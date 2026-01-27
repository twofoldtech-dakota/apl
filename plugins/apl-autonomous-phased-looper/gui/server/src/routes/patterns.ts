// Patterns API Routes
import { Router, type Request, type Response } from 'express';
import { patternService } from '../services/patternService.js';

export const patternsRouter = Router();

// GET /api/patterns - Get pattern index
patternsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const index = await patternService.getPatternIndex();
    res.json(index);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get pattern index',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/patterns/categories - Get all categories
patternsRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await patternService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get categories',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/patterns/category/:category - Get patterns by category
patternsRouter.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const patterns = await patternService.getPatternsByCategory(req.params.category);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get patterns by category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/patterns/pattern/:id - Get pattern by ID
patternsRouter.get('/pattern/:id', async (req: Request, res: Response) => {
  try {
    const pattern = await patternService.getPatternById(req.params.id);
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

// GET /api/patterns/search - Search patterns
patternsRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const patterns = await patternService.searchPatterns(query);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to search patterns',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/patterns/tags - Get all tags
patternsRouter.get('/tags', async (_req: Request, res: Response) => {
  try {
    const tags = await patternService.getAllTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get tags',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/patterns/by-tag/:tag - Get patterns by tag
patternsRouter.get('/by-tag/:tag', async (req: Request, res: Response) => {
  try {
    const patterns = await patternService.getPatternsByTag(req.params.tag);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get patterns by tag',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/patterns/clear-cache - Clear pattern cache
patternsRouter.post('/clear-cache', (_req: Request, res: Response) => {
  try {
    patternService.clearCache();
    res.json({ message: 'Pattern cache cleared' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
