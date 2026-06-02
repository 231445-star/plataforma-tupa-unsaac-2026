import { ISolicitudRepository, SolicitudResumen } from '../repositories/solicitud.repository';
import { ITramiteRepository } from '../repositories/tramite.repository';
import { ISolicitanteRepository } from '../repositories/solicitante.repository';
import { CrearSolicitudInput } from '../dtos/solicitud.dto';
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError';

export class SolicitudService {
  constructor(
    private readonly solicitudRepo: ISolicitudRepository,
    private readonly tramiteRepo: ITramiteRepository,
    private readonly solicitanteRepo: ISolicitanteRepository,
  ) {}

  // RF-05: registra una nueva solicitud de trámite
  async registrar(input: CrearSolicitudInput): Promise<SolicitudResumen> {
    // 1. El alumno debe haber completado RF-04 (existe en tsolicitante con datos de contacto)
    const solicitante = await this.solicitanteRepo.obtenerSolicitante(input.codigoAlumno);
    if (!solicitante) {
      throw new ValidationError(
        'Debe identificarse primero ingresando su código de alumno',
      );
    }
    if (!solicitante.cemail || !solicitante.ctelefono) {
      throw new ValidationError(
        'Debe completar su email y teléfono antes de registrar una solicitud',
      );
    }

    // 2. El trámite debe existir y estar activo (D-5)
    const tramite = await this.tramiteRepo.obtenerParaSolicitud(input.codigoTramite);
    if (!tramite) {
      throw new NotFoundError(`Trámite con código "${input.codigoTramite}" no encontrado`);
    }
    if (!tramite.bactivo) {
      throw new ConflictError(
        'El trámite seleccionado no está disponible para nuevas solicitudes',
      );
    }

    // 3. El trámite debe tener un monto vigente
    if (!tramite.nidtmontotramite || tramite.montoVigente === null) {
      throw new ValidationError('El trámite no tiene un monto vigente definido');
    }

    // 4. Bloqueo de solicitud duplicada activa (D-3)
    const tieneDuplicado = await this.solicitudRepo.buscarDuplicadoActivo(
      input.codigoAlumno,
      input.codigoTramite,
    );
    if (tieneDuplicado) {
      throw new ConflictError(
        'Ya tiene una solicitud activa para este trámite. Espere a que sea cerrada o anulada antes de iniciar una nueva.',
      );
    }

    // 5. Crear la solicitud
    return this.solicitudRepo.crear({
      ccodigosolicitante: input.codigoAlumno,
      codigoTramite: input.codigoTramite,
      nidtmontotramite: tramite.nidtmontotramite,
      nmontotramite: tramite.montoVigente,
      cidtsolicitudtramite: generarCodigoSeguimiento(),
    });
  }
}

function generarCodigoSeguimiento(): string {
  const año = new Date().getFullYear();
  const aleatorio = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `TUPA-${año}-${aleatorio}`;
}
