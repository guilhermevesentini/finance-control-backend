import { MongoClient, type Db } from "mongodb";

let client: MongoClient | undefined;
let db: Db | undefined;

export async function connectMongo(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI ausente no .env");
  }

  client = new MongoClient(uri);
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  db = client.db();
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("MongoDB ainda nao foi conectado");
  }

  return db;
}

export async function disconnectMongo(): Promise<void> {
  await client?.close();
  client = undefined;
  db = undefined;
}
