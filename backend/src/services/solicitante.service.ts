import { ISolicitanteRepository, SolicitanteDatos } from '../repositories/solicitante.repository';
import { CompletarDatosInput } from '../dtos/solicitante.dto';
import { NotFoundError, ValidationError } from '../errors/AppError';

export interface IdentificacionResult {
  codigoAlumno: string;
  apellidos: string;
  nombres: string;
  email: string;
  telefono: string;
  // true cuando faltan email/teléfono y el alumno debe completarlos (D-1)
  requiereCompletarDatos: boolean;
}

export class SolicitanteService {
  constructor(private readonly repo: ISolicitanteRepository) {}

  // RF-04 paso 1: valida el código y devuelve los datos del alumno
  async identificar(codigoAlumno: string): Promise<IdentificacionResult> {
    const alumno = await this.repo.buscarAlumno(codigoAlumno.trim());

    if (!alumno || !alumno.activo) {
      throw new NotFoundError('Estudiante no válido');
    }

    const email = alumno.email?.trim() ?? '';
    const telefono = alumno.telefono?.trim() ?? '';
    const requiereCompletarDatos = !email || !telefono;

    // Si ya tiene ambos datos, crea o actualiza el registro en tsolicitante
    if (!requiereCompletarDatos) {
      await this.repo.crearOActualizar({
        ccodigosolicitante: alumno.codigoalumno,
        cnombres: alumno.nombresalumno,
        capellidopaterno: alumno.apalumno,
        capellidomaterno: alumno.amalumno,
        cnumerodocumento: alumno.dni,
        cemail: email,
        ctelefono: telefono,
      });
    }

    return {
      codigoAlumno: alumno.codigoalumno,
      apellidos: [alumno.apalumno, alumno.amalumno].filter(Boolean).join(' '),
      nombres: alumno.nombresalumno ?? '',
      email,
      telefono,
      requiereCompletarDatos,
    };
  }

  // RF-04 paso 2 (D-1): completa email y teléfono faltantes, persiste en tsolicitante
  async completarDatos(
    codigoAlumno: string,
    datos: CompletarDatosInput,
  ): Promise<SolicitanteDatos> {
    const alumno = await this.repo.buscarAlumno(codigoAlumno.trim());

    if (!alumno || !alumno.activo) {
      throw new NotFoundError('Estudiante no válido');
    }

    // Solo se permite completar si efectivamente faltan los datos
    const emailActual = alumno.email?.trim() ?? '';
    const telefonoActual = alumno.telefono?.trim() ?? '';
    if (emailActual && telefonoActual) {
      throw new ValidationError('El alumno ya tiene email y teléfono registrados');
    }

    return this.repo.crearOActualizar({
      ccodigosolicitante: alumno.codigoalumno,
      cnombres: alumno.nombresalumno,
      capellidopaterno: alumno.apalumno,
      capellidomaterno: alumno.amalumno,
      cnumerodocumento: alumno.dni,
      cemail: datos.email,
      ctelefono: datos.telefono,
    });
  }
}
