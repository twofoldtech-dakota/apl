import { useAplStore } from '../../store/aplStore';
import { Database, AlertTriangle, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import ProgressBar from '../common/ProgressBar';

// Context window limits for different models
const MODEL_LIMITS: Record<string, number> = {
  'claude-sonnet': 200000,
  'claude-haiku': 200000,
  'claude-opus': 200000,
  'default': 200000,
};

export default function TokenUsageTracker() {
  const { tokenUsage } = useAplStore();
  const { inputTokens, outputTokens, totalTokens, model, estimatedCost, sessionTokenHistory } = tokenUsage;

  const contextLimit = MODEL_LIMITS[model] || MODEL_LIMITS.default;
  const usagePercent = Math.min((totalTokens / contextLimit) * 100, 100);
  const isHighUsage = usagePercent > 70;
  const isCriticalUsage = usagePercent > 90;

  // Format numbers with commas
  const formatNumber = (num: number) => num.toLocaleString();

  // Format cost
  const formatCost = (cost: number) => {
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-apl-400" />
          <h3 className="text-sm font-medium text-gray-400">Context Usage</h3>
        </div>
        {isCriticalUsage && (
          <div className="flex items-center gap-1 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Critical</span>
          </div>
        )}
      </div>

      {/* Main Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">
            {formatNumber(totalTokens)} / {formatNumber(contextLimit)} tokens
          </span>
          <span
            className={clsx(
              'text-sm font-medium',
              isCriticalUsage ? 'text-red-400' : isHighUsage ? 'text-yellow-400' : 'text-green-400'
            )}
          >
            {usagePercent.toFixed(1)}%
          </span>
        </div>
        <ProgressBar
          value={usagePercent}
          max={100}
          variant={isCriticalUsage ? 'danger' : isHighUsage ? 'warning' : 'success'}
          showLabel={false}
        />
        {isHighUsage && (
          <p className="text-xs text-yellow-400 mt-2">
            {isCriticalUsage
              ? 'Context almost full! Consider starting a new session.'
              : 'Approaching context limit. Complex tasks may be affected.'}
          </p>
        )}
      </div>

      {/* Token Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Input Tokens</p>
          <p className="text-lg font-medium text-blue-400">{formatNumber(inputTokens)}</p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Output Tokens</p>
          <p className="text-lg font-medium text-green-400">{formatNumber(outputTokens)}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Model:</span>
          <span className="text-gray-300">{model || 'Unknown'}</span>
        </div>
        {estimatedCost > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Est. Cost:</span>
            <span className="text-gray-300">{formatCost(estimatedCost)}</span>
          </div>
        )}
      </div>

      {/* Usage Trend (mini sparkline) */}
      {sessionTokenHistory.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">Session Trend</span>
          </div>
          <div className="flex items-end gap-1 h-8">
            {sessionTokenHistory.slice(-20).map((tokens, i) => {
              const height = (tokens / Math.max(...sessionTokenHistory)) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-apl-600 rounded-t"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
