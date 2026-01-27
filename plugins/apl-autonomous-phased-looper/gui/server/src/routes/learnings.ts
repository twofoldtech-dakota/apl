// Learnings API Routes
import { Router, type Request, type Response } from 'express';
import { learningsService } from '../services/learningsService.js';

export const learningsRouter = Router();

// GET /api/learnings - Get all learnings
learningsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const learnings = await learningsService.getLearnings();
    res.json(learnings);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get learnings',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/stats - Get learnings statistics
learningsRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await learningsService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get learnings stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/success-patterns - Get success patterns
learningsRouter.get('/success-patterns', async (_req: Request, res: Response) => {
  try {
    const patterns = await learningsService.getSuccessPatterns();
    res.json(patterns);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get success patterns',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/anti-patterns - Get anti-patterns
learningsRouter.get('/anti-patterns', async (_req: Request, res: Response) => {
  try {
    const patterns = await learningsService.getAntiPatterns();
    res.json(patterns);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get anti-patterns',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/pattern/:id - Get pattern by ID
learningsRouter.get('/pattern/:id', async (req: Request, res: Response) => {
  try {
    const pattern = await learningsService.getPatternById(req.params.id);
    if (!pattern) {
      res.status(404).json({ error: 'Pattern not found' });
      return;
    }
    res.json(pattern);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get pattern',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/learnings/pattern/:id - Delete pattern
learningsRouter.delete('/pattern/:id', async (req: Request, res: Response) => {
  try {
    const success = await learningsService.deletePattern(req.params.id);
    if (success) {
      res.json({ message: 'Pattern deleted' });
    } else {
      res.status(404).json({ error: 'Pattern not found' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete pattern',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /api/learnings/patterns - Clear all patterns
learningsRouter.delete('/patterns', async (_req: Request, res: Response) => {
  try {
    const success = await learningsService.clearAllPatterns();
    if (success) {
      res.json({ message: 'All patterns cleared' });
    } else {
      res.status(500).json({ error: 'Failed to clear patterns' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear patterns',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/user-preferences - Get user preferences
learningsRouter.get('/user-preferences', async (_req: Request, res: Response) => {
  try {
    const preferences = await learningsService.getUserPreferences();
    res.json(preferences);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get user preferences',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/project-knowledge - Get project knowledge
learningsRouter.get('/project-knowledge', async (_req: Request, res: Response) => {
  try {
    const knowledge = await learningsService.getProjectKnowledge();
    res.json(knowledge);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get project knowledge',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/technique-stats - Get technique statistics
learningsRouter.get('/technique-stats', async (_req: Request, res: Response) => {
  try {
    const stats = await learningsService.getTechniqueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get technique stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/by-tag/:tag - Get patterns by tag
learningsRouter.get('/by-tag/:tag', async (req: Request, res: Response) => {
  try {
    const patterns = await learningsService.getPatternsByTag(req.params.tag);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get patterns by tag',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/learnings/by-task-type/:type - Get patterns by task type
learningsRouter.get('/by-task-type/:type', async (req: Request, res: Response) => {
  try {
    const patterns = await learningsService.getPatternsByTaskType(req.params.type);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get patterns by task type',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
