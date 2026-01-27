// Checkpoints API Routes
import { Router, type Request, type Response } from 'express';
import { checkpointService } from '../services/checkpointService.js';

export const checkpointsRouter = Router();

// GET /api/checkpoints - Get all checkpoints
checkpointsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const checkpoints = await checkpointService.getCheckpoints();
    res.json(checkpoints);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get checkpoints',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/checkpoints/timeline - Get checkpoint timeline
checkpointsRouter.get('/timeline', async (_req: Request, res: Response) => {
  try {
    const timeline = await checkpointService.getCheckpointTimeline();
    res.json(timeline);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get checkpoint timeline',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/checkpoints/latest - Get latest checkpoint
checkpointsRouter.get('/latest', async (_req: Request, res: Response) => {
  try {
    const checkpoint = await checkpointService.getLatestCheckpoint();
    if (!checkpoint) {
      res.status(404).json({ error: 'No checkpoints found' });
      return;
    }
    res.json(checkpoint);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get latest checkpoint',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/checkpoints/:id - Get checkpoint by ID
checkpointsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const checkpoint = await checkpointService.getCheckpointById(req.params.id);
    if (!checkpoint) {
      res.status(404).json({ error: 'Checkpoint not found' });
      return;
    }
    res.json(checkpoint);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get checkpoint',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/checkpoints/:id/diff - Get checkpoint diff info
checkpointsRouter.get('/:id/diff', async (req: Request, res: Response) => {
  try {
    const diff = await checkpointService.getCheckpointDiff(req.params.id);
    if (!diff) {
      res.status(404).json({ error: 'Checkpoint not found' });
      return;
    }
    res.json(diff);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get checkpoint diff',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/checkpoints/phase/:phase - Get checkpoints by phase
checkpointsRouter.get('/phase/:phase', async (req: Request, res: Response) => {
  try {
    const checkpoints = await checkpointService.getCheckpointsByPhase(req.params.phase);
    res.json(checkpoints);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get checkpoints by phase',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/checkpoints/:id/rollback - Rollback to checkpoint
checkpointsRouter.post('/:id/rollback', async (req: Request, res: Response) => {
  try {
    const result = await checkpointService.rollbackToCheckpoint(req.params.id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to rollback',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
