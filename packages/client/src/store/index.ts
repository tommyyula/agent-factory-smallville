import { create } from 'zustand';
import { Agent, AgentStatus, Task, TaskStatus, Message, MessageType } from '@agent-factory/shared';

// Mock agent definitions (ITEM logistics roles)
const MOCK_AGENTS: Omit<Agent, 'createdAt' | 'lastActiveAt' | 'memories' | 'metrics'>[] = [
  {
    id: 'agent-1', name: '王仓管', type: 'warehouse' as any, role: '仓储管家',
    status: AgentStatus.EXECUTING,
    location: { x: 950, y: 200, zone: 'warehouse' as any },
    capabilities: ['inventory_check', 'stock_alert'], metadata: {},
    visual: { spriteKey: 'agent-0', scale: 1, tint: 0xffffff, statusIndicator: { color: 0x00FF00, icon: '⚙️', visible: true } },
  },
  {
    id: 'agent-2', name: '李调度', type: 'transport' as any, role: '运输调度',
    status: AgentStatus.THINKING,
    location: { x: 950, y: 480, zone: 'transport' as any },
    capabilities: ['route_planning', 'fleet_monitoring'], metadata: {},
    visual: { spriteKey: 'agent-1', scale: 1, tint: 0xffffff, statusIndicator: { color: 0xFFD700, icon: '💭', visible: true } },
  },
  {
    id: 'agent-3', name: '张客服', type: 'customer_service' as any, role: '客服代表',
    status: AgentStatus.COMMUNICATING,
    location: { x: 230, y: 200, zone: 'customer_service' as any },
    capabilities: ['customer_support', 'complaint_handling'], metadata: {},
    visual: { spriteKey: 'agent-2', scale: 1, tint: 0xffffff, statusIndicator: { color: 0x00BFFF, icon: '💬', visible: true } },
  },
  {
    id: 'agent-4', name: '陈数据', type: 'data_analyst' as any, role: '数据分析师',
    status: AgentStatus.IDLE,
    location: { x: 230, y: 480, zone: 'data_center' as any },
    capabilities: ['data_analysis', 'report_generation'], metadata: {},
    visual: { spriteKey: 'agent-3', scale: 1, tint: 0xffffff, statusIndicator: { color: 0x808080, icon: '💤', visible: true } },
  },
  {
    id: 'agent-5', name: '刘开发', type: 'developer' as any, role: '开发工程师',
    status: AgentStatus.EXECUTING,
    location: { x: 640, y: 480, zone: 'development' as any },
    capabilities: ['code_review', 'bug_fixing'], metadata: {},
    visual: { spriteKey: 'agent-4', scale: 1, tint: 0xffffff, statusIndicator: { color: 0x00FF00, icon: '⚙️', visible: true } },
  },
  {
    id: 'agent-6', name: '赵质检', type: 'quality' as any, role: '质检专员',
    status: AgentStatus.THINKING,
    location: { x: 230, y: 730, zone: 'quality' as any },
    capabilities: ['quality_audit', 'compliance_check'], metadata: {},
    visual: { spriteKey: 'agent-5', scale: 1, tint: 0xffffff, statusIndicator: { color: 0xFFD700, icon: '💭', visible: true } },
  },
  {
    id: 'agent-7', name: '孙规划', type: 'planning' as any, role: '规划师',
    status: AgentStatus.IDLE,
    location: { x: 640, y: 730, zone: 'rest' as any },
    capabilities: ['demand_forecast', 'capacity_planning'], metadata: {},
    visual: { spriteKey: 'agent-6', scale: 1, tint: 0xffffff, statusIndicator: { color: 0x808080, icon: '💤', visible: true } },
  },
  {
    id: 'agent-8', name: '周协调', type: 'coordinator' as any, role: '协调员',
    status: AgentStatus.COMMUNICATING,
    location: { x: 630, y: 190, zone: 'common' as any },
    capabilities: ['cross_team_sync', 'escalation'], metadata: {},
    visual: { spriteKey: 'agent-7', scale: 1, tint: 0xffffff, statusIndicator: { color: 0x00BFFF, icon: '💬', visible: true } },
  },
];

