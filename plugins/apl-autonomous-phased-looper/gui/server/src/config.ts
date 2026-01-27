// Server Configuration
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigins: string[];
  // APL paths
  pluginRoot: string;
  masterConfigPath: string;
  patternsPath: string;
  agentsPath: string;
  // Project paths (set at runtime)
  projectRoot: string;
  aplDir: string;
  stateFilePath: string;
  learningsFilePath: string;
  projectConfigPath: string;
  metaDir: string;
}

function resolvePluginRoot(): string {
  // Navigate from gui/server/src to plugin root
  return path.resolve(__dirname, '../../..');
}

function createConfig(): ServerConfig {
  const pluginRoot = resolvePluginRoot();
  const projectRoot = process.env.APL_PROJECT_ROOT || process.cwd();

  return {
    port: parseInt(process.env.APL_GUI_PORT || '3001', 10),
    host: process.env.APL_GUI_HOST || 'localhost',
    corsOrigins: (process.env.APL_GUI_CORS_ORIGINS || 'http://localhost:5173').split(','),

    // Plugin paths (read-only)
    pluginRoot,
    masterConfigPath: path.join(pluginRoot, 'master-config.json'),
    patternsPath: path.join(pluginRoot, 'patterns'),
    agentsPath: path.join(pluginRoot, 'agents'),

    // Project paths (writable)
    projectRoot,
    aplDir: path.join(projectRoot, '.apl'),
    stateFilePath: path.join(projectRoot, '.apl/state.json'),
    learningsFilePath: path.join(projectRoot, '.apl/learnings.json'),
    projectConfigPath: path.join(projectRoot, '.apl/config.json'),
    metaDir: path.join(projectRoot, '.meta'),
  };
}

export const config = createConfig();

export function updateProjectRoot(newRoot: string): void {
  config.projectRoot = newRoot;
  config.aplDir = path.join(newRoot, '.apl');
  config.stateFilePath = path.join(newRoot, '.apl/state.json');
  config.learningsFilePath = path.join(newRoot, '.apl/learnings.json');
  config.projectConfigPath = path.join(newRoot, '.apl/config.json');
  config.metaDir = path.join(newRoot, '.meta');
}
