// Learnings File Watcher
import chokidar, { type FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import type { Learnings } from '@apl-gui/shared';
import { config } from '../config.js';
import { readJsonFile } from '../utils/fileUtils.js';
import { debounce } from '../utils/debounce.js';

export class LearningsWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;

  start(): void {
    if (this.watcher) return;

    this.watcher = chokidar.watch(config.learningsFilePath, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    const handleChange = debounce(async () => {
      const learnings = await readJsonFile<Learnings>(config.learningsFilePath);
      if (learnings) {
        this.emit('update', { learnings });
      }
    }, 100);

    this.watcher.on('add', handleChange);
    this.watcher.on('change', handleChange);
    this.watcher.on('unlink', () => {
      this.emit('cleared', {});
    });
    this.watcher.on('error', (error) => {
      this.emit('error', { error: error.message });
    });
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  isRunning(): boolean {
    return this.watcher !== null;
  }
}
