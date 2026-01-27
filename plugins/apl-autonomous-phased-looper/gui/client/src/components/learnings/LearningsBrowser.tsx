import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useAplStore } from '../../store/aplStore';
import { api } from '../../api/client';
import type { SuccessPattern, AntiPattern } from '@apl-gui/shared';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

export default function LearningsBrowser() {
  const { learnings, fetchLearnings } = useAplStore();
  const [activeTab, setActiveTab] = useState<'success' | 'anti'>('success');
  const [stats, setStats] = useState<{
    successPatternCount: number;
    antiPatternCount: number;
    totalPatterns: number;
    topTags: { tag: string; count: number }[];
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchLearnings();
    loadStats();
  }, [fetchLearnings]);

  const loadStats = async () => {
    try {
      const data = await api.getLearningsStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDeletePattern = async (id: string) => {
    try {
      await api.deletePattern(id);
      fetchLearnings();
      loadStats();
      setDeleteModalOpen(false);
      setPatternToDelete(null);
    } catch (error) {
      console.error('Failed to delete pattern:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all patterns? This cannot be undone.')) {
      return;
    }
    try {
      await api.clearAllPatterns();
      fetchLearnings();
      loadStats();
    } catch (error) {
      console.error('Failed to clear patterns:', error);
    }
  };

  if (!learnings) {
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
          <h1 className="text-2xl font-bold text-white">Learnings</h1>
          <p className="text-gray-400">Patterns learned from previous APL sessions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchLearnings(); loadStats(); }} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={handleClearAll} className="btn btn-danger flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.successPatternCount}</p>
                <p className="text-sm text-gray-400">Success Patterns</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.antiPatternCount}</p>
                <p className="text-sm text-gray-400">Anti-Patterns</p>
              </div>
            </div>
          </div>
          <div className="card p-4 col-span-2">
            <p className="text-sm text-gray-400 mb-2">Top Tags</p>
            <div className="flex flex-wrap gap-2">
              {stats.topTags.slice(0, 6).map(({ tag, count }) => (
                <Badge key={tag} variant="info">
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('success')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'success'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Success Patterns ({learnings.success_patterns.length})
        </button>
        <button
          onClick={() => setActiveTab('anti')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'anti'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Anti-Patterns ({learnings.anti_patterns.length})
        </button>
      </div>

      {/* Pattern List */}
      <div className="space-y-3">
        {activeTab === 'success' ? (
          learnings.success_patterns.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              No success patterns learned yet
            </div>
          ) : (
            learnings.success_patterns.map((pattern) => (
              <SuccessPatternCard
                key={pattern.id}
                pattern={pattern}
                onDelete={() => {
                  setPatternToDelete(pattern.id);
                  setDeleteModalOpen(true);
                }}
              />
            ))
          )
        ) : (
          learnings.anti_patterns.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              No anti-patterns learned yet
            </div>
          ) : (
            learnings.anti_patterns.map((pattern) => (
              <AntiPatternCard
                key={pattern.id}
                pattern={pattern}
                onDelete={() => {
                  setPatternToDelete(pattern.id);
                  setDeleteModalOpen(true);
                }}
              />
            ))
          )
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Pattern"
        size="sm"
      >
        <p className="text-gray-300 mb-4">Are you sure you want to delete this pattern?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => patternToDelete && handleDeletePattern(patternToDelete)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SuccessPatternCard({ pattern, onDelete }: { pattern: SuccessPattern; onDelete: () => void }) {
  return (
    <div className="card p-4 border-l-4 border-green-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">{pattern.id}</span>
            <Badge variant="info">{pattern.task_type}</Badge>
            <Badge variant="completed">Used {pattern.success_count}x</Badge>
          </div>
          <p className="text-white mb-2">{pattern.approach}</p>
          <p className="text-sm text-gray-400">{pattern.context}</p>
          <div className="flex gap-2 mt-2">
            {pattern.tags.map((tag) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
          </div>
        </div>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-400 p-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AntiPatternCard({ pattern, onDelete }: { pattern: AntiPattern; onDelete: () => void }) {
  return (
    <div className="card p-4 border-l-4 border-red-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">{pattern.id}</span>
            <Badge variant="info">{pattern.task_type}</Badge>
            <Badge variant="failed">Failed {pattern.failure_count}x</Badge>
          </div>
          <p className="text-white mb-2">{pattern.approach}</p>
          <p className="text-sm text-red-300 mb-2">Reason: {pattern.reason}</p>
          <p className="text-sm text-green-300">Alternative: {pattern.alternative}</p>
        </div>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-400 p-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
