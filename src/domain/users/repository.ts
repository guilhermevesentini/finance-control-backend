import type { CreateUserInput, User } from "../types.js";

export interface UsersRepository {
  create(input: CreateUserInput & { passwordHash: string; id: string }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmailOrUsername(value: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePassword(id: string, passwordHash: string): Promise<boolean>;
}
