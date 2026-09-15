import type { Category } from "../types.js";

export interface CategoriesRepository {
  create(customerId: string, input: { nome: string; color: string; tipo: number }): Promise<Category>;
  createMany(customerId: string, input: Array<{ nome: string; color: string; tipo: number }>): Promise<void>;
  update(customerId: string, input: { id: string; nome: string; color: string }): Promise<boolean>;
  remove(customerId: string, id: string, tipo: number): Promise<boolean>;
  findAll(customerId: string, tipo?: number): Promise<Category[]>;
}
