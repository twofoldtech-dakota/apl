// APL State Store with Agentic Features
import { create } from 'zustand';
import type { AplState, Task, Checkpoint, MasterConfig, Learnings } from '@apl-gui/shared';
import type { AgentActivity, ToolInvocation, TokenUsage, ActivityEvent, AgentId, ReActStep } from '@apl-gui/shared';
import { DEFAULT_STATE, DEFAULT_AGENT_ACTIVITY, DEFAULT_TOKEN_USAGE } from '@apl-gui/shared';
import { api } from '../api/client';

interface AplStore {
  // Core State
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

  // Agentic Features
  agentActivity: AgentActivity;
  toolInvocations: ToolInvocation[];
  tokenUsage: TokenUsage;

  // Core Actions
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

  // Agentic Actions
  setAgentActivity: (activity: Partial<AgentActivity>) => void;
  setActiveAgent: (agentId: AgentId | null) => void;
  setReActStep: (step: ReActStep, iteration?: number) => void;
  addToDelegationChain: (agentId: AgentId) => void;
  clearDelegationChain: () => void;
  addToolInvocation: (invocation: ToolInvocation) => void;
  updateToolInvocation: (id: string, update: Partial<ToolInvocation>) => void;
  clearToolInvocations: () => void;
  setTokenUsage: (usage: Partial<TokenUsage>) => void;
  addToTokenHistory: (tokens: number) => void;

  // Fetch actions
  fetchInitialState: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  fetchLearnings: () => Promise<void>;

  // Reset actions
  resetState: () => void;
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

  // Agentic initial state
  agentActivity: DEFAULT_AGENT_ACTIVITY,
  toolInvocations: [],
  tokenUsage: DEFAULT_TOKEN_USAGE,

  // Core Actions
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
      details: task as unknown as Record<string, unknown>,
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
      details: checkpoint as unknown as Record<string, unknown>,
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

  setAplRunning: (running, pid) => {
    set({ aplRunning: running, aplPid: pid || null });

    // Reset agentic state when APL stops
    if (!running) {
      set({
        agentActivity: DEFAULT_AGENT_ACTIVITY,
      });
    }
  },

  addActivityEvent: (event) => {
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((s) => ({
      activityEvents: [{ ...event, id }, ...s.activityEvents].slice(0, 100), // Keep last 100 events
    }));
  },

  clearActivityEvents: () => set({ activityEvents: [] }),

  setError: (error) => set({ error, isLoading: false }),

  // Agentic Actions
  setAgentActivity: (activity) => {
    set((s) => ({
      agentActivity: { ...s.agentActivity, ...activity },
    }));
  },

  setActiveAgent: (agentId) => {
    const current = get().agentActivity.activeAgent;
    if (current !== agentId) {
      set((s) => ({
        agentActivity: { ...s.agentActivity, activeAgent: agentId },
      }));

      if (agentId) {
        get().addActivityEvent({
          timestamp: new Date().toISOString(),
          type: 'agent',
          message: `Agent activated: ${agentId}`,
          agentId,
        });

        // Update agent stats
        set((s) => ({
          agentActivity: {
            ...s.agentActivity,
            agentStats: {
              ...s.agentActivity.agentStats,
              [agentId]: {
                ...(s.agentActivity.agentStats[agentId] || { invocations: 0 }),
                invocations: (s.agentActivity.agentStats[agentId]?.invocations || 0) + 1,
                lastActive: new Date().toISOString(),
              },
            },
          },
        }));
      }
    }
  },

  setReActStep: (step, iteration) => {
    set((s) => ({
      agentActivity: {
        ...s.agentActivity,
        reactStep: step,
        reactIteration: iteration ?? s.agentActivity.reactIteration,
      },
    }));
  },

  addToDelegationChain: (agentId) => {
    set((s) => ({
      agentActivity: {
        ...s.agentActivity,
        delegationChain: [...s.agentActivity.delegationChain, agentId],
      },
    }));
  },

  clearDelegationChain: () => {
    set((s) => ({
      agentActivity: { ...s.agentActivity, delegationChain: [] },
    }));
  },

  addToolInvocation: (invocation) => {
    set((s) => ({
      toolInvocations: [invocation, ...s.toolInvocations].slice(0, 200), // Keep last 200
    }));

    get().addActivityEvent({
      timestamp: invocation.timestamp,
      type: 'tool',
      message: `Tool: ${invocation.tool}${invocation.summary ? ` - ${invocation.summary}` : ''}`,
      details: invocation as unknown as Record<string, unknown>,
    });
  },

  updateToolInvocation: (id, update) => {
    set((s) => ({
      toolInvocations: s.toolInvocations.map((inv) =>
        inv.id === id ? { ...inv, ...update } : inv
      ),
    }));
  },

  clearToolInvocations: () => set({ toolInvocations: [] }),

  setTokenUsage: (usage) => {
    set((s) => ({
      tokenUsage: { ...s.tokenUsage, ...usage, lastUpdated: new Date().toISOString() },
    }));
  },

  addToTokenHistory: (tokens) => {
    set((s) => ({
      tokenUsage: {
        ...s.tokenUsage,
        sessionTokenHistory: [...s.tokenUsage.sessionTokenHistory, tokens].slice(-100), // Keep last 100 data points
      },
    }));
  },

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

  // Reset state when project changes - clears execution state but preserves connection
  resetState: () => {
    set({
      state: DEFAULT_STATE,
      isLoading: false,
      error: null,
      // Preserve: connected (still connected to server)
      // Preserve: config (will be refetched)
      learnings: null,
      aplRunning: false,
      aplPid: null,
      activityEvents: [],
      agentActivity: DEFAULT_AGENT_ACTIVITY,
      toolInvocations: [],
      tokenUsage: DEFAULT_TOKEN_USAGE,
    });
  },
}));
