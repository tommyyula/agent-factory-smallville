import { Agent, AgentStatus, Task, Memory, MemoryType, Location } from '@agent-factory/shared';
import { agentService } from '../services/agent-service.js';
import { taskService } from '../services/task-service.js';
import { memoryStore } from '../models/store.js';
import { getWebSocketService } from '../websocket/server.js';
import { v4 as uuidv4 } from 'uuid';

export class AgentRuntime {
  private agents = new Map<string, AgentProcess>();
  private running = false;

  start(): void {
    if (this.running) return;
    
    this.running = true;
    console.log('🤖 Agent Runtime started');
    
    // Start agent processes for all existing agents
    agentService.getAllAgents().forEach(agent => {
      this.startAgentProcess(agent);
    });

    // Start main runtime loop
    this.runMainLoop();
  }

  stop(): void {
    this.running = false;
    this.agents.forEach(process => {
      clearInterval(process.interval);
    });
    this.agents.clear();
    console.log('🤖 Agent Runtime stopped');
  }

  startAgentProcess(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      this.stopAgentProcess(agent.id);
    }

    const process: AgentProcess = {
      agentId: agent.id,
      state: 'idle',
      lastUpdate: Date.now(),
      currentActivity: null,
      interval: setInterval(() => this.updateAgent(agent.id), 2000 + Math.random() * 3000) // 2-5 second intervals
    };

    this.agents.set(agent.id, process);
    console.log(`Started process for agent: ${agent.name}`);
  }

  stopAgentProcess(agentId: string): void {
    const process = this.agents.get(agentId);
    if (process) {
      clearInterval(process.interval);
      this.agents.delete(agentId);
    }
  }

  private updateAgent(agentId: string): void {
    if (!this.running) return;

    const agent = agentService.getAgent(agentId);
    const process = this.agents.get(agentId);
    
    if (!agent || !process) return;

    // Agent state machine logic
    switch (agent.status) {
      case AgentStatus.IDLE:
        this.handleIdleState(agent);
        break;
      
      case AgentStatus.THINKING:
        this.handleThinkingState(agent);
        break;
      
      case AgentStatus.EXECUTING:
        this.handleExecutingState(agent);
        break;
      
      case AgentStatus.COMMUNICATING:
        this.handleCommunicatingState(agent);
        break;
      
      case AgentStatus.ERROR:
        this.handleErrorState(agent);
        break;
    }

    // Update process timestamp
    process.lastUpdate = Date.now();
  }

  private handleIdleState(agent: Agent): void {
    // Look for pending tasks
    if (!agent.currentTask) {
      const suitableTasks = taskService.getAllTasks({ 
        status: 'pending' as any 
      }).filter(task => this.canAgentDoTask(agent, task));

      if (suitableTasks.length > 0) {
        // Assign a random suitable task
        const task = suitableTasks[Math.floor(Math.random() * suitableTasks.length)];
        if (agentService.assignTask(agent.id, task)) {
          this.createMemory(agent.id, `接到新任务: ${task.title}`, MemoryType.OBSERVATION);
          agentService.updateAgentStatus(agent.id, AgentStatus.THINKING);
          
          // Broadcast thought
          const wsService = getWebSocketService();
          if (wsService) {
            wsService.broadcastAgentThought(agent.id, `思考如何完成: ${task.title}`, 'task');
          }
        }
      }
    }

    // Random activities when truly idle
    if (!agent.currentTask && Math.random() < 0.1) { // 10% chance
      this.performRandomActivity(agent);
    }
  }

  private handleThinkingState(agent: Agent): void {
    if (!agent.currentTask) {
      agentService.updateAgentStatus(agent.id, AgentStatus.IDLE);
      return;
    }

    // Thinking duration: 5-15 seconds
    const thinkingTime = 5000 + Math.random() * 10000;
    
    setTimeout(() => {
      const currentAgent = agentService.getAgent(agent.id);
      if (currentAgent && currentAgent.status === AgentStatus.THINKING) {
        // Move to appropriate zone for task
        const targetLocation = this.getTaskLocation(currentAgent.currentTask!);
        if (targetLocation) {
          this.moveAgentToLocation(currentAgent.id, targetLocation);
        }

        agentService.updateAgentStatus(currentAgent.id, AgentStatus.EXECUTING);
        taskService.startTask(currentAgent.currentTask!.id);
        
        this.createMemory(currentAgent.id, `开始执行任务: ${currentAgent.currentTask!.title}`, MemoryType.OBSERVATION);
        
        const wsService = getWebSocketService();
        if (wsService) {
          wsService.broadcastAgentThought(currentAgent.id, `正在执行: ${currentAgent.currentTask!.description}`, 'task');
        }
      }
    }, thinkingTime);
  }

  private handleExecutingState(agent: Agent): void {
    if (!agent.currentTask) {
      agentService.updateAgentStatus(agent.id, AgentStatus.IDLE);
      return;
    }

    const task = agent.currentTask;
    
    // Update task progress
    const currentProgress = task.progress || 0;
    const progressIncrement = 5 + Math.random() * 10; // 5-15% progress per update
    const newProgress = Math.min(100, currentProgress + progressIncrement);
    
    taskService.updateTaskProgress(task.id, newProgress);

    // Check if task is completed
    if (newProgress >= 100) {
      agentService.completeCurrentTask(agent.id);
      this.createMemory(agent.id, `完成任务: ${task.title}`, MemoryType.OBSERVATION);
      
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.broadcastAgentThought(agent.id, `任务完成！${task.title}`, 'task');
      }

      // Sometimes reflect on completed tasks
      if (Math.random() < 0.3) {
        setTimeout(() => this.generateReflection(agent.id, task), 2000);
      }
    }

    // Random chance of communication during execution
    if (Math.random() < 0.05) { // 5% chance
      this.initiateRandomCommunication(agent);
    }
  }

  private handleCommunicatingState(agent: Agent): void {
    // Communication lasts 3-10 seconds
    const commDuration = 3000 + Math.random() * 7000;
    
    setTimeout(() => {
      const currentAgent = agentService.getAgent(agent.id);
      if (currentAgent && currentAgent.status === AgentStatus.COMMUNICATING) {
        const previousStatus = currentAgent.currentTask ? AgentStatus.EXECUTING : AgentStatus.IDLE;
        agentService.updateAgentStatus(currentAgent.id, previousStatus);
      }
    }, commDuration);
  }

  private handleErrorState(agent: Agent): void {
    // Error recovery: 10-30 seconds
    const recoveryTime = 10000 + Math.random() * 20000;
    
    setTimeout(() => {
      const currentAgent = agentService.getAgent(agent.id);
      if (currentAgent && currentAgent.status === AgentStatus.ERROR) {
        this.createMemory(currentAgent.id, '从错误状态恢复', MemoryType.OBSERVATION);
        agentService.updateAgentStatus(currentAgent.id, AgentStatus.IDLE);
      }
    }, recoveryTime);
  }

  private performRandomActivity(agent: Agent): void {
    const activities = [
      '查看系统状态',
      '整理工作区域', 
      '检查设备状态',
      '休息片刻',
      '查看消息通知'
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    this.createMemory(agent.id, activity, MemoryType.OBSERVATION);
    
    const wsService = getWebSocketService();
    if (wsService) {
      wsService.broadcastAgentThought(agent.id, activity, 'reflection');
    }
  }

  private initiateRandomCommunication(agent: Agent): void {
    const otherAgents = agentService.getAllAgents().filter(a => a.id !== agent.id);
    if (otherAgents.length === 0) return;

    const partner = otherAgents[Math.floor(Math.random() * otherAgents.length)];
    
    agentService.updateAgentStatus(agent.id, AgentStatus.COMMUNICATING);
    agentService.updateAgentStatus(partner.id, AgentStatus.COMMUNICATING);

    const wsService = getWebSocketService();
    if (wsService) {
      wsService.broadcastAgentThought(agent.id, `与 ${partner.name} 协调工作`, 'task');
      wsService.broadcastAgentThought(partner.id, `与 ${agent.name} 协调工作`, 'task');
    }

    this.createMemory(agent.id, `与 ${partner.name} 沟通工作事项`, MemoryType.OBSERVATION);
    this.createMemory(partner.id, `与 ${agent.name} 沟通工作事项`, MemoryType.OBSERVATION);
  }

  private canAgentDoTask(agent: Agent, task: Task): boolean {
    // Simple capability matching
    const taskRequirements = this.getTaskRequirements(task.type);
    return agent.capabilities.some(cap => taskRequirements.includes(cap));
  }

  private getTaskRequirements(taskType: string): string[] {
    const requirements = {
      'inventory_check': ['inventory_management', 'data_entry'],
      'route_optimization': ['route_planning', 'data_analysis'],
      'customer_inquiry': ['customer_service', 'communication'],
      'data_analysis': ['data_analysis', 'report_generation'],
      'code_review': ['software_development', 'quality_assurance'],
      'quality_control': ['quality_control', 'inspection'],
      'team_coordination': ['leadership', 'communication']
    };
    return requirements[taskType as keyof typeof requirements] || ['general'];
  }

  private getTaskLocation(task: Task): Location | null {
    const locationMap = {
      'inventory_check': { x: 1200, y: 600, zone: 'warehouse' as any },
      'route_optimization': { x: 1200, y: 800, zone: 'transport' as any },
      'customer_inquiry': { x: 800, y: 400, zone: 'customer_service' as any },
      'data_analysis': { x: 1200, y: 1000, zone: 'data_center' as any },
      'code_review': { x: 400, y: 1000, zone: 'development' as any },
      'quality_control': { x: 1000, y: 600, zone: 'quality' as any },
      'team_coordination': { x: 600, y: 600, zone: 'common_area' as any }
    };
    return locationMap[task.type as keyof typeof locationMap] || null;
  }

  private moveAgentToLocation(agentId: string, location: Location): void {
    const agent = agentService.getAgent(agentId);
    if (!agent) return;

    const wsService = getWebSocketService();
    if (wsService) {
      // Generate simple path (direct line for now)
      const path = [agent.location, location];
      wsService.broadcastAgentMovement(agentId, agent.location, location, path);
    }

    // Update agent location
    agentService.updateAgent(agentId, { location });
  }

  private createMemory(agentId: string, content: string, type: MemoryType): void {
    const memory: Memory = {
      id: uuidv4(),
      agentId,
      type,
      content,
      importance: Math.floor(Math.random() * 5) + 3, // 3-7 importance
      timestamp: new Date(),
      relatedMemories: [],
      relatedAgents: [],
      relatedTasks: [],
      tags: [type, 'runtime-generated'],
      metadata: { generatedByRuntime: true }
    };

    memoryStore.set(memory.id, memory);

    // Add to agent's memory collection
    const agent = agentService.getAgent(agentId);
    if (agent) {
      agent.memories.push(memory);
      
      // Limit memory size (keep last 50)
      if (agent.memories.length > 50) {
        agent.memories = agent.memories.slice(-50);
      }
    }
  }

  private generateReflection(agentId: string, completedTask: Task): void {
    const reflections = [
      `这个任务比预期${completedTask.actualDuration! > completedTask.estimatedDuration ? '花费更多时间' : '完成更快'}`,
      `通过完成 ${completedTask.title}，我提高了相关技能`,
      `下次处理类似任务时，我可以更高效`,
      `团队协作在这个任务中很重要`,
      `这类任务需要更仔细的规划`
    ];

    const reflection = reflections[Math.floor(Math.random() * reflections.length)];
    this.createMemory(agentId, reflection, MemoryType.REFLECTION);

    const wsService = getWebSocketService();
    if (wsService) {
      wsService.broadcastAgentThought(agentId, reflection, 'reflection');
    }
  }

  private runMainLoop(): void {
    setInterval(() => {
      if (!this.running) return;

      // Generate random tasks periodically
      if (Math.random() < 0.3) { // 30% chance every cycle
        const randomAgent = agentService.getAllAgents()[Math.floor(Math.random() * agentService.getAllAgents().length)];
        if (randomAgent) {
          taskService.generateRandomTask(randomAgent.type);
        }
      }

      // System status broadcast
      const wsService = getWebSocketService();
      if (wsService && Math.random() < 0.1) { // 10% chance
        const agents = agentService.getAllAgents();
        const tasks = taskService.getAllTasks();
        
        wsService.broadcast({
          type: 'system:status',
          payload: {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status !== 'idle').length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            systemHealth: 0.85 + Math.random() * 0.15, // 85-100%
            timestamp: new Date()
          },
          timestamp: new Date()
        }, 'system:status');
      }
    }, 10000); // Every 10 seconds
  }
}

interface AgentProcess {
  agentId: string;
  state: string;
  lastUpdate: number;
  currentActivity: any;
  interval: NodeJS.Timeout;
}

export const agentRuntime = new AgentRuntime();