import { Router } from "express";
import type { AccountsRepository } from "../../domain/accounts/repository.js";
import type { CategoriesRepository } from "../../domain/categories/repository.js";
import { ensureDefaultCategories } from "../../domain/categories/seed.js";
import { banks } from "../../infra/banks.js";
import { fail, HttpStatus, ok } from "../envelope.js";
import { authMiddleware, type AuthedRequest } from "../middleware/auth.js";
import { wrap } from "../wrap.js";

export function createCatalogRouter(
  accounts: AccountsRepository,
  categories: CategoriesRepository
) {
  const router = Router();
  router.use(authMiddleware);

  router.get("/get-banks", (_req, res) => ok(res, banks));

  router.get("/get-bank-account", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    return ok(res, await accounts.findAll(authed.userId));
  }));

  router.post("/create-bank-account", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    await accounts.create(authed.userId, {
      banco: req.body?.banco,
      nomeBanco: req.body?.nomeBanco || "",
      nome: req.body?.nome || "",
      conta: req.body?.conta,
      agencia: req.body?.agencia || "",
      saldo: req.body?.saldo || "0.00",
      contaPrincipal: Boolean(req.body?.contaPrincipal)
    });
    return ok(res, true);
  }));

  router.post("/delete-bank-account", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const removed = await accounts.remove(authed.userId, String(req.body?.id));
    if (!removed) return fail(res, HttpStatus.notFound, "Conta nao encontrada");
    return ok(res, true);
  }));

  router.get("/get-categories/", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const tipo = req.query.tipo != null ? Number(req.query.tipo) : undefined;
    await ensureDefaultCategories(categories, authed.userId, tipo);
    return ok(res, await categories.findAll(authed.userId, tipo));
  }));

  router.post("/create-category", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    await categories.create(authed.userId, {
      nome: req.body?.nome || "",
      color: req.body?.color || "#008FFB",
      tipo: Number(req.body?.tipo ?? 2)
    });
    return ok(res, true);
  }));

  router.post("/edit-category", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const updated = await categories.update(authed.userId, {
      id: String(req.body?.id),
      nome: req.body?.nome || "",
      color: req.body?.color || "#008FFB"
    });
    if (!updated) return fail(res, HttpStatus.notFound, "Categoria nao encontrada");
    return ok(res, true);
  }));

  router.post("/delete-category", wrap(async (req, res) => {
    const authed = req as AuthedRequest;
    const removed = await categories.remove(
      authed.userId,
      String(req.body?.id),
      Number(req.body?.tipo ?? 2)
    );
    if (!removed) return fail(res, HttpStatus.notFound, "Categoria nao encontrada");
    return ok(res, true);
  }));

  return router;
}
