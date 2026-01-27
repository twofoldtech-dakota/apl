import { useAplStore } from '../../store/aplStore';
import PhaseIndicator from './PhaseIndicator';
import TaskList from './TaskList';
import MetricsPanel from './MetricsPanel';
import ActivityFeed from './ActivityFeed';
import ControlBar from '../control/ControlBar';
import LoadingSpinner from '../common/LoadingSpinner';

export default function Dashboard() {
  const { state, isLoading, error } = useAplStore();

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

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks - 2 columns */}
            <div className="lg:col-span-2">
              <TaskList tasks={state.tasks} />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Metrics */}
              <MetricsPanel
                metrics={state.metrics}
                confidence={state.confidence}
              />

              {/* Activity Feed */}
              <ActivityFeed />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
