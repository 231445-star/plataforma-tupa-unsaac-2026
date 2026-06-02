import { Router } from 'express';
import { listarTramites, buscarTramites, obtenerDetalleTramite } from '../controllers/tramite.controller';

const router = Router();

// RF-01: GET /api/tramites — lista paginada de trámites activos
router.get('/', listarTramites);

// RF-02: GET /api/tramites/buscar?busqueda=&dependencia= — búsqueda y filtrado
router.get('/buscar', buscarTramites);

// RF-03: GET /api/tramites/:codigo — detalle con requisitos y monto vigente
router.get('/:codigo', obtenerDetalleTramite);

export default router;
