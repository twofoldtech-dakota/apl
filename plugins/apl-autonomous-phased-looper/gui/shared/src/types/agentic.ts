// Enhanced Agentic Types for APL GUI

// ReAct Loop States
export type ReActStep = 'idle' | 'reason' | 'act' | 'observe' | 'verify';

// APL Agents
export type AgentId =
  | 'apl-orchestrator'
  | 'planner-agent'
  | 'coder-agent'
  | 'tester-agent'
  | 'reviewer-agent'
  | 'learner-agent'
  | 'meta-orchestrator'
  | 'requirements-analyst'
  | 'content-strategy-agent'
  | 'brand-voice-agent'
  | 'design-agent'
  | 'accessibility-agent'
  | 'copy-content-agent'
  | 'deployer-agent';

// Tool Types
export type ToolName =
  | 'Read'
  | 'Write'
  | 'Edit'
  | 'Bash'
  | 'Glob'
  | 'Grep'
  | 'Task'
  | 'WebFetch'
  | 'WebSearch'
  | 'TodoWrite'
  | 'NotebookEdit';

export interface AgentStats {
  invocations: number;
  avgDuration?: number;
  lastActive?: string;
  successCount?: number;
  errorCount?: number;
}

export interface AgentActivity {
  activeAgent: AgentId | null;
  delegationChain: AgentId[];
  reactStep: ReActStep;
  reactIteration: number;
  agentStats: Record<AgentId, AgentStats>;
  currentAction?: string;
  currentThought?: string;
}

export interface ToolInvocation {
  id: string;
  tool: ToolName;
  timestamp: string;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  summary?: string;
  agentId?: AgentId;
  taskId?: number;
  params?: Record<string, unknown>;
  result?: {
    success: boolean;
    error?: string;
    outputSummary?: string;
  };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  estimatedCost: number;
  sessionTokenHistory: number[];
  lastUpdated: string;
}

// Activity event for the activity feed
export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'task' | 'phase' | 'checkpoint' | 'error' | 'info' | 'agent' | 'tool';
  message: string;
  details?: Record<string, unknown>;
  agentId?: AgentId;
  taskId?: number;
}

// WebSocket messages for agentic features
export interface AgentActivityMessage {
  type: 'agent:activity';
  payload: {
    activeAgent: AgentId | null;
    delegationChain: AgentId[];
    reactStep: ReActStep;
    reactIteration: number;
    currentAction?: string;
    currentThought?: string;
  };
}

export interface ToolInvocationMessage {
  type: 'tool:invocation';
  payload: ToolInvocation;
}

export interface TokenUsageMessage {
  type: 'token:usage';
  payload: TokenUsage;
}

// Default values
export const DEFAULT_AGENT_ACTIVITY: AgentActivity = {
  activeAgent: null,
  delegationChain: [],
  reactStep: 'idle',
  reactIteration: 0,
  agentStats: {} as Record<AgentId, AgentStats>,
};

export const DEFAULT_TOKEN_USAGE: TokenUsage = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  model: 'claude-sonnet',
  estimatedCost: 0,
  sessionTokenHistory: [],
  lastUpdated: '',
};
