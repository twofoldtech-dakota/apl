import { useEffect, useState } from 'react';
import { Clock, RotateCcw, RefreshCw, FileCode, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '../../api/client';
import { useAplStore } from '../../store/aplStore';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

interface CheckpointTimelineItem {
  id: string;
  phase: string;
  iteration: number;
  timestamp: string;
  tasksCompletedCount: number;
  filesCount: number;
}

export default function CheckpointPanel() {
  const { fetchInitialState } = useAplStore();
  const [timeline, setTimeline] = useState<CheckpointTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rollbackModal, setRollbackModal] = useState<{ open: boolean; checkpointId: string | null }>({
    open: false,
    checkpointId: null,
  });
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCheckpointTimeline();
      setTimeline(data);
    } catch (error) {
      console.error('Failed to load checkpoint timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!rollbackModal.checkpointId) return;

    setIsRollingBack(true);
    try {
      const result = await api.rollbackToCheckpoint(rollbackModal.checkpointId);
      if (result.success) {
        fetchInitialState();
        loadTimeline();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to rollback:', error);
      alert('Failed to rollback to checkpoint');
    } finally {
      setIsRollingBack(false);
      setRollbackModal({ open: false, checkpointId: null });
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'plan':
        return 'text-yellow-400 border-yellow-400';
      case 'execute':
        return 'text-blue-400 border-blue-400';
      case 'review':
        return 'text-green-400 border-green-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Checkpoints</h1>
          <p className="text-gray-400">Recovery points during APL execution</p>
        </div>
        <button onClick={loadTimeline} className="btn btn-secondary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {timeline.length === 0 ? (
        <div className="card p-8 text-center">
          <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Checkpoints</h3>
          <p className="text-gray-500">Checkpoints will appear here as APL progresses through phases</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700" />

            {timeline.map((checkpoint) => (
              <div key={checkpoint.id} className="relative flex gap-4 pb-6">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-gray-800 ${getPhaseColor(checkpoint.phase)}`}
                >
                  <Clock className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{checkpoint.id}</span>
                        <Badge variant={
                          checkpoint.phase === 'plan' ? 'warning' :
                          checkpoint.phase === 'execute' ? 'in_progress' : 'completed'
                        }>
                          {checkpoint.phase}
                        </Badge>
                        <span className="text-sm text-gray-400">Iteration {checkpoint.iteration}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {checkpoint.tasksCompletedCount} tasks
                        </div>
                        <div className="flex items-center gap-1">
                          <FileCode className="h-4 w-4 text-apl-400" />
                          {checkpoint.filesCount} files
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(checkpoint.timestamp), 'PPpp')} ({formatDistanceToNow(new Date(checkpoint.timestamp), { addSuffix: true })})
                      </p>
                    </div>

                    <button
                      onClick={() => setRollbackModal({ open: true, checkpointId: checkpoint.id })}
                      className="btn btn-secondary flex items-center gap-2 text-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Rollback
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      <Modal
        isOpen={rollbackModal.open}
        onClose={() => setRollbackModal({ open: false, checkpointId: null })}
        title="Confirm Rollback"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to rollback to checkpoint <strong>{rollbackModal.checkpointId}</strong>?
          </p>
          <p className="text-yellow-400 text-sm">
            Warning: This will reset the APL state to this checkpoint. Tasks completed after this point will be marked as pending.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setRollbackModal({ open: false, checkpointId: null })}
              className="btn btn-secondary"
              disabled={isRollingBack}
            >
              Cancel
            </button>
            <button
              onClick={handleRollback}
              className="btn btn-danger flex items-center gap-2"
              disabled={isRollingBack}
            >
              {isRollingBack ? (
                <>
                  <LoadingSpinner size="sm" />
                  Rolling back...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Rollback
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
