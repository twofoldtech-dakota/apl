// Express Application Setup
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';

// Import routes
import { stateRouter } from './routes/state.js';
import { configRouter } from './routes/config.js';
import { learningsRouter } from './routes/learnings.js';
import { patternsRouter } from './routes/patterns.js';
import { checkpointsRouter } from './routes/checkpoints.js';
import { controlRouter } from './routes/control.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
  }));

  app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
  }));

  app.use(express.json());

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      projectRoot: config.projectRoot,
    });
  });

  // API Routes
  app.use('/api/state', stateRouter);
  app.use('/api/config', configRouter);
  app.use('/api/learnings', learningsRouter);
  app.use('/api/patterns', patternsRouter);
  app.use('/api/checkpoints', checkpointsRouter);
  app.use('/api/control', controlRouter);

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
    });
  });

  return app;
}