const MOCK_TASKS: Task[] = [
  { id: 'task-1', title: '库存盘点 - A区', description: '对仓库A区全面库存盘点', type: 'inventory_check' as any, status: TaskStatus.IN_PROGRESS, priority: 2 as any, assignedTo: 'agent-1', createdBy: 'system', progress: 65, estimatedDuration: 1800000, dependencies: [], createdAt: new Date(), metadata: {} },
  { id: 'task-2', title: '路线优化 - 5号配送区', description: '优化配送路线提高效率', type: 'route_optimization' as any, status: TaskStatus.IN_PROGRESS, priority: 3 as any, assignedTo: 'agent-2', createdBy: 'system', progress: 30, estimatedDuration: 1800000, dependencies: [], createdAt: new Date(), metadata: {} },
  { id: 'task-3', title: '客户投诉处理 #2847', description: '处理延迟配送投诉', type: 'support_ticket' as any, status: TaskStatus.IN_PROGRESS, priority: 1 as any, assignedTo: 'agent-3', createdBy: 'system', progress: 80, estimatedDuration: 1800000, dependencies: [], createdAt: new Date(), metadata: {} },
  { id: 'task-4', title: '月度数据报告', description: '生成3月运营数据报告', type: 'report' as any, status: TaskStatus.PENDING, priority: 2 as any, assignedTo: 'agent-4', createdBy: 'system', progress: 0, estimatedDuration: 1800000, dependencies: [], createdAt: new Date(), metadata: {} },
  { id: 'task-5', title: 'API v2.3 代码审查', description: '审查新版本API代码', type: 'code_review' as any, status: TaskStatus.IN_PROGRESS, priority: 2 as any, assignedTo: 'agent-5', createdBy: 'system', progress: 45, estimatedDuration: 1800000, dependencies: [], createdAt: new Date(), metadata: {} },
  { id: 'task-6', title: '质量审计 - B仓', description: 'B仓库月度质量检查', type: 'quality_audit' as any, status: TaskStatus.PENDING, priority: 3 as any, assignedTo: 'agent-6', createdBy: 'system', progress: 0, estimatedDuration: 1800000, dependencies: [], createdAt: new Date(), metadata: {} },
];

const ZONES_FOR_TYPE: Record<string, string> = {
  warehouse: 'warehouse',
  transport: 'transport',
  customer_service: 'customer_service',
  data_analyst: 'data_center',
  data_analysis: 'data_center',
  developer: 'development',
  development: 'development',
  quality: 'quality',
  planning: 'rest',
  coordinator: 'common',
};

const ALL_ZONES = ['warehouse', 'transport', 'customer_service', 'data_center', 'development', 'quality', 'rest', 'common'];

// Thought texts by role
const THOUGHTS: Record<string, string[]> = {
  warehouse: ['盘点A-3货架...', '库存预警: SKU-4821 低于安全库位', '正在更新入库记录', '对比实际数与系统数'],
  transport: ['计算最优路线中...', '5号区配送延迟15分钟', '调度3号车前往B点', '分析交通数据'],
  customer_service: ['正在回复客户咨询', '处理投诉工单 #2847', '更新FAQ知识库', '转接至高级客服'],
  data_analyst: ['生成日报中...', '异常数据检测: 出库量↑32%', 'SQL查询执行中...', '可视化图表渲染'],
  developer: ['代码审查中...', '修复 BUG #1234', '部署测试环境', '优化数据库查询'],
  quality: ['检查批次合规性', '抽样检测进行中', '更新质检报告', '异常品处理流程'],
  planning: ['需求预测建模', '产能规划分析', '供应链优化', '季度计划编制'],
  coordinator: ['同步各部门进度', '协调紧急会议', '汇总项目状态', '发送周报通知'],
};

interface AppState {
  connected: boolean;
  mockMode: boolean;
  agents: Record<string, Agent>;
  tasks: Record<string, Task>;
  messages: Message[];
  selectedAgentId: string | null;
  activePanel: 'agents' | 'tasks' | 'messages' | 'stats';

  setConnected: (c: boolean) => void;
  selectAgent: (id: string | null) => void;
  setActivePanel: (p: 'agents' | 'tasks' | 'messages' | 'stats') => void;
  initMockMode: () => void;
}

let mockInterval: ReturnType<typeof setInterval> | null = null;

