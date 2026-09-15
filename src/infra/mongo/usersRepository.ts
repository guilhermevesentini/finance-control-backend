import { v4 as uuid } from "uuid";
import type { UsersRepository } from "../../domain/users/repository.js";
import type { User } from "../../domain/types.js";
import { getDb } from "./client.js";

function collection() {
  return getDb().collection<User>("users");
}

export const mongoUsersRepository: UsersRepository = {
  async create(input) {
    const user: User = {
      _id: input.id,
      email: input.email.trim().toLowerCase(),
      username: (input.username || input.email).trim(),
      passwordHash: input.passwordHash,
      createdAt: new Date()
    };

    await collection().insertOne(user);
    return user;
  },

  async findByEmail(email) {
    return collection().findOne({ email: email.trim().toLowerCase() });
  },

  async findByUsername(username) {
    return collection().findOne({ username: username.trim() });
  },

  async findByEmailOrUsername(value) {
    const normalized = value.trim();
    return collection().findOne({
      $or: [{ email: normalized.toLowerCase() }, { username: normalized }]
    });
  },

  async findById(id) {
    return collection().findOne({ _id: id });
  },

  async updatePassword(id, passwordHash) {
    const result = await collection().updateOne({ _id: id }, { $set: { passwordHash } });
    return result.modifiedCount > 0;
  }
};

export function newId(): string {
  return uuid();
}
