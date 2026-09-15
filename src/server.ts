import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectMongo } from "./infra/mongo/client.js";
import { createIndexes } from "./infra/mongo/indexes.js";
import { mongoUsersRepository } from "./infra/mongo/usersRepository.js";
import { mongoExpensesRepository } from "./infra/mongo/expensesRepository.js";
import { mongoIncomesRepository } from "./infra/mongo/incomesRepository.js";
import { mongoAccountsRepository } from "./infra/mongo/accountsRepository.js";
import { mongoCategoriesRepository } from "./infra/mongo/categoriesRepository.js";
import { createAuthRouter } from "./http/routes/auth.js";
import { createMovementsRouter } from "./http/routes/movements.js";
import { createCatalogRouter } from "./http/routes/catalog.js";
import { createOverviewRouter } from "./http/routes/overview.js";
import { fail, HttpStatus, ok } from "./http/envelope.js";

const app = express();

const corsOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_req, res) => ok(res, { mongo: true }));

app.use(createAuthRouter(mongoUsersRepository, mongoCategoriesRepository));
app.use(createMovementsRouter(mongoExpensesRepository, mongoIncomesRepository));
app.use(createCatalogRouter(mongoAccountsRepository, mongoCategoriesRepository));
app.use(createOverviewRouter(mongoExpensesRepository, mongoIncomesRepository));

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  return fail(res, HttpStatus.badRequest, "Erro interno");
});

const PORT = Number(process.env.PORT) || 7000;

async function start() {
  const db = await connectMongo();
  await createIndexes(db);
  console.log("Mongo connected:", db.databaseName);

  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Falha ao iniciar a API", error);
  process.exit(1);
});
