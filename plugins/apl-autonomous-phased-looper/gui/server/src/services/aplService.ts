// APL Service - manages APL command execution
import { spawn, type ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { config } from '../config.js';

export interface AplProcessStatus {
  running: boolean;
  pid?: number;
  goal?: string;
  startedAt?: string;
}

export class AplService extends EventEmitter {
  private process: ChildProcess | null = null;
  private currentGoal: string = '';
  private startedAt: string = '';

  async startApl(goal: string): Promise<{
    success: boolean;
    message: string;
    pid?: number;
  }> {
    if (this.process) {
      return {
        success: false,
        message: 'APL is already running',
      };
    }

    try {
      // Spawn Claude Code with APL skill
      // Note: This assumes claude CLI is available in PATH
      this.process = spawn('claude', [
        '--print',
        '--dangerously-skip-permissions',
        `/apl ${goal}`,
      ], {
        cwd: config.projectRoot,
        env: {
          ...process.env,
          APL_PROJECT_ROOT: config.projectRoot,
        },
        shell: true,
      });

      this.currentGoal = goal;
      this.startedAt = new Date().toISOString();

      this.process.stdout?.on('data', (data: Buffer) => {
        this.emit('output', {
          stream: 'stdout',
          data: data.toString(),
        });
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        this.emit('output', {
          stream: 'stderr',
          data: data.toString(),
        });
      });

      this.process.on('close', (code: number | null) => {
        this.emit('close', {
          code,
          goal: this.currentGoal,
        });
        this.process = null;
        this.currentGoal = '';
        this.startedAt = '';
      });

      this.process.on('error', (error: Error) => {
        this.emit('error', {
          error: error.message,
        });
        this.process = null;
        this.currentGoal = '';
        this.startedAt = '';
      });

      return {
        success: true,
        message: `APL started with goal: ${goal}`,
        pid: this.process.pid,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start APL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async stopApl(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!this.process) {
      return {
        success: false,
        message: 'APL is not running',
      };
    }

    try {
      this.process.kill('SIGTERM');

      // Give it 5 seconds to gracefully terminate
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (this.process) {
            this.process.kill('SIGKILL');
          }
          resolve();
        }, 5000);

        this.process?.on('close', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      return {
        success: true,
        message: 'APL stopped',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to stop APL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  getStatus(): AplProcessStatus {
    return {
      running: this.process !== null,
      pid: this.process?.pid,
      goal: this.currentGoal || undefined,
      startedAt: this.startedAt || undefined,
    };
  }

  isRunning(): boolean {
    return this.process !== null;
  }
}

export const aplService = new AplService();
