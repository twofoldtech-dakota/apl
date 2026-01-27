import { Check, Circle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { Phase } from '@apl-gui/shared';

interface PhaseIndicatorProps {
  phase: Phase;
  iteration: number;
  maxIterations: number;
}

const phases: { id: Phase; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'execute', label: 'Execute' },
  { id: 'review', label: 'Review' },
];

export default function PhaseIndicator({ phase, iteration, maxIterations }: PhaseIndicatorProps) {
  const currentPhaseIndex = phases.findIndex(p => p.id === phase);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Workflow Progress</h3>
        <div className="text-sm text-gray-400">
          Iteration <span className="text-white font-medium">{iteration}</span> / {maxIterations}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {phases.map((p, index) => {
          const isCompleted = index < currentPhaseIndex;
          const isCurrent = index === currentPhaseIndex;
          const isPending = index > currentPhaseIndex;

          return (
            <div key={p.id} className="flex items-center">
              {/* Phase Step */}
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-green-500 bg-green-500/20',
                    isCurrent && 'border-apl-500 bg-apl-500/20 ring-4 ring-apl-500/20',
                    isPending && 'border-gray-600 bg-gray-700'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6 text-green-400" />
                  ) : (
                    <Circle
                      className={clsx(
                        'h-6 w-6',
                        isCurrent ? 'text-apl-400' : 'text-gray-500'
                      )}
                      fill={isCurrent ? 'currentColor' : 'none'}
                    />
                  )}
                </div>
                <span
                  className={clsx(
                    'mt-2 text-sm font-medium',
                    isCompleted && 'text-green-400',
                    isCurrent && 'text-apl-400',
                    isPending && 'text-gray-500'
                  )}
                >
                  {p.label}
                </span>
              </div>

              {/* Connector */}
              {index < phases.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <div
                      className={clsx(
                        'h-0.5 flex-1 transition-all',
                        index < currentPhaseIndex ? 'bg-green-500' : 'bg-gray-600'
                      )}
                    />
                    <ArrowRight
                      className={clsx(
                        'h-4 w-4 mx-1',
                        index < currentPhaseIndex ? 'text-green-500' : 'text-gray-600'
                      )}
                    />
                    <div
                      className={clsx(
                        'h-0.5 flex-1 transition-all',
                        index < currentPhaseIndex ? 'bg-green-500' : 'bg-gray-600'
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
