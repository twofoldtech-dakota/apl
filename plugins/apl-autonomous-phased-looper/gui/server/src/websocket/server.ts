// WebSocket Server
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { v4 as uuidv4 } from 'crypto';
import { broadcaster } from './broadcaster.js';
import { createWatchers, type WatcherManager } from '../watchers/index.js';
import { aplService } from '../services/aplService.js';

export class WebSocketServer {
  private wss: WSServer | null = null;
  private watchers: WatcherManager | null = null;

  attach(server: Server): void {
    this.wss = new WSServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();

      broadcaster.addClient(ws);

      // Send connection established message
      broadcaster.send(ws, {
        type: 'connection:established',
        payload: {
          clientId,
          serverVersion: '1.0.0',
        },
        timestamp: new Date().toISOString(),
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        broadcaster.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        broadcaster.removeClient(ws);
      });
    });

    // Start file watchers and forward events to clients
    this.startWatchers();

    // Forward APL service events
    this.setupAplServiceEvents();
  }

  private startWatchers(): void {
    this.watchers = createWatchers();

    // Forward all watcher events to WebSocket clients
    this.watchers.on('state:update', (data) => {
      broadcaster.emit('state:update', data);
    });

    this.watchers.on('state:phase_change', (data) => {
      broadcaster.emit('state:phase_change', data);
    });

    this.watchers.on('state:cleared', (data) => {
      broadcaster.emit('state:cleared', data);
    });

    this.watchers.on('task:update', (data) => {
      broadcaster.emit('task:update', data);
    });

    this.watchers.on('task:started', (data) => {
      broadcaster.emit('task:started', data);
    });

    this.watchers.on('task:completed', (data) => {
      broadcaster.emit('task:completed', data);
    });

    this.watchers.on('task:failed', (data) => {
      broadcaster.emit('task:failed', data);
    });

    this.watchers.on('checkpoint:created', (data) => {
      broadcaster.emit('checkpoint:created', data);
    });

    this.watchers.on('config:update', (data) => {
      broadcaster.emit('config:update', data);
    });

    this.watchers.on('learnings:update', (data) => {
      broadcaster.emit('learnings:update', data);
    });

    this.watchers.on('error', (data) => {
      broadcaster.emit('error', {
        code: 'WATCHER_ERROR',
        message: data.error,
        details: data,
      });
    });

    this.watchers.start();
  }

  private setupAplServiceEvents(): void {
    aplService.on('output', (data) => {
      broadcaster.emit('apl:output', data);
    });

    aplService.on('close', (data) => {
      broadcaster.emit('apl:stopped', {
        reason: data.code === 0 ? 'completed' : 'error',
        summary: `APL finished with code ${data.code}`,
      });
    });

    aplService.on('error', (data) => {
      broadcaster.emit('apl:error', {
        error: data.error,
        fatal: true,
      });
    });
  }

  private handleMessage(ws: WebSocket, message: { type: string; payload?: unknown }): void {
    switch (message.type) {
      case 'ping':
        broadcaster.send(ws, {
          type: 'connection:established',
          payload: { pong: true },
          timestamp: new Date().toISOString(),
        } as any);
        break;

      case 'subscribe':
        // Future: implement selective subscriptions
        break;

      case 'unsubscribe':
        // Future: implement selective unsubscriptions
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private generateClientId(): string {
    // Simple UUID-like ID
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  close(): void {
    if (this.watchers) {
      this.watchers.stop();
      this.watchers = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }

  getClientCount(): number {
    return broadcaster.getClientCount();
  }
}
