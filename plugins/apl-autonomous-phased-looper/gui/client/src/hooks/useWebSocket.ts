// WebSocket Hook
import { useCallback, useRef } from 'react';
import { useAplStore } from '../store/aplStore';
import type { WebSocketMessage } from '@apl-gui/shared';

const WS_URL = `ws://${window.location.hostname}:3001/ws`;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    setState,
    updateTask,
    addCheckpoint,
    setConfig,
    setLearnings,
    setConnected,
    setAplRunning,
    addActivityEvent,
  } = useAplStore();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'connection:established':
            setConnected(true);
            break;

          case 'state:update':
            setState((message as any).payload.state);
            break;

          case 'state:phase_change':
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'phase',
              message: `Phase: ${(message as any).payload.previousPhase} → ${(message as any).payload.newPhase}`,
              details: (message as any).payload,
            });
            break;

          case 'state:cleared':
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'info',
              message: 'APL state cleared',
            });
            break;

          case 'task:update':
          case 'task:started':
          case 'task:completed':
          case 'task:failed':
            updateTask((message as any).payload.task || (message as any).payload);
            break;

          case 'checkpoint:created':
            addCheckpoint((message as any).payload.checkpoint);
            break;

          case 'config:update':
            setConfig((message as any).payload.config);
            break;

          case 'learnings:update':
            setLearnings((message as any).payload.learnings);
            break;

          case 'apl:started':
            setAplRunning(true);
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'info',
              message: `APL started: ${(message as any).payload.goal}`,
              details: (message as any).payload,
            });
            break;

          case 'apl:stopped':
            setAplRunning(false);
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'info',
              message: `APL stopped: ${(message as any).payload.reason}`,
              details: (message as any).payload,
            });
            break;

          case 'apl:output':
            // Could pipe to a console component
            break;

          case 'apl:error':
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'error',
              message: `APL Error: ${(message as any).payload.error}`,
              details: (message as any).payload,
            });
            break;

          case 'error':
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'error',
              message: (message as any).payload.message,
              details: (message as any).payload,
            });
            break;

          default:
            console.log('Unknown WebSocket message:', message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
    [setState, updateTask, addCheckpoint, setConfig, setLearnings, setConnected, setAplRunning, addActivityEvent]
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [handleMessage, setConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
  }, [setConnected]);

  const send = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    connect,
    disconnect,
    send,
  };
}
