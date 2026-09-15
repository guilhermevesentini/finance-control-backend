import { Router } from "express";
import bcrypt from "bcryptjs";
import type { UsersRepository } from "../../domain/users/repository.js";
import { fail, HttpStatus, ok } from "../envelope.js";
import { authMiddleware, signToken, type AuthedRequest } from "../middleware/auth.js";
import { newId } from "../../infra/mongo/usersRepository.js";
import { wrap } from "../wrap.js";

export function createAuthRouter(users: UsersRepository) {
  const router = Router();

  router.post("/create-user", wrap(async (req, res) => {
    const { email, username, password } = req.body ?? {};
    if (!email || !password) {
      return fail(res, HttpStatus.badRequest, "Email e senha sao obrigatorios");
    }

    const exists = await users.findByEmail(email);
    if (exists) {
      return fail(res, HttpStatus.badRequest, "Usuario ja cadastrado");
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    await users.create({
      id: newId(),
      email,
      username,
      password,
      passwordHash
    });

    return ok(res, true, "Usuario criado com sucesso");
  }));

  router.post("/auth/login", wrap(async (req, res) => {
    const { email, username, password } = req.body ?? {};
    const login = email || username;
    if (!login || !password) {
      return fail(res, HttpStatus.badRequest, "Credenciais invalidas");
    }

    const user = await users.findByEmailOrUsername(String(login));
    if (!user) {
      return fail(res, HttpStatus.unauthorized, "Usuario nao encontrado");
    }

    const matches = await bcrypt.compare(String(password), user.passwordHash);
    if (!matches) {
      return fail(res, HttpStatus.unauthorized, "Usuario nao encontrado");
    }

    const token = signToken(user._id, user.email);
    return ok(res, token);
  }));

  router.get("/find-user/:usuario", authMiddleware, wrap(async (req, res) => {
    const user = await users.findByEmailOrUsername(String(req.params.usuario));
    if (!user) {
      return fail(res, HttpStatus.notFound, "Usuario nao encontrado");
    }

    return ok(res, {
      id: user._id,
      _id: user._id,
      email: user.email,
      username: user.username
    });
  }));

  router.get("/recover-password/:email", wrap(async (req, res) => {
    const user = await users.findByEmail(String(req.params.email));
    if (!user) {
      return fail(res, HttpStatus.notFound, "Usuario nao encontrado");
    }

    return ok(res, true);
  }));

  router.post("/change-password", authMiddleware, wrap(async (req, res) => {
    const form = req.body?.form ?? req.body ?? {};
    const email = String(form.email || "");
    const senha = String(form.senha || "");
    const novaSenha = String(form.novaSenha || "");
    const authed = req as AuthedRequest;

    if (!email || !senha || !novaSenha) {
      return fail(res, HttpStatus.badRequest, "Dados incompletos");
    }

    const user = await users.findById(authed.userId);
    if (!user || user.email !== email.trim().toLowerCase()) {
      return fail(res, HttpStatus.unauthorized, "Nao autorizado");
    }

    const matches = await bcrypt.compare(senha, user.passwordHash);
    if (!matches) {
      return fail(res, HttpStatus.badRequest, "Senha atual invalida");
    }

    const passwordHash = await bcrypt.hash(novaSenha, 10);
    await users.updatePassword(user._id, passwordHash);
    return ok(res, true);
  }));

  return router;
}
