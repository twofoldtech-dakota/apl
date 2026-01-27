import { useState } from 'react';
import { Terminal, Play, RotateCcw, FileText, HelpCircle, Trash2, Building2, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';
import { useAplStore } from '../../store/aplStore';
import { clsx } from 'clsx';

type CommandCategory = 'apl' | 'meta';

interface Command {
  name: string;
  description: string;
  icon: React.ElementType;
  action: () => Promise<void>;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  dangerous?: boolean;
}

export default function CommandPanel() {
  const [activeCategory, setActiveCategory] = useState<CommandCategory>('apl');
  const [inputValue, setInputValue] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const { fetchInitialState, fetchLearnings } = useAplStore();

  const executeCommand = async (command: Command) => {
    setIsExecuting(true);
    setActiveCommand(command.name);
    try {
      await command.action();
    } catch (error) {
      console.error(`Command ${command.name} failed:`, error);
      alert(`Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
      setActiveCommand(null);
      setInputValue('');
    }
  };

  const aplCommands: Command[] = [
    {
      name: 'status',
      description: 'View current APL state and progress',
      icon: FileText,
      action: async () => {
        await fetchInitialState();
      },
    },
    {
      name: 'reset',
      description: 'Clear state and start fresh',
      icon: RotateCcw,
      action: async () => {
        if (confirm('Are you sure you want to reset APL state? This cannot be undone.')) {
          await api.clearState();
          await fetchInitialState();
        }
      },
      dangerous: true,
    },
    {
      name: 'rollback',
      description: 'Restore to a previous checkpoint',
      icon: RotateCcw,
      action: async () => {
        // Navigate to checkpoints page or open modal
        window.location.hash = '#/checkpoints';
      },
    },
    {
      name: 'forget',
      description: 'Clear all learned patterns',
      icon: Trash2,
      action: async () => {
        if (confirm('Are you sure you want to clear all learned patterns? This cannot be undone.')) {
          await api.clearAllPatterns();
          await fetchLearnings();
        }
      },
      dangerous: true,
    },
  ];

  const metaCommands: Command[] = [
    {
      name: 'meta',
      description: 'Start enterprise project planning',
      icon: Building2,
      action: async () => {
        if (!inputValue.trim()) {
          alert('Please enter a project goal');
          return;
        }
        await api.startApl(`/meta ${inputValue.trim()}`);
      },
      requiresInput: true,
      inputPlaceholder: 'Enter enterprise project goal...',
    },
    {
      name: 'meta loop',
      description: 'Execute next Epic in the plan',
      icon: Play,
      action: async () => {
        await api.startApl('/meta loop');
      },
    },
    {
      name: 'meta status',
      description: 'View Epic/Feature/Story progress',
      icon: FileText,
      action: async () => {
        await api.startApl('/meta status');
      },
    },
    {
      name: 'meta export',
      description: 'Generate project documentation',
      icon: FileText,
      action: async () => {
        await api.startApl('/meta export');
      },
    },
  ];

  const commands = activeCategory === 'apl' ? aplCommands : metaCommands;

  return (
    <div className="card">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="h-5 w-5 text-apl-400" />
          <h3 className="font-medium text-white">Commands</h3>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory('apl')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              activeCategory === 'apl'
                ? 'bg-apl-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            )}
          >
            /apl
          </button>
          <button
            onClick={() => setActiveCategory('meta')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              activeCategory === 'meta'
                ? 'bg-apl-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            )}
          >
            /meta
          </button>
        </div>
      </div>

      {/* Commands List */}
      <div className="p-2">
        {commands.map((command) => {
          const Icon = command.icon;
          const isActive = activeCommand === command.name;

          return (
            <div key={command.name} className="mb-2">
              {command.requiresInput ? (
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-apl-400" />
                    <span className="text-sm font-medium text-white">{command.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{command.description}</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={command.inputPlaceholder}
                      className="input flex-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          executeCommand(command);
                        }
                      }}
                    />
                    <button
                      onClick={() => executeCommand(command)}
                      disabled={isExecuting || !inputValue.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      {isActive ? 'Running...' : 'Run'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => executeCommand(command)}
                  disabled={isExecuting}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                    command.dangerous
                      ? 'hover:bg-red-900/20 hover:border-red-700'
                      : 'hover:bg-gray-700',
                    isActive && 'bg-gray-700'
                  )}
                >
                  <Icon className={clsx(
                    'h-4 w-4',
                    command.dangerous ? 'text-red-400' : 'text-apl-400'
                  )} />
                  <div className="flex-1">
                    <span className={clsx(
                      'text-sm font-medium',
                      command.dangerous ? 'text-red-300' : 'text-white'
                    )}>
                      {command.name}
                    </span>
                    <p className="text-xs text-gray-400">{command.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/30">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <HelpCircle className="h-3 w-3 mt-0.5" />
          <span>
            {activeCategory === 'apl'
              ? 'APL commands control the autonomous coding workflow'
              : 'Meta commands handle enterprise-scale project orchestration'}
          </span>
        </div>
      </div>
    </div>
  );
}
