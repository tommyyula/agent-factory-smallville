import { Agent, AgentType, AgentStatus, Location } from '@agent-factory/shared';
import { agentService } from '../services/agent-service.js';
import { taskService } from '../services/task-service.js';

interface AgentTemplate {
  name: string;
  type: AgentType;
  role: string;
  description: string;
  capabilities: string[];
  baseLocation: Location;
  personality: {
    communication_style: string;
    decision_making: string;
    collaboration: string;
  };
}

export class AgentSeeder {
  private agentTemplates: AgentTemplate[] = [
    {
      name: 'Alex Chen',
      type: AgentType.WAREHOUSE,
      role: '仓储管家',
      description: '负责仓库运营和库存管理监督',
      capabilities: ['inventory_management', 'team_coordination', 'quality_control', 'data_entry'],
      baseLocation: { x: 1200, y: 600, zone: 'warehouse' as any },
      personality: {
        communication_style: 'direct',
        decision_making: 'analytical',
        collaboration: 'high'
      }
    },
    {
      name: 'Maria Rodriguez',
      type: AgentType.TRANSPORTATION,
      role: '运输调度',
      description: '管理运输物流和路线优化',
      capabilities: ['route_planning', 'vehicle_management', 'delivery_scheduling', 'logistics_coordination'],
      baseLocation: { x: 1200, y: 800, zone: 'transport' as any },
      personality: {
        communication_style: 'efficient',
        decision_making: 'quick',
        collaboration: 'high'
      }
    },
    {
      name: 'James Park',
      type: AgentType.CUSTOMER_SERVICE,
      role: '客服代表',
      description: '处理客户咨询和解决服务问题',
      capabilities: ['customer_support', 'issue_resolution', 'communication', 'empathy'],
      baseLocation: { x: 800, y: 400, zone: 'customer_service' as any },
      personality: {
        communication_style: 'empathetic',
        decision_making: 'customer_focused',
        collaboration: 'medium'
      }
    },
    {
      name: 'Dr. Sarah Kim',
      type: AgentType.DATA_ANALYST,
      role: '数据分析师',
      description: '分析运营数据并生成洞察报告',
      capabilities: ['data_analysis', 'pattern_recognition', 'report_generation', 'statistical_analysis'],
      baseLocation: { x: 1200, y: 1000, zone: 'data_center' as any },
      personality: {
        communication_style: 'analytical',
        decision_making: 'data_driven',
        collaboration: 'medium'
      }
    },
    {
      name: 'Ryan O\'Connor',
      type: AgentType.DEVELOPER,
      role: '全栈开发工程师',
      description: '开发和维护系统应用程序',
      capabilities: ['software_development', 'system_integration', 'debugging', 'code_review'],
      baseLocation: { x: 400, y: 1000, zone: 'development' as any },
      personality: {
        communication_style: 'technical',
        decision_making: 'methodical',
        collaboration: 'medium'
      }
    },
    {
      name: 'Emily Zhang',
      type: AgentType.QUALITY,
      role: '质检专员',
      description: '确保产品质量和合规标准',
      capabilities: ['quality_control', 'inspection', 'compliance_checking', 'documentation'],
      baseLocation: { x: 1000, y: 600, zone: 'quality' as any },
      personality: {
        communication_style: 'precise',
        decision_making: 'thorough',
        collaboration: 'high'
      }
    },
    {
      name: 'Michael Liu',
      type: AgentType.PLANNING,
      role: '规划师',
      description: '进行需求预测和容量规划',
      capabilities: ['demand_forecasting', 'capacity_planning', 'strategic_analysis', 'optimization'],
      baseLocation: { x: 600, y: 800, zone: 'planning' as any },
      personality: {
        communication_style: 'strategic',
        decision_making: 'long_term',
        collaboration: 'high'
      }
    },
    {
      name: 'Lisa Wang',
      type: AgentType.COORDINATOR,
      role: '协调员',
      description: '协调跨团队同步和升级处理',
      capabilities: ['team_coordination', 'communication', 'conflict_resolution', 'leadership'],
      baseLocation: { x: 600, y: 600, zone: 'common_area' as any },
      personality: {
        communication_style: 'diplomatic',
        decision_making: 'collaborative',
        collaboration: 'very_high'
      }
    }
  ];

