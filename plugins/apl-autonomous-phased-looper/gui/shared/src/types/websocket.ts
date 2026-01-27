// APL GUI WebSocket Message Types

import type { AplState, Task, Checkpoint } from './state.js';
import type { MasterConfig } from './config.js';
import type { Learnings } from './learnings.js';

export type WebSocketMessageType =
  | 'connection:established'
  | 'connection:error'
  | 'state:update'
  | 'state:phase_change'
  | 'state:cleared'
  | 'task:update'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'config:update'
  | 'learnings:update'
  | 'checkpoint:created'
  | 'checkpoint:rollback'
  | 'apl:started'
  | 'apl:stopped'
  | 'apl:output'
  | 'apl:error'
  | 'error';

export interface BaseWebSocketMessage {
  type: WebSocketMessageType;
  timestamp: string;
}

export interface ConnectionEstablishedMessage extends BaseWebSocketMessage {
  type: 'connection:established';
  payload: {
    clientId: string;
    serverVersion: string;
  };
}

export interface ConnectionErrorMessage extends BaseWebSocketMessage {
  type: 'connection:error';
  payload: {
    error: string;
  };
}

export interface StateUpdateMessage extends BaseWebSocketMessage {
  type: 'state:update';
  payload: {
    state: AplState;
  };
}

export interface StatePhaseChangeMessage extends BaseWebSocketMessage {
  type: 'state:phase_change';
  payload: {
    previousPhase: string;
    newPhase: string;
    iteration: number;
  };
}

export interface StateClearedMessage extends BaseWebSocketMessage {
  type: 'state:cleared';
  payload: Record<string, never>;
}

export interface TaskUpdateMessage extends BaseWebSocketMessage {
  type: 'task:update';
  payload: {
    task: Task;
  };
}

export interface TaskStartedMessage extends BaseWebSocketMessage {
  type: 'task:started';
  payload: {
    taskId: number;
    description: string;
  };
}

export interface TaskCompletedMessage extends BaseWebSocketMessage {
  type: 'task:completed';
  payload: {
    taskId: number;
    result: Task['result'];
  };
}

export interface TaskFailedMessage extends BaseWebSocketMessage {
  type: 'task:failed';
  payload: {
    taskId: number;
    error: string;
    attempt: number;
  };
}

export interface ConfigUpdateMessage extends BaseWebSocketMessage {
  type: 'config:update';
  payload: {
    config: MasterConfig;
    changedSection?: string;
  };
}

export interface LearningsUpdateMessage extends BaseWebSocketMessage {
  type: 'learnings:update';
  payload: {
    learnings: Learnings;
  };
}

export interface CheckpointCreatedMessage extends BaseWebSocketMessage {
  type: 'checkpoint:created';
  payload: {
    checkpoint: Checkpoint;
  };
}

export interface CheckpointRollbackMessage extends BaseWebSocketMessage {
  type: 'checkpoint:rollback';
  payload: {
    checkpointId: string;
    success: boolean;
  };
}

export interface AplStartedMessage extends BaseWebSocketMessage {
  type: 'apl:started';
  payload: {
    goal: string;
    sessionId: string;
  };
}

export interface AplStoppedMessage extends BaseWebSocketMessage {
  type: 'apl:stopped';
  payload: {
    reason: 'completed' | 'user_stopped' | 'error' | 'timeout';
    summary?: string;
  };
}

export interface AplOutputMessage extends BaseWebSocketMessage {
  type: 'apl:output';
  payload: {
    stream: 'stdout' | 'stderr';
    data: string;
  };
}

export interface AplErrorMessage extends BaseWebSocketMessage {
  type: 'apl:error';
  payload: {
    error: string;
    fatal: boolean;
  };
}

export interface ErrorMessage extends BaseWebSocketMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type WebSocketMessage =
  | ConnectionEstablishedMessage
  | ConnectionErrorMessage
  | StateUpdateMessage
  | StatePhaseChangeMessage
  | StateClearedMessage
  | TaskUpdateMessage
  | TaskStartedMessage
  | TaskCompletedMessage
  | TaskFailedMessage
  | ConfigUpdateMessage
  | LearningsUpdateMessage
  | CheckpointCreatedMessage
  | CheckpointRollbackMessage
  | AplStartedMessage
  | AplStoppedMessage
  | AplOutputMessage
  | AplErrorMessage
  | ErrorMessage;

// Client -> Server messages
export type ClientMessageType =
  | 'subscribe'
  | 'unsubscribe'
  | 'ping';

export interface ClientMessage {
  type: ClientMessageType;
  payload?: unknown;
}

export function createMessage<T extends WebSocketMessage>(
  type: T['type'],
  payload: T['payload']
): T {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
  } as T;
}
