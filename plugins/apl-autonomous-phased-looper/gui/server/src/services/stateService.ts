// State Service - manages APL state file
import type { AplState } from '@apl-gui/shared';
import { DEFAULT_STATE } from '@apl-gui/shared';
import { config } from '../config.js';
import { readJsonFile, writeJsonFile, fileExists } from '../utils/fileUtils.js';

export class StateService {
  async getState(): Promise<AplState> {
    const state = await readJsonFile<AplState>(config.stateFilePath);
    return state || DEFAULT_STATE;
  }

  async hasActiveSession(): Promise<boolean> {
    const exists = await fileExists(config.stateFilePath);
    if (!exists) return false;

    const state = await this.getState();
    return state.session_id !== '' && state.goal !== '';
  }

  async clearState(): Promise<boolean> {
    return writeJsonFile(config.stateFilePath, DEFAULT_STATE);
  }

  async updateState(updates: Partial<AplState>): Promise<boolean> {
    const currentState = await this.getState();
    const newState = {
      ...currentState,
      ...updates,
      last_updated: new Date().toISOString(),
    };
    return writeJsonFile(config.stateFilePath, newState);
  }

  async getTaskById(taskId: number): Promise<AplState['tasks'][0] | null> {
    const state = await this.getState();
    return state.tasks.find(t => t.id === taskId) || null;
  }

  async getTasksByStatus(status: string): Promise<AplState['tasks']> {
    const state = await this.getState();
    return state.tasks.filter(t => t.status === status);
  }

  async getMetrics(): Promise<AplState['metrics'] | null> {
    const state = await this.getState();
    return state.metrics || null;
  }

  async getCheckpoints(): Promise<AplState['checkpoints']> {
    const state = await this.getState();
    return state.checkpoints || [];
  }

  async getScratchpad(): Promise<AplState['scratchpad'] | null> {
    const state = await this.getState();
    return state.scratchpad || null;
  }

  async getVerificationLog(): Promise<AplState['verification_log']> {
    const state = await this.getState();
    return state.verification_log || [];
  }

  async getErrors(): Promise<AplState['errors']> {
    const state = await this.getState();
    return state.errors || [];
  }
}

export const stateService = new StateService();
