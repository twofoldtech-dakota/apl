import { useAplStore } from '../../store/aplStore';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { Activity, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';

export default function ActivityFeed() {
  const { activityEvents } = useAplStore();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'phase':
        return <Activity className="h-4 w-4 text-apl-400" />;
      case 'checkpoint':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Activity</h3>

      {activityEvents.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {activityEvents.slice(0, 20).map((event) => (
            <div
              key={event.id}
              className={clsx(
                'flex items-start gap-3 text-sm',
                event.type === 'error' && 'text-red-300',
                event.type !== 'error' && 'text-gray-300'
              )}
            >
              <div className="mt-0.5">{getEventIcon(event.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{event.message}</p>
                <p className="text-xs text-gray-500">{formatTime(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
