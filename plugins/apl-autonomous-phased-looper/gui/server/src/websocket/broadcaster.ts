// WebSocket Broadcaster
import { WebSocket } from 'ws';
import type { WebSocketMessage, WebSocketMessageType } from '@apl-gui/shared';

export class Broadcaster {
  private clients: Set<WebSocket> = new Set();

  addClient(ws: WebSocket): void {
    this.clients.add(ws);
  }

  removeClient(ws: WebSocket): void {
    this.clients.delete(ws);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  broadcast(message: WebSocketMessage): void {
    const data = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  send(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  emit(type: WebSocketMessageType, payload: unknown): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    } as WebSocketMessage;

    this.broadcast(message);
  }
}

export const broadcaster = new Broadcaster();
