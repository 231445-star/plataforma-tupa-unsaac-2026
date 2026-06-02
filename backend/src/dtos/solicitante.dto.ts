import { z } from 'zod';

export const CompletarDatosDto = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .email('El email no tiene un formato válido')
    .max(100),
  telefono: z
    .string({ required_error: 'El teléfono es obligatorio' })
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20)
    .regex(/^\+?[\d\s\-()]+$/, 'El teléfono solo puede contener dígitos'),
});

export type CompletarDatosInput = z.infer<typeof CompletarDatosDto>;
