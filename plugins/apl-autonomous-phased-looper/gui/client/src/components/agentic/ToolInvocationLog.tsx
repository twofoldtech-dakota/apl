import { useAplStore } from '../../store/aplStore';
import { Wrench, FileText, Terminal, Search, Edit, FolderOpen, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

// Tool definitions with icons and colors
const TOOLS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  Read: { icon: FileText, color: 'text-blue-400', label: 'Read' },
  Write: { icon: Edit, color: 'text-green-400', label: 'Write' },
  Edit: { icon: Edit, color: 'text-yellow-400', label: 'Edit' },
  Bash: { icon: Terminal, color: 'text-purple-400', label: 'Bash' },
  Glob: { icon: FolderOpen, color: 'text-orange-400', label: 'Glob' },
  Grep: { icon: Search, color: 'text-pink-400', label: 'Grep' },
  Task: { icon: Wrench, color: 'text-apl-400', label: 'Task' },
  WebFetch: { icon: Globe, color: 'text-cyan-400', label: 'WebFetch' },
  TodoWrite: { icon: FileText, color: 'text-gray-400', label: 'TodoWrite' },
};

export default function ToolInvocationLog() {
  const { toolInvocations } = useAplStore();

  // Calculate tool stats
  const toolStats = toolInvocations.reduce((acc, inv) => {
    if (!acc[inv.tool]) {
      acc[inv.tool] = { count: 0, totalDuration: 0 };
    }
    acc[inv.tool].count++;
    if (inv.duration) {
      acc[inv.tool].totalDuration += inv.duration;
    }
    return acc;
  }, {} as Record<string, { count: number; totalDuration: number }>);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-apl-400" />
          <h3 className="text-sm font-medium text-gray-400">Tool Invocations</h3>
        </div>
        <span className="text-xs text-gray-500">{toolInvocations.length} total</span>
      </div>

      {/* Tool Stats Summary */}
      {Object.keys(toolStats).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(toolStats)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([tool, stats]) => {
              const toolInfo = TOOLS[tool] || { icon: Wrench, color: 'text-gray-400', label: tool };
              const Icon = toolInfo.icon;
              return (
                <div
                  key={tool}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 border border-gray-700"
                >
                  <Icon className={clsx('h-3 w-3', toolInfo.color)} />
                  <span className="text-xs text-gray-300">{toolInfo.label}</span>
                  <span className="text-xs text-gray-500">×{stats.count}</span>
                </div>
              );
            })}
        </div>
      )}

      {/* Invocation List */}
      {toolInvocations.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Tool invocations will appear here as agents execute
        </p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {toolInvocations.slice(0, 50).map((invocation) => {
            const toolInfo = TOOLS[invocation.tool] || { icon: Wrench, color: 'text-gray-400', label: invocation.tool };
            const Icon = toolInfo.icon;

            return (
              <div
                key={invocation.id}
                className={clsx(
                  'flex items-start gap-3 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50',
                  invocation.status === 'error' && 'border-red-700/50'
                )}
              >
                <Icon className={clsx('h-4 w-4 mt-0.5', toolInfo.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{toolInfo.label}</span>
                    {invocation.duration && (
                      <span className="text-xs text-gray-500">{invocation.duration}ms</span>
                    )}
                    {invocation.status === 'error' && (
                      <span className="text-xs text-red-400">error</span>
                    )}
                  </div>
                  {invocation.summary && (
                    <p className="text-xs text-gray-500 truncate">{invocation.summary}</p>
                  )}
                  <p className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(invocation.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
