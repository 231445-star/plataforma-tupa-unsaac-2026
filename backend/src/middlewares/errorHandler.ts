import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code ?? 'ERROR', message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        detalles: err.errors.map((e) => ({ campo: e.path.join('.'), mensaje: e.message })),
      },
    });
    return;
  }

  console.error('Error inesperado:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
}
