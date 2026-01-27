// Config API Routes
import { Router, type Request, type Response } from 'express';
import { configService } from '../services/configService.js';

export const configRouter = Router();

// GET /api/config - Get merged config (master + project)
configRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const config = await configService.getMergedConfig();
    if (!config) {
      res.status(404).json({ error: 'Config not found' });
      return;
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/config/master - Get master config only
configRouter.get('/master', async (_req: Request, res: Response) => {
  try {
    const config = await configService.getMasterConfig();
    if (!config) {
      res.status(404).json({ error: 'Master config not found' });
      return;
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get master config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/config/project - Get project config only
configRouter.get('/project', async (_req: Request, res: Response) => {
  try {
    const config = await configService.getProjectConfig();
    res.json(config || {});
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get project config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PATCH /api/config/master - Update master config
configRouter.patch('/master', async (req: Request, res: Response) => {
  try {
    const success = await configService.updateMasterConfig(req.body);
    if (success) {
      const config = await configService.getMasterConfig();
      res.json(config);
    } else {
      res.status(500).json({ error: 'Failed to update master config' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update master config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PATCH /api/config/project - Update project config
configRouter.patch('/project', async (req: Request, res: Response) => {
  try {
    const success = await configService.updateProjectConfig(req.body);
    if (success) {
      const config = await configService.getProjectConfig();
      res.json(config);
    } else {
      res.status(500).json({ error: 'Failed to update project config' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update project config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/config/agents - Get agents config
configRouter.get('/agents', async (_req: Request, res: Response) => {
  try {
    const agents = await configService.getAgents();
    if (!agents) {
      res.status(404).json({ error: 'Agents config not found' });
      return;
    }
    res.json(agents);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get agents config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PATCH /api/config/agents/:name/toggle - Toggle agent enabled
configRouter.patch('/agents/:name/toggle', async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    const success = await configService.toggleAgent(req.params.name, enabled);

    if (success) {
      res.json({ message: `Agent ${req.params.name} ${enabled ? 'enabled' : 'disabled'}` });
    } else {
      res.status(404).json({ error: 'Agent not found' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to toggle agent',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/config/hooks - Get hooks config
configRouter.get('/hooks', async (_req: Request, res: Response) => {
  try {
    const hooks = await configService.getHooks();
    if (!hooks) {
      res.status(404).json({ error: 'Hooks config not found' });
      return;
    }
    res.json(hooks);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get hooks config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PATCH /api/config/hooks/:name/toggle - Toggle hook enabled
configRouter.patch('/hooks/:name/toggle', async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    const success = await configService.toggleHook(req.params.name, enabled);

    if (success) {
      res.json({ message: `Hook ${req.params.name} ${enabled ? 'enabled' : 'disabled'}` });
    } else {
      res.status(404).json({ error: 'Hook not found' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to toggle hook',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/config/section/:section - Get specific config section
configRouter.get('/section/:section', async (req: Request, res: Response) => {
  try {
    const config = await configService.getMasterConfig();
    if (!config) {
      res.status(404).json({ error: 'Config not found' });
      return;
    }

    const section = req.params.section as keyof typeof config;
    if (!(section in config)) {
      res.status(404).json({ error: `Section ${section} not found` });
      return;
    }

    res.json(config[section]);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get config section',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
