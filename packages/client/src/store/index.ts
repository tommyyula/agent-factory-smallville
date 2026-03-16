import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Agent, 
  Task, 
  Message, 
  WSMessage, 
  AgentStatus,
  TaskStatus 
} from '@agent-factory/shared';

interface AppState {
  // Connection state
  connected: boolean;
  reconnecting: boolean;
  
  // Data
  agents: Record<string, Agent>;
  tasks: Record<string, Task>;
  messages: Message[];
  
  // UI state
  selectedAgentId: string | null;
  sidebarVisible: boolean;
  activePanel: 'agents' | 'tasks' | 'messages' | 'stats';
  
  // System stats
  systemStats: {
    totalAgents: number;
    activeAgents: number;
    completedTasks: number;
    systemHealth: number;
  };
  
  // Mock mode (when no backend connection)
  mockMode: boolean;
  
  // Actions
  setConnected: (connected: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
  setMockMode: (mockMode: boolean) => void;
  
  // Agent actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agent: Agent) => void;
  selectAgent: (agentId: string | null) => void;
  
  // Task actions
  setTasks: (tasks: Task[]) => void;
  updateTask: (task: Task) => void;
  
  // Message actions
  addMessage: (message: Message) => void;
  
  // UI actions
  setSidebarVisible: (visible: boolean) => void;
  setActivePanel: (panel: 'agents' | 'tasks' | 'messages' | 'stats') => void;
  
  // System actions
  updateSystemStats: (stats: any) => void;
  
  // Mock data actions for GitHub Pages
  initMockData: () => void;
  simulateAgentActivity: () => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    connected: false,
    reconnecting: false,
    agents: {},
    tasks: {},
    messages: [],
    selectedAgentId: null,
    sidebarVisible: true,
    activePanel: 'agents',
    systemStats: {
      totalAgents: 0,
      activeAgents: 0,
      completedTasks: 0,
      systemHealth: 0
    },
    mockMode: false,

    // Connection actions
    setConnected: (connected) => set({ connected }),
    setReconnecting: (reconnecting) => set({ reconnecting }),
    setMockMode: (mockMode) => set({ mockMode }),

    // Agent actions
    setAgents: (agents) => {
      const agentMap = agents.reduce((acc, agent) => {
        acc[agent.id] = agent;
        return acc;
      }, {} as Record<string, Agent>);
      
      set({ agents: agentMap });
    },

    updateAgent: (agent) => {
      set((state) => ({
        agents: {
          ...state.agents,
          [agent.id]: agent
        }
      }));
    },

    selectAgent: (agentId) => set({ selectedAgentId: agentId }),

    // Task actions
    setTasks: (tasks) => {
      const taskMap = tasks.reduce((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {} as Record<string, Task>);
      
      set({ tasks: taskMap });
    },

    updateTask: (task) => {
      set((state) => ({
        tasks: {
          ...state.tasks,
          [task.id]: task
        }
      }));
    },

    // Message actions
    addMessage: (message) => {
      set((state) => ({
        messages: [...state.messages.slice(-99), message] // Keep last 100 messages
      }));
    },

    // UI actions
    setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
    setActivePanel: (panel) => set({ activePanel: panel }),

    // System actions
    updateSystemStats: (stats) => set({ systemStats: stats }),

    // Mock data for GitHub Pages deployment
    initMockData: () => {
      console.log('🎭 Initializing mock data for GitHub Pages');
      
      const mockAgents: Agent[] = [
        {
          id: 'mock-agent-1',
          name: 'Alex Chen',
          type: 'warehouse' as any,
          role: '仓储管家',
          status: AgentStatus.IDLE,
          location: { x: 1150, y: 550, zone: 'warehouse' as any },
          capabilities: ['inventory_management', 'quality_control'],
          metadata: { mock: true },
          createdAt: new Date(),
          lastActiveAt: new Date(),
          memories: [],
          visual: {
            spriteKey: 'agent-0',
            scale: 1.0,
            tint: 0xffffff,
            statusIndicator: { color: 0x808080, icon: '💤', visible: true }
          },
          metrics: {
            tasksCompleted: 15,
            tasksInProgress: 1,
            tasksFailed: 0,
            averageTaskDuration: 1200000,
            messagesSent: 23,
            messagesReceived: 31,
            activeTime: 28800000,
            idleTime: 3600000,
            errorTime: 0,
            lastCalculated: new Date()
          }
        },
        {
          id: 'mock-agent-2',
          name: 'Maria Rodriguez',
          type: 'transportation' as any,
          role: '运输调度',
          status: AgentStatus.EXECUTING,
          location: { x: 1150, y: 750, zone: 'transport' as any },
          capabilities: ['route_planning', 'logistics_coordination'],
          metadata: { mock: true },
          createdAt: new Date(),
          lastActiveAt: new Date(),
          memories: [],
          visual: {
            spriteKey: 'agent-1',
            scale: 1.0,
            tint: 0xffffff,
            statusIndicator: { color: 0x00FF00, icon: '⚙️', visible: true }
          },
          metrics: {
            tasksCompleted: 22,
            tasksInProgress: 2,
            tasksFailed: 1,
            averageTaskDuration: 900000,
            messagesSent: 45,
            messagesReceived: 38,
            activeTime: 25200000,
            idleTime: 7200000,
            errorTime: 300000,
            lastCalculated: new Date()
          }
        },
        {
          id: 'mock-agent-3',
          name: 'James Park',
          type: 'customer_service' as any,
          role: '客服代表',
          status: AgentStatus.THINKING,
          location: { x: 750, y: 350, zone: 'customer_service' as any },
          capabilities: ['customer_support', 'communication'],
          metadata: { mock: true },
          createdAt: new Date(),
          lastActiveAt: new Date(),
          memories: [],
          visual: {
            spriteKey: 'agent-2',
            scale: 1.0,
            tint: 0xffffff,
            statusIndicator: { color: 0xFFD700, icon: '💭', visible: true }
          },
          metrics: {
            tasksCompleted: 35,
            tasksInProgress: 1,
            tasksFailed: 2,
            averageTaskDuration: 600000,
            messagesSent: 78,
            messagesReceived: 92,
            activeTime: 30600000,
            idleTime: 1800000,
            errorTime: 600000,
            lastCalculated: new Date()
          }
        },
        {
          id: 'mock-agent-4',
          name: 'Dr. Sarah Kim',
          type: 'data_analyst' as any,
          role: '数据分析师',
          status: AgentStatus.IDLE,
          location: { x: 1150, y: 950, zone: 'data_center' as any },
          capabilities: ['data_analysis', 'report_generation'],
          metadata: { mock: true },
          createdAt: new Date(),
          lastActiveAt: new Date(),
          memories: [],
          visual: {
            spriteKey: 'agent-3',
            scale: 1.0,
            tint: 0xffffff,
            statusIndicator: { color: 0x808080, icon: '💤', visible: true }
          },
          metrics: {
            tasksCompleted: 18,
            tasksInProgress: 0,
            tasksFailed: 0,
            averageTaskDuration: 1800000,
            messagesSent: 12,
            messagesReceived: 15,
            activeTime: 21600000,
            idleTime: 10800000,
            errorTime: 0,
            lastCalculated: new Date()
          }
        }
      ];

      const mockTasks: Task[] = [
        {
          id: 'mock-task-1',
          title: '库存盘点 - A区',
          description: '对仓库A区进行全面库存盘点',
          type: 'inventory_check' as any,
          status: TaskStatus.IN_PROGRESS,
          priority: 2 as any,
          assignedTo: 'mock-agent-1',
          createdBy: 'system',
          estimatedDuration: 1800000,
          progress: 65,
          dependencies: [],
          createdAt: new Date(Date.now() - 3600000),
          startedAt: new Date(Date.now() - 1800000),
          metadata: { mock: true }
        },
        {
          id: 'mock-task-2',
          title: '路线优化 - 5号配送区',
          description: '优化5号配送区的配送路线以提高效率',
          type: 'route_optimization' as any,
          status: TaskStatus.IN_PROGRESS,
          priority: 3 as any,
          assignedTo: 'mock-agent-2',
          createdBy: 'dispatcher',
          estimatedDuration: 1200000,
          progress: 30,
          dependencies: [],
          createdAt: new Date(Date.now() - 2400000),
          startedAt: new Date(Date.now() - 900000),
          metadata: { mock: true }
        },
        {
          id: 'mock-task-3',
          title: '客户咨询处理',
          description: '处理客户关于订单状态的咨询',
          type: 'customer_inquiry' as any,
          status: TaskStatus.PENDING,
          priority: 2 as any,
          createdBy: 'system',
          estimatedDuration: 600000,
          progress: 0,
          dependencies: [],
          createdAt: new Date(Date.now() - 600000),
          metadata: { mock: true }
        }
      ];

      get().setAgents(mockAgents);
      get().setTasks(mockTasks);
      get().updateSystemStats({
        totalAgents: mockAgents.length,
        activeAgents: mockAgents.filter(a => a.status !== AgentStatus.IDLE).length,
        completedTasks: 47,
        systemHealth: 0.92
      });
    },

    simulateAgentActivity: () => {
      const state = get();
      const agents = Object.values(state.agents);
      
      // Randomly update agent statuses
      agents.forEach(agent => {
        if (Math.random() < 0.1) { // 10% chance per cycle
          const statuses = [AgentStatus.IDLE, AgentStatus.THINKING, AgentStatus.EXECUTING];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          const updatedAgent = {
            ...agent,
            status: randomStatus,
            lastActiveAt: new Date()
          };
          
          get().updateAgent(updatedAgent);
        }
      });

      // Update task progress
      const tasks = Object.values(state.tasks);
      tasks.forEach(task => {
        if (task.status === TaskStatus.IN_PROGRESS && Math.random() < 0.2) { // 20% chance
          const progressIncrement = Math.random() * 10;
          const newProgress = Math.min(100, task.progress + progressIncrement);
          
          const updatedTask = {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? TaskStatus.COMPLETED : task.status,
            completedAt: newProgress >= 100 ? new Date() : task.completedAt
          };
          
          get().updateTask(updatedTask);
        }
      });
    }
  }))
);

// Subscribe to agent changes to trigger game updates
useAppStore.subscribe(
  (state) => state.agents,
  (agents) => {
    // This will be handled by the Game component
    console.log('🎮 Agents updated in store');
  }
);

// Subscribe to selected agent changes
useAppStore.subscribe(
  (state) => state.selectedAgentId,
  (selectedAgentId) => {
    console.log('👆 Agent selection changed:', selectedAgentId);
  }
);