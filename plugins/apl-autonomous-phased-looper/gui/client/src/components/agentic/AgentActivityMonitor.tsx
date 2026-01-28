import { useAplStore } from '../../store/aplStore';
import { Bot, ArrowRight, Circle, Zap } from 'lucide-react';
import { clsx } from 'clsx';

// APL Agent definitions
const AGENTS = [
  { id: 'apl-orchestrator', name: 'Orchestrator', color: 'text-apl-400', bgColor: 'bg-apl-900/50', role: 'Main coordinator' },
  { id: 'planner-agent', name: 'Planner', color: 'text-yellow-400', bgColor: 'bg-yellow-900/50', role: 'Task decomposition' },
  { id: 'coder-agent', name: 'Coder', color: 'text-blue-400', bgColor: 'bg-blue-900/50', role: 'Code generation' },
  { id: 'tester-agent', name: 'Tester', color: 'text-green-400', bgColor: 'bg-green-900/50', role: 'Test execution' },
  { id: 'reviewer-agent', name: 'Reviewer', color: 'text-purple-400', bgColor: 'bg-purple-900/50', role: 'Code review' },
  { id: 'learner-agent', name: 'Learner', color: 'text-orange-400', bgColor: 'bg-orange-900/50', role: 'Pattern extraction' },
  { id: 'meta-orchestrator', name: 'Meta', color: 'text-indigo-400', bgColor: 'bg-indigo-900/50', role: 'Enterprise planning' },
  { id: 'requirements-analyst', name: 'Analyst', color: 'text-rose-400', bgColor: 'bg-rose-900/50', role: 'Requirements' },
  { id: 'content-strategy-agent', name: 'Content', color: 'text-emerald-400', bgColor: 'bg-emerald-900/50', role: 'SEO & content' },
  { id: 'brand-voice-agent', name: 'Voice', color: 'text-amber-400', bgColor: 'bg-amber-900/50', role: 'Brand voice' },
  { id: 'design-agent', name: 'Design', color: 'text-pink-400', bgColor: 'bg-pink-900/50', role: 'UI patterns' },
  { id: 'accessibility-agent', name: 'A11y', color: 'text-cyan-400', bgColor: 'bg-cyan-900/50', role: 'Accessibility' },
  { id: 'copy-content-agent', name: 'Copy', color: 'text-lime-400', bgColor: 'bg-lime-900/50', role: 'Copywriting' },
  { id: 'deployer-agent', name: 'Deployer', color: 'text-sky-400', bgColor: 'bg-sky-900/50', role: 'Deployment' },
] as const;

export default function AgentActivityMonitor() {
  const { agentActivity } = useAplStore();
  const { activeAgent, delegationChain, agentStats } = agentActivity;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-apl-400" />
          <h3 className="text-sm font-medium text-gray-400">Agent Activity</h3>
        </div>
        {activeAgent && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">Active</span>
          </div>
        )}
      </div>

      {/* Delegation Chain */}
      {delegationChain.length > 0 && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Delegation Chain</p>
          <div className="flex items-center gap-2 flex-wrap">
            {delegationChain.map((agentId, index) => {
              const agent = AGENTS.find((a) => a.id === agentId);
              return (
                <div key={index} className="flex items-center gap-2">
                  <span className={clsx('text-sm font-medium', agent?.color || 'text-gray-400')}>
                    {agent?.name || agentId}
                  </span>
                  {index < delegationChain.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-gray-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map((agent) => {
          const isActive = activeAgent === agent.id;
          const stats = agentStats[agent.id];

          return (
            <div
              key={agent.id}
              className={clsx(
                'p-3 rounded-lg border transition-all',
                isActive
                  ? `${agent.bgColor} border-${agent.color.replace('text-', '')}`
                  : 'bg-gray-800/30 border-gray-700/50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Circle
                    className={clsx(
                      'h-2 w-2',
                      isActive ? `${agent.color} fill-current` : 'text-gray-600'
                    )}
                  />
                  <span className={clsx('text-sm font-medium', isActive ? agent.color : 'text-gray-500')}>
                    {agent.name}
                  </span>
                </div>
                {isActive && <Zap className={clsx('h-3 w-3', agent.color)} />}
              </div>
              <p className="text-xs text-gray-500">{agent.role}</p>
              {stats && (
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span>Invocations: {stats.invocations}</span>
                  {stats.avgDuration && <span>Avg: {stats.avgDuration}ms</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No activity state */}
      {!activeAgent && delegationChain.length === 0 && (
        <div className="mt-4 text-center py-4">
          <p className="text-gray-500 text-sm">No agent activity</p>
          <p className="text-gray-600 text-xs mt-1">Agents will activate when APL is running</p>
        </div>
      )}
    </div>
  );
}
