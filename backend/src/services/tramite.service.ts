import { ITramiteRepository, TramiteListItem, TramiteDetalle } from '../repositories/tramite.repository';
import { ListarTramitesQuery } from '../dtos/tramite.dto';
import { NotFoundError } from '../errors/AppError';

export interface Paginado<T> {
  data: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

export class TramiteService {
  constructor(private readonly tramiteRepo: ITramiteRepository) {}

  // RF-01: lista trámites activos paginados
  async listarTramites(query: ListarTramitesQuery): Promise<Paginado<TramiteListItem>> {
    const { data, total } = await this.tramiteRepo.listar(query);
    return this.paginar(data, total, query);
  }

  // RF-02: búsqueda y filtrado
  async buscarTramites(query: ListarTramitesQuery): Promise<Paginado<TramiteListItem>> {
    const { data, total } = await this.tramiteRepo.buscar(query);
    return this.paginar(data, total, query);
  }

  // RF-03: detalle de trámite (404 controlado si no existe o está inactivo)
  async obtenerDetalle(codigo: string): Promise<TramiteDetalle> {
    const tramite = await this.tramiteRepo.obtenerDetalle(codigo);

    if (!tramite) {
      throw new NotFoundError(`Trámite con código "${codigo}" no encontrado`);
    }
    if (!tramite.bactivo) {
      throw new NotFoundError(`El trámite "${codigo}" no está disponible`);
    }

    return tramite;
  }

  private paginar<T>(data: T[], total: number, query: ListarTramitesQuery): Paginado<T> {
    return {
      data,
      total,
      pagina: query.pagina,
      porPagina: query.porPagina,
      totalPaginas: Math.ceil(total / query.porPagina),
    };
  }
}
