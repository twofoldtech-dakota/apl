// API Client
const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || 'Request failed');
  }
  return response.json();
}

export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  return handleResponse<T>(response);
}

export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleResponse<T>(response);
}

export async function patch<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function del<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
  });
  return handleResponse<T>(response);
}

// API endpoints
export const api = {
  // State
  getState: () => get<import('@apl-gui/shared').AplState>('/state'),
  getActiveSession: () => get<{ active: boolean }>('/state/active'),
  getTasks: () => get<import('@apl-gui/shared').Task[]>('/state/tasks'),
  getMetrics: () => get<import('@apl-gui/shared').StateMetrics>('/state/metrics'),
  clearState: () => del<{ message: string }>('/state'),

  // Config
  getConfig: () => get<import('@apl-gui/shared').MasterConfig>('/config'),
  getMasterConfig: () => get<import('@apl-gui/shared').MasterConfig>('/config/master'),
  getProjectConfig: () => get<object>('/config/project'),
  updateMasterConfig: (data: Partial<import('@apl-gui/shared').MasterConfig>) =>
    patch<import('@apl-gui/shared').MasterConfig>('/config/master', data),
  updateProjectConfig: (data: object) => patch<object>('/config/project', data),
  getAgents: () => get<import('@apl-gui/shared').MasterConfig['agents']>('/config/agents'),
  toggleAgent: (name: string, enabled: boolean) =>
    patch<{ message: string }>(`/config/agents/${name}/toggle`, { enabled }),
  getHooks: () => get<import('@apl-gui/shared').MasterConfig['hooks']>('/config/hooks'),
  toggleHook: (name: string, enabled: boolean) =>
    patch<{ message: string }>(`/config/hooks/${name}/toggle`, { enabled }),

  // Learnings
  getLearnings: () => get<import('@apl-gui/shared').Learnings>('/learnings'),
  getLearningsStats: () => get<{
    successPatternCount: number;
    antiPatternCount: number;
    totalPatterns: number;
    topTags: { tag: string; count: number }[];
  }>('/learnings/stats'),
  getSuccessPatterns: () => get<import('@apl-gui/shared').SuccessPattern[]>('/learnings/success-patterns'),
  getAntiPatterns: () => get<import('@apl-gui/shared').AntiPattern[]>('/learnings/anti-patterns'),
  deletePattern: (id: string) => del<{ message: string }>(`/learnings/pattern/${id}`),
  clearAllPatterns: () => del<{ message: string }>('/learnings/patterns'),
  getTechniqueStats: () => get<import('@apl-gui/shared').Learnings['technique_stats']>('/learnings/technique-stats'),

  // Patterns
  getPatternIndex: () => get<import('@apl-gui/shared').PatternIndex>('/patterns'),
  getCategories: () => get<string[]>('/patterns/categories'),
  getPatternsByCategory: (category: string) =>
    get<import('@apl-gui/shared').Pattern[]>(`/patterns/category/${category}`),
  getPatternById: (id: string) => get<import('@apl-gui/shared').Pattern>(`/patterns/pattern/${id}`),
  searchPatterns: (query: string) => get<import('@apl-gui/shared').Pattern[]>(`/patterns/search?q=${encodeURIComponent(query)}`),

  // Checkpoints
  getCheckpoints: () => get<import('@apl-gui/shared').Checkpoint[]>('/checkpoints'),
  getCheckpointTimeline: () => get<{
    id: string;
    phase: string;
    iteration: number;
    timestamp: string;
    tasksCompletedCount: number;
    filesCount: number;
  }[]>('/checkpoints/timeline'),
  getLatestCheckpoint: () => get<import('@apl-gui/shared').Checkpoint>('/checkpoints/latest'),
  rollbackToCheckpoint: (id: string) =>
    post<{ success: boolean; message: string }>(`/checkpoints/${id}/rollback`),

  // Control
  getStatus: () => get<{
    running: boolean;
    pid?: number;
    goal?: string;
    startedAt?: string;
  }>('/control/status'),
  startApl: (goal: string) => post<{ success: boolean; message: string; pid?: number }>('/control/start', { goal }),
  stopApl: () => post<{ success: boolean; message: string }>('/control/stop'),
  getProject: () => get<{ projectRoot: string; aplDir: string }>('/control/project'),
  setProject: (projectRoot: string) =>
    post<{ message: string; projectRoot: string; aplDir: string }>('/control/project', { projectRoot }),
};
