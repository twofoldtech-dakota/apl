import { useAplStore } from '../../store/aplStore';
import { Brain, Play, Eye, CheckSquare, RotateCw } from 'lucide-react';
import { clsx } from 'clsx';

type ReActStep = 'reason' | 'act' | 'observe' | 'verify' | 'idle';

const STEPS: { id: ReActStep; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { id: 'reason', label: 'Reason', icon: Brain, color: 'text-purple-400', description: 'Analyzing requirements and planning approach' },
  { id: 'act', label: 'Act', icon: Play, color: 'text-blue-400', description: 'Executing code generation or modification' },
  { id: 'observe', label: 'Observe', icon: Eye, color: 'text-yellow-400', description: 'Checking results and analyzing output' },
  { id: 'verify', label: 'Verify', icon: CheckSquare, color: 'text-green-400', description: 'Validating against success criteria' },
];

export default function ReActLoopIndicator() {
  const { agentActivity } = useAplStore();
  const { reactStep, reactIteration } = agentActivity;

  const currentStepIndex = STEPS.findIndex((s) => s.id === reactStep);
  const currentStepInfo = STEPS.find((s) => s.id === reactStep);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RotateCw className={clsx('h-5 w-5', reactStep !== 'idle' && 'animate-spin-slow', 'text-apl-400')} />
          <h3 className="text-sm font-medium text-gray-400">ReAct Loop</h3>
        </div>
        {reactIteration > 0 && (
          <span className="text-xs text-gray-500">Iteration {reactIteration}</span>
        )}
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((step, index) => {
          const isActive = step.id === reactStep;
          const isCompleted = currentStepIndex > index;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div
                className={clsx(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  isActive && `${step.color} border-current bg-gray-800 scale-110`,
                  isCompleted && 'border-green-500 bg-green-900/30',
                  !isActive && !isCompleted && 'border-gray-600 bg-gray-800/50'
                )}
              >
                <Icon
                  className={clsx(
                    'h-5 w-5',
                    isActive && step.color,
                    isCompleted && 'text-green-400',
                    !isActive && !isCompleted && 'text-gray-500'
                  )}
                />
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={clsx(
                    'w-8 h-0.5 mx-1',
                    isCompleted ? 'bg-green-500' : 'bg-gray-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Labels */}
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((step) => {
          const isActive = step.id === reactStep;
          return (
            <div key={step.id} className="w-10 text-center">
              <span
                className={clsx(
                  'text-xs',
                  isActive ? step.color : 'text-gray-500'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Step Description */}
      {currentStepInfo && reactStep !== 'idle' ? (
        <div className={clsx('p-3 rounded-lg bg-gray-800/50 border-l-2', `border-l-${currentStepInfo.color.replace('text-', '')}`)}>
          <p className="text-sm text-gray-300">{currentStepInfo.description}</p>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-gray-800/50 border-l-2 border-l-gray-600">
          <p className="text-sm text-gray-500">Waiting for agent to start ReAct cycle...</p>
        </div>
      )}
    </div>
  );
}
