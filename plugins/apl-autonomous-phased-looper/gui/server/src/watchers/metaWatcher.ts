// Meta Directory Watcher
import chokidar, { type FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import path from 'path';
import { config } from '../config.js';
import { readJsonFile } from '../utils/fileUtils.js';
import { debounce } from '../utils/debounce.js';

export class MetaWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;

  start(): void {
    if (this.watcher) return;

    // Watch the entire .meta directory
    this.watcher = chokidar.watch(config.metaDir, {
      persistent: true,
      ignoreInitial: false,
      depth: 2, // Watch epics subdirectory too
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    const handleChange = debounce(async (filePath: string) => {
      const fileName = path.basename(filePath);
      const content = await readJsonFile<object>(filePath);

      if (!content) return;

      if (fileName === 'plan.json') {
        this.emit('plan_update', { plan: content });
      } else if (fileName === 'progress.json') {
        this.emit('progress_update', { progress: content });
      } else if (filePath.includes('/epics/')) {
        this.emit('epic_update', {
          epicFile: fileName,
          epic: content,
        });
      }

      this.emit('update', {
        file: fileName,
        path: filePath,
        content,
      });
    }, 100);

    this.watcher.on('add', handleChange);
    this.watcher.on('change', handleChange);
    this.watcher.on('unlink', (filePath) => {
      this.emit('file_removed', { path: filePath });
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
