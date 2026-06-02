import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SolicitudService } from './solicitud.service';
import { ISolicitudRepository, SolicitudResumen } from '../repositories/solicitud.repository';
import { ITramiteRepository, TramiteParaSolicitud } from '../repositories/tramite.repository';
import { ISolicitanteRepository, SolicitanteDatos } from '../repositories/solicitante.repository';
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError';
import { EstadoSolicitud } from '@prisma/client';

// ── fixtures ────────────────────────────────────────────────────────────────

const solicitanteCompleto: SolicitanteDatos = {
  ccodigosolicitante: '184001',
  cnombres: 'JUAN CARLOS',
  capellidopaterno: 'QUISPE',
  capellidomaterno: 'MAMANI',
  cnumerodocumento: '12345678',
  cemail: 'jquispe@unsaac.edu.pe',
  ctelefono: '984123456',
};

const solicitanteSinContacto: SolicitanteDatos = {
  ...solicitanteCompleto,
  cemail: null,
  ctelefono: null,
};

const tramiteActivo: TramiteParaSolicitud = {
  ccodigo: 'T001',
  cdenominaciontramite: 'Constancia de Estudios',
  bactivo: true,
  nidtmontotramite: 1,
  montoVigente: 15.0,
};

const tramiteInactivo: TramiteParaSolicitud = {
  ...tramiteActivo,
  bactivo: false,
};

const tramiteSinMonto: TramiteParaSolicitud = {
  ...tramiteActivo,
  nidtmontotramite: null,
  montoVigente: null,
};

const solicitudCreada: SolicitudResumen = {
  nidtsolicitudtramite: 1,
  cidtsolicitudtramite: 'TUPA-2026-ABC123',
  cestado: EstadoSolicitud.SOLICITADO,
  dfecharegistro: new Date(),
  solicitante: {
    ccodigosolicitante: '184001',
    cnombres: 'JUAN CARLOS',
    capellidopaterno: 'QUISPE',
    capellidomaterno: 'MAMANI',
    cemail: 'jquispe@unsaac.edu.pe',
  },
  tramite: {
    ccodigo: 'T001',
    cdenominaciontramite: 'Constancia de Estudios',
    nmontotramite: 15.0,
  },
};

// ── mocks ────────────────────────────────────────────────────────────────────

function crearSolicitudRepoMock(): ISolicitudRepository {
  return {
    buscarDuplicadoActivo: vi.fn().mockResolvedValue(false),
    crear: vi.fn().mockResolvedValue(solicitudCreada),
  };
}

function crearTramiteRepoMock(): ITramiteRepository {
  return {
    listar: vi.fn(),
    buscar: vi.fn(),
    obtenerDetalle: vi.fn(),
    obtenerParaSolicitud: vi.fn().mockResolvedValue(tramiteActivo),
  };
}

function crearSolicitanteRepoMock(): ISolicitanteRepository {
  return {
    buscarAlumno: vi.fn(),
    obtenerSolicitante: vi.fn().mockResolvedValue(solicitanteCompleto),
    crearOActualizar: vi.fn(),
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('SolicitudService — RF-05', () => {
  let solicitudRepo: ISolicitudRepository;
  let tramiteRepo: ITramiteRepository;
  let solicitanteRepo: ISolicitanteRepository;
  let service: SolicitudService;

  beforeEach(() => {
    solicitudRepo = crearSolicitudRepoMock();
    tramiteRepo = crearTramiteRepoMock();
    solicitanteRepo = crearSolicitanteRepoMock();
    service = new SolicitudService(solicitudRepo, tramiteRepo, solicitanteRepo);
  });

  describe('registrar()', () => {
    it('crea la solicitud correctamente con datos válidos', async () => {
      const resultado = await service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' });

      expect(resultado.cestado).toBe(EstadoSolicitud.SOLICITADO);
      expect(resultado.tramite.ccodigo).toBe('T001');
      expect(solicitudRepo.crear).toHaveBeenCalledOnce();
    });

    it('el código de seguimiento generado tiene el formato TUPA-YYYY-XXXXXXX', async () => {
      await service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' });

      const llamada = vi.mocked(solicitudRepo.crear).mock.calls[0][0];
      expect(llamada.cidtsolicitudtramite).toMatch(/^TUPA-\d{4}-[A-Z0-9]+$/);
    });

    it('lanza ValidationError si el alumno no completó RF-04 (no está en tsolicitante)', async () => {
      vi.mocked(solicitanteRepo.obtenerSolicitante).mockResolvedValue(null);

      await expect(
        service.registrar({ codigoAlumno: '184002', codigoTramite: 'T001' }),
      ).rejects.toThrow(ValidationError);
    });

    it('lanza ValidationError si el solicitante existe pero le faltan datos de contacto', async () => {
      vi.mocked(solicitanteRepo.obtenerSolicitante).mockResolvedValue(solicitanteSinContacto);

      await expect(
        service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' }),
      ).rejects.toThrow(ValidationError);
    });

    it('lanza NotFoundError si el trámite no existe', async () => {
      vi.mocked(tramiteRepo.obtenerParaSolicitud).mockResolvedValue(null);

      await expect(
        service.registrar({ codigoAlumno: '184001', codigoTramite: 'INEXISTENTE' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('lanza ConflictError si el trámite está desactivado (D-5)', async () => {
      vi.mocked(tramiteRepo.obtenerParaSolicitud).mockResolvedValue(tramiteInactivo);

      await expect(
        service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' }),
      ).rejects.toThrow(ConflictError);
    });

    it('lanza ValidationError si el trámite no tiene monto vigente', async () => {
      vi.mocked(tramiteRepo.obtenerParaSolicitud).mockResolvedValue(tramiteSinMonto);

      await expect(
        service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' }),
      ).rejects.toThrow(ValidationError);
    });

    it('lanza ConflictError si ya existe una solicitud activa del mismo trámite (D-3)', async () => {
      vi.mocked(solicitudRepo.buscarDuplicadoActivo).mockResolvedValue(true);

      await expect(
        service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' }),
      ).rejects.toThrow(ConflictError);
    });

    it('el mensaje de ConflictError por duplicado es claro', async () => {
      vi.mocked(solicitudRepo.buscarDuplicadoActivo).mockResolvedValue(true);

      await expect(
        service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' }),
      ).rejects.toThrow('Ya tiene una solicitud activa');
    });

    it('consulta duplicados con el código de alumno y trámite correctos', async () => {
      await service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' });

      expect(solicitudRepo.buscarDuplicadoActivo).toHaveBeenCalledWith('184001', 'T001');
    });

    it('pasa el monto vigente al crear la solicitud', async () => {
      await service.registrar({ codigoAlumno: '184001', codigoTramite: 'T001' });

      const llamada = vi.mocked(solicitudRepo.crear).mock.calls[0][0];
      expect(llamada.nmontotramite).toBe(15.0);
      expect(llamada.nidtmontotramite).toBe(1);
    });
  });
});
