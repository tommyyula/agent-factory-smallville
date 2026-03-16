import { Router } from 'express';
import { sceneStore } from '../models/store.js';
import { agentService } from '../services/agent-service.js';
import { taskService } from '../services/task-service.js';
import { SceneConfig, Building, Zone, ZoneType, BuildingType } from '@agent-factory/shared';

const router = Router();

// Default scene configuration
const defaultSceneConfig: SceneConfig = {
  buildings: [
    {
      id: 'house-1',
      name: '住宅楼1',
      type: BuildingType.HOUSE,
      position: { x: 200, y: 200, zone: ZoneType.COMMON_AREA },
      size: { width: 64, height: 64 },
      entrancePoint: { x: 232, y: 264, zone: ZoneType.COMMON_AREA },
      capacity: 2,
      occupants: []
    },
    {
      id: 'warehouse-main',
      name: '主仓库',
      type: BuildingType.WAREHOUSE,
      position: { x: 1100, y: 500, zone: ZoneType.WAREHOUSE },
      size: { width: 128, height: 96 },
      entrancePoint: { x: 1164, y: 596, zone: ZoneType.WAREHOUSE },
      capacity: 8,
      occupants: []
    },
    {
      id: 'office-customer',
      name: '客服中心',
      type: BuildingType.OFFICE,
      position: { x: 700, y: 300, zone: ZoneType.CUSTOMER_SERVICE },
      size: { width: 96, height: 80 },
      entrancePoint: { x: 748, y: 380, zone: ZoneType.CUSTOMER_SERVICE },
      capacity: 6,
      occupants: []
    },
    {
      id: 'datacenter-main',
      name: '数据中心',
      type: BuildingType.DATA_CENTER,
      position: { x: 1100, y: 900, zone: ZoneType.DATA_CENTER },
      size: { width: 128, height: 128 },
      entrancePoint: { x: 1164, y: 1028, zone: ZoneType.DATA_CENTER },
      capacity: 12,
      occupants: []
    },
    {
      id: 'office-dev',
      name: '开发中心',
      type: BuildingType.OFFICE,
      position: { x: 300, y: 900, zone: ZoneType.DEVELOPMENT },
      size: { width: 96, height: 80 },
      entrancePoint: { x: 348, y: 980, zone: ZoneType.DEVELOPMENT },
      capacity: 8,
      occupants: []
    },
    {
      id: 'transport-hub',
      name: '运输枢纽',
      type: BuildingType.TRANSPORT_HUB,
      position: { x: 1100, y: 700, zone: ZoneType.TRANSPORT },
      size: { width: 128, height: 96 },
      entrancePoint: { x: 1164, y: 796, zone: ZoneType.TRANSPORT },
      capacity: 6,
      occupants: []
    },
    {
      id: 'meeting-room',
      name: '会议室',
      type: BuildingType.MEETING_ROOM,
      position: { x: 500, y: 500, zone: ZoneType.COMMON_AREA },
      size: { width: 80, height: 64 },
      entrancePoint: { x: 540, y: 564, zone: ZoneType.COMMON_AREA },
      capacity: 10,
      occupants: []
    }
  ],
  zones: [
    {
      id: 'warehouse-zone',
      name: '仓储区',
      type: ZoneType.WAREHOUSE,
      bounds: { x: 1000, y: 400, width: 300, height: 200 },
      color: '#FFE4B5',
      allowedAgentTypes: ['warehouse' as any, 'quality' as any, 'coordinator' as any],
      maxOccupancy: 10
    },
    {
      id: 'transport-zone',
      name: '运输区',
      type: ZoneType.TRANSPORT,
      bounds: { x: 1000, y: 650, width: 300, height: 200 },
      color: '#E6F3FF',
      allowedAgentTypes: ['transportation' as any, 'coordinator' as any],
      maxOccupancy: 8
    },
    {
      id: 'customer-zone',
      name: '客服区',
      type: ZoneType.CUSTOMER_SERVICE,
      bounds: { x: 650, y: 250, width: 250, height: 200 },
      color: '#E6FFE6',
      allowedAgentTypes: ['customer_service' as any, 'coordinator' as any],
      maxOccupancy: 6
    },
    {
      id: 'datacenter-zone',
      name: '数据中心区',
      type: ZoneType.DATA_CENTER,
      bounds: { x: 1000, y: 850, width: 300, height: 200 },
      color: '#F0E6FF',
      allowedAgentTypes: ['data_analyst' as any, 'developer' as any],
      maxOccupancy: 12
    },
    {
      id: 'development-zone',
      name: '开发区',
      type: ZoneType.DEVELOPMENT,
      bounds: { x: 200, y: 850, width: 300, height: 200 },
      color: '#FFE6F0',
      allowedAgentTypes: ['developer' as any, 'quality' as any],
      maxOccupancy: 8
    },
    {
      id: 'common-zone',
      name: '公共区域',
      type: ZoneType.COMMON_AREA,
      bounds: { x: 400, y: 400, width: 400, height: 300 },
      color: '#F5F5F5',
      allowedAgentTypes: ['warehouse', 'transportation', 'customer_service', 'data_analyst', 'developer', 'quality', 'planning', 'coordinator'] as any[],
      maxOccupancy: 20
    }
  ],
  spawnPoints: [
    {
      agentType: 'warehouse' as any,
      location: { x: 1150, y: 550, zone: ZoneType.WAREHOUSE },
      name: '仓储入口'
    },
    {
      agentType: 'transportation' as any,
      location: { x: 1150, y: 750, zone: ZoneType.TRANSPORT },
      name: '运输入口'
    },
    {
      agentType: 'customer_service' as any,
      location: { x: 750, y: 350, zone: ZoneType.CUSTOMER_SERVICE },
      name: '客服入口'
    },
    {
      agentType: 'data_analyst' as any,
      location: { x: 1150, y: 950, zone: ZoneType.DATA_CENTER },
      name: '数据中心入口'
    },
    {
      agentType: 'developer' as any,
      location: { x: 350, y: 950, zone: ZoneType.DEVELOPMENT },
      name: '开发中心入口'
    }
  ],
  tilemap: {
    width: 48,
    height: 36,
    tileWidth: 32,
    tileHeight: 32,
    layers: [
      {
        name: 'ground',
        data: [], // Will be generated
        visible: true,
        opacity: 1
      },
      {
        name: 'paths',
        data: [], // Will be generated
        visible: true,
        opacity: 1
      },
      {
        name: 'buildings',
        data: [], // Will be generated
        visible: true,
        opacity: 1
      }
    ]
  }
};

