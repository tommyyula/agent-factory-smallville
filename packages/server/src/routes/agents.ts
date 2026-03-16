import { Router } from 'express';
import { agentService } from '../services/agent-service.js';
import { memoryStore } from '../models/store.js';
import { AgentStatus, AgentType } from '@agent-factory/shared';

const router = Router();

// GET /api/agents - List all agents
router.get('/', (req, res) => {
  try {
    const { status, type, limit, offset } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status as AgentStatus;
    if (type) filter.type = type as AgentType;

    let agents = agentService.getAllAgents(filter);
    
    // Pagination
    const limitNum = parseInt(limit as string) || agents.length;
    const offsetNum = parseInt(offset as string) || 0;
    
    const paginatedAgents = agents.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: {
        agents: paginatedAgents,
        pagination: {
          total: agents.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < agents.length
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      timestamp: new Date()
    });
  }
});

// GET /api/agents/:id - Get agent details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const agent = agentService.getAgent(id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: agent,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent',
      timestamp: new Date()
    });
  }
});

// POST /api/agents - Create new agent
router.post('/', (req, res) => {
  try {
    const agentData = req.body;
    
    // Basic validation
    if (!agentData.name || !agentData.type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required',
        timestamp: new Date()
      });
    }

    const agent = agentService.createAgent(agentData);
    
    res.status(201).json({
      success: true,
      data: agent,
      message: 'Agent created successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create agent',
      timestamp: new Date()
    });
  }
});

// PATCH /api/agents/:id - Update agent
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const agent = agentService.updateAgent(id, updates);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: agent,
      message: 'Agent updated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update agent',
      timestamp: new Date()
    });
  }
});

// PUT /api/agents/:id/status - Update agent status
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        timestamp: new Date()
      });
    }

    const agent = agentService.updateAgentStatus(id, status, location);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: agent,
      message: 'Agent status updated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update agent status',
      timestamp: new Date()
    });
  }
});

// DELETE /api/agents/:id - Delete agent
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = agentService.deleteAgent(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete agent',
      timestamp: new Date()
    });
  }
});

// GET /api/agents/:id/memories - Get agent memory stream
router.get('/:id/memories', (req, res) => {
  try {
    const { id } = req.params;
    const { limit, offset, type } = req.query;
    
    const agent = agentService.getAgent(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        timestamp: new Date()
      });
    }

    // Get all memories for this agent
    let memories = memoryStore.getAll().filter(memory => memory.agentId === id);
    
    // Filter by type if specified
    if (type) {
      memories = memories.filter(memory => memory.type === type);
    }

    // Sort by timestamp (newest first)
    memories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Pagination
    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;
    const paginatedMemories = memories.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: {
        memories: paginatedMemories,
        pagination: {
          total: memories.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < memories.length
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent memories',
      timestamp: new Date()
    });
  }
});

// GET /api/agents/:id/metrics - Get agent performance metrics
router.get('/:id/metrics', (req, res) => {
  try {
    const { id } = req.params;
    
    const agent = agentService.getAgent(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: agent.metrics,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent metrics',
      timestamp: new Date()
    });
  }
});

export default router;