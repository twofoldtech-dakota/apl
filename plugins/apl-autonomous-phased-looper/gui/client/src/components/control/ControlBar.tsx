import { useState } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import { useAplStore } from '../../store/aplStore';
import { api } from '../../api/client';

export default function ControlBar() {
  const [goal, setGoal] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const { aplRunning, fetchInitialState } = useAplStore();

  const handleStart = async () => {
    if (!goal.trim() || aplRunning) return;

    setIsStarting(true);
    try {
      await api.startApl(goal.trim());
      setGoal('');
    } catch (error) {
      console.error('Failed to start APL:', error);
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
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your coding goal... (e.g., Build a REST API with authentication)"
            className="input w-full"
            disabled={aplRunning}
          />
        </div>

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
    </div>
  );
}