// Initialize default scene config
sceneStore.set(defaultSceneConfig);

// GET /api/scene/config - Get scene configuration
router.get('/config', (req, res) => {
  try {
    const config = sceneStore.get();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Scene configuration not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: config,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scene configuration',
      timestamp: new Date()
    });
  }
});

// PUT /api/scene/config - Update scene configuration
router.put('/config', (req, res) => {
  try {
    const updates = req.body;
    
    // Basic validation
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration data',
        timestamp: new Date()
      });
    }

    const currentConfig = sceneStore.get() || defaultSceneConfig;
    const newConfig = { ...currentConfig, ...updates };
    
    sceneStore.set(newConfig);

    res.json({
      success: true,
      data: newConfig,
      message: 'Scene configuration updated successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update scene configuration',
      timestamp: new Date()
    });
  }
});

// GET /api/scene/buildings - Get all buildings
router.get('/buildings', (req, res) => {
  try {
    const config = sceneStore.get();
    
    if (!config) {
      return res.json({
        success: true,
        data: [],
        timestamp: new Date()
      });
    }

    // Add occupancy data
    const buildingsWithOccupancy = config.buildings.map(building => {
      const agents = agentService.getAllAgents();
      const occupants = agents.filter(agent => {
        const distance = Math.sqrt(
          Math.pow(agent.location.x - building.position.x, 2) +
          Math.pow(agent.location.y - building.position.y, 2)
        );
        return distance < 100; // Within 100 pixels of building
      });

      return {
        ...building,
        currentOccupancy: occupants.length,
        occupants: occupants.map(a => ({ id: a.id, name: a.name }))
      };
    });

    res.json({
      success: true,
      data: buildingsWithOccupancy,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buildings',
      timestamp: new Date()
    });
  }
});

