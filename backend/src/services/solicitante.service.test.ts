import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SolicitanteService } from './solicitante.service';
import { ISolicitanteRepository, AlumnoDatos, SolicitanteDatos } from '../repositories/solicitante.repository';
import { NotFoundError, ValidationError } from '../errors/AppError';

// ── fixtures ────────────────────────────────────────────────────────────────

const alumnoCompleto: AlumnoDatos = {
  codigoalumno: '184001',
  apalumno: 'QUISPE',
  amalumno: 'MAMANI',
  nombresalumno: 'JUAN CARLOS',
  dni: '12345678',
  telefono: '984123456',
  email: 'jquispe@unsaac.edu.pe',
  activo: true,
};

const alumnoSinContacto: AlumnoDatos = {
  ...alumnoCompleto,
  codigoalumno: '184002',
  email: '',
  telefono: '',
};

const alumnoSoloEmail: AlumnoDatos = {
  ...alumnoCompleto,
  codigoalumno: '204010',
  telefono: '',
};

const alumnoInactivo: AlumnoDatos = {
  ...alumnoCompleto,
  activo: false,
};

const solicitanteEjemplo: SolicitanteDatos = {
  ccodigosolicitante: '184001',
  cnombres: 'JUAN CARLOS',
  capellidopaterno: 'QUISPE',
  capellidomaterno: 'MAMANI',
  cnumerodocumento: '12345678',
  cemail: 'jquispe@unsaac.edu.pe',
  ctelefono: '984123456',
};

function crearRepoMock(): ISolicitanteRepository {
  return {
    buscarAlumno: vi.fn(),
    obtenerSolicitante: vi.fn(),
    crearOActualizar: vi.fn().mockResolvedValue(solicitanteEjemplo),
  };
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('SolicitanteService — RF-04', () => {
  let repo: ISolicitanteRepository;
  let service: SolicitanteService;

  beforeEach(() => {
    repo = crearRepoMock();
    service = new SolicitanteService(repo);
  });

  describe('identificar()', () => {
    it('retorna datos del alumno cuando el código es válido y tiene contacto completo', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoCompleto);

      const resultado = await service.identificar('184001');

      expect(resultado.codigoAlumno).toBe('184001');
      expect(resultado.apellidos).toBe('QUISPE MAMANI');
      expect(resultado.nombres).toBe('JUAN CARLOS');
      expect(resultado.requiereCompletarDatos).toBe(false);
    });

    it('crea el solicitante automáticamente cuando el alumno ya tiene email y teléfono', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoCompleto);

      await service.identificar('184001');

      expect(repo.crearOActualizar).toHaveBeenCalledWith(
        expect.objectContaining({
          ccodigosolicitante: '184001',
          cemail: 'jquispe@unsaac.edu.pe',
          ctelefono: '984123456',
        }),
      );
    });

    it('marca requiereCompletarDatos=true cuando faltan email y teléfono (D-1)', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoSinContacto);

      const resultado = await service.identificar('184002');

      expect(resultado.requiereCompletarDatos).toBe(true);
      expect(repo.crearOActualizar).not.toHaveBeenCalled();
    });

    it('marca requiereCompletarDatos=true cuando falta solo el teléfono', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoSoloEmail);

      const resultado = await service.identificar('204010');

      expect(resultado.requiereCompletarDatos).toBe(true);
    });

    it('lanza NotFoundError cuando el código no existe (D-1)', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(null);

      await expect(service.identificar('999999')).rejects.toThrow(NotFoundError);
      await expect(service.identificar('999999')).rejects.toThrow('Estudiante no válido');
    });

    it('lanza NotFoundError cuando el alumno está inactivo', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoInactivo);

      await expect(service.identificar('184001')).rejects.toThrow(NotFoundError);
    });

    it('trimea espacios del código antes de buscar', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoCompleto);

      await service.identificar('  184001  ');

      expect(repo.buscarAlumno).toHaveBeenCalledWith('184001');
    });
  });

  describe('completarDatos()', () => {
    it('persiste email y teléfono en tsolicitante cuando el alumno no los tiene', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoSinContacto);

      await service.completarDatos('184002', {
        email: 'nuevo@correo.com',
        telefono: '951111111',
      });

      expect(repo.crearOActualizar).toHaveBeenCalledWith(
        expect.objectContaining({
          cemail: 'nuevo@correo.com',
          ctelefono: '951111111',
        }),
      );
    });

    it('lanza ValidationError si el alumno ya tiene ambos datos registrados', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(alumnoCompleto);

      await expect(
        service.completarDatos('184001', { email: 'otro@mail.com', telefono: '900000000' }),
      ).rejects.toThrow(ValidationError);
    });

    it('lanza NotFoundError si el código no existe', async () => {
      vi.mocked(repo.buscarAlumno).mockResolvedValue(null);

      await expect(
        service.completarDatos('999999', { email: 'x@x.com', telefono: '900000000' }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
