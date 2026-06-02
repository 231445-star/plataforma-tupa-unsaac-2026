import { EstadoSolicitud } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ESTADOS_TERMINALES } from '../lib/estadoSolicitud';

export interface CrearSolicitudData {
  ccodigosolicitante: string;
  codigoTramite: string;
  nidtmontotramite: number;
  nmontotramite: number;
  cidtsolicitudtramite: string;
}

export interface SolicitudResumen {
  nidtsolicitudtramite: number;
  cidtsolicitudtramite: string;
  cestado: EstadoSolicitud;
  dfecharegistro: Date;
  solicitante: {
    ccodigosolicitante: string;
    cnombres: string | null;
    capellidopaterno: string | null;
    capellidomaterno: string | null;
    cemail: string | null;
  };
  tramite: {
    ccodigo: string;
    cdenominaciontramite: string;
    nmontotramite: number;
  };
}

export interface ISolicitudRepository {
  buscarDuplicadoActivo(codigoSolicitante: string, codigoTramite: string): Promise<boolean>;
  crear(data: CrearSolicitudData): Promise<SolicitudResumen>;
}

export class SolicitudRepository implements ISolicitudRepository {
  // D-3: detecta si ya existe una solicitud activa del mismo alumno para el mismo trámite
  async buscarDuplicadoActivo(
    codigoSolicitante: string,
    codigoTramite: string,
  ): Promise<boolean> {
    const existente = await prisma.solicitud.findFirst({
      where: {
        ccodigosolicitante: codigoSolicitante,
        cestado: { notIn: ESTADOS_TERMINALES },
        detalles: { some: { ccodigo: codigoTramite } },
      },
      select: { nidtsolicitudtramite: true },
    });
    return existente !== null;
  }

  // Crea solicitud + detalle + historial inicial + notificación en una transacción
  async crear(data: CrearSolicitudData): Promise<SolicitudResumen> {
    const solicitud = await prisma.$transaction(async (tx) => {
      const nueva = await tx.solicitud.create({
        data: {
          ccodigosolicitante: data.ccodigosolicitante,
          dfecharegistro: new Date(),
          dfechapeticion: new Date(),
          cestado: EstadoSolicitud.SOLICITADO,
          cidtsolicitudtramite: data.cidtsolicitudtramite,
          detalles: {
            create: {
              ccodigo: data.codigoTramite,
              nidtmontotramite: data.nidtmontotramite,
              ncantidad: 1,
              nmontotramite: data.nmontotramite,
            },
          },
        },
        include: {
          solicitante: true,
          detalles: { include: { tramite: true } },
        },
      });

      // Registra estado inicial en el historial
      await tx.historialEstado.create({
        data: {
          nidtsolicitudtramite: nueva.nidtsolicitudtramite,
          cestadoanterior: '',
          cestadonuevo: EstadoSolicitud.SOLICITADO,
          cmotivo: 'Solicitud registrada por el alumno',
          cusuario: data.ccodigosolicitante,
        },
      });

      // Notificación in-app inicial (RF-11)
      await tx.notificacion.create({
        data: {
          nidtsolicitudtramite: nueva.nidtsolicitudtramite,
          cmensaje: `Tu solicitud de "${nueva.detalles[0]?.tramite.cdenominaciontramite}" fue registrada correctamente. Código de seguimiento: ${data.cidtsolicitudtramite}`,
        },
      });

      return nueva;
    });

    const detalle = solicitud.detalles[0];
    return {
      nidtsolicitudtramite: Number(solicitud.nidtsolicitudtramite),
      cidtsolicitudtramite: solicitud.cidtsolicitudtramite,
      cestado: solicitud.cestado,
      dfecharegistro: solicitud.dfecharegistro,
      solicitante: {
        ccodigosolicitante: solicitud.solicitante.ccodigosolicitante,
        cnombres: solicitud.solicitante.cnombres,
        capellidopaterno: solicitud.solicitante.capellidopaterno,
        capellidomaterno: solicitud.solicitante.capellidomaterno,
        cemail: solicitud.solicitante.cemail,
      },
      tramite: {
        ccodigo: detalle.ccodigo,
        cdenominaciontramite: detalle.tramite.cdenominaciontramite,
        nmontotramite: Number(detalle.nmontotramite),
      },
    };
  }
}