  public seedAgents(): Agent[] {
    const createdAgents: Agent[] = [];

    console.log('🌱 Seeding agents...');

    this.agentTemplates.forEach(template => {
      const agent = agentService.createAgent({
        name: template.name,
        type: template.type,
        role: template.role,
        location: template.baseLocation,
        capabilities: template.capabilities,
        metadata: {
          description: template.description,
          personality: template.personality,
          template: true,
          seeded: true,
          seedTime: new Date().toISOString()
        }
      });

      createdAgents.push(agent);
      console.log(`✅ Created agent: ${agent.name} (${agent.role})`);
    });

    console.log(`🎉 Successfully seeded ${createdAgents.length} agents`);
    return createdAgents;
  }

  public seedInitialTasks(): void {
    console.log('🌱 Seeding initial tasks...');

    // Create some initial tasks for variety
    const initialTasks = [
      {
        title: '晨间库存检查',
        description: '检查昨夜入库商品的库存情况',
        type: 'inventory_check',
        priority: 2,
        estimatedDuration: 1200000 // 20 minutes
      },
      {
        title: '客户反馈处理',
        description: '处理昨日积累的客户反馈和建议',
        type: 'customer_inquiry',
        priority: 3,
        estimatedDuration: 900000 // 15 minutes
      },
      {
        title: '路线效率分析',
        description: '分析上周配送路线的效率数据',
        type: 'route_optimization',
        priority: 2,
        estimatedDuration: 1800000 // 30 minutes
      },
      {
        title: '系统性能报告',
        description: '生成系统性能月度分析报告',
        type: 'data_analysis',
        priority: 1,
        estimatedDuration: 2400000 // 40 minutes
      },
      {
        title: '代码质量审查',
        description: '审查新提交的用户界面改进代码',
        type: 'code_review',
        priority: 3,
        estimatedDuration: 1500000 // 25 minutes
      }
    ];

    let createdCount = 0;
    initialTasks.forEach(taskTemplate => {
      const task = taskService.createTask({
        title: taskTemplate.title,
        description: taskTemplate.description,
        type: taskTemplate.type as any,
        priority: taskTemplate.priority as any,
        estimatedDuration: taskTemplate.estimatedDuration,
        createdBy: 'system-seeder',
        metadata: {
          seeded: true,
          seedTime: new Date().toISOString()
        }
      });
      
      if (task) {
        createdCount++;
        console.log(`✅ Created task: ${task.title}`);
      }
    });

    console.log(`🎉 Successfully seeded ${createdCount} initial tasks`);
  }

  public startAgentBehaviors(): void {
    console.log('🤖 Starting agent behaviors...');
    
    const agents = agentService.getAllAgents();
    
    // Set some agents to different initial states for variety
    if (agents.length >= 3) {
      agentService.updateAgentStatus(agents[1].id, AgentStatus.THINKING);
      agentService.updateAgentStatus(agents[2].id, AgentStatus.EXECUTING);
      
      if (agents.length >= 5) {
        agentService.updateAgentStatus(agents[4].id, AgentStatus.THINKING);
      }
    }

    console.log('🎭 Agent behaviors initialized');
  }

  public getAgentStats(): { total: number; byType: Record<string, number>; byStatus: Record<string, number> } {
    const agents = agentService.getAllAgents();
    const stats = {
      total: agents.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>
    };

    agents.forEach(agent => {
      // Count by type
      stats.byType[agent.type] = (stats.byType[agent.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[agent.status] = (stats.byStatus[agent.status] || 0) + 1;
    });

    return stats;
  }

  public resetAllAgents(): void {
    console.log('🔄 Resetting all agents...');
    
    const agents = agentService.getAllAgents();
    agents.forEach(agent => {
      // Reset to idle state
      agentService.updateAgent(agent.id, {
        status: AgentStatus.IDLE,
        currentTask: undefined,
        location: this.getAgentTemplate(agent.name)?.baseLocation || agent.location
      });
    });

    console.log('✅ All agents reset to idle state');
  }

  private getAgentTemplate(name: string): AgentTemplate | undefined {
    return this.agentTemplates.find(template => template.name === name);
  }
}

export const agentSeeder = new AgentSeeder();