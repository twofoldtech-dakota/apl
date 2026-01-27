import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Circle, Loader2, XCircle, AlertTriangle, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import type { Task, ParallelGroup } from '@apl-gui/shared';
import Badge from '../common/Badge';

interface TaskCardProps {
  task: Task;
  parallelGroup?: ParallelGroup;
  groupColor?: string;
}

export default function TaskCard({ task, parallelGroup, groupColor }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-400" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'skipped':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (): 'pending' | 'in_progress' | 'completed' | 'failed' => {
    if (task.status === 'skipped') return 'failed';
    return task.status as 'pending' | 'in_progress' | 'completed' | 'failed';
  };

  return (
    <div
      className={clsx(
        'rounded-lg border p-4 transition-colors',
        groupColor && 'border-l-4',
        groupColor,
        task.status === 'in_progress' && 'border-blue-500/50 bg-blue-500/5',
        task.status === 'completed' && 'border-green-500/30 bg-green-500/5',
        task.status === 'failed' && 'border-red-500/50 bg-red-500/5',
        task.status === 'pending' && 'border-gray-700 bg-gray-800/50',
        task.status === 'skipped' && 'border-yellow-500/50 bg-yellow-500/5'
      )}
    >
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mt-0.5">{getStatusIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-gray-500">#{task.id}</span>
            <Badge variant={getStatusVariant()}>{task.status}</Badge>
            <Badge variant="default">{task.complexity}</Badge>
            {task.attempts > 1 && (
              <Badge variant="warning">Attempt {task.attempts}</Badge>
            )}
            {parallelGroup && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Layers className="h-3 w-3" />
                <span>Group {parallelGroup.group.toUpperCase()}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-white truncate">{task.description}</p>

          {task.current_step && task.status === 'in_progress' && (
            <p className="text-xs text-blue-400 mt-1 animate-pulse">{task.current_step}</p>
          )}

          {task.files_in_progress && task.files_in_progress.length > 0 && task.status === 'in_progress' && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Working on:</span>
              <span className="text-xs text-apl-400">{task.files_in_progress.join(', ')}</span>
            </div>
          )}
        </div>

        <button className="text-gray-400 hover:text-white">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pl-8 space-y-3 text-sm">
          {/* Success Criteria */}
          {task.success_criteria && task.success_criteria.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-1">Success Criteria</h4>
              <ul className="space-y-1">
                {task.success_criteria.map((criterion, i) => (
                  <li key={i} className="text-gray-300 flex items-start gap-2">
                    <span className="text-gray-500">-</span>
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-1">Dependencies</h4>
              <p className="text-gray-300">Tasks: {task.dependencies.join(', ')}</p>
            </div>
          )}

          {/* Parallel Group Info */}
          {parallelGroup && (
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-1">Parallel Execution</h4>
              <p className="text-gray-300">
                Group {parallelGroup.group.toUpperCase()} - runs with tasks: {parallelGroup.task_ids.filter(id => id !== task.id).join(', ') || 'none'}
              </p>
            </div>
          )}

          {/* Result */}
          {task.result && (
            <div>
              <h4 className="text-xs font-medium text-green-400 mb-1">Result</h4>
              <p className="text-gray-300">{task.result.summary}</p>
              {task.result.approach_used && (
                <p className="text-xs text-gray-500 mt-1">
                  Approach: {task.result.approach_used}
                </p>
              )}
              {task.result.files_created && task.result.files_created.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Files created: {task.result.files_created.join(', ')}
                </p>
              )}
              {task.result.files_modified && task.result.files_modified.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Files modified: {task.result.files_modified.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Error History */}
          {task.error_history && task.error_history.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-red-400 mb-1">Error History</h4>
              {task.error_history.map((error, i) => (
                <div key={i} className="text-xs mb-2 p-2 bg-red-900/20 rounded">
                  <div className="text-red-300">
                    <span className="text-gray-500">Attempt {error.attempt}:</span> {error.error}
                  </div>
                  {error.recovery && (
                    <div className="text-green-400 mt-1">
                      Recovery: {error.recovery}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Timestamps */}
          <div className="flex gap-4 text-xs text-gray-500">
            {task.started_at && (
              <span>Started: {new Date(task.started_at).toLocaleTimeString()}</span>
            )}
            {task.completed_at && (
              <span>Completed: {new Date(task.completed_at).toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
