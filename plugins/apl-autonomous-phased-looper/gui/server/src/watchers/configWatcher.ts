// Config File Watcher
import chokidar, { type FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import type { MasterConfig } from '@apl-gui/shared';
import { config } from '../config.js';
import { readJsonFile } from '../utils/fileUtils.js';
import { debounce } from '../utils/debounce.js';

export class ConfigWatcher extends EventEmitter {
  private masterWatcher: FSWatcher | null = null;
  private projectWatcher: FSWatcher | null = null;

  start(): void {
    // Watch master config
    if (!this.masterWatcher) {
      this.masterWatcher = chokidar.watch(config.masterConfigPath, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      });

      const handleMasterChange = debounce(async () => {
        const masterConfig = await readJsonFile<MasterConfig>(config.masterConfigPath);
        if (masterConfig) {
          this.emit('update', { config: masterConfig, source: 'master' });
        }
      }, 100);

      this.masterWatcher.on('add', handleMasterChange);
      this.masterWatcher.on('change', handleMasterChange);
      this.masterWatcher.on('error', (error) => {
        this.emit('error', { error: error.message, source: 'master' });
      });
    }

    // Watch project config
    if (!this.projectWatcher) {
      this.projectWatcher = chokidar.watch(config.projectConfigPath, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      });

      const handleProjectChange = debounce(async () => {
        const projectConfig = await readJsonFile<object>(config.projectConfigPath);
        if (projectConfig) {
          this.emit('update', { config: projectConfig, source: 'project' });
        }
      }, 100);

      this.projectWatcher.on('add', handleProjectChange);
      this.projectWatcher.on('change', handleProjectChange);
      this.projectWatcher.on('unlink', () => {
        this.emit('project_removed', {});
      });
      this.projectWatcher.on('error', (error) => {
        this.emit('error', { error: error.message, source: 'project' });
      });
    }
  }

  stop(): void {
    if (this.masterWatcher) {
      this.masterWatcher.close();
      this.masterWatcher = null;
    }
    if (this.projectWatcher) {
      this.projectWatcher.close();
      this.projectWatcher = null;
    }
  }

  isRunning(): boolean {
    return this.masterWatcher !== null || this.projectWatcher !== null;
  }
}
