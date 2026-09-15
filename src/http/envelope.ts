import type { Response } from "express";

export const HttpStatus = {
  success: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404
} as const;

export function ok<T>(res: Response, result: T, message?: string) {
  return res.status(200).json({
    result,
    statusCode: HttpStatus.success,
    message
  });
}

export function fail(res: Response, status: number, message: string, result: unknown = null) {
  return res.status(status).json({
    result,
    statusCode: status,
    message
  });
}
