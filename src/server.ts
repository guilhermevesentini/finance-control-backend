import "dotenv/config";
import cors, { type CorsOptions } from "cors";
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

function parseCorsOrigins(): string[] {
  const extras = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return [
    ...new Set([
      "http://localhost:5173",
      "http://localhost:5174",
      "https://selffinancecontrol.netlify.app",
      ...extras
    ])
  ];
}

const corsOptions: CorsOptions = {
  origin: parseCorsOrigins(),
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

let mongoReady = false;

app.get("/health", (_req, res) => ok(res, { mongo: mongoReady }));

app.use(createAuthRouter(mongoUsersRepository, mongoCategoriesRepository));
app.use(createMovementsRouter(mongoExpensesRepository, mongoIncomesRepository));
app.use(createCatalogRouter(mongoAccountsRepository, mongoCategoriesRepository));
app.use(createOverviewRouter(mongoExpensesRepository, mongoIncomesRepository));

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  return fail(res, HttpStatus.badRequest, "Erro interno");
});

const PORT = Number(process.env.PORT) || 7000;

async function connectMongoWithRetry(): Promise<void> {
  for (;;) {
    try {
      const db = await connectMongo();
      await createIndexes(db);
      mongoReady = true;
      console.log("Mongo connected:", db.databaseName);
      return;
    } catch (error) {
      mongoReady = false;
      console.error("Falha ao conectar no MongoDB, tentando de novo em 5s", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function start() {
  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`API rodando na porta ${PORT}`);
      resolve();
    });
    server.on("error", reject);
  });

  await connectMongoWithRetry();
}

start().catch((error) => {
  console.error("Falha ao iniciar a API", error);
  process.exit(1);
});
