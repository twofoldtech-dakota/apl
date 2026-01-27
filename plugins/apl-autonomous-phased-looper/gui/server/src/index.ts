// APL GUI Server - Entry Point
import { createServer } from 'http';
import { createApp } from './app.js';
import { WebSocketServer } from './websocket/index.js';
import { config } from './config.js';

async function main(): Promise<void> {
  // Create Express app
  const app = createApp();

  // Create HTTP server
  const server = createServer(app);

  // Create and attach WebSocket server
  const wsServer = new WebSocketServer();
  wsServer.attach(server);

  // Start server
  server.listen(config.port, config.host, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           APL GUI Control Panel - Server Started           ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  HTTP Server:    http://${config.host}:${config.port}                    ║`);
    console.log(`║  WebSocket:      ws://${config.host}:${config.port}/ws                   ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Project Root:   ${config.projectRoot.slice(0, 40).padEnd(40)} ║`);
    console.log(`║  Plugin Root:    ${config.pluginRoot.slice(0, 40).padEnd(40)} ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  API Endpoints:                                            ║');
    console.log('║    GET  /health              - Server health check         ║');
    console.log('║    GET  /api/state           - Current APL state           ║');
    console.log('║    GET  /api/config          - APL configuration           ║');
    console.log('║    GET  /api/learnings       - Learned patterns            ║');
    console.log('║    GET  /api/patterns        - Pattern library             ║');
    console.log('║    GET  /api/checkpoints     - Checkpoints                 ║');
    console.log('║    POST /api/control/start   - Start APL                   ║');
    console.log('║    POST /api/control/stop    - Stop APL                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
  });

  // Graceful shutdown
  const shutdown = (): void => {
    console.log('\nShutting down...');
    wsServer.close();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
