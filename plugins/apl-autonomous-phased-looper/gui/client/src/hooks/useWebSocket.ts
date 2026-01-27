// WebSocket Hook with Agentic Event Support
import { useCallback, useRef } from 'react';
import { useAplStore } from '../store/aplStore';

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
    // Agentic actions
    setAgentActivity,
    setActiveAgent,
    setReActStep,
    addToDelegationChain,
    clearDelegationChain,
    addToolInvocation,
    updateToolInvocation,
    setTokenUsage,
    addToTokenHistory,
  } = useAplStore();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'connection:established':
            setConnected(true);
            break;

          case 'state:update':
            setState(message.payload.state);
            break;

          case 'state:phase_change':
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'phase',
              message: `Phase: ${message.payload.previousPhase} → ${message.payload.newPhase}`,
              details: message.payload,
            });
            // Reset ReAct loop on phase change
            setReActStep('idle', 0);
            clearDelegationChain();
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
            updateTask(message.payload.task || message.payload);
            break;

          case 'checkpoint:created':
            addCheckpoint(message.payload.checkpoint);
            break;

          case 'config:update':
            setConfig(message.payload.config);
            break;

          case 'learnings:update':
            setLearnings(message.payload.learnings);
            break;

          case 'apl:started':
            setAplRunning(true);
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'info',
              message: `APL started: ${message.payload.goal}`,
              details: message.payload,
            });
            break;

          case 'apl:stopped':
            setAplRunning(false);
            setActiveAgent(null);
            setReActStep('idle', 0);
            clearDelegationChain();
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'info',
              message: `APL stopped: ${message.payload.reason}`,
              details: message.payload,
            });
            break;

          case 'apl:output':
            // Could pipe to a console component
            break;

          case 'apl:error':
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'error',
              message: `APL Error: ${message.payload.error}`,
              details: message.payload,
            });
            break;

          // Agentic Events
          case 'agent:activity':
            setAgentActivity(message.payload);
            if (message.payload.activeAgent) {
              setActiveAgent(message.payload.activeAgent);
            }
            if (message.payload.reactStep) {
              setReActStep(message.payload.reactStep, message.payload.reactIteration);
            }
            break;

          case 'agent:delegated':
            addToDelegationChain(message.payload.toAgent);
            setActiveAgent(message.payload.toAgent);
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'agent',
              message: `Delegated: ${message.payload.fromAgent} → ${message.payload.toAgent}`,
              agentId: message.payload.toAgent,
              details: message.payload,
            });
            break;

          case 'agent:returned':
            setActiveAgent(message.payload.toAgent);
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'agent',
              message: `Returned: ${message.payload.fromAgent} → ${message.payload.toAgent}`,
              agentId: message.payload.toAgent,
              details: message.payload,
            });
            break;

          case 'react:step':
            setReActStep(message.payload.step, message.payload.iteration);
            break;

          case 'tool:invocation':
            addToolInvocation(message.payload);
            break;

          case 'tool:completed':
            updateToolInvocation(message.payload.id, {
              status: message.payload.success ? 'success' : 'error',
              duration: message.payload.duration,
              result: message.payload.result,
            });
            break;

          case 'token:usage':
            setTokenUsage(message.payload);
            if (message.payload.totalTokens) {
              addToTokenHistory(message.payload.totalTokens);
            }
            break;

          case 'error':
            addActivityEvent({
              timestamp: message.timestamp,
              type: 'error',
              message: message.payload.message,
              details: message.payload,
            });
            break;

          default:
            console.log('Unknown WebSocket message:', message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
    [
      setState,
      updateTask,
      addCheckpoint,
      setConfig,
      setLearnings,
      setConnected,
      setAplRunning,
      addActivityEvent,
      setAgentActivity,
      setActiveAgent,
      setReActStep,
      addToDelegationChain,
      clearDelegationChain,
      addToolInvocation,
      updateToolInvocation,
      setTokenUsage,
      addToTokenHistory,
    ]
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
