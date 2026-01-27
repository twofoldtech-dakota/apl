import { useEffect, useState } from 'react';
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { useAplStore } from '../../store/aplStore';
import { api } from '../../api/client';
import type { MasterConfig } from '@apl-gui/shared';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';

interface ConfigSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ConfigSection({ title, children, defaultOpen = false }: ConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <span className="font-medium text-white">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-gray-800/50">{children}</div>}
    </div>
  );
}

export default function ConfigPanel() {
  const { config, fetchConfig } = useAplStore();
  const [localConfig, setLocalConfig] = useState<MasterConfig | null>(null);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleToggleAgent = async (agentName: string, enabled: boolean) => {
    try {
      await api.toggleAgent(agentName, enabled);
      fetchConfig();
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  const handleToggleHook = async (hookName: string, enabled: boolean) => {
    try {
      await api.toggleHook(hookName, enabled);
      fetchConfig();
    } catch (error) {
      console.error('Failed to toggle hook:', error);
    }
  };

  if (!localConfig) {
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
          <h1 className="text-2xl font-bold text-white">Configuration</h1>
          <p className="text-gray-400">Manage APL settings and behavior</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchConfig()} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Agents Section */}
        <ConfigSection title="Agents" defaultOpen>
          <div className="space-y-3">
            {Object.entries(localConfig.agents).map(([name, agent]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{name}</span>
                    <Badge variant={agent.enabled ? 'completed' : 'pending'}>
                      {agent.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant="info">{agent.model}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agent.enabled}
                    onChange={(e) => handleToggleAgent(name, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-apl-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apl-600"></div>
                </label>
              </div>
            ))}
          </div>
        </ConfigSection>

        {/* Execution Section */}
        <ConfigSection title="Execution">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Max Iterations</label>
              <p className="text-white font-medium">{localConfig.execution.max_iterations}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Max Phase Iterations</label>
              <p className="text-white font-medium">{localConfig.execution.max_phase_iterations}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Max Retry Attempts</label>
              <p className="text-white font-medium">{localConfig.execution.max_retry_attempts}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Timeout (minutes)</label>
              <p className="text-white font-medium">{localConfig.execution.timeout_minutes}</p>
            </div>
          </div>
        </ConfigSection>

        {/* Hooks Section */}
        <ConfigSection title="Hooks">
          <div className="space-y-3">
            {Object.entries(localConfig.hooks).map(([name, hook]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{name.replace(/_/g, ' ')}</span>
                    <Badge variant={hook.enabled ? 'completed' : 'pending'}>
                      {hook.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Trigger: {hook.trigger}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hook.enabled}
                    onChange={(e) => handleToggleHook(name, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-apl-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apl-600"></div>
                </label>
              </div>
            ))}
          </div>
        </ConfigSection>

        {/* Learning Section */}
        <ConfigSection title="Learning">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Learning Enabled</span>
              <Badge variant={localConfig.learning.enabled ? 'completed' : 'pending'}>
                {localConfig.learning.enabled ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Max Patterns</span>
              <span className="text-white font-medium">{localConfig.learning.max_patterns_stored}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Persist Success Patterns</span>
              <Badge variant={localConfig.learning.persist_success_patterns ? 'completed' : 'pending'}>
                {localConfig.learning.persist_success_patterns ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Persist Anti-Patterns</span>
              <Badge variant={localConfig.learning.persist_anti_patterns ? 'completed' : 'pending'}>
                {localConfig.learning.persist_anti_patterns ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </ConfigSection>

        {/* Safety Section */}
        <ConfigSection title="Safety">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400 text-sm">Max Files Per Task</span>
                <p className="text-white font-medium">{localConfig.safety.max_files_per_task}</p>
              </div>
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400 text-sm">Max Lines Per Edit</span>
                <p className="text-white font-medium">{localConfig.safety.max_lines_per_edit}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400 text-sm">Blocked Paths</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {localConfig.safety.blocked_paths.map((path, i) => (
                  <Badge key={i} variant="warning">{path}</Badge>
                ))}
              </div>
            </div>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}
