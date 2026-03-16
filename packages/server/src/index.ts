import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeWebSocketService } from './websocket/server.js';
import { agentRuntime } from './runtime/agent-runtime.js';
import { agentSeeder } from './mock/agent-seeder.js';
import agentRoutes from './routes/agents.js';
import taskRoutes from './routes/tasks.js';
import sceneRoutes from './routes/scene.js';

const PORT = process.env.PORT || 3001;
const app = express();

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true, // Allow all origins in development
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'agent-factory-smallville-api'
  });
});

// API routes
app.use('/api/agents', agentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/scene', sceneRoutes);

// System status endpoint
app.get('/api/status', (req, res) => {
  const wsService = require('./websocket/server.js').getWebSocketService();
  const connectedClients = wsService ? wsService.getConnectedClientsCount() : 0;

  res.json({
    message: 'Agent Factory Smallville API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    system: {
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      load: process.cpuUsage()
    },
    websocket: {
      connected_clients: connectedClients,
      status: wsService ? 'active' : 'inactive'
    },
    runtime: {
      agents_running: agentRuntime ? true : false
    }
  });
});

// System control endpoints
app.post('/api/system/seed', (req, res) => {
  try {
    console.log('🌱 Seeding system with initial data...');
    
    // Seed agents
    const agents = agentSeeder.seedAgents();
    
    // Seed initial tasks
    agentSeeder.seedInitialTasks();
    
    // Start agent behaviors
    agentSeeder.startAgentBehaviors();
    
    res.json({
      success: true,
      message: 'System seeded successfully',
      data: {
        agents_created: agents.length,
        agents: agents.map(a => ({ id: a.id, name: a.name, type: a.type }))
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error seeding system:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed system',
      timestamp: new Date()
    });
  }
});

app.post('/api/system/start-runtime', (req, res) => {
  try {
    agentRuntime.start();
    
    res.json({
      success: true,
      message: 'Agent runtime started',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error starting runtime:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start agent runtime',
      timestamp: new Date()
    });
  }
});

app.post('/api/system/stop-runtime', (req, res) => {
  try {
    agentRuntime.stop();
    
    res.json({
      success: true,
      message: 'Agent runtime stopped',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error stopping runtime:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop agent runtime',
      timestamp: new Date()
    });
  }
});

app.get('/api/system/stats', (req, res) => {
  try {
    const stats = agentSeeder.getAgentStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system statistics',
      timestamp: new Date()
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requested: req.originalUrl,
    timestamp: new Date()
  });
});

// Initialize WebSocket service
let wsService: any = null;

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down...');
  
  // Stop agent runtime
  agentRuntime.stop();
  
  // Close WebSocket service
  if (wsService) {
    wsService.close();
  }
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Status: http://localhost:${PORT}/api/status`);
  
  // Initialize WebSocket service
  wsService = initializeWebSocketService(server);
  console.log(`📡 WebSocket service initialized`);
  
  // Auto-seed system in development
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      console.log('\n🌱 Auto-seeding system for development...');
      
      try {
        // Seed agents and tasks
        agentSeeder.seedAgents();
        agentSeeder.seedInitialTasks();
        agentSeeder.startAgentBehaviors();
        
        // Start runtime after a short delay
        setTimeout(() => {
          agentRuntime.start();
          console.log('✅ Development environment ready!');
        }, 2000);
        
      } catch (error) {
        console.error('❌ Error during auto-seeding:', error);
      }
    }, 1000);
  }
  
  console.log('\n🎯 API Endpoints:');
  console.log('   GET  /api/agents           - List agents');
  console.log('   GET  /api/tasks            - List tasks');
  console.log('   GET  /api/scene/config     - Scene configuration');
  console.log('   POST /api/system/seed      - Seed system data');
  console.log('   POST /api/system/start-runtime - Start agent runtime');
  console.log('');
});