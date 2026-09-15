import { v4 as uuid } from "uuid";
import type { CategoriesRepository } from "../../domain/categories/repository.js";
import type { Category } from "../../domain/types.js";
import { getDb } from "./client.js";

function collection() {
  return getDb().collection<Category>("categories");
}

function toPublic(category: Category) {
  return { ...category, id: category._id };
}

export const mongoCategoriesRepository: CategoriesRepository = {
  async create(customerId, input) {
    const category: Category = {
      _id: uuid(),
      customerId,
      tipo: input.tipo,
      nome: input.nome,
      color: input.color
    };

    await collection().insertOne(category);
    return toPublic(category);
  },

  async createMany(customerId, input) {
    if (!input.length) return;

    const categories = input.map((item) => ({
      _id: uuid(),
      customerId,
      tipo: item.tipo,
      nome: item.nome,
      color: item.color
    }));

    await collection().insertMany(categories);
  },

  async update(customerId, input) {
    const result = await collection().updateOne(
      { _id: input.id, customerId },
      { $set: { nome: input.nome, color: input.color } }
    );
    return result.matchedCount > 0;
  },

  async remove(customerId, id, tipo) {
    const result = await collection().deleteOne({ _id: id, customerId, tipo });
    return result.deletedCount > 0;
  },

  async findAll(customerId, tipo) {
    const query = tipo == null ? { customerId } : { customerId, tipo: Number(tipo) };
    const docs = await collection().find(query).toArray();
    return docs.map(toPublic);
  }
};
