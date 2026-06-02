import { Router } from 'express';
import { registrarSolicitud } from '../controllers/solicitud.controller';

const router = Router();

// RF-05: POST /api/solicitudes — registra una nueva solicitud de trámite
router.post('/', registrarSolicitud);

export default router;
