import { Request, Response, NextFunction } from 'express';
import { SolicitanteService } from '../services/solicitante.service';
import { SolicitanteRepository } from '../repositories/solicitante.repository';
import { CompletarDatosDto } from '../dtos/solicitante.dto';

const solicitanteService = new SolicitanteService(new SolicitanteRepository());

// GET /api/solicitantes/:codigo — RF-04 paso 1
export async function identificarAlumno(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = req.params;
    const resultado = await solicitanteService.identificar(codigo);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

// POST /api/solicitantes/:codigo/completar — RF-04 paso 2 (D-1)
export async function completarDatos(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = req.params;
    const datos = CompletarDatosDto.parse(req.body);
    const solicitante = await solicitanteService.completarDatos(codigo, datos);
    res.status(200).json(solicitante);
  } catch (err) {
    next(err);
  }
}
