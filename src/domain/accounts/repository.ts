import type { Account } from "../types.js";

export interface AccountsRepository {
  create(customerId: string, input: Omit<Account, "_id" | "customerId">): Promise<Account>;
  findAll(customerId: string): Promise<Account[]>;
  remove(customerId: string, id: string): Promise<boolean>;
  clearPrincipal(customerId: string): Promise<void>;
}
