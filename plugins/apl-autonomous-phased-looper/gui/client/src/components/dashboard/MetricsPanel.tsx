import type { StateMetrics, ConfidenceLevel } from '@apl-gui/shared';
import ProgressBar from '../common/ProgressBar';
import { CheckCircle, XCircle, FileCode, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricsPanelProps {
  metrics: StateMetrics;
  confidence: ConfidenceLevel;
}

export default function MetricsPanel({ metrics, confidence }: MetricsPanelProps) {
  const totalTasks = metrics.tasks_completed + metrics.tasks_remaining;
  const successRatePercent = Math.round(metrics.success_rate * 100);

  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getConfidenceWidth = () => {
    switch (confidence) {
      case 'high':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      case 'low':
        return 'w-1/3';
      default:
        return 'w-0';
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Metrics</h3>

      <div className="space-y-4">
        {/* Task Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Task Progress</span>
            <span className="text-white">{metrics.tasks_completed}/{totalTasks}</span>
          </div>
          <ProgressBar
            value={metrics.tasks_completed}
            max={totalTasks || 1}
            variant="success"
          />
        </div>

        {/* Confidence */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Confidence</span>
            <span className={clsx('uppercase font-medium', getConfidenceColor())}>
              {confidence}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all',
                confidence === 'high' && 'bg-green-500',
                confidence === 'medium' && 'bg-yellow-500',
                confidence === 'low' && 'bg-red-500',
                getConfidenceWidth()
              )}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Success Rate</p>
              <p className="text-sm font-medium text-white">{successRatePercent}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Total Attempts</p>
              <p className="text-sm font-medium text-white">{metrics.total_attempts}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-apl-400" />
            <div>
              <p className="text-xs text-gray-400">Files Created</p>
              <p className="text-sm font-medium text-white">{metrics.files_created}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">Elapsed</p>
              <p className="text-sm font-medium text-white">{metrics.elapsed_minutes} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
