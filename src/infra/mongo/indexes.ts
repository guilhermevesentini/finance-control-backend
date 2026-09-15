import type { Db } from "mongodb";

export async function createIndexes(db: Db): Promise<void> {
  await db.collection("users").createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { username: 1 }, unique: true }
  ]);

  await db.collection("expenses").createIndexes([
    { key: { customerId: 1 } },
    { key: { customerId: 1, "meses.ano": 1, "meses.mes": 1 } }
  ]);

  await db.collection("incomes").createIndexes([
    { key: { customerId: 1 } },
    { key: { customerId: 1, "meses.ano": 1, "meses.mes": 1 } }
  ]);

  await db.collection("accounts").createIndex({ customerId: 1 });
  await db.collection("categories").createIndex({ customerId: 1, tipo: 1 });
}
