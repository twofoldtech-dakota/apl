import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CommandsPage from './components/commands/CommandsPage';
import ConfigPanel from './components/config/ConfigPanel';
import LearningsBrowser from './components/learnings/LearningsBrowser';
import PatternLibrary from './components/patterns/PatternLibrary';
import CheckpointPanel from './components/checkpoints/CheckpointPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { useAplStore } from './store/aplStore';

function App() {
  const { connect, disconnect } = useWebSocket();
  const fetchInitialState = useAplStore((state) => state.fetchInitialState);

  useEffect(() => {
    // Connect WebSocket
    connect();

    // Fetch initial state
    fetchInitialState();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchInitialState]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/commands" element={<CommandsPage />} />
        <Route path="/config" element={<ConfigPanel />} />
        <Route path="/learnings" element={<LearningsBrowser />} />
        <Route path="/patterns" element={<PatternLibrary />} />
        <Route path="/checkpoints" element={<CheckpointPanel />} />
      </Routes>
    </Layout>
  );
}

export default App;
