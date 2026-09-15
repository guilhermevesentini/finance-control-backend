import { Router } from "express";
import { ok } from "../envelope.js";
import { authMiddleware, type AuthedRequest } from "../middleware/auth.js";
import { createOverviewService } from "../overviewService.js";
import type { ExpensesRepository } from "../../domain/expenses/repository.js";
import type { IncomesRepository } from "../../domain/incomes/repository.js";
import { wrap } from "../wrap.js";

export function createOverviewRouter(
  expenses: ExpensesRepository,
  incomes: IncomesRepository
) {
  const router = Router();
  const overview = createOverviewService(expenses, incomes);
  router.use(authMiddleware);

  router.get("/overview/spark", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const inicio = String(req.query.inicio || "");
    const fim = String(req.query.fim || "");
    return ok(res, await overview.spark(authed.userId, inicio, fim));
  }));

  router.get("/overview/donut", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const inicio = String(req.query.inicio || "");
    const fim = String(req.query.fim || "");
    return ok(res, await overview.donut(authed.userId, inicio, fim));
  }));

  router.get("/overview/resumo-movimentos", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const ano = Number(req.query.ano) || new Date().getFullYear();
    return ok(res, await overview.resumo(authed.userId, ano));
  }));

  return router;
}
