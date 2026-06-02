import { Request, Response } from 'express';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Ruta ${req.method} ${req.path} no encontrada` },
  });
}
