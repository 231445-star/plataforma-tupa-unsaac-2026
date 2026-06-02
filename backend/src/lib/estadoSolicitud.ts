import { EstadoSolicitud } from '@prisma/client';

// Máquina de estados de la solicitud — fuente de verdad (architecture.md §5)
const TRANSICIONES: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  SOLICITADO:         [EstadoSolicitud.PAGADO, EstadoSolicitud.ANULADO],
  PAGADO:             [EstadoSolicitud.EN_PROCESO, EstadoSolicitud.CERRADO],
  PAGADO_SIN_ADJUNTO: [EstadoSolicitud.EN_PROCESO, EstadoSolicitud.ANULADO],
  EN_PROCESO:         [EstadoSolicitud.CERRADO, EstadoSolicitud.ANULADO],
  ANULADO:            [],
  CERRADO:            [],
};

export const ESTADOS_ACTIVOS: EstadoSolicitud[] = [
  EstadoSolicitud.SOLICITADO,
  EstadoSolicitud.EN_PROCESO,
  EstadoSolicitud.PAGADO,
  EstadoSolicitud.PAGADO_SIN_ADJUNTO,
];

export const ESTADOS_TERMINALES: EstadoSolicitud[] = [
  EstadoSolicitud.ANULADO,
  EstadoSolicitud.CERRADO,
];

export function esTransicionValida(
  desde: EstadoSolicitud,
  hacia: EstadoSolicitud,
): boolean {
  return TRANSICIONES[desde]?.includes(hacia) ?? false;
}

export function transicionesDisponibles(desde: EstadoSolicitud): EstadoSolicitud[] {
  return TRANSICIONES[desde] ?? [];
}
