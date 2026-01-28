// Watcher Manager - coordinates all file watchers
import { EventEmitter } from 'events';
import { StateWatcher } from './stateWatcher.js';
import { LearningsWatcher } from './learningsWatcher.js';
import { ConfigWatcher } from './configWatcher.js';

export class WatcherManager extends EventEmitter {
  private stateWatcher: StateWatcher;
  private learningsWatcher: LearningsWatcher;
  private configWatcher: ConfigWatcher;

  constructor() {
    super();
    this.stateWatcher = new StateWatcher();
    this.learningsWatcher = new LearningsWatcher();
    this.configWatcher = new ConfigWatcher();

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward state events
    this.stateWatcher.on('update', (data) => this.emit('state:update', data));
    this.stateWatcher.on('phase_change', (data) => this.emit('state:phase_change', data));
    this.stateWatcher.on('cleared', (data) => this.emit('state:cleared', data));
    this.stateWatcher.on('task_update', (data) => this.emit('task:update', data));
    this.stateWatcher.on('task_started', (data) => this.emit('task:started', data));
    this.stateWatcher.on('task_completed', (data) => this.emit('task:completed', data));
    this.stateWatcher.on('task_failed', (data) => this.emit('task:failed', data));
    this.stateWatcher.on('checkpoint_created', (data) => this.emit('checkpoint:created', data));
    this.stateWatcher.on('error', (data) => this.emit('error', { ...data, source: 'state' }));

    // Forward learnings events
    this.learningsWatcher.on('update', (data) => this.emit('learnings:update', data));
    this.learningsWatcher.on('cleared', (data) => this.emit('learnings:cleared', data));
    this.learningsWatcher.on('error', (data) => this.emit('error', { ...data, source: 'learnings' }));

    // Forward config events
    this.configWatcher.on('update', (data) => this.emit('config:update', data));
    this.configWatcher.on('project_removed', (data) => this.emit('config:project_removed', data));
    this.configWatcher.on('error', (data) => this.emit('error', { ...data, source: 'config' }));
  }

  start(): void {
    this.stateWatcher.start();
    this.learningsWatcher.start();
    this.configWatcher.start();
  }

  stop(): void {
    this.stateWatcher.stop();
    this.learningsWatcher.stop();
    this.configWatcher.stop();
  }

  getStatus(): {
    state: boolean;
    learnings: boolean;
    config: boolean;
  } {
    return {
      state: this.stateWatcher.isRunning(),
      learnings: this.learningsWatcher.isRunning(),
      config: this.configWatcher.isRunning(),
    };
  }
}

export function createWatchers(): WatcherManager {
  return new WatcherManager();
}
