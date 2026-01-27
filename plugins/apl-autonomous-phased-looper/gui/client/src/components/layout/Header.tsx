import { Activity, Settings, Bell } from 'lucide-react';
import { useAplStore } from '../../store/aplStore';

export default function Header() {
  const { state, aplRunning, connected } = useAplStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apl-600">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">APL Control Panel</h1>
          {state.goal && (
            <p className="text-xs text-gray-400 truncate max-w-md">
              {state.goal}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Status indicators */}
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {aplRunning && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-gray-400">APL Running</span>
          </div>
        )}

        {/* Action buttons */}
        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
