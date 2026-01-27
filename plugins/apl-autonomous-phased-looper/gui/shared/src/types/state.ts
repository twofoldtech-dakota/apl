// APL State Types - based on .apl/state.json structure

export type Phase = 'plan' | 'execute' | 'review';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
export type TaskComplexity = 'simple' | 'medium' | 'complex';
export type FileAction = 'create' | 'modify' | 'delete';
export type ParallelGroupStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface TaskResult {
  summary: string;
  files_created?: string[];
  files_modified?: string[];
  approach_used: string;
}

export interface TaskError {
  attempt: number;
  error: string;
  recovery?: string;
}

export interface Task {
  id: number;
  description: string;
  success_criteria: string[];
  complexity: TaskComplexity;
  dependencies: number[];
  status: TaskStatus;
  attempts: number;
  result?: TaskResult;
  error_history?: TaskError[];
  started_at?: string;
  completed_at?: string;
  current_step?: string;
  files_in_progress?: string[];
}

export interface ParallelGroup {
  group: string;
  task_ids: number[];
  status: ParallelGroupStatus;
}

export interface FileModification {
  path: string;
  action: FileAction;
  task_id: number;
  checkpoint_id: string;
  summary?: string;
}

export interface Checkpoint {
  id: string;
  phase: Phase;
  iteration: number;
  timestamp: string;
  tasks_completed: number[];
  files_snapshot: string[];
}

export interface Scratchpad {
  learnings: string[];
  failed_approaches: string[];
  open_questions: string[];
}

export interface VerificationEntry {
  task_id: number;
  criterion: string;
  verified: boolean;
  evidence: string;
  timestamp: string;
}

export interface StateError {
  task_id: number;
  attempt: number;
  type: string;
  message: string;
  timestamp: string;
  resolution?: string;
}

export interface StateMetrics {
  tasks_completed: number;
  tasks_remaining: number;
  total_attempts: number;
  success_rate: number;
  elapsed_minutes: number;
  files_created: number;
  files_modified: number;
}

export interface AplState {
  version: string;
  session_id: string;
  goal: string;
  phase: Phase;
  iteration: number;
  max_iterations: number;
  confidence: ConfidenceLevel;
  started_at: string;
  last_updated: string;
  tasks: Task[];
  parallel_groups?: ParallelGroup[];
  files_modified: FileModification[];
  checkpoints: Checkpoint[];
  scratchpad: Scratchpad;
  verification_log: VerificationEntry[];
  errors: StateError[];
  metrics: StateMetrics;
}

// Empty/default state for when no APL session is active
export const DEFAULT_STATE: AplState = {
  version: '1.0.0',
  session_id: '',
  goal: '',
  phase: 'plan',
  iteration: 0,
  max_iterations: 20,
  confidence: 'medium',
  started_at: '',
  last_updated: '',
  tasks: [],
  parallel_groups: [],
  files_modified: [],
  checkpoints: [],
  scratchpad: {
    learnings: [],
    failed_approaches: [],
    open_questions: [],
  },
  verification_log: [],
  errors: [],
  metrics: {
    tasks_completed: 0,
    tasks_remaining: 0,
    total_attempts: 0,
    success_rate: 0,
    elapsed_minutes: 0,
    files_created: 0,
    files_modified: 0,
  },
};
