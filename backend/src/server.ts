import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from '../config/env';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import { auth } from './middleware/auth';
// Mount legacy JS routers for resources not yet ported to TS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const legacyClients = require('../routes/clients');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const legacyMeetings = require('../routes/meetings');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const legacyProjects = require('../routes/projects');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const legacyLeads = require('../routes/leads');

export const app = express();

// Core middleware
app.use(express.json({ limit: '1mb' }));
app.use(helmet() as any);
app.use(compression() as any);
app.use(morgan('combined') as any);
app.use(
  (cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }) as any)
);

// Rate limit only chat endpoint
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/chat', chatLimiter as any);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
// Protect legacy clients route with TS auth middleware
app.use('/api/clients', auth as any, legacyClients);
app.use('/api/meetings', auth as any, legacyMeetings);
app.use('/api/projects', auth as any, legacyProjects);
app.use('/api/leads', auth as any, legacyLeads);

// Healthcheck
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Optionally, log the error here
  // console.error(err);
  res.status(500).json({ error: 'Internal server error', message: config.NODE_ENV === 'development' ? err.message : undefined });
});

export function startServer(port: number): void {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server running on port ${port}`);
  });
}

export default app;


