import { useState } from 'react';
import { useAplStore } from '../../store/aplStore';
import PhaseIndicator from './PhaseIndicator';
import TaskList from './TaskList';
import MetricsPanel from './MetricsPanel';
import ActivityFeed from './ActivityFeed';
import ScratchpadPanel from './ScratchpadPanel';
import VerificationPanel from './VerificationPanel';
import ControlBar from '../control/ControlBar';
import AgentActivityMonitor from '../agentic/AgentActivityMonitor';
import ReActLoopIndicator from '../agentic/ReActLoopIndicator';
import ToolInvocationLog from '../agentic/ToolInvocationLog';
import TokenUsageTracker from '../agentic/TokenUsageTracker';
import LoadingSpinner from '../common/LoadingSpinner';
import { LayoutDashboard, Bot } from 'lucide-react';
import { clsx } from 'clsx';

type ViewMode = 'overview' | 'agentic';

export default function Dashboard() {
  const { state, isLoading, error } = useAplStore();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading state</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const hasActiveSession = state.session_id && state.goal;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <ControlBar />

      {!hasActiveSession ? (
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No Active Session</h2>
          <p className="text-gray-500 mb-4">
            Enter a goal above to start an APL session, or wait for an active session to appear.
          </p>
        </div>
      ) : (
        <>
          {/* Goal Display */}
          <div className="card p-4">
            <h2 className="text-sm font-medium text-gray-400 mb-1">Current Goal</h2>
            <p className="text-lg text-white">{state.goal}</p>
          </div>

          {/* Phase Indicator */}
          <PhaseIndicator phase={state.phase} iteration={state.iteration} maxIterations={state.max_iterations} />

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('overview')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'overview'
                  ? 'bg-apl-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setViewMode('agentic')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'agentic'
                  ? 'bg-apl-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              )}
            >
              <Bot className="h-4 w-4" />
              Agentic View
            </button>
          </div>

          {viewMode === 'overview' ? (
            /* Overview Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tasks - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                <TaskList tasks={state.tasks} />

                {/* Scratchpad below tasks */}
                <ScratchpadPanel />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Metrics */}
                <MetricsPanel
                  metrics={state.metrics}
                  confidence={state.confidence}
                />

                {/* Verification Evidence */}
                <VerificationPanel />

                {/* Activity Feed */}
                <ActivityFeed />
              </div>
            </div>
          ) : (
            /* Agentic View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Agent & ReAct */}
              <div className="space-y-6">
                <AgentActivityMonitor />
                <ReActLoopIndicator />
                <TokenUsageTracker />
              </div>

              {/* Right Column - Tools & Activity */}
              <div className="space-y-6">
                <ToolInvocationLog />
                <ScratchpadPanel />
                <ActivityFeed />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
