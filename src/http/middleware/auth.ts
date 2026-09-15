import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { fail, HttpStatus } from "../envelope.js";

export type AuthedRequest = Request & {
  userId: string;
  email: string;
};

type TokenPayload = {
  sub: string;
  email: string;
};

export function signToken(userId: string, email: string): string {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error("SECRET_KEY ausente no .env");
  }

  return jwt.sign({ sub: userId, email }, secret, { expiresIn: "7d" });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const secret = process.env.SECRET_KEY;

  if (!token || !secret) {
    return fail(res, HttpStatus.unauthorized, "Nao autorizado");
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    const authed = req as AuthedRequest;
    authed.userId = payload.sub;
    authed.email = payload.email;
    next();
  } catch {
    return fail(res, HttpStatus.unauthorized, "Nao autorizado");
  }
}
