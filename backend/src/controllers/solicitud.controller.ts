import { Request, Response, NextFunction } from 'express';
import { SolicitudService } from '../services/solicitud.service';
import { SolicitudRepository } from '../repositories/solicitud.repository';
import { TramiteRepository } from '../repositories/tramite.repository';
import { SolicitanteRepository } from '../repositories/solicitante.repository';
import { CrearSolicitudDto } from '../dtos/solicitud.dto';

const solicitudService = new SolicitudService(
  new SolicitudRepository(),
  new TramiteRepository(),
  new SolicitanteRepository(),
);

// POST /api/solicitudes — RF-05
export async function registrarSolicitud(req: Request, res: Response, next: NextFunction) {
  try {
    const datos = CrearSolicitudDto.parse(req.body);
    const solicitud = await solicitudService.registrar(datos);
    res.status(201).json(solicitud);
  } catch (err) {
    next(err);
  }
}
