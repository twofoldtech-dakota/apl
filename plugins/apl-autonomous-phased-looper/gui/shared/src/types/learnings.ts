// APL Learnings Types - based on learnings.json structure

export interface SuccessPattern {
  id: string;
  task_type: string;
  approach: string;
  context: string;
  success_count: number;
  last_used: string | null;
  code_example: string | null;
  tags: string[];
}

export interface AntiPattern {
  id: string;
  task_type: string;
  approach: string;
  reason: string;
  failure_count: number;
  last_encountered: string | null;
  alternative: string;
}

export interface CodeStyle {
  naming: string | null;
  variables: string | null;
  functions: string | null;
  async: string | null;
  comments: string | null;
  formatting: string | null;
}

export interface UserPreferences {
  code_style: CodeStyle;
  preferred_libraries: string[];
  avoided_libraries: string[];
  architecture_preferences: string[];
}

export interface ProjectKnowledge {
  entry_points: string[];
  test_command: string | null;
  build_command: string | null;
  lint_command: string | null;
  key_files: Record<string, string>;
  conventions: Record<string, string>;
  dependencies: {
    runtime: string[];
    dev: string[];
  };
}

export interface ReactPatternStats {
  success: number;
  failure: number;
  avg_iterations: number;
}

export interface CoveVerificationStats {
  caught_issues: number;
  false_positives: number;
}

export interface ReflexionStats {
  improvements_found: number;
  no_issues: number;
}

export interface ParallelExecutionStats {
  sessions_used: number;
  avg_tasks_parallelized: number;
  time_saved_percent: number;
  conflict_rate: number;
}

export interface TechniqueStats {
  react_pattern: ReactPatternStats;
  cove_verification: CoveVerificationStats;
  reflexion: ReflexionStats;
  parallel_execution: ParallelExecutionStats;
}

export interface Learnings {
  version: string;
  project_id: string | null;
  last_updated: string | null;
  success_patterns: SuccessPattern[];
  anti_patterns: AntiPattern[];
  user_preferences: UserPreferences;
  project_knowledge: ProjectKnowledge;
  technique_stats: TechniqueStats;
}

export const DEFAULT_LEARNINGS: Learnings = {
  version: '1.0.0',
  project_id: null,
  last_updated: null,
  success_patterns: [],
  anti_patterns: [],
  user_preferences: {
    code_style: {
      naming: null,
      variables: null,
      functions: null,
      async: null,
      comments: null,
      formatting: null,
    },
    preferred_libraries: [],
    avoided_libraries: [],
    architecture_preferences: [],
  },
  project_knowledge: {
    entry_points: [],
    test_command: null,
    build_command: null,
    lint_command: null,
    key_files: {},
    conventions: {},
    dependencies: {
      runtime: [],
      dev: [],
    },
  },
  technique_stats: {
    react_pattern: { success: 0, failure: 0, avg_iterations: 0 },
    cove_verification: { caught_issues: 0, false_positives: 0 },
    reflexion: { improvements_found: 0, no_issues: 0 },
    parallel_execution: {
      sessions_used: 0,
      avg_tasks_parallelized: 0,
      time_saved_percent: 0,
      conflict_rate: 0,
    },
  },
};
