// Re-export shared types
export type {
  // State types
  AplState,
  Task,
  TaskResult,
  TaskError,
  TaskStatus,
  TaskComplexity,
  Phase,
  ConfidenceLevel,
  ParallelGroup,
  FileModification,
  Checkpoint,
  Scratchpad,
  VerificationEntry,
  StateError,
  StateMetrics,

  // Config types
  MasterConfig,
  AgentConfig,
  ExecutionConfig,
  LearningConfig,
  SafetyConfig,

  // Learnings types
  Learnings,
  SuccessPattern,
  AntiPattern,

  // Pattern types
  Pattern,
  PatternIndex,

  // WebSocket types
  WebSocketMessage,

  // Agentic types
  AgentActivity,
  AgentId,
  AgentStats,
  ReActStep,
  ToolInvocation,
  ToolName,
  TokenUsage,
  ActivityEvent,
} from '@apl-gui/shared';

// Client-specific types
export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
}