// GET /api/scene/zones - Get all zones
router.get('/zones', (req, res) => {
  try {
    const config = sceneStore.get();
    
    if (!config) {
      return res.json({
        success: true,
        data: [],
        timestamp: new Date()
      });
    }

    // Add occupancy data for zones
    const zonesWithOccupancy = config.zones.map(zone => {
      const agents = agentService.getAllAgents();
      const occupants = agents.filter(agent => {
        return agent.location.x >= zone.bounds.x &&
               agent.location.x <= zone.bounds.x + zone.bounds.width &&
               agent.location.y >= zone.bounds.y &&
               agent.location.y <= zone.bounds.y + zone.bounds.height;
      });

      return {
        ...zone,
        currentOccupancy: occupants.length,
        occupants: occupants.map(a => ({ id: a.id, name: a.name, type: a.type }))
      };
    });

    res.json({
      success: true,
      data: zonesWithOccupancy,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch zones',
      timestamp: new Date()
    });
  }
});

// GET /api/scene/stats - Get scene statistics
router.get('/stats', (req, res) => {
  try {
    const config = sceneStore.get();
    const agents = agentService.getAllAgents();
    const tasks = taskService.getAllTasks();

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Scene configuration not found',
        timestamp: new Date()
      });
    }

    // Calculate zone occupancy
    const zoneOccupancy = config.zones.map(zone => {
      const occupants = agents.filter(agent => {
        return agent.location.x >= zone.bounds.x &&
               agent.location.x <= zone.bounds.x + zone.bounds.width &&
               agent.location.y >= zone.bounds.y &&
               agent.location.y <= zone.bounds.y + zone.bounds.height;
      });

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        occupancy: occupants.length,
        maxOccupancy: zone.maxOccupancy,
        utilizationRate: Math.round((occupants.length / zone.maxOccupancy) * 100)
      };
    });

    // Calculate agent distribution by type
    const agentDistribution = agents.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate task distribution by zone
    const tasksByZone = tasks.reduce((acc, task) => {
      if (task.assignedTo) {
        const agent = agents.find(a => a.id === task.assignedTo);
        if (agent) {
          const zone = agent.location.zone;
          acc[zone] = (acc[zone] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      scene: {
        totalBuildings: config.buildings.length,
        totalZones: config.zones.length,
        mapSize: {
          width: config.tilemap.width * config.tilemap.tileWidth,
          height: config.tilemap.height * config.tilemap.tileHeight
        }
      },
      occupancy: {
        zones: zoneOccupancy,
        totalAgents: agents.length,
        averageUtilization: Math.round(
          zoneOccupancy.reduce((sum, z) => sum + z.utilizationRate, 0) / zoneOccupancy.length
        )
      },
      distribution: {
        agentsByType: agentDistribution,
        tasksByZone: tasksByZone
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
      error: 'Failed to fetch scene statistics',
      timestamp: new Date()
    });
  }
});

// POST /api/scene/reset - Reset scene to default configuration
router.post('/reset', (req, res) => {
  try {
    sceneStore.set(defaultSceneConfig);

    res.json({
      success: true,
      data: defaultSceneConfig,
      message: 'Scene reset to default configuration',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset scene configuration',
      timestamp: new Date()
    });
  }
});

export default router;