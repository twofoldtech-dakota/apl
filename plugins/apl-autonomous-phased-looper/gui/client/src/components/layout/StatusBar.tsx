import { useAplStore } from '../../store/aplStore';
import { formatDistanceToNow } from 'date-fns';

export default function StatusBar() {
  const { state, aplRunning, connected } = useAplStore();

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'plan':
        return 'text-yellow-400';
      case 'execute':
        return 'text-blue-400';
      case 'review':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  return (
    <footer className="flex h-8 items-center justify-between border-t border-gray-700 bg-gray-800 px-4 text-xs">
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* Phase */}
        {state.phase && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Phase:</span>
            <span className={getPhaseColor(state.phase)}>{state.phase.toUpperCase()}</span>
          </div>
        )}

        {/* Iteration */}
        {state.iteration > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Iteration:</span>
            <span className="text-gray-300">{state.iteration}/{state.max_iterations}</span>
          </div>
        )}

        {/* APL Status */}
        {aplRunning && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-400">APL Running</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Tasks progress */}
        {state.metrics.tasks_completed > 0 || state.metrics.tasks_remaining > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Tasks:</span>
            <span className="text-gray-300">
              {state.metrics.tasks_completed}/{state.metrics.tasks_completed + state.metrics.tasks_remaining}
            </span>
          </div>
        ) : null}

        {/* Last updated */}
        {state.last_updated && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Updated:</span>
            <span className="text-gray-400">{formatTime(state.last_updated)}</span>
          </div>
        )}

        {/* Session ID */}
        {state.session_id && (
          <div className="text-gray-500">
            Session: {state.session_id.slice(-8)}
          </div>
        )}
      </div>
    </footer>
  );
}
