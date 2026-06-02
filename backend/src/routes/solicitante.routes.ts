import { Router } from 'express';
import { identificarAlumno, completarDatos } from '../controllers/solicitante.controller';

const router = Router();

// RF-04 paso 1: identifica al alumno por su código
router.get('/:codigo', identificarAlumno);

// RF-04 paso 2 (D-1): completa email y teléfono si faltan
router.post('/:codigo/completar', completarDatos);

export default router;
