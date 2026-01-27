// Re-export shared types
export type {
  AplState,
  Task,
  TaskStatus,
  Phase,
  ConfidenceLevel,
  Checkpoint,
  StateMetrics,
  MasterConfig,
  AgentConfig,
  Learnings,
  SuccessPattern,
  AntiPattern,
  Pattern,
  WebSocketMessage,
} from '@apl-gui/shared';

// Client-specific types
export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'task' | 'phase' | 'checkpoint' | 'error' | 'info';
  message: string;
  details?: unknown;
}

export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
}
