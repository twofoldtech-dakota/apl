// State API Routes
import { Router, type Request, type Response } from 'express';
import { stateService } from '../services/stateService.js';

export const stateRouter = Router();

// GET /api/state - Get current APL state
stateRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const state = await stateService.getState();
    res.json(state);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get state',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/active - Check if there's an active session
stateRouter.get('/active', async (_req: Request, res: Response) => {
  try {
    const hasActive = await stateService.hasActiveSession();
    res.json({ active: hasActive });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check active session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/tasks - Get all tasks
stateRouter.get('/tasks', async (_req: Request, res: Response) => {
  try {
    const state = await stateService.getState();
    res.json(state.tasks);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get tasks',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/tasks/:id - Get task by ID
stateRouter.get('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const task = await stateService.getTaskById(taskId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get task',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/tasks/status/:status - Get tasks by status
stateRouter.get('/tasks/status/:status', async (req: Request, res: Response) => {
  try {
    const tasks = await stateService.getTasksByStatus(req.params.status);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get tasks by status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/metrics - Get metrics
stateRouter.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = await stateService.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/scratchpad - Get scratchpad
stateRouter.get('/scratchpad', async (_req: Request, res: Response) => {
  try {
    const scratchpad = await stateService.getScratchpad();
    res.json(scratchpad);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get scratchpad',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/verification - Get verification log
stateRouter.get('/verification', async (_req: Request, res: Response) => {
  try {
    const log = await stateService.getVerificationLog();
    res.json(log);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get verification log',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/state/errors - Get errors
stateRouter.get('/errors', async (_req: Request, res: Response) => {
  try {
    const errors = await stateService.getErrors();
    res.json(errors);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get errors',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/state - Clear state
stateRouter.delete('/', async (_req: Request, res: Response) => {
  try {
    const success = await stateService.clearState();
    if (success) {
      res.json({ message: 'State cleared' });
    } else {
      res.status(500).json({ error: 'Failed to clear state' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear state',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
