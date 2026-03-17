import React from 'react';
import { useAppStore } from '../store/index.js';
import { Agent, AgentStatus, TaskStatus } from '@agent-factory/shared';

const STATUS_EMOJI: Record<string, string> = {
  idle: '💤', thinking: '💭', executing: '⚙️',
  communicating: '💬', error: '❌', sleeping: '😴',
};

const STATUS_LABEL: Record<string, string> = {
  idle: '空闲', thinking: '思考中', executing: '执行中',
  communicating: '通信中', error: '错误', sleeping: '休眠',
};

const STATUS_COLOR: Record<string, string> = {
  idle: '#888', thinking: '#FFD700', executing: '#4CAF50',
  communicating: '#00BCD4', error: '#F44336', sleeping: '#5C6BC0',
};

const Sidebar: React.FC = () => {
  const agents = useAppStore(s => s.agents);
  const tasks = useAppStore(s => s.tasks);
  const messages = useAppStore(s => s.messages);
  const selectedAgentId = useAppStore(s => s.selectedAgentId);
  const activePanel = useAppStore(s => s.activePanel);
  const setActivePanel = useAppStore(s => s.setActivePanel);
  const selectAgent = useAppStore(s => s.selectAgent);

  const agentList = Object.values(agents);
  const taskList = Object.values(tasks);
  const selectedAgent = selectedAgentId ? agents[selectedAgentId] : null;

  const tabs: { key: typeof activePanel; label: string; icon: string }[] = [
    { key: 'agents', label: '代理', icon: '🤖' },
    { key: 'tasks', label: '任务', icon: '📋' },
    { key: 'messages', label: '消息', icon: '💬' },
    { key: 'stats', label: '统计', icon: '📊' },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActivePanel(t.key)}
            style={{
              ...styles.tab,
              ...(activePanel === t.key ? styles.tabActive : {}),
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Selected Agent Detail */}
      {selectedAgent && (
        <div style={styles.detail}>
          <div style={styles.detailHeader}>
            <span style={{ fontSize: 18 }}>👤</span>
            <div>
              <div style={styles.detailName}>{selectedAgent.name}</div>
              <div style={styles.detailRole}>{selectedAgent.role}</div>
            </div>
            <button onClick={() => selectAgent(null)} style={styles.closeBtn}>✕</button>
          </div>
          <div style={styles.detailStatus}>
            <span style={{ color: STATUS_COLOR[selectedAgent.status] }}>
              {STATUS_EMOJI[selectedAgent.status]} {STATUS_LABEL[selectedAgent.status]}
            </span>
          </div>
          {selectedAgent.metrics && (
            <div style={styles.metrics}>
              <div style={styles.metricRow}>
                <span>完成任务</span><span>{selectedAgent.metrics.tasksCompleted}</span>
              </div>
              <div style={styles.metricRow}>
                <span>发送消息</span><span>{selectedAgent.metrics.messagesSent}</span>
              </div>
              <div style={styles.metricRow}>
                <span>失败任务</span><span style={{ color: selectedAgent.metrics.tasksFailed > 0 ? '#F44336' : '#888' }}>{selectedAgent.metrics.tasksFailed}</span>
              </div>
            </div>
          )}
          <div style={styles.divider} />
        </div>
      )}

      {/* Panel Content */}
      <div style={styles.content}>
        {activePanel === 'agents' && (
          <div>
            <div style={styles.sectionTitle}>代理列表 ({agentList.length})</div>
            {agentList.map(a => (
              <AgentItem key={a.id} agent={a} selected={a.id === selectedAgentId} onClick={() => selectAgent(a.id)} />
            ))}
          </div>
        )}

        {activePanel === 'tasks' && (
          <div>
            <div style={styles.sectionTitle}>任务队列 ({taskList.length})</div>
            {taskList.map(t => {
              const assignee = agents[t.assignedTo || ''];
              return (
                <div key={t.id} style={styles.taskItem}>
                  <div style={styles.taskTitle}>{t.title}</div>
                  <div style={styles.taskMeta}>
                    <span style={{ color: t.status === TaskStatus.IN_PROGRESS ? '#4CAF50' : '#888' }}>
                      {t.status === TaskStatus.IN_PROGRESS ? '进行中' : t.status === TaskStatus.COMPLETED ? '已完成' : '待处理'}
                    </span>
                    {assignee && <span style={{ color: '#aaa' }}> · {assignee.name}</span>}
                  </div>
                  {t.status === TaskStatus.IN_PROGRESS && (
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${t.progress || 0}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activePanel === 'messages' && (
          <div>
            <div style={styles.sectionTitle}>消息流</div>
            {messages.length === 0 && <div style={styles.empty}>暂无消息</div>}
            {messages.map(m => (
              <div key={m.id} style={styles.messageItem}>
                <div style={styles.messageContent}>{m.content}</div>
                <div style={styles.messageTime}>
                  {new Date(m.timestamp).toLocaleTimeString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        )}

        {activePanel === 'stats' && (
          <div>
            <div style={styles.sectionTitle}>系统统计</div>
            <div style={styles.statGrid}>
              <StatCard label="总代理数" value={agentList.length} icon="🤖" />
              <StatCard label="活跃代理" value={agentList.filter(a => a.status !== AgentStatus.IDLE && a.status !== AgentStatus.SLEEPING).length} icon="🟢" color="#4CAF50" />
              <StatCard label="进行中任务" value={taskList.filter(t => t.status === TaskStatus.IN_PROGRESS).length} icon="⚡" color="#FF9800" />
              <StatCard label="已完成任务" value={taskList.filter(t => t.status === TaskStatus.COMPLETED).length} icon="✅" color="#66BB6A" />
              <StatCard label="消息总数" value={messages.length} icon="💬" color="#29B6F6" />
              <StatCard label="错误代理" value={agentList.filter(a => a.status === AgentStatus.ERROR).length} icon="❌" color="#F44336" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AgentItem: React.FC<{ agent: Agent; selected: boolean; onClick: () => void }> = ({ agent, selected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      ...styles.agentItem,
      ...(selected ? styles.agentItemSelected : {}),
    }}
  >
    <div style={styles.agentInfo}>
      <span style={styles.agentName}>{agent.name}</span>
      <span style={styles.agentRole}>{agent.role}</span>
    </div>
    <span style={{ color: STATUS_COLOR[agent.status], fontSize: 16 }}>
      {STATUS_EMOJI[agent.status]}
    </span>
  </div>
);

const StatCard: React.FC<{ label: string; value: number; icon: string; color?: string }> = ({ label, value, icon, color }) => (
  <div style={styles.statCard}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: color || '#e0e0e0' }}>{value}</div>
    <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  sidebar: { display: 'flex', flexDirection: 'column', height: '100%' },
  tabs: { display: 'flex', borderBottom: '1px solid #2a2a4a', flexShrink: 0 },
  tab: {
    flex: 1, padding: '10px 4px', fontSize: 12, background: 'none',
    border: 'none', color: '#888', cursor: 'pointer', borderBottom: '2px solid transparent',
  },
  tabActive: { color: '#c0c0ff', borderBottomColor: '#7B68EE' },
  content: { flex: 1, overflow: 'auto', padding: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 10 },
  agentItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 10px', marginBottom: 4, borderRadius: 6,
    background: '#1e1e38', cursor: 'pointer', transition: 'background 0.15s',
  },
  agentItemSelected: { background: '#2a2a5a', outline: '1px solid #7B68EE' },
  agentInfo: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  agentName: { fontSize: 13, fontWeight: 500, color: '#e0e0e0' },
  agentRole: { fontSize: 11, color: '#888' },
  taskItem: { padding: '8px 10px', marginBottom: 6, background: '#1e1e38', borderRadius: 6 },
  taskTitle: { fontSize: 13, fontWeight: 500, color: '#e0e0e0', marginBottom: 4 },
  taskMeta: { fontSize: 11, marginBottom: 4 },
  progressBar: { height: 4, background: '#333', borderRadius: 2, overflow: 'hidden' as const },
  progressFill: { height: '100%', background: '#7B68EE', borderRadius: 2, transition: 'width 0.3s' },
  messageItem: { padding: '6px 10px', marginBottom: 4, background: '#1e1e38', borderRadius: 6 },
  messageContent: { fontSize: 12, color: '#ccc', marginBottom: 2 },
  messageTime: { fontSize: 10, color: '#666' },
  empty: { fontSize: 13, color: '#666', textAlign: 'center' as const, padding: 20 },
  detail: { padding: 12, background: '#1a1a35', borderBottom: '1px solid #2a2a4a' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: 10 },
  detailName: { fontSize: 15, fontWeight: 600, color: '#e0e0e0' },
  detailRole: { fontSize: 12, color: '#888' },
  closeBtn: { marginLeft: 'auto', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 },
  detailStatus: { marginTop: 8, fontSize: 13 },
  metrics: { marginTop: 8 },
  metricRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', padding: '2px 0' },
  divider: { height: 1, background: '#2a2a4a', marginTop: 8 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
  statCard: {
    background: '#1e1e38', borderRadius: 8, padding: 12,
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4,
  },
};

export default Sidebar;
