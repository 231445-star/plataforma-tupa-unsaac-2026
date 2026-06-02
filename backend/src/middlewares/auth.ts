import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';

export interface JwtPayload {
  login: string;
  perfilId: number;
  usuarioId: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token no proporcionado');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? '') as JwtPayload;
    req.usuario = payload;
    next();
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}

export function requiereRol(...perfilesPermitidos: number[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) throw new UnauthorizedError();
    if (!perfilesPermitidos.includes(req.usuario.perfilId)) {
      throw new ForbiddenError();
    }
    next();
  };
}
