// Control API Routes
import { Router, type Request, type Response } from 'express';
import { aplService } from '../services/aplService.js';
import { config, updateProjectRoot } from '../config.js';

export const controlRouter = Router();

// GET /api/control/status - Get APL process status
controlRouter.get('/status', (_req: Request, res: Response) => {
  try {
    const status = aplService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/control/start - Start APL with a goal
controlRouter.post('/start', async (req: Request, res: Response) => {
  try {
    const { goal } = req.body;

    if (!goal || typeof goal !== 'string') {
      res.status(400).json({ error: 'Goal is required' });
      return;
    }

    const result = await aplService.startApl(goal);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to start APL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/control/stop - Stop APL
controlRouter.post('/stop', async (_req: Request, res: Response) => {
  try {
    const result = await aplService.stopApl();

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to stop APL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/control/project - Get current project root
controlRouter.get('/project', (_req: Request, res: Response) => {
  res.json({
    projectRoot: config.projectRoot,
    aplDir: config.aplDir,
  });
});

// POST /api/control/project - Set project root
controlRouter.post('/project', (req: Request, res: Response) => {
  try {
    const { projectRoot } = req.body;

    if (!projectRoot || typeof projectRoot !== 'string') {
      res.status(400).json({ error: 'Project root is required' });
      return;
    }

    updateProjectRoot(projectRoot);

    res.json({
      message: 'Project root updated',
      projectRoot: config.projectRoot,
      aplDir: config.aplDir,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update project root',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/control/info - Get server info
controlRouter.get('/info', (_req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    projectRoot: config.projectRoot,
    pluginRoot: config.pluginRoot,
    aplRunning: aplService.isRunning(),
  });
});
