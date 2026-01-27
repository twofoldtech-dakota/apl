// Config Service - manages APL configuration
import type { MasterConfig, ProjectConfig } from '@apl-gui/shared';
import { config } from '../config.js';
import { readJsonFile, writeJsonFile, fileExists } from '../utils/fileUtils.js';

export class ConfigService {
  async getMasterConfig(): Promise<MasterConfig | null> {
    return readJsonFile<MasterConfig>(config.masterConfigPath);
  }

  async getProjectConfig(): Promise<ProjectConfig | null> {
    return readJsonFile<ProjectConfig>(config.projectConfigPath);
  }

  async getMergedConfig(): Promise<MasterConfig | null> {
    const masterConfig = await this.getMasterConfig();
    if (!masterConfig) return null;

    const projectConfig = await this.getProjectConfig();
    if (!projectConfig) return masterConfig;

    // Merge project config into master config
    return this.mergeConfigs(masterConfig, projectConfig);
  }

  private mergeConfigs(master: MasterConfig, project: ProjectConfig): MasterConfig {
    const merged = { ...master };

    if (project.max_iterations !== undefined) {
      merged.execution.max_iterations = project.max_iterations;
    }
    if (project.max_phase_iterations !== undefined) {
      merged.execution.max_phase_iterations = project.max_phase_iterations;
    }
    if (project.max_retry_attempts !== undefined) {
      merged.execution.max_retry_attempts = project.max_retry_attempts;
    }
    if (project.confidence_threshold !== undefined) {
      merged.confidence.threshold = project.confidence_threshold;
    }
    if (project.auto_test !== undefined) {
      merged.verification.run_tests_after_changes = project.auto_test;
    }
    if (project.auto_lint !== undefined) {
      merged.verification.run_linter_after_changes = project.auto_lint;
    }
    if (project.learning_enabled !== undefined) {
      merged.learning.enabled = project.learning_enabled;
    }
    if (project.compression_threshold !== undefined) {
      merged.context_management.compression_threshold_tokens = project.compression_threshold;
    }
    if (project.model_selection) {
      if (project.model_selection.simple_tasks) {
        merged.model_selection.by_task_complexity.simple = project.model_selection.simple_tasks;
      }
      if (project.model_selection.medium_tasks) {
        merged.model_selection.by_task_complexity.medium = project.model_selection.medium_tasks;
      }
      if (project.model_selection.complex_tasks) {
        merged.model_selection.by_task_complexity.complex = project.model_selection.complex_tasks;
      }
    }

    return merged;
  }

  async updateMasterConfig(updates: Partial<MasterConfig>): Promise<boolean> {
    const currentConfig = await this.getMasterConfig();
    if (!currentConfig) return false;

    const newConfig = this.deepMerge(currentConfig, updates);
    return writeJsonFile(config.masterConfigPath, newConfig);
  }

  async updateProjectConfig(updates: Partial<ProjectConfig>): Promise<boolean> {
    const currentConfig = await this.getProjectConfig() || {};
    const newConfig = { ...currentConfig, ...updates };
    return writeJsonFile(config.projectConfigPath, newConfig);
  }

  async hasProjectConfig(): Promise<boolean> {
    return fileExists(config.projectConfigPath);
  }

  async getAgents(): Promise<MasterConfig['agents'] | null> {
    const masterConfig = await this.getMasterConfig();
    return masterConfig?.agents || null;
  }

  async toggleAgent(agentName: string, enabled: boolean): Promise<boolean> {
    const masterConfig = await this.getMasterConfig();
    if (!masterConfig || !masterConfig.agents[agentName]) return false;

    masterConfig.agents[agentName].enabled = enabled;
    return writeJsonFile(config.masterConfigPath, masterConfig);
  }

  async getHooks(): Promise<MasterConfig['hooks'] | null> {
    const masterConfig = await this.getMasterConfig();
    return masterConfig?.hooks || null;
  }

  async toggleHook(hookName: string, enabled: boolean): Promise<boolean> {
    const masterConfig = await this.getMasterConfig();
    if (!masterConfig || !masterConfig.hooks[hookName]) return false;

    masterConfig.hooks[hookName].enabled = enabled;
    return writeJsonFile(config.masterConfigPath, masterConfig);
  }

  private deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (
          sourceValue !== null &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue !== null &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          result[key] = this.deepMerge(
            targetValue as Record<string, unknown>,
            sourceValue as Record<string, unknown>
          ) as T[Extract<keyof T, string>];
        } else {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }
}

export const configService = new ConfigService();
