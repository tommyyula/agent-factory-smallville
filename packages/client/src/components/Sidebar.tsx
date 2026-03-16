import React from 'react';
import { useAppStore } from '../store/index.js';
import { Agent, Task, AgentStatus, TaskStatus } from '@agent-factory/shared';

const Sidebar: React.FC = () => {
  const { 
    agents, 
    tasks, 
    messages, 
    selectedAgentId, 
    activePanel, 
    systemStats,
    mockMode,
    connected,
    setActivePanel,
    selectAgent
  } = useAppStore();

  const agentArray = Object.values(agents);
  const taskArray = Object.values(tasks);
  const selectedAgent = selectedAgentId ? agents[selectedAgentId] : null;

  const getStatusColor = (status: AgentStatus): string => {
    const colors = {
      [AgentStatus.IDLE]: '#808080',
      [AgentStatus.THINKING]: '#FFD700', 
      [AgentStatus.EXECUTING]: '#00FF00',
      [AgentStatus.COMMUNICATING]: '#00BFFF',
      [AgentStatus.ERROR]: '#FF0000',
      [AgentStatus.SLEEPING]: '#666666',
      [AgentStatus.OFFLINE]: '#333333'
    };
    return colors[status] || '#808080';
  };

  const getStatusText = (status: AgentStatus): string => {
    const texts = {
      [AgentStatus.IDLE]: '空闲',
      [AgentStatus.THINKING]: '思考中',
      [AgentStatus.EXECUTING]: '执行中',
      [AgentStatus.COMMUNICATING]: '沟通中',
      [AgentStatus.ERROR]: '错误',
      [AgentStatus.SLEEPING]: '休息中',
      [AgentStatus.OFFLINE]: '离线'
    };
    return texts[status] || '未知';
  };

  const getTaskStatusText = (status: TaskStatus): string => {
    const texts = {
      [TaskStatus.PENDING]: '待分配',
      [TaskStatus.ASSIGNED]: '已分配',
      [TaskStatus.IN_PROGRESS]: '进行中',
      [TaskStatus.COMPLETED]: '已完成',
      [TaskStatus.FAILED]: '失败',
      [TaskStatus.CANCELLED]: '已取消'
    };
    return texts[status] || '未知';
  };

  const renderConnectionStatus = () => (
    <div className="connection-status">
      <div className={`status-indicator ${mockMode ? 'mock' : connected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {mockMode ? '演示模式' : connected ? '已连接' : '连接中...'}
        </span>
      </div>
    </div>
  );

  const renderAgentList = () => (
    <div className="agent-list">
      <h3>代理列表 ({agentArray.length})</h3>
      <div className="agent-items">
        {agentArray.map((agent: Agent) => (
          <div 
            key={agent.id}
            className={`agent-item ${selectedAgentId === agent.id ? 'selected' : ''}`}
            onClick={() => selectAgent(agent.id)}
          >
            <div className="agent-header">
              <div className="agent-name">{agent.name}</div>
              <div 
                className="agent-status"
                style={{ color: getStatusColor(agent.status) }}
              >
                {getStatusText(agent.status)}
              </div>
            </div>
            <div className="agent-role">{agent.role}</div>
            <div className="agent-metrics">
              <span>完成任务: {agent.metrics.tasksCompleted}</span>
              <span>消息: {agent.metrics.messagesSent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTaskQueue = () => (
    <div className="task-queue">
      <h3>任务队列 ({taskArray.length})</h3>
      <div className="task-items">
        {taskArray.map((task: Task) => (
          <div key={task.id} className="task-item">
            <div className="task-header">
              <div className="task-title">{task.title}</div>
              <div className="task-priority">优先级: {task.priority}</div>
            </div>
            <div className="task-description">{task.description}</div>
            <div className="task-info">
              <div className="task-status">{getTaskStatusText(task.status)}</div>
              {task.assignedTo && (
                <div className="task-assignee">
                  分配给: {agents[task.assignedTo]?.name || '未知'}
                </div>
              )}
              {task.status === TaskStatus.IN_PROGRESS && (
                <div className="task-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span>{Math.round(task.progress)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="message-feed">
      <h3>消息流 ({messages.length})</h3>
      <div className="message-items">
        {messages.slice(-20).map((message) => (
          <div key={message.id} className="message-item">
            <div className="message-header">
              <span className="message-from">
                {agents[message.fromAgent]?.name || message.fromAgent}
              </span>
              {message.toAgent && (
                <>
                  <span className="message-arrow">→</span>
                  <span className="message-to">
                    {agents[message.toAgent]?.name || message.toAgent}
                  </span>
                </>
              )}
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemStats = () => (
    <div className="system-stats">
      <h3>系统统计</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">总代理数</div>
          <div className="stat-value">{systemStats.totalAgents}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">活跃代理</div>
          <div className="stat-value">{systemStats.activeAgents}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">完成任务</div>
          <div className="stat-value">{systemStats.completedTasks}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">系统健康</div>
          <div className="stat-value">
            {Math.round(systemStats.systemHealth * 100)}%
          </div>
        </div>
      </div>
      
      <div className="status-distribution">
        <h4>代理状态分布</h4>
        {Object.values(AgentStatus).map(status => {
          const count = agentArray.filter(agent => agent.status === status).length;
          if (count === 0) return null;
          
          return (
            <div key={status} className="status-item">
              <span 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(status) }}
              ></span>
              <span className="status-name">{getStatusText(status)}</span>
              <span className="status-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAgentDetail = () => {
    if (!selectedAgent) return null;

    return (
      <div className="agent-detail">
        <h3>代理详情</h3>
        <div className="detail-content">
          <div className="basic-info">
            <h4>{selectedAgent.name}</h4>
            <p className="role">{selectedAgent.role}</p>
            <div 
              className="status"
              style={{ color: getStatusColor(selectedAgent.status) }}
            >
              状态: {getStatusText(selectedAgent.status)}
            </div>
          </div>

          {selectedAgent.currentTask && (
            <div className="current-task">
              <h4>当前任务</h4>
              <div className="task-info">
                <div className="task-title">{selectedAgent.currentTask.title}</div>
                <div className="task-description">{selectedAgent.currentTask.description}</div>
                <div className="task-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${selectedAgent.currentTask.progress}%` }}
                    ></div>
                  </div>
                  <span>{Math.round(selectedAgent.currentTask.progress)}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="capabilities">
            <h4>能力</h4>
            <div className="capability-tags">
              {selectedAgent.capabilities.map(cap => (
                <span key={cap} className="capability-tag">{cap}</span>
              ))}
            </div>
          </div>

          <div className="metrics">
            <h4>性能指标</h4>
            <div className="metric-grid">
              <div className="metric-item">
                <span className="metric-label">完成任务</span>
                <span className="metric-value">{selectedAgent.metrics.tasksCompleted}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">进行中</span>
                <span className="metric-value">{selectedAgent.metrics.tasksInProgress}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">平均时长</span>
                <span className="metric-value">
                  {Math.round(selectedAgent.metrics.averageTaskDuration / 60000)}分钟
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">发送消息</span>
                <span className="metric-value">{selectedAgent.metrics.messagesSent}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Agent Factory</h2>
        {renderConnectionStatus()}
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab-button ${activePanel === 'agents' ? 'active' : ''}`}
          onClick={() => setActivePanel('agents')}
        >
          代理
        </button>
        <button 
          className={`tab-button ${activePanel === 'tasks' ? 'active' : ''}`}
          onClick={() => setActivePanel('tasks')}
        >
          任务
        </button>
        <button 
          className={`tab-button ${activePanel === 'messages' ? 'active' : ''}`}
          onClick={() => setActivePanel('messages')}
        >
          消息
        </button>
        <button 
          className={`tab-button ${activePanel === 'stats' ? 'active' : ''}`}
          onClick={() => setActivePanel('stats')}
        >
          统计
        </button>
      </div>

      <div className="sidebar-content">
        {selectedAgent && renderAgentDetail()}
        
        <div className="tab-content">
          {activePanel === 'agents' && renderAgentList()}
          {activePanel === 'tasks' && renderTaskQueue()}
          {activePanel === 'messages' && renderMessages()}
          {activePanel === 'stats' && renderSystemStats()}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;