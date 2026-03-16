import { 
  WSMessage, 
  AgentStatusUpdate, 
  AgentMovement, 
  AgentThought, 
  TaskUpdate, 
  MessageNew, 
  SystemStatus 
} from '@agent-factory/shared';
import { useAppStore } from '../store/index.js';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private url: string;
  private gameSceneRef: any = null;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`📡 Connecting to WebSocket: ${this.url}`);
        
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          useAppStore.getState().setConnected(true);
          useAppStore.getState().setReconnecting(false);
          useAppStore.getState().setMockMode(false);
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log('📡 WebSocket disconnected:', event.code, event.reason);
          useAppStore.getState().setConnected(false);
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          } else {
            console.log('🎭 Max reconnection attempts reached, switching to mock mode');
            this.enableMockMode();
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('📡 WebSocket error:', error);
          reject(error);
        };
        
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.enableMockMode();
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++;
    useAppStore.getState().setReconnecting(true);
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(() => {
        // Will handle in onclose
      });
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  private enableMockMode(): void {
    console.log('🎭 Enabling mock mode');
    useAppStore.getState().setMockMode(true);
    useAppStore.getState().setConnected(false);
    useAppStore.getState().setReconnecting(false);
    
    // Initialize mock data
    useAppStore.getState().initMockData();
    
    // Start mock simulation
    this.startMockSimulation();
  }

  private startMockSimulation(): void {
    // Simulate activity every 5 seconds
    setInterval(() => {
      useAppStore.getState().simulateAgentActivity();
      
      // Simulate random thoughts and communications
      if (Math.random() < 0.3) { // 30% chance
        this.simulateRandomThought();
      }
      
      if (Math.random() < 0.2) { // 20% chance
        this.simulateCommunication();
      }
    }, 5000);
  }

  private simulateRandomThought(): void {
    const agents = Object.values(useAppStore.getState().agents);
    if (agents.length === 0) return;
    
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const thoughts = [
      '正在分析当前任务优先级',
      '检查系统状态指标',
      '准备生成进度报告',
      '协调团队工作安排',
      '优化工作流程',
      '处理待办事项',
      '更新任务状态'
    ];
    
    const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
    
    if (this.gameSceneRef) {
      this.gameSceneRef.showThoughtBubble(randomAgent.id, randomThought, 4000);
    }
  }

  private simulateCommunication(): void {
    const agents = Object.values(useAppStore.getState().agents);
    if (agents.length < 2) return;
    
    const agent1 = agents[Math.floor(Math.random() * agents.length)];
    const agent2 = agents[Math.floor(Math.random() * agents.length)];
    
    if (agent1.id !== agent2.id && this.gameSceneRef) {
      this.gameSceneRef.showCommunicationLine(agent1.id, agent2.id, 3000);
    }
  }

  private handleMessage(message: WSMessage): void {
    console.log('📨 Received message:', message.type);
    
    switch (message.type) {
      case 'agent:status':
        this.handleAgentStatusUpdate(message as AgentStatusUpdate);
        break;
        
      case 'agent:move':
        this.handleAgentMovement(message as AgentMovement);
        break;
        
      case 'agent:thought':
        this.handleAgentThought(message as AgentThought);
        break;
        
      case 'task:update':
        this.handleTaskUpdate(message as TaskUpdate);
        break;
        
      case 'message:new':
        this.handleNewMessage(message as MessageNew);
        break;
        
      case 'system:status':
        this.handleSystemStatus(message as SystemStatus);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleAgentStatusUpdate(message: AgentStatusUpdate): void {
    const { agentId, currentStatus, location } = message.payload;
    
    const store = useAppStore.getState();
    const agent = store.agents[agentId];
    
    if (agent) {
      const updatedAgent = {
        ...agent,
        status: currentStatus,
        location: location,
        lastActiveAt: new Date()
      };
      
      store.updateAgent(updatedAgent);
      
      // Update game visual
      if (this.gameSceneRef) {
        this.gameSceneRef.updateAgent(agentId, updatedAgent);
      }
    }
  }

  private handleAgentMovement(message: AgentMovement): void {
    const { agentId, fromLocation, toLocation } = message.payload;
    
    if (this.gameSceneRef) {
      this.gameSceneRef.moveAgent(agentId, fromLocation, toLocation);
    }
    
    // Update agent location in store
    const store = useAppStore.getState();
    const agent = store.agents[agentId];
    
    if (agent) {
      const updatedAgent = {
        ...agent,
        location: toLocation
      };
      store.updateAgent(updatedAgent);
    }
  }

  private handleAgentThought(message: AgentThought): void {
    const { agentId, content, duration } = message.payload;
    
    if (this.gameSceneRef) {
      this.gameSceneRef.showThoughtBubble(agentId, content, duration);
    }
  }

  private handleTaskUpdate(message: TaskUpdate): void {
    const { taskId, agentId, status, progress } = message.payload;
    
    const store = useAppStore.getState();
    const task = store.tasks[taskId];
    
    if (task) {
      const updatedTask = {
        ...task,
        status,
        progress,
        assignedTo: agentId || task.assignedTo
      };
      
      store.updateTask(updatedTask);
    }
  }

  private handleNewMessage(message: MessageNew): void {
    const { message: newMessage, visualConfig } = message.payload;
    
    // Add to message store
    useAppStore.getState().addMessage(newMessage);
    
    // Show visual communication
    if (this.gameSceneRef && visualConfig.showLine && newMessage.toAgent) {
      this.gameSceneRef.showCommunicationLine(
        newMessage.fromAgent, 
        newMessage.toAgent, 
        visualConfig.duration
      );
    }
  }

  private handleSystemStatus(message: SystemStatus): void {
    const stats = message.payload;
    useAppStore.getState().updateSystemStats(stats);
  }

  // Public methods
  public setGameScene(gameScene: any): void {
    this.gameSceneRef = gameScene;
  }

  public sendMessage(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  public selectAgent(agentId: string): void {
    this.sendMessage({
      type: 'agent:select',
      payload: { agentId },
      timestamp: new Date()
    });
  }

  public disconnect(): void {
    if (this.ws) {
      console.log('📡 Disconnecting WebSocket');
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const getWebSocketUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // For development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${protocol}//localhost:3001`;
  }
  
  // For production (GitHub Pages doesn't support WebSocket, so will fallback to mock)
  return `${protocol}//${window.location.host}/ws`;
};

export const wsService = new WebSocketService(getWebSocketUrl());