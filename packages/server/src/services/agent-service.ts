import { Agent, AgentStatus, AgentType, Location, AgentMetrics, Task } from '@agent-factory/shared';
import { agentStore, taskStore } from '../models/store.js';
import { v4 as uuidv4 } from 'uuid';

export class AgentService {
  createAgent(agentData: Partial<Agent>): Agent {
    const agent: Agent = {
      id: uuidv4(),
      name: agentData.name || 'Unnamed Agent',
      type: agentData.type || AgentType.WAREHOUSE,
      role: agentData.role || 'Worker',
      status: AgentStatus.IDLE,
      location: agentData.location || { x: 400, y: 400, zone: 'common_area' as any },
      capabilities: agentData.capabilities || [],
      metadata: agentData.metadata || {},
      createdAt: new Date(),
      lastActiveAt: new Date(),
      memories: [],
      visual: {
        spriteKey: this.getSpriteKey(agentData.type || AgentType.WAREHOUSE),
        scale: 1.0,
        tint: 0xffffff,
        statusIndicator: {
          color: 0x808080,
          icon: '💤',
          visible: true
        }
      },
      metrics: {
        tasksCompleted: 0,
        tasksInProgress: 0,
        tasksFailed: 0,
        averageTaskDuration: 0,
        messagesSent: 0,
        messagesReceived: 0,
        activeTime: 0,
        idleTime: 0,
        errorTime: 0,
        lastCalculated: new Date()
      }
    };

    agentStore.set(agent.id, agent);
    return agent;
  }

  getAgent(id: string): Agent | undefined {
    return agentStore.get(id);
  }

  getAllAgents(filter?: { status?: AgentStatus; type?: AgentType }): Agent[] {
    const agents = agentStore.getAll();
    
    if (!filter) return agents;
    
    return agents.filter(agent => {
      if (filter.status && agent.status !== filter.status) return false;
      if (filter.type && agent.type !== filter.type) return false;
      return true;
    });
  }

  updateAgent(id: string, updates: Partial<Agent>): Agent | null {
    const agent = agentStore.get(id);
    if (!agent) return null;

    const updatedAgent = { ...agent, ...updates, lastActiveAt: new Date() };
    agentStore.set(id, updatedAgent);
    return updatedAgent;
  }

  updateAgentStatus(id: string, status: AgentStatus, location?: Location): Agent | null {
    const agent = agentStore.get(id);
    if (!agent) return null;

    const previousStatus = agent.status;
    const updates: Partial<Agent> = {
      status,
      lastActiveAt: new Date()
    };

    if (location) {
      updates.location = location;
    }

    // Update status indicator
    updates.visual = {
      ...agent.visual,
      statusIndicator: this.getStatusIndicator(status)
    };

    const updatedAgent = this.updateAgent(id, updates);
    
    // Emit status change event for WebSocket
    if (updatedAgent && previousStatus !== status) {
      console.log(`Agent ${agent.name} status changed: ${previousStatus} → ${status}`);
    }

    return updatedAgent;
  }

  assignTask(agentId: string, task: Task): boolean {
    const agent = agentStore.get(agentId);
    if (!agent || agent.currentTask) {
      return false;
    }

    // Update agent with current task
    this.updateAgent(agentId, { 
      currentTask: task,
      status: AgentStatus.THINKING 
    });

    // Update task assignment
    task.assignedTo = agentId;
    task.status = 'assigned' as any;
    taskStore.set(task.id, task);

    return true;
  }

  completeCurrentTask(agentId: string): Task | null {
    const agent = agentStore.get(agentId);
    if (!agent || !agent.currentTask) {
      return null;
    }

    const task = agent.currentTask;
    task.status = 'completed' as any;
    task.completedAt = new Date();
    task.progress = 100;

    // Update agent
    this.updateAgent(agentId, {
      currentTask: undefined,
      status: AgentStatus.IDLE
    });

    // Update task store
    taskStore.set(task.id, task);

    // Update metrics
    this.updateMetrics(agentId, { taskCompleted: true });

    return task;
  }

  deleteAgent(id: string): boolean {
    return agentStore.delete(id);
  }

  // Helper methods
  private getSpriteKey(type: AgentType): string {
    const spriteMap = {
      [AgentType.WAREHOUSE]: 'warehouse-worker',
      [AgentType.TRANSPORTATION]: 'transport-manager', 
      [AgentType.CUSTOMER_SERVICE]: 'customer-service',
      [AgentType.DATA_ANALYST]: 'data-analyst',
      [AgentType.DEVELOPER]: 'developer',
      [AgentType.QUALITY]: 'quality-inspector',
      [AgentType.PLANNING]: 'planner',
      [AgentType.COORDINATOR]: 'coordinator'
    };
    return spriteMap[type] || 'default-agent';
  }

  private getStatusIndicator(status: AgentStatus) {
    const indicators = {
      [AgentStatus.IDLE]: { color: 0x808080, icon: '💤', visible: true },
      [AgentStatus.THINKING]: { color: 0xFFD700, icon: '💭', visible: true },
      [AgentStatus.EXECUTING]: { color: 0x00FF00, icon: '⚙️', visible: true },
      [AgentStatus.COMMUNICATING]: { color: 0x00BFFF, icon: '💬', visible: true },
      [AgentStatus.ERROR]: { color: 0xFF0000, icon: '⚠️', visible: true },
      [AgentStatus.SLEEPING]: { color: 0x666666, icon: '😴', visible: true },
      [AgentStatus.OFFLINE]: { color: 0x333333, icon: '🔌', visible: true }
    };
    return indicators[status] || indicators[AgentStatus.IDLE];
  }

  private updateMetrics(agentId: string, update: { taskCompleted?: boolean }): void {
    const agent = agentStore.get(agentId);
    if (!agent) return;

    const metrics = { ...agent.metrics };
    
    if (update.taskCompleted) {
      metrics.tasksCompleted += 1;
      if (agent.currentTask) {
        const duration = Date.now() - (agent.currentTask.startedAt?.getTime() || Date.now());
        metrics.averageTaskDuration = 
          (metrics.averageTaskDuration * (metrics.tasksCompleted - 1) + duration) / metrics.tasksCompleted;
      }
    }

    metrics.lastCalculated = new Date();
    
    this.updateAgent(agentId, { metrics });
  }
}

export const agentService = new AgentService();