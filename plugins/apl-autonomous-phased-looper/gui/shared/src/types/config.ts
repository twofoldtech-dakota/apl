// APL Configuration Types - based on master-config.json structure

export type ModelType = 'haiku' | 'sonnet' | 'opus';
export type AgentRole = 'coordinator' | 'planning' | 'execution' | 'verification' | 'quality' | 'learning' | 'enterprise' | 'analysis' | 'content' | 'design' | 'deployment';
export type ConflictResolution = 'sequential_fallback' | 'abort' | 'manual';

export interface WorkflowConfig {
  phases: string[];
  default_entry_phase: string;
  allow_phase_skip: boolean;
  require_review_before_complete: boolean;
}

export interface ExecutionConfig {
  max_iterations: number;
  max_phase_iterations: number;
  max_retry_attempts: number;
  timeout_minutes: number;
  checkpoint_on_phase_change: boolean;
  auto_rollback_on_failure: boolean;
}

export interface ParallelExecutionConfig {
  enabled: boolean;
  max_concurrent_agents: number;
  min_tasks_for_parallel: number;
  conflict_resolution: ConflictResolution;
}

export interface AgentConfig {
  file: string;
  enabled: boolean;
  model: ModelType;
  tools: string[];
  role: AgentRole;
  description: string;
}

export interface AgentsConfig {
  orchestrator: AgentConfig;
  planner: AgentConfig;
  coder: AgentConfig;
  tester: AgentConfig;
  reviewer: AgentConfig;
  learner: AgentConfig;
  meta_orchestrator: AgentConfig;
  requirements_analyst: AgentConfig;
  [key: string]: AgentConfig;
}

export interface HookConfig {
  enabled: boolean;
  trigger: string;
  action: string;
  timeout_seconds: number;
  fail_on_error: boolean;
}

export interface HooksConfig {
  on_code_change: HookConfig;
  on_session_end: HookConfig;
  on_orchestrator_complete: HookConfig;
  [key: string]: HookConfig;
}

export interface ConfidenceLevelConfig {
  description: string;
  action: string;
}

export interface ConfidenceConfig {
  threshold: string;
  levels: {
    low: ConfidenceLevelConfig;
    medium: ConfidenceLevelConfig;
    high: ConfidenceLevelConfig;
  };
  escalate_on_low: boolean;
  auto_proceed_on_high: boolean;
}

export interface VerificationConfig {
  chain_of_verification: boolean;
  run_tests_after_changes: boolean;
  run_linter_after_changes: boolean;
  require_all_criteria_met: boolean;
  test_commands: Record<string, string>;
  lint_commands: Record<string, string>;
}

export interface TechniqueConfig {
  enabled: boolean;
  weight: number;
}

export interface LearningConfig {
  enabled: boolean;
  storage_path: string;
  persist_success_patterns: boolean;
  persist_anti_patterns: boolean;
  learn_user_preferences: boolean;
  learn_project_knowledge: boolean;
  track_technique_stats: boolean;
  max_patterns_stored: number;
  pattern_decay_days: number;
  techniques: {
    react: TechniqueConfig;
    chain_of_verification: TechniqueConfig;
    tree_of_thoughts: TechniqueConfig;
    reflexion: TechniqueConfig;
  };
}

export interface PatternsConfig {
  library_path: string;
  categories: string[];
  auto_suggest: boolean;
  min_confidence_to_apply: number;
}

export interface ContextManagementConfig {
  compression_threshold_tokens: number;
  max_scratchpad_entries: number;
  auto_summarize_completed: boolean;
  preserve_error_history: number;
  checkpoint_retention: number;
}

export interface ModelSelectionConfig {
  default: ModelType;
  by_task_complexity: {
    simple: ModelType;
    medium: ModelType;
    complex: ModelType;
  };
  by_phase: {
    plan: ModelType;
    execute: ModelType;
    review: ModelType;
    learn: ModelType;
  };
  cost_optimization: {
    enabled: boolean;
    prefer_haiku_for_simple: boolean;
  };
}

export interface OutputConfig {
  verbose: boolean;
  show_reasoning: boolean;
  show_phase_transitions: boolean;
  show_task_progress: boolean;
  show_verification_details: boolean;
  show_learning_updates: boolean;
  log_to_file: boolean;
  log_path: string;
}

export interface SafetyConfig {
  require_confirmation_for_destructive: boolean;
  max_files_per_task: number;
  max_lines_per_edit: number;
  blocked_paths: string[];
  blocked_operations: string[];
  require_tests_before_commit: boolean;
}

export interface DomainsConfig {
  available: string[];
  active: string | null;
  questions_path: string;
}

export interface ContentStrategyConfig {
  enabled: boolean;
  default_accessibility_level: string;
  seo: {
    keyword_density_target: number;
    meta_description_max_length: number;
    title_max_length: number;
    include_structured_data: boolean;
    structured_data_types: string[];
  };
  brand_voice: {
    tone: string;
    personality_traits: string[];
    vocabulary_level: string;
    avoid_words: string[];
    preferred_phrases: string[];
  };
  ai_citation_optimization: {
    enabled: boolean;
    include_definitive_statements: boolean;
    include_authoritative_references: boolean;
  };
}

export interface IntegrationConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface IntegrationsConfig {
  vercel: IntegrationConfig & {
    mcp_server?: string;
    mcp_url?: string;
    team_slug?: string | null;
    project_slug?: string | null;
    production_branch: string;
    preview_on_pr: boolean;
    auto_deploy_after_review?: boolean;
    smoke_test_url?: string | null;
  };
  pencil: IntegrationConfig & {
    mcp_server?: string;
    design_data_path: string;
    auto_export_on_change: boolean;
    export_format: string;
    design_before_code: boolean;
  };
  github: IntegrationConfig & {
    auto_create_pr: boolean;
    pr_template: string;
  };
  slack: IntegrationConfig & {
    webhook_url: string | null;
    notify_on_complete: boolean;
  };
}

export interface MasterConfig {
  $schema?: string;
  version: string;
  name: string;
  description: string;
  workflow: WorkflowConfig;
  execution: ExecutionConfig;
  parallel_execution: ParallelExecutionConfig;
  agents: AgentsConfig;
  hooks: HooksConfig;
  confidence: ConfidenceConfig;
  verification: VerificationConfig;
  learning: LearningConfig;
  patterns: PatternsConfig;
  content_strategy: ContentStrategyConfig;
  context_management: ContextManagementConfig;
  model_selection: ModelSelectionConfig;
  output: OutputConfig;
  safety: SafetyConfig;
  domains: DomainsConfig;
  integrations: IntegrationsConfig;
}

// Project-level config (subset that can be overridden)
export interface ProjectConfig {
  max_iterations?: number;
  max_phase_iterations?: number;
  max_retry_attempts?: number;
  confidence_threshold?: string;
  auto_test?: boolean;
  auto_lint?: boolean;
  learning_enabled?: boolean;
  compression_threshold?: number;
  model_selection?: {
    simple_tasks?: ModelType;
    medium_tasks?: ModelType;
    complex_tasks?: ModelType;
  };
}
