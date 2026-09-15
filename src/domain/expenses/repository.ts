import type { Expense, ExpenseWriteInput } from "../types.js";

export interface ExpensesRepository {
  create(customerId: string, input: ExpenseWriteInput): Promise<Expense>;
  update(customerId: string, input: ExpenseWriteInput): Promise<boolean>;
  remove(customerId: string, id: string, mes?: number): Promise<boolean>;
  findByMonth(customerId: string, mes: number, ano: number): Promise<Expense[]>;
  findAll(customerId: string): Promise<Expense[]>;
}
