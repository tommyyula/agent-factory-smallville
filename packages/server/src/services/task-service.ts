import { Task, TaskStatus, TaskType, Priority, AgentType } from '@agent-factory/shared';
import { taskStore } from '../models/store.js';
import { v4 as uuidv4 } from 'uuid';

export class TaskService {
  createTask(taskData: Partial<Task>): Task {
    const task: Task = {
      id: uuidv4(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      type: taskData.type || TaskType.INVENTORY_CHECK,
      status: TaskStatus.PENDING,
      priority: taskData.priority || Priority.NORMAL,
      createdBy: taskData.createdBy || 'system',
      estimatedDuration: taskData.estimatedDuration || 300000, // 5 minutes default
      progress: 0,
      dependencies: taskData.dependencies || [],
      createdAt: new Date(),
      metadata: taskData.metadata || {}
    };

    taskStore.set(task.id, task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return taskStore.get(id);
  }

  getAllTasks(filter?: { 
    status?: TaskStatus; 
    assignedTo?: string; 
    type?: TaskType;
    priority?: Priority;
  }): Task[] {
    const tasks = taskStore.getAll();
    
    if (!filter) return tasks;
    
    return tasks.filter(task => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.assignedTo && task.assignedTo !== filter.assignedTo) return false;
      if (filter.type && task.type !== filter.type) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      return true;
    });
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const task = taskStore.get(id);
    if (!task) return null;

    const updatedTask = { ...task, ...updates };
    
    // Auto-set timestamps
    if (updates.status === TaskStatus.IN_PROGRESS && !task.startedAt) {
      updatedTask.startedAt = new Date();
    }
    if (updates.status === TaskStatus.COMPLETED && !task.completedAt) {
      updatedTask.completedAt = new Date();
      updatedTask.progress = 100;
      if (updatedTask.startedAt) {
        updatedTask.actualDuration = Date.now() - updatedTask.startedAt.getTime();
      }
    }

    taskStore.set(id, updatedTask);
    return updatedTask;
  }

  updateTaskProgress(id: string, progress: number): Task | null {
    const task = taskStore.get(id);
    if (!task) return null;

    const updates: Partial<Task> = { progress: Math.max(0, Math.min(100, progress)) };
    
    // Auto-complete if progress reaches 100
    if (progress >= 100 && task.status === TaskStatus.IN_PROGRESS) {
      updates.status = TaskStatus.COMPLETED;
    }

    return this.updateTask(id, updates);
  }

  assignTask(id: string, agentId: string): Task | null {
    const task = taskStore.get(id);
    if (!task || task.status !== TaskStatus.PENDING) return null;

    return this.updateTask(id, {
      assignedTo: agentId,
      status: TaskStatus.ASSIGNED
    });
  }

  startTask(id: string): Task | null {
    const task = taskStore.get(id);
    if (!task || task.status !== TaskStatus.ASSIGNED) return null;

    return this.updateTask(id, {
      status: TaskStatus.IN_PROGRESS,
      startedAt: new Date()
    });
  }

  completeTask(id: string, results?: any): Task | null {
    const task = taskStore.get(id);
    if (!task || task.status !== TaskStatus.IN_PROGRESS) return null;

    const updates: Partial<Task> = {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      progress: 100
    };

    if (results) {
      updates.metadata = { ...task.metadata, results };
    }

    return this.updateTask(id, updates);
  }

  failTask(id: string, error?: string): Task | null {
    const task = taskStore.get(id);
    if (!task || ![TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS].includes(task.status)) {
      return null;
    }

    const updates: Partial<Task> = {
      status: TaskStatus.FAILED
    };

    if (error) {
      updates.metadata = { ...task.metadata, error };
    }

    return this.updateTask(id, updates);
  }

  deleteTask(id: string): boolean {
    return taskStore.delete(id);
  }

  // Task templates for different agent types
  generateRandomTask(agentType?: AgentType): Task {
    const templates = this.getTaskTemplates();
    const typeTemplates = agentType ? templates[agentType] : Object.values(templates).flat();
    const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

    return this.createTask({
      title: template.title,
      description: template.description,
      type: template.type,
      priority: template.priority,
      estimatedDuration: template.estimatedDuration,
      createdBy: 'task-generator',
      metadata: { template: true, generatedAt: new Date().toISOString() }
    });
  }

  private getTaskTemplates() {
    return {
      [AgentType.WAREHOUSE]: [
        {
          title: '库存盘点 - A区',
          description: '对仓库A区进行全面库存盘点',
          type: TaskType.INVENTORY_CHECK,
          priority: Priority.NORMAL,
          estimatedDuration: 1800000 // 30 minutes
        },
        {
          title: '质量检查 - 入库商品',
          description: '检查新到货商品的质量标准',
          type: TaskType.QUALITY_CONTROL,
          priority: Priority.HIGH,
          estimatedDuration: 900000 // 15 minutes
        }
      ],
      [AgentType.TRANSPORTATION]: [
        {
          title: '路线优化 - 5号配送区',
          description: '优化5号配送区的配送路线',
          type: TaskType.ROUTE_OPTIMIZATION,
          priority: Priority.HIGH,
          estimatedDuration: 1200000 // 20 minutes
        }
      ],
      [AgentType.CUSTOMER_SERVICE]: [
        {
          title: '客户咨询 - 订单状态',
          description: '处理客户关于订单配送状态的咨询',
          type: TaskType.CUSTOMER_INQUIRY,
          priority: Priority.NORMAL,
          estimatedDuration: 600000 // 10 minutes
        }
      ],
      [AgentType.DATA_ANALYST]: [
        {
          title: '周报生成',
          description: '生成本周运营数据分析报告',
          type: TaskType.DATA_ANALYSIS,
          priority: Priority.NORMAL,
          estimatedDuration: 2400000 // 40 minutes
        },
        {
          title: '性能趋势分析',
          description: '分析系统性能指标的变化趋势',
          type: TaskType.REPORT_GENERATION,
          priority: Priority.LOW,
          estimatedDuration: 1800000 // 30 minutes
        }
      ],
      [AgentType.DEVELOPER]: [
        {
          title: '代码审查 - 用户认证',
          description: '审查用户认证模块的代码更新',
          type: TaskType.CODE_REVIEW,
          priority: Priority.HIGH,
          estimatedDuration: 1500000 // 25 minutes
        }
      ],
      [AgentType.COORDINATOR]: [
        {
          title: '团队协调会议',
          description: '协调各部门间的工作安排',
          type: TaskType.TEAM_COORDINATION,
          priority: Priority.HIGH,
          estimatedDuration: 2100000 // 35 minutes
        }
      ]
    };
  }
}

export const taskService = new TaskService();