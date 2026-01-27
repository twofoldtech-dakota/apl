import { useAplStore } from '../../store/aplStore';
import { CheckCircle, XCircle, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function VerificationPanel() {
  const { state } = useAplStore();
  const { verification_log } = state;
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  if (verification_log.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-apl-400" />
          <h3 className="text-sm font-medium text-gray-400">Chain-of-Verification</h3>
        </div>
        <p className="text-gray-500 text-sm text-center py-4">
          Verification evidence will appear here as tasks complete
        </p>
      </div>
    );
  }

  // Group by task_id
  const verificationsByTask = verification_log.reduce((acc, entry) => {
    if (!acc[entry.task_id]) {
      acc[entry.task_id] = [];
    }
    acc[entry.task_id].push(entry);
    return acc;
  }, {} as Record<number, typeof verification_log>);

  const toggleTask = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Calculate stats
  const totalVerifications = verification_log.length;
  const passedVerifications = verification_log.filter((v) => v.verified).length;
  const passRate = totalVerifications > 0 ? Math.round((passedVerifications / totalVerifications) * 100) : 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-apl-400" />
          <h3 className="text-sm font-medium text-gray-400">Chain-of-Verification</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Pass Rate:</span>
          <span className={`text-sm font-medium ${passRate >= 80 ? 'text-green-400' : passRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {passRate}%
          </span>
          <span className="text-xs text-gray-600">({passedVerifications}/{totalVerifications})</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(verificationsByTask).map(([taskId, entries]) => {
          const isExpanded = expandedTasks.has(Number(taskId));
          const allPassed = entries.every((e) => e.verified);
          const task = state.tasks.find((t) => t.id === Number(taskId));

          return (
            <div key={taskId} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Task Header */}
              <button
                onClick={() => toggleTask(Number(taskId))}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  {allPassed ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">
                    Task {taskId}: {task?.description.slice(0, 40)}...
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {entries.filter((e) => e.verified).length}/{entries.length} passed
                </span>
              </button>

              {/* Verification Details */}
              {isExpanded && (
                <div className="border-t border-gray-700 bg-gray-800/50 p-3 space-y-3">
                  {entries.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {entry.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300">{entry.criterion}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="text-gray-400">Evidence:</span> {entry.evidence}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
