import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TramiteService } from './tramite.service';
import { ITramiteRepository, TramiteListItem, TramiteDetalle } from '../repositories/tramite.repository';
import { NotFoundError } from '../errors/AppError';

const tramiteEjemplo: TramiteListItem = {
  ccodigo: 'T001',
  cdenominaciontramite: 'Constancia de Estudios',
  cdescripcion: 'Constancia para acreditar estudios',
  bactivo: true,
  montoVigente: 15.5,
  dependencia: 'Secretaría General',
};

const detalleEjemplo: TramiteDetalle = {
  ...tramiteEjemplo,
  requisitos: [{ nidtrequisitotramite: 1, cdescripcionrequisito: 'Solicitud firmada' }],
  montos: [{ nidtmontotramite: 1, nmonto: 15.5, cdescripcionpago: 'Pago por constancia', dfechainicio: new Date('2024-01-01'), dfechafin: null }],
};

function crearRepoMock(): ITramiteRepository {
  return {
    listar: vi.fn(),
    buscar: vi.fn(),
    obtenerDetalle: vi.fn(),
  };
}

describe('TramiteService', () => {
  let repo: ITramiteRepository;
  let service: TramiteService;

  beforeEach(() => {
    repo = crearRepoMock();
    service = new TramiteService(repo);
  });

  describe('listarTramites (RF-01)', () => {
    it('retorna trámites paginados correctamente', async () => {
      vi.mocked(repo.listar).mockResolvedValue({ data: [tramiteEjemplo], total: 1 });

      const resultado = await service.listarTramites({ pagina: 1, porPagina: 20 });

      expect(resultado.data).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(resultado.pagina).toBe(1);
      expect(resultado.totalPaginas).toBe(1);
    });

    it('calcula totalPaginas correctamente con múltiples páginas', async () => {
      vi.mocked(repo.listar).mockResolvedValue({
        data: Array(10).fill(tramiteEjemplo),
        total: 45,
      });

      const resultado = await service.listarTramites({ pagina: 1, porPagina: 10 });

      expect(resultado.totalPaginas).toBe(5);
    });
  });

  describe('buscarTramites (RF-02)', () => {
    it('retorna resultado de búsqueda con paginación', async () => {
      vi.mocked(repo.buscar).mockResolvedValue({ data: [tramiteEjemplo], total: 1 });

      const resultado = await service.buscarTramites({ pagina: 1, porPagina: 20, busqueda: 'Constancia' });

      expect(repo.buscar).toHaveBeenCalledWith({ pagina: 1, porPagina: 20, busqueda: 'Constancia' });
      expect(resultado.data[0].cdenominaciontramite).toBe('Constancia de Estudios');
    });

    it('retorna lista vacía cuando no hay coincidencias', async () => {
      vi.mocked(repo.buscar).mockResolvedValue({ data: [], total: 0 });

      const resultado = await service.buscarTramites({ pagina: 1, porPagina: 20, busqueda: 'xyz_inexistente' });

      expect(resultado.total).toBe(0);
      expect(resultado.data).toHaveLength(0);
    });
  });

  describe('obtenerDetalle (RF-03)', () => {
    it('retorna el detalle completo de un trámite activo', async () => {
      vi.mocked(repo.obtenerDetalle).mockResolvedValue(detalleEjemplo);

      const resultado = await service.obtenerDetalle('T001');

      expect(resultado.ccodigo).toBe('T001');
      expect(resultado.requisitos).toHaveLength(1);
      expect(resultado.montos).toHaveLength(1);
    });

    it('lanza NotFoundError si el trámite no existe', async () => {
      vi.mocked(repo.obtenerDetalle).mockResolvedValue(null);

      await expect(service.obtenerDetalle('INEXISTENTE')).rejects.toThrow(NotFoundError);
    });

    it('lanza NotFoundError si el trámite está inactivo', async () => {
      vi.mocked(repo.obtenerDetalle).mockResolvedValue({ ...detalleEjemplo, bactivo: false });

      await expect(service.obtenerDetalle('T001')).rejects.toThrow(NotFoundError);
    });
  });
});
