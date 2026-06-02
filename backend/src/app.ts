import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import tramiteRoutes from './routes/tramite.routes';
import solicitanteRoutes from './routes/solicitante.routes';
import solicitudRoutes from './routes/solicitud.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas públicas
app.use('/api/tramites', tramiteRoutes);
app.use('/api/solicitantes', solicitanteRoutes);
app.use('/api/solicitudes', solicitudRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

export default app;
