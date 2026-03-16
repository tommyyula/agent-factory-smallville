import { Router } from 'express';
import { taskService } from '../services/task-service.js';
import { agentService } from '../services/agent-service.js';
import { TaskStatus, TaskType, Priority } from '@agent-factory/shared';

const router = Router();

// GET /api/tasks - List all tasks
router.get('/', (req, res) => {
  try {
    const { status, assignedTo, type, priority, limit, offset } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status as TaskStatus;
    if (assignedTo) filter.assignedTo = assignedTo as string;
    if (type) filter.type = type as TaskType;
    if (priority) filter.priority = parseInt(priority as string) as Priority;

    let tasks = taskService.getAllTasks(filter);
    
    // Sort by priority and creation date
    tasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return b.createdAt.getTime() - a.createdAt.getTime(); // Newer first
    });
    
    // Pagination
    const limitNum = parseInt(limit as string) || tasks.length;
    const offsetNum = parseInt(offset as string) || 0;
    
    const paginatedTasks = tasks.slice(offsetNum, offsetNum + limitNum);

    // Calculate stats
    const stats = {
      total: tasks.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>
    };

    tasks.forEach(task => {
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
      stats.byPriority[task.priority.toString()] = (stats.byPriority[task.priority.toString()] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        tasks: paginatedTasks,
        stats,
        pagination: {
          total: tasks.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < tasks.length
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      timestamp: new Date()
    });
  }
});

// GET /api/tasks/:id - Get task details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const task = taskService.getTask(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: task,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      timestamp: new Date()
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
  try {
    const taskData = req.body;
    
    // Basic validation
    if (!taskData.title || !taskData.description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required',
        timestamp: new Date()
      });
    }

    const task = taskService.createTask(taskData);
    
    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      timestamp: new Date()
    });
  }
});

// PATCH /api/tasks/:id - Update task
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const task = taskService.updateTask(id, updates);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      timestamp: new Date()
    });
  }
});

// PUT /api/tasks/:id/assign - Assign task to agent
router.put('/:id/assign', (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID is required',
        timestamp: new Date()
      });
    }

    // Check if agent exists
    const agent = agentService.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        timestamp: new Date()
      });
    }

    // Check if agent is available
    if (agent.currentTask) {
      return res.status(400).json({
        success: false,
        error: 'Agent is already assigned to another task',
        timestamp: new Date()
      });
    }

    const task = taskService.assignTask(id, agentId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or cannot be assigned',
        timestamp: new Date()
      });
    }

    // Update agent with the task
    const success = agentService.assignTask(agentId, task);
    if (!success) {
      // Rollback task assignment
      taskService.updateTask(id, { assignedTo: undefined, status: TaskStatus.PENDING });
      return res.status(400).json({
        success: false,
        error: 'Failed to assign task to agent',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task assigned successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to assign task',
      timestamp: new Date()
    });
  }
});

// PUT /api/tasks/:id/start - Start task execution
router.put('/:id/start', (req, res) => {
  try {
    const { id } = req.params;
    
    const task = taskService.startTask(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or cannot be started',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task started successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start task',
      timestamp: new Date()
    });
  }
});

// PUT /api/tasks/:id/complete - Complete task
router.put('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const { results } = req.body;
    
    const task = taskService.completeTask(id, results);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or cannot be completed',
        timestamp: new Date()
      });
    }

    // Update agent status if this was their current task
    if (task.assignedTo) {
      const agent = agentService.getAgent(task.assignedTo);
      if (agent && agent.currentTask?.id === task.id) {
        agentService.completeCurrentTask(task.assignedTo);
      }
    }

    res.json({
      success: true,
      data: task,
      message: 'Task completed successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to complete task',
      timestamp: new Date()
    });
  }
});

// PUT /api/tasks/:id/fail - Mark task as failed
router.put('/:id/fail', (req, res) => {
  try {
    const { id } = req.params;
    const { error: errorMessage } = req.body;
    
    const task = taskService.failTask(id, errorMessage);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or cannot be failed',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task marked as failed',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task status',
      timestamp: new Date()
    });
  }
});

// PUT /api/tasks/:id/progress - Update task progress
router.put('/:id/progress', (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be a number between 0 and 100',
        timestamp: new Date()
      });
    }

    const task = taskService.updateTaskProgress(id, progress);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task progress updated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task progress',
      timestamp: new Date()
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = taskService.deleteTask(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      timestamp: new Date()
    });
  }
});

// GET /api/tasks/stats - Get task statistics
router.get('/queue/stats', (req, res) => {
  try {
    const tasks = taskService.getAllTasks();
    const agents = agentService.getAllAgents();
    
    const stats = {
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
        assigned: tasks.filter(t => t.status === TaskStatus.ASSIGNED).length,
        inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        failed: tasks.filter(t => t.status === TaskStatus.FAILED).length
      },
      agents: {
        total: agents.length,
        idle: agents.filter(a => a.status === 'idle').length,
        busy: agents.filter(a => a.currentTask).length,
        available: agents.filter(a => a.status === 'idle' && !a.currentTask).length
      },
      performance: {
        averageCompletionTime: this.calculateAverageCompletionTime(tasks),
        completionRate: this.calculateCompletionRate(tasks),
        taskThroughput: this.calculateThroughput(tasks)
      },
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task statistics',
      timestamp: new Date()
    });
  }
});

// Helper functions for statistics
function calculateAverageCompletionTime(tasks: any[]): number {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED && t.actualDuration);
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
  return Math.round(totalTime / completedTasks.length);
}

function calculateCompletionRate(tasks: any[]): number {
  if (tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const finishedTasks = tasks.filter(t => 
    t.status === TaskStatus.COMPLETED || 
    t.status === TaskStatus.FAILED || 
    t.status === TaskStatus.CANCELLED
  ).length;
  
  if (finishedTasks === 0) return 0;
  return Math.round((completedTasks / finishedTasks) * 100);
}

function calculateThroughput(tasks: any[]): number {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentCompletions = tasks.filter(t => 
    t.status === TaskStatus.COMPLETED && 
    t.completedAt && 
    new Date(t.completedAt) >= oneHourAgo
  );
  
  return recentCompletions.length;
}

export default router;