import { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, History, Sparkles } from 'lucide-react';
import { useAplStore } from '../../store/aplStore';
import { api } from '../../api/client';
import { clsx } from 'clsx';

const STORAGE_KEY = 'apl-gui-goal-history';
const MAX_HISTORY = 10;

export default function ControlBar() {
  const [goal, setGoal] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [goalHistory, setGoalHistory] = useState<string[]>([]);
  const { aplRunning, fetchInitialState } = useAplStore();

  // Load goal history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setGoalHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load goal history:', e);
    }
  }, []);

  // Save goal to history
  const saveToHistory = (newGoal: string) => {
    const updated = [newGoal, ...goalHistory.filter(g => g !== newGoal)].slice(0, MAX_HISTORY);
    setGoalHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save goal history:', e);
    }
  };

  const handleStart = async () => {
    if (!goal.trim() || aplRunning) return;

    setIsStarting(true);
    try {
      await api.startApl(goal.trim());
      saveToHistory(goal.trim());
      setGoal('');
      setShowHistory(false);
      setShowTemplates(false);
    } catch (error) {
      console.error('Failed to start APL:', error);
      alert(`Failed to start APL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    if (!aplRunning) return;

    setIsStopping(true);
    try {
      await api.stopApl();
    } catch (error) {
      console.error('Failed to stop APL:', error);
    } finally {
      setIsStopping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
    if (e.key === 'Escape') {
      setShowHistory(false);
      setShowTemplates(false);
    }
  };

  const selectFromHistory = (historyGoal: string) => {
    setGoal(historyGoal);
    setShowHistory(false);
  };

  const selectTemplate = (template: string) => {
    setGoal(template);
    setShowTemplates(false);
  };

  const clearHistory = () => {
    setGoalHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowHistory(false);
  };

  return (
    <div className="card p-4 space-y-3">
      {/* Main Input Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { setShowHistory(false); setShowTemplates(false); }}
            placeholder="Enter your coding goal... (e.g., Build a REST API with authentication)"
            className="input w-full pr-20"
            disabled={aplRunning}
          />

          {/* Input action buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* History button */}
            <button
              onClick={() => { setShowHistory(!showHistory); setShowTemplates(false); }}
              className={clsx(
                'p-1.5 rounded hover:bg-gray-600 transition-colors',
                showHistory ? 'bg-gray-600 text-apl-400' : 'text-gray-400'
              )}
              title="Goal history"
              disabled={aplRunning}
            >
              <History className="h-4 w-4" />
            </button>

            {/* Templates button */}
            <button
              onClick={() => { setShowTemplates(!showTemplates); setShowHistory(false); }}
              className={clsx(
                'p-1.5 rounded hover:bg-gray-600 transition-colors',
                showTemplates ? 'bg-gray-600 text-apl-400' : 'text-gray-400'
              )}
              title="Goal templates"
              disabled={aplRunning}
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          {/* History Dropdown */}
          {showHistory && goalHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              <div className="p-2 border-b border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Recent Goals</span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              {goalHistory.map((historyGoal, i) => (
                <button
                  key={i}
                  onClick={() => selectFromHistory(historyGoal)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 truncate"
                >
                  {historyGoal}
                </button>
              ))}
            </div>
          )}

          {/* Templates Dropdown */}
          {showTemplates && (
            <GoalTemplatesDropdown onSelect={selectTemplate} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!aplRunning ? (
            <button
              onClick={handleStart}
              disabled={!goal.trim() || isStarting}
              className="btn btn-primary flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isStarting ? 'Starting...' : 'Start APL'}
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={isStopping}
              className="btn btn-danger flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              {isStopping ? 'Stopping...' : 'Stop'}
            </button>
          )}

          <button
            onClick={() => fetchInitialState()}
            className="btn btn-secondary flex items-center gap-2"
            title="Refresh state"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions Row */}
      <QuickActionsBar disabled={aplRunning} onGoalSet={setGoal} />
    </div>
  );
}

// Goal Templates Dropdown
function GoalTemplatesDropdown({ onSelect }: { onSelect: (template: string) => void }) {
  const TEMPLATES = {
    'API Development': [
      'Build a REST API with Express and TypeScript',
      'Add JWT authentication to the API',
      'Create CRUD endpoints for [resource]',
      'Add input validation and error handling',
      'Implement rate limiting and security headers',
    ],
    'Testing': [
      'Add unit tests for all services',
      'Write integration tests for API endpoints',
      'Add E2E tests with Playwright',
      'Improve test coverage to 80%',
    ],
    'Database': [
      'Set up database migrations',
      'Add connection pooling',
      'Create repository pattern for data access',
      'Optimize slow database queries',
    ],
    'Frontend': [
      'Create React component for [feature]',
      'Add form validation with error messages',
      'Implement responsive design',
      'Add loading states and error handling',
    ],
    'Refactoring': [
      'Refactor for better separation of concerns',
      'Extract common logic into reusable utilities',
      'Improve type safety throughout the codebase',
      'Fix all TypeScript errors and warnings',
    ],
    'DevOps': [
      'Set up CI/CD pipeline',
      'Add Docker configuration',
      'Configure environment variables',
      'Add health check endpoints',
    ],
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
      <div className="p-2 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-medium">Goal Templates</span>
      </div>
      {Object.entries(TEMPLATES).map(([category, templates]) => (
        <div key={category}>
          <div className="px-3 py-1.5 text-xs font-medium text-apl-400 bg-gray-800/50">
            {category}
          </div>
          {templates.map((template, i) => (
            <button
              key={i}
              onClick={() => onSelect(template)}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              {template}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// Quick Actions Bar
function QuickActionsBar({ disabled, onGoalSet }: { disabled: boolean; onGoalSet: (goal: string) => void }) {
  const quickActions = [
    { label: 'Run Tests', goal: 'Run the test suite and fix any failing tests' },
    { label: 'Lint & Fix', goal: 'Run linter and fix all linting errors' },
    { label: 'Type Check', goal: 'Fix all TypeScript type errors' },
    { label: 'Build', goal: 'Run the build and fix any build errors' },
    { label: 'Add Tests', goal: 'Add comprehensive tests for recent changes' },
    { label: 'Refactor', goal: 'Refactor the most recent changes for better code quality' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500">Quick:</span>
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => onGoalSet(action.goal)}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