export const useAppStore = create<AppState>()((set, get) => ({
  connected: false,
  mockMode: false,
  agents: {},
  tasks: {},
  messages: [],
  selectedAgentId: null,
  activePanel: 'agents',

  setConnected: (c) => set({ connected: c }),
  selectAgent: (id) => set({ selectedAgentId: id }),
  setActivePanel: (p) => set({ activePanel: p }),

  initMockMode: () => {
    if (get().mockMode) return; // already initialized

    // Load mock agents
    const agentsMap: Record<string, Agent> = {};
    MOCK_AGENTS.forEach(a => {
      agentsMap[a.id] = {
        ...a,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        memories: [],
        metrics: {
          tasksCompleted: Math.floor(Math.random() * 40 + 10),
          tasksInProgress: a.status === AgentStatus.EXECUTING ? 1 : 0,
          tasksFailed: Math.floor(Math.random() * 3),
          averageTaskDuration: Math.floor(Math.random() * 1200000 + 300000),
          messagesSent: Math.floor(Math.random() * 50 + 10),
          messagesReceived: Math.floor(Math.random() * 50 + 10),
          activeTime: Math.floor(Math.random() * 28800000),
          idleTime: Math.floor(Math.random() * 7200000),
          errorTime: Math.floor(Math.random() * 600000),
          lastCalculated: new Date(),
        },
      } as Agent;
    });

    // Load mock tasks
    const tasksMap: Record<string, Task> = {};
    MOCK_TASKS.forEach(t => { tasksMap[t.id] = t; });

    set({
      mockMode: true,
      connected: true,
      agents: agentsMap,
      tasks: tasksMap,
      messages: [],
    });

    // Start simulation loop
    if (mockInterval) clearInterval(mockInterval);
    mockInterval = setInterval(() => {
      const state = get();
      const agentIds = Object.keys(state.agents);
      if (agentIds.length === 0) return;

      // Pick a random agent to update
      const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
      const agent = { ...state.agents[agentId] };

      // Cycle status
      const statuses = [AgentStatus.IDLE, AgentStatus.THINKING, AgentStatus.EXECUTING, AgentStatus.COMMUNICATING];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      agent.status = newStatus;
      agent.lastActiveAt = new Date();

      // Maybe change zone
      if (Math.random() < 0.3) {
        const homeZone = ZONES_FOR_TYPE[agent.type] || 'common';
        const zones = Math.random() < 0.6 ? [homeZone] : ALL_ZONES;
        const newZone = zones[Math.floor(Math.random() * zones.length)];
        agent.location = { ...agent.location, zone: newZone as any };
      }

      // Update task progress
      const updatedTasks = { ...state.tasks };
      Object.values(updatedTasks).forEach(t => {
        if (t.status === TaskStatus.IN_PROGRESS && t.assignedTo === agentId) {
          const newProgress = Math.min(100, (t.progress || 0) + Math.floor(Math.random() * 15));
          updatedTasks[t.id] = { ...t, progress: newProgress };
          if (newProgress >= 100) {
            updatedTasks[t.id].status = TaskStatus.COMPLETED;
          }
        }
      });

      // Maybe add a message
      let newMessages = [...state.messages];
      if (newStatus === AgentStatus.COMMUNICATING && Math.random() < 0.5) {
        const otherIds = agentIds.filter(id => id !== agentId);
        const toId = otherIds[Math.floor(Math.random() * otherIds.length)];
        const toAgent = state.agents[toId];
        const thoughts = THOUGHTS[agent.type] || THOUGHTS['coordinator'];
        newMessages = [
          {
            id: `msg-${Date.now()}`,
            fromAgent: agentId,
            toAgent: toId,
            content: `${agent.name} → ${toAgent?.name}: ${thoughts[Math.floor(Math.random() * thoughts.length)]}`,
            type: MessageType.DIRECT,
            timestamp: new Date(),
            visualDuration: 3000,
            metadata: {},
          },
          ...newMessages,
        ].slice(0, 50); // Keep last 50 messages
      }

      // Attach current task title for thought bubble
      const currentTask = Object.values(updatedTasks).find(t => t.assignedTo === agentId && t.status === TaskStatus.IN_PROGRESS);
      (agent as any).currentTaskTitle = currentTask?.title || undefined;

      set({
        agents: { ...state.agents, [agentId]: agent },
        tasks: updatedTasks,
        messages: newMessages,
      });
    }, 3000); // Update every 3 seconds
  },
}));
