// APL State Store
import { create } from 'zustand';
import type { AplState, Task, Checkpoint, MasterConfig, Learnings } from '@apl-gui/shared';
import { DEFAULT_STATE } from '@apl-gui/shared';
import { api } from '../api/client';
import type { ActivityEvent } from '../types';

interface AplStore {
  // State
  state: AplState;
  isLoading: boolean;
  error: string | null;
  connected: boolean;

  // Config
  config: MasterConfig | null;

  // Learnings
  learnings: Learnings | null;

  // APL Process
  aplRunning: boolean;
  aplPid: number | null;

  // Activity feed
  activityEvents: ActivityEvent[];

  // Actions
  setState: (state: AplState) => void;
  updateTask: (task: Task) => void;
  addCheckpoint: (checkpoint: Checkpoint) => void;
  setConfig: (config: MasterConfig) => void;
  setLearnings: (learnings: Learnings) => void;
  setConnected: (connected: boolean) => void;
  setAplRunning: (running: boolean, pid?: number) => void;
  addActivityEvent: (event: Omit<ActivityEvent, 'id'>) => void;
  clearActivityEvents: () => void;
  setError: (error: string | null) => void;

  // Fetch actions
  fetchInitialState: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  fetchLearnings: () => Promise<void>;
}

export const useAplStore = create<AplStore>((set, get) => ({
  // Initial state
  state: DEFAULT_STATE,
  isLoading: false,
  error: null,
  connected: false,
  config: null,
  learnings: null,
  aplRunning: false,
  aplPid: null,
  activityEvents: [],

  // Actions
  setState: (state) => {
    const previousPhase = get().state.phase;
    set({ state, isLoading: false, error: null });

    // Add activity event if phase changed
    if (previousPhase !== state.phase && state.phase) {
      get().addActivityEvent({
        timestamp: new Date().toISOString(),
        type: 'phase',
        message: `Phase changed to ${state.phase.toUpperCase()}`,
        details: { from: previousPhase, to: state.phase },
      });
    }
  },

  updateTask: (task) => {
    set((s) => {
      const taskIndex = s.state.tasks.findIndex((t) => t.id === task.id);
      if (taskIndex === -1) return s;

      const tasks = [...s.state.tasks];
      tasks[taskIndex] = task;

      return {
        state: { ...s.state, tasks },
      };
    });

    // Add activity event
    const eventType = task.status === 'completed' ? 'task' : task.status === 'failed' ? 'error' : 'task';
    get().addActivityEvent({
      timestamp: new Date().toISOString(),
      type: eventType,
      message: `Task ${task.id}: ${task.status} - ${task.description.slice(0, 50)}...`,
      details: task,
    });
  },

  addCheckpoint: (checkpoint) => {
    set((s) => ({
      state: {
        ...s.state,
        checkpoints: [...s.state.checkpoints, checkpoint],
      },
    }));

    get().addActivityEvent({
      timestamp: checkpoint.timestamp,
      type: 'checkpoint',
      message: `Checkpoint ${checkpoint.id} created at iteration ${checkpoint.iteration}`,
      details: checkpoint,
    });
  },

  setConfig: (config) => set({ config }),

  setLearnings: (learnings) => set({ learnings }),

  setConnected: (connected) => {
    set({ connected });
    if (connected) {
      get().addActivityEvent({
        timestamp: new Date().toISOString(),
        type: 'info',
        message: 'Connected to APL server',
      });
    }
  },

  setAplRunning: (running, pid) => set({ aplRunning: running, aplPid: pid || null }),

  addActivityEvent: (event) => {
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((s) => ({
      activityEvents: [{ ...event, id }, ...s.activityEvents].slice(0, 100), // Keep last 100 events
    }));
  },

  clearActivityEvents: () => set({ activityEvents: [] }),

  setError: (error) => set({ error, isLoading: false }),

  // Fetch actions
  fetchInitialState: async () => {
    set({ isLoading: true, error: null });
    try {
      const [state, status] = await Promise.all([
        api.getState(),
        api.getStatus(),
      ]);
      set({
        state,
        aplRunning: status.running,
        aplPid: status.pid || null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch state',
        isLoading: false,
      });
    }
  },

  fetchConfig: async () => {
    try {
      const config = await api.getConfig();
      set({ config });
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  },

  fetchLearnings: async () => {
    try {
      const learnings = await api.getLearnings();
      set({ learnings });
    } catch (error) {
      console.error('Failed to fetch learnings:', error);
    }
  },
}));
