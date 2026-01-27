// State File Watcher
import chokidar, { type FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import type { AplState } from '@apl-gui/shared';
import { config } from '../config.js';
import { readJsonFile } from '../utils/fileUtils.js';
import { debounce } from '../utils/debounce.js';

export class StateWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private lastState: AplState | null = null;

  start(): void {
    if (this.watcher) return;

    this.watcher = chokidar.watch(config.stateFilePath, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    const handleChange = debounce(async () => {
      const state = await readJsonFile<AplState>(config.stateFilePath);
      if (!state) return;

      // Detect phase changes
      if (this.lastState && this.lastState.phase !== state.phase) {
        this.emit('phase_change', {
          previousPhase: this.lastState.phase,
          newPhase: state.phase,
          iteration: state.iteration,
        });
      }

      // Detect task updates
      if (this.lastState) {
        for (const task of state.tasks) {
          const oldTask = this.lastState.tasks.find(t => t.id === task.id);
          if (!oldTask || oldTask.status !== task.status) {
            this.emit('task_update', { task });

            if (task.status === 'in_progress' && oldTask?.status !== 'in_progress') {
              this.emit('task_started', {
                taskId: task.id,
                description: task.description,
              });
            } else if (task.status === 'completed' && oldTask?.status !== 'completed') {
              this.emit('task_completed', {
                taskId: task.id,
                result: task.result,
              });
            } else if (task.status === 'failed' && oldTask?.status !== 'failed') {
              this.emit('task_failed', {
                taskId: task.id,
                error: task.error_history?.[task.error_history.length - 1]?.error || 'Unknown error',
                attempt: task.attempts,
              });
            }
          }
        }
      }

      // Detect new checkpoints
      if (this.lastState) {
        const newCheckpoints = state.checkpoints.filter(
          cp => !this.lastState!.checkpoints.find(lcp => lcp.id === cp.id)
        );
        for (const checkpoint of newCheckpoints) {
          this.emit('checkpoint_created', { checkpoint });
        }
      }

      this.lastState = state;
      this.emit('update', { state });
    }, 100);

    this.watcher.on('add', handleChange);
    this.watcher.on('change', handleChange);
    this.watcher.on('unlink', () => {
      this.lastState = null;
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
      this.lastState = null;
    }
  }

  isRunning(): boolean {
    return this.watcher !== null;
  }
}
