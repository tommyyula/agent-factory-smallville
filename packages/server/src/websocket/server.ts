import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { 
  WSMessage, 
  AgentStatusUpdate, 
  AgentMovement, 
  AgentThought, 
  TaskUpdate, 
  MessageNew, 
  SystemStatus 
} from '@agent-factory/shared';
import { agentStore, taskStore, messageStore } from '../models/store.js';

interface ConnectedClient {
  id: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  lastPing: number;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients = new Map<string, ConnectedClient>();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
    this.setupStoreListeners();
    this.heartbeatInterval = setInterval(() => this.heartbeat(), 30000); // 30s heartbeat
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (socket: WebSocket) => {
      const clientId = this.generateClientId();
      const client: ConnectedClient = {
        id: clientId,
        socket,
        subscriptions: new Set(['agent:status', 'agent:move', 'task:update', 'system:status']),
        lastPing: Date.now()
      };

      this.clients.set(clientId, client);
      console.log(`WebSocket client connected: ${clientId}`);

      // Send initial data
      this.sendInitialData(client);

      socket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as WSMessage;
          this.handleClientMessage(client, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      socket.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
      });

      socket.on('pong', () => {
        client.lastPing = Date.now();
      });

      socket.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  private setupStoreListeners(): void {
    // Listen for agent updates
    agentStore.on('updated', (agentId: string, agent: any) => {
      const statusUpdate: AgentStatusUpdate = {
        type: 'agent:status',
        payload: {
          agentId: agent.id,
          previousStatus: agent._previousStatus || agent.status,
          currentStatus: agent.status,
          location: agent.location,
          timestamp: new Date()
        }
      };
      this.broadcast(statusUpdate, 'agent:status');
    });

    // Listen for task updates
    taskStore.on('updated', (taskId: string, task: any) => {
      const taskUpdate: TaskUpdate = {
        type: 'task:update',
        payload: {
          taskId: task.id,
          agentId: task.assignedTo,
          status: task.status,
          progress: task.progress,
          timestamp: new Date()
        }
      };
      this.broadcast(taskUpdate, 'task:update');
    });

    // Listen for new messages
    messageStore.on('updated', (messageId: string, message: any) => {
      const messageNew: MessageNew = {
        type: 'message:new',
        payload: {
          message,
          visualConfig: {
            showLine: true,
            duration: message.visualDuration || 3000,
            style: message.type
          }
        }
      };
      this.broadcast(messageNew, 'message:new');
    });
  }

  private handleClientMessage(client: ConnectedClient, message: WSMessage): void {
    switch (message.type) {
      case 'subscribe':
        if (Array.isArray(message.payload.events)) {
          message.payload.events.forEach((event: string) => {
            client.subscriptions.add(event);
          });
        }
        break;

      case 'unsubscribe':
        if (Array.isArray(message.payload.events)) {
          message.payload.events.forEach((event: string) => {
            client.subscriptions.delete(event);
          });
        }
        break;

      case 'ping':
        this.send(client, { type: 'pong', payload: {}, timestamp: new Date() });
        break;

      case 'agent:select':
        // Handle agent selection (could trigger camera focus)
        this.broadcast({
          type: 'agent:selected',
          payload: { agentId: message.payload.agentId, selectedBy: client.id },
          timestamp: new Date()
        }, 'agent:selected');
        break;

      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private sendInitialData(client: ConnectedClient): void {
    // Send current agents
    const agents = agentStore.getAll();
    agents.forEach(agent => {
      const statusUpdate: AgentStatusUpdate = {
        type: 'agent:status',
        payload: {
          agentId: agent.id,
          previousStatus: agent.status,
          currentStatus: agent.status,
          location: agent.location,
          timestamp: new Date()
        }
      };
      this.send(client, statusUpdate);
    });

    // Send current tasks
    const tasks = taskStore.getAll();
    tasks.forEach(task => {
      const taskUpdate: TaskUpdate = {
        type: 'task:update',
        payload: {
          taskId: task.id,
          agentId: task.assignedTo,
          status: task.status,
          progress: task.progress,
          timestamp: new Date()
        }
      };
      this.send(client, taskUpdate);
    });

    // Send system status
    const systemStatus: SystemStatus = {
      type: 'system:status',
      payload: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status !== 'idle' && a.status !== 'sleeping').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        systemHealth: 0.95,
        timestamp: new Date()
      }
    };
    this.send(client, systemStatus);
  }

  public broadcast<T>(message: WSMessage<T>, eventType?: string): void {
    this.clients.forEach(client => {
      if (!eventType || client.subscriptions.has(eventType)) {
        this.send(client, message);
      }
    });
  }

  public send<T>(client: ConnectedClient, message: WSMessage<T>): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to client ${client.id}:`, error);
      }
    }
  }

  // Broadcast agent movement
  public broadcastAgentMovement(agentId: string, fromLocation: any, toLocation: any, path: any[]): void {
    const movement: AgentMovement = {
      type: 'agent:move',
      payload: {
        agentId,
        fromLocation,
        toLocation,
        path,
        speed: 100, // pixels per second
        timestamp: new Date()
      }
    };
    this.broadcast(movement, 'agent:move');
  }

  // Broadcast agent thought
  public broadcastAgentThought(agentId: string, content: string, thoughtType: 'task' | 'reflection' | 'plan' = 'task'): void {
    const thought: AgentThought = {
      type: 'agent:thought',
      payload: {
        agentId,
        content,
        thoughtType,
        duration: 5000, // 5 seconds
        timestamp: new Date()
      }
    };
    this.broadcast(thought, 'agent:thought');
  }

  private heartbeat(): void {
    const now = Date.now();
    this.clients.forEach((client, clientId) => {
      if (client.socket.readyState === WebSocket.OPEN) {
        if (now - client.lastPing > 60000) { // 60s timeout
          console.log(`Terminating inactive client: ${clientId}`);
          client.socket.terminate();
          this.clients.delete(clientId);
        } else {
          client.socket.ping();
        }
      } else {
        this.clients.delete(clientId);
      }
    });
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public close(): void {
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }
}

let wsService: WebSocketService | null = null;

export function initializeWebSocketService(server: Server): WebSocketService {
  wsService = new WebSocketService(server);
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}