import { Request, Response, NextFunction } from 'express';
import { TramiteService } from '../services/tramite.service';
import { ListarTramitesQueryDto } from '../dtos/tramite.dto';
import { TramiteRepository } from '../repositories/tramite.repository';

const tramiteService = new TramiteService(new TramiteRepository());

export async function listarTramites(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListarTramitesQueryDto.parse(req.query);
    const resultado = await tramiteService.listarTramites(query);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function buscarTramites(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListarTramitesQueryDto.parse(req.query);
    const resultado = await tramiteService.buscarTramites(query);

    if (resultado.total === 0) {
      res.json({ ...resultado, mensaje: 'No se encontraron trámites con los criterios ingresados' });
      return;
    }

    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function obtenerDetalleTramite(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = req.params;
    const tramite = await tramiteService.obtenerDetalle(codigo);
    res.json(tramite);
  } catch (err) {
    next(err);
  }
}
