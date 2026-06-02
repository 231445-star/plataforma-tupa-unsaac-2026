import { z } from 'zod';

export const ListarTramitesQueryDto = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(20),
  busqueda: z.string().trim().optional(),
  dependencia: z.string().trim().optional(),
});

export type ListarTramitesQuery = z.infer<typeof ListarTramitesQueryDto>;
