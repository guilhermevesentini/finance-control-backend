import { v4 as uuid } from "uuid";
import type { AccountsRepository } from "../../domain/accounts/repository.js";
import type { Account } from "../../domain/types.js";
import { getDb } from "./client.js";

function collection() {
  return getDb().collection<Account>("accounts");
}

function toPublic(account: Account) {
  return { ...account, id: account._id };
}

export const mongoAccountsRepository: AccountsRepository = {
  async create(customerId, input) {
    if (input.contaPrincipal) {
      await collection().updateMany({ customerId }, { $set: { contaPrincipal: false } });
    }

    const account: Account = {
      _id: uuid(),
      customerId,
      ...input
    };

    await collection().insertOne(account);
    return toPublic(account);
  },

  async findAll(customerId) {
    const docs = await collection().find({ customerId }).toArray();
    return docs.map(toPublic);
  },

  async remove(customerId, id) {
    const result = await collection().deleteOne({ _id: id, customerId });
    return result.deletedCount > 0;
  },

  async clearPrincipal(customerId) {
    await collection().updateMany({ customerId }, { $set: { contaPrincipal: false } });
  }
};
