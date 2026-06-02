import { z } from 'zod';

export const CrearSolicitudDto = z.object({
  codigoAlumno: z
    .string({ required_error: 'El código de alumno es obligatorio' })
    .min(1, 'El código de alumno no puede estar vacío'),
  codigoTramite: z
    .string({ required_error: 'El código de trámite es obligatorio' })
    .min(1, 'El código de trámite no puede estar vacío'),
});

export type CrearSolicitudInput = z.infer<typeof CrearSolicitudDto>;
