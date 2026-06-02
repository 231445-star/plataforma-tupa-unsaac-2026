import { prisma } from '../lib/prisma';

export interface AlumnoDatos {
  codigoalumno: string;
  apalumno: string | null;
  amalumno: string | null;
  nombresalumno: string | null;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

export interface SolicitanteDatos {
  ccodigosolicitante: string;
  cnombres: string | null;
  capellidopaterno: string | null;
  capellidomaterno: string | null;
  cnumerodocumento: string | null;
  cemail: string | null;
  ctelefono: string | null;
}

export interface CrearSolicitanteInput {
  ccodigosolicitante: string;
  cnombres: string | null;
  capellidopaterno: string | null;
  capellidomaterno: string | null;
  cnumerodocumento: string | null;
  cemail: string;
  ctelefono: string;
}

export interface ISolicitanteRepository {
  buscarAlumno(codigo: string): Promise<AlumnoDatos | null>;
  obtenerSolicitante(codigo: string): Promise<SolicitanteDatos | null>;
  crearOActualizar(input: CrearSolicitanteInput): Promise<SolicitanteDatos>;
}

export class SolicitanteRepository implements ISolicitanteRepository {
  async buscarAlumno(codigo: string): Promise<AlumnoDatos | null> {
    return prisma.alumno.findUnique({
      where: { codigoalumno: codigo },
      select: {
        codigoalumno: true,
        apalumno: true,
        amalumno: true,
        nombresalumno: true,
        dni: true,
        telefono: true,
        email: true,
        activo: true,
      },
    });
  }

  async obtenerSolicitante(codigo: string): Promise<SolicitanteDatos | null> {
    return prisma.solicitante.findUnique({
      where: { ccodigosolicitante: codigo },
    });
  }

  async crearOActualizar(input: CrearSolicitanteInput): Promise<SolicitanteDatos> {
    return prisma.solicitante.upsert({
      where: { ccodigosolicitante: input.ccodigosolicitante },
      update: {
        cemail: input.cemail,
        ctelefono: input.ctelefono,
      },
      create: {
        ccodigosolicitante: input.ccodigosolicitante,
        cnombres: input.cnombres,
        capellidopaterno: input.capellidopaterno,
        capellidomaterno: input.capellidomaterno,
        cnumerodocumento: input.cnumerodocumento,
        cemail: input.cemail,
        ctelefono: input.ctelefono,
      },
    });
  }
}
