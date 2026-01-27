// Checkpoint Service - manages APL checkpoints and rollback
import type { Checkpoint, AplState } from '@apl-gui/shared';
import { stateService } from './stateService.js';

export class CheckpointService {
  async getCheckpoints(): Promise<Checkpoint[]> {
    return stateService.getCheckpoints();
  }

  async getCheckpointById(id: string): Promise<Checkpoint | null> {
    const checkpoints = await this.getCheckpoints();
    return checkpoints.find(cp => cp.id === id) || null;
  }

  async getLatestCheckpoint(): Promise<Checkpoint | null> {
    const checkpoints = await this.getCheckpoints();
    if (checkpoints.length === 0) return null;

    return checkpoints.reduce((latest, current) => {
      return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
    });
  }

  async getCheckpointsByPhase(phase: string): Promise<Checkpoint[]> {
    const checkpoints = await this.getCheckpoints();
    return checkpoints.filter(cp => cp.phase === phase);
  }

  async rollbackToCheckpoint(checkpointId: string): Promise<{
    success: boolean;
    message: string;
    checkpoint?: Checkpoint;
  }> {
    const checkpoint = await this.getCheckpointById(checkpointId);
    if (!checkpoint) {
      return {
        success: false,
        message: `Checkpoint ${checkpointId} not found`,
      };
    }

    const state = await stateService.getState();

    // Remove checkpoints after this one
    const checkpointIndex = state.checkpoints.findIndex(cp => cp.id === checkpointId);
    if (checkpointIndex === -1) {
      return {
        success: false,
        message: `Checkpoint ${checkpointId} not found in state`,
      };
    }

    // Reset state to checkpoint
    const newState: Partial<AplState> = {
      phase: checkpoint.phase,
      iteration: checkpoint.iteration,
      checkpoints: state.checkpoints.slice(0, checkpointIndex + 1),
      tasks: state.tasks.map(task => {
        if (checkpoint.tasks_completed.includes(task.id)) {
          return task;
        }
        // Reset tasks that weren't completed at this checkpoint
        return {
          ...task,
          status: 'pending' as const,
          attempts: 0,
          result: undefined,
          completed_at: undefined,
          started_at: undefined,
          current_step: undefined,
          files_in_progress: undefined,
        };
      }),
      // Clear files modified after checkpoint
      files_modified: state.files_modified.filter(
        f => checkpoint.files_snapshot.includes(f.path) ||
            checkpoint.tasks_completed.includes(f.task_id)
      ),
      // Update metrics
      metrics: {
        ...state.metrics,
        tasks_completed: checkpoint.tasks_completed.length,
        tasks_remaining: state.tasks.length - checkpoint.tasks_completed.length,
      },
    };

    const success = await stateService.updateState(newState);

    return {
      success,
      message: success
        ? `Rolled back to checkpoint ${checkpointId}`
        : 'Failed to update state',
      checkpoint,
    };
  }

  async getCheckpointDiff(checkpointId: string): Promise<{
    tasksCompleted: number[];
    filesModified: string[];
    phase: string;
    iteration: number;
  } | null> {
    const checkpoint = await this.getCheckpointById(checkpointId);
    if (!checkpoint) return null;

    return {
      tasksCompleted: checkpoint.tasks_completed,
      filesModified: checkpoint.files_snapshot,
      phase: checkpoint.phase,
      iteration: checkpoint.iteration,
    };
  }

  async getCheckpointTimeline(): Promise<{
    id: string;
    phase: string;
    iteration: number;
    timestamp: string;
    tasksCompletedCount: number;
    filesCount: number;
  }[]> {
    const checkpoints = await this.getCheckpoints();

    return checkpoints
      .map(cp => ({
        id: cp.id,
        phase: cp.phase,
        iteration: cp.iteration,
        timestamp: cp.timestamp,
        tasksCompletedCount: cp.tasks_completed.length,
        filesCount: cp.files_snapshot.length,
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export const checkpointService = new CheckpointService();
