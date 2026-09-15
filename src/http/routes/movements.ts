import { Router } from "express";
import type { ExpensesRepository } from "../../domain/expenses/repository.js";
import type { IncomesRepository } from "../../domain/incomes/repository.js";
import { fail, HttpStatus, ok } from "../envelope.js";
import { authMiddleware, type AuthedRequest } from "../middleware/auth.js";
import { wrap } from "../wrap.js";

export function createMovementsRouter(
  expenses: ExpensesRepository,
  incomes: IncomesRepository
) {
  const router = Router();
  router.use(authMiddleware);

  router.post("/create-expense", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    await expenses.create(authed.userId, req.body);
    return ok(res, true);
  }));

  router.post("/edit-expense", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const updated = await expenses.update(authed.userId, req.body);
    if (!updated) return fail(res, HttpStatus.notFound, "Despesa nao encontrada");
    return ok(res, true);
  }));

  router.post("/delete-expense", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const { despesaId, mes } = req.body ?? {};
    const removed = await expenses.remove(authed.userId, String(despesaId), mes);
    if (!removed) return fail(res, HttpStatus.notFound, "Despesa nao encontrada");
    return ok(res, true);
  }));

  router.get("/get-expense", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const mes = Number(req.query.mes);
    const ano = Number(req.query.ano);
    const result = await expenses.findByMonth(authed.userId, mes, ano);
    return ok(res, result);
  }));

  router.post("/create-income", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    await incomes.create(authed.userId, req.body);
    return ok(res, true);
  }));

  router.post("/edit-income", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const updated = await incomes.update(authed.userId, req.body);
    if (!updated) return fail(res, HttpStatus.notFound, "Receita nao encontrada");
    return ok(res, true);
  }));

  router.post("/delete-income", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const { despesaId, incomeId, mes } = req.body ?? {};
    const removed = await incomes.remove(
      authed.userId,
      String(incomeId || despesaId),
      mes
    );
    if (!removed) return fail(res, HttpStatus.notFound, "Receita nao encontrada");
    return ok(res, true);
  }));

  router.get("/get-income", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const mes = Number(req.query.mes);
    const ano = Number(req.query.ano);
    const result = await incomes.findByMonth(authed.userId, mes, ano);
    return ok(res, result);
  }));

  return router;
}
