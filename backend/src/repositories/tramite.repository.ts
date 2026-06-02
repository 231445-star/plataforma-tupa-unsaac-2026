import { prisma } from '../lib/prisma';
import { ListarTramitesQuery } from '../dtos/tramite.dto';

export interface TramiteParaSolicitud {
  ccodigo: string;
  cdenominaciontramite: string;
  bactivo: boolean;
  nidtmontotramite: number | null;
  montoVigente: number | null;
}

export interface ITramiteRepository {
  listar(query: ListarTramitesQuery): Promise<{ data: TramiteListItem[]; total: number }>;
  buscar(query: ListarTramitesQuery): Promise<{ data: TramiteListItem[]; total: number }>;
  obtenerDetalle(codigo: string): Promise<TramiteDetalle | null>;
  obtenerParaSolicitud(codigo: string): Promise<TramiteParaSolicitud | null>;
}

export interface TramiteListItem {
  ccodigo: string;
  cdenominaciontramite: string;
  cdescripcion: string | null;
  bactivo: boolean;
  montoVigente: number | null;
  dependencia: string | null;
}

export interface TramiteDetalle extends TramiteListItem {
  requisitos: { nidtrequisitotramite: number; cdescripcionrequisito: string }[];
  montos: { nidtmontotramite: number; nmonto: number; cdescripcionpago: string | null; dfechainicio: Date | null; dfechafin: Date | null }[];
}

export class TramiteRepository implements ITramiteRepository {
  async listar(query: ListarTramitesQuery) {
    const { pagina, porPagina, dependencia } = query;
    const skip = (pagina - 1) * porPagina;

    const where = {
      bactivo: true,
      ...(dependencia
        ? {
            unidadesTram: {
              some: {
                unidad: {
                  cdescripcion: { contains: dependencia, mode: 'insensitive' as const },
                },
              },
            },
          }
        : {}),
    };

    const [tramites, total] = await prisma.$transaction([
      prisma.tramite.findMany({
        where,
        skip,
        take: porPagina,
        include: {
          montos: { where: { dfechafin: null }, take: 1, orderBy: { dfechainicio: 'desc' } },
          unidadesTram: { include: { unidad: true }, take: 1 },
        },
        orderBy: { cdenominaciontramite: 'asc' },
      }),
      prisma.tramite.count({ where }),
    ]);

    return {
      data: tramites.map(mapTramiteToListItem),
      total,
    };
  }

  async buscar(query: ListarTramitesQuery) {
    const { pagina, porPagina, busqueda, dependencia } = query;
    const skip = (pagina - 1) * porPagina;

    const where = {
      bactivo: true,
      ...(busqueda
        ? { cdenominaciontramite: { contains: busqueda, mode: 'insensitive' as const } }
        : {}),
      ...(dependencia
        ? {
            unidadesTram: {
              some: {
                unidad: {
                  cdescripcion: { contains: dependencia, mode: 'insensitive' as const },
                },
              },
            },
          }
        : {}),
    };

    const [tramites, total] = await prisma.$transaction([
      prisma.tramite.findMany({
        where,
        skip,
        take: porPagina,
        include: {
          montos: { where: { dfechafin: null }, take: 1, orderBy: { dfechainicio: 'desc' } },
          unidadesTram: { include: { unidad: true }, take: 1 },
        },
        orderBy: { cdenominaciontramite: 'asc' },
      }),
      prisma.tramite.count({ where }),
    ]);

    return {
      data: tramites.map(mapTramiteToListItem),
      total,
    };
  }

  async obtenerDetalle(codigo: string): Promise<TramiteDetalle | null> {
    const tramite = await prisma.tramite.findFirst({
      where: { ccodigo: codigo },
      include: {
        requisitos: { orderBy: { nidtrequisitotramite: 'asc' } },
        montos: { orderBy: { dfechainicio: 'desc' } },
        unidadesTram: { include: { unidad: true }, take: 1 },
      },
    });

    if (!tramite) return null;

    const montoVigente = tramite.montos.find((m) => m.dfechafin === null);

    return {
      ccodigo: tramite.ccodigo,
      cdenominaciontramite: tramite.cdenominaciontramite,
      cdescripcion: tramite.cdescripcion,
      bactivo: tramite.bactivo,
      montoVigente: montoVigente ? Number(montoVigente.nmonto) : null,
      dependencia: tramite.unidadesTram[0]?.unidad.cdescripcion ?? null,
      requisitos: tramite.requisitos.map((r) => ({
        nidtrequisitotramite: r.nidtrequisitotramite,
        cdescripcionrequisito: r.cdescripcionrequisito,
      })),
      montos: tramite.montos.map((m) => ({
        nidtmontotramite: m.nidtmontotramite,
        nmonto: Number(m.nmonto),
        cdescripcionpago: m.cdescripcionpago,
        dfechainicio: m.dfechainicio,
        dfechafin: m.dfechafin,
      })),
    };
  }

  async obtenerParaSolicitud(codigo: string): Promise<TramiteParaSolicitud | null> {
    const tramite = await prisma.tramite.findUnique({
      where: { ccodigo: codigo },
      include: {
        montos: {
          where: { dfechafin: null },
          orderBy: { dfechainicio: 'desc' },
          take: 1,
        },
      },
    });

    if (!tramite) return null;

    const monto = tramite.montos[0] ?? null;
    return {
      ccodigo: tramite.ccodigo,
      cdenominaciontramite: tramite.cdenominaciontramite,
      bactivo: tramite.bactivo,
      nidtmontotramite: monto?.nidtmontotramite ?? null,
      montoVigente: monto ? Number(monto.nmonto) : null,
    };
  }
}

// ─── helpers privados ───────────────────────────────────────────────────────

type TramiteConRelaciones = Awaited<
  ReturnType<typeof prisma.tramite.findMany>
>[number] & {
  montos: { nmonto: { toNumber(): number } }[];
  unidadesTram: { unidad: { cdescripcion: string | null } }[];
};

function mapTramiteToListItem(t: TramiteConRelaciones): TramiteListItem {
  return {
    ccodigo: t.ccodigo,
    cdenominaciontramite: t.cdenominaciontramite,
    cdescripcion: t.cdescripcion,
    bactivo: t.bactivo,
    montoVigente: t.montos[0] ? Number(t.montos[0].nmonto) : null,
    dependencia: t.unidadesTram[0]?.unidad.cdescripcion ?? null,
  };
}
