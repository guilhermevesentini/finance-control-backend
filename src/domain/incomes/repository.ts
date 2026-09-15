import type { Income, IncomeWriteInput } from "../types.js";

export interface IncomesRepository {
  create(customerId: string, input: IncomeWriteInput): Promise<Income>;
  update(customerId: string, input: IncomeWriteInput): Promise<boolean>;
  remove(customerId: string, id: string, mes?: number): Promise<boolean>;
  findByMonth(customerId: string, mes: number, ano: number): Promise<Income[]>;
  findAll(customerId: string): Promise<Income[]>;
}
