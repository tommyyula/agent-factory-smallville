import React, { useEffect, useState } from 'react';
import Game from './components/Game.js';
import Sidebar from './components/Sidebar.js';
import { useAppStore } from './store/index.js';
import { wsService } from './services/websocket.js';
import './App.css';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    sidebarVisible, 
    setSidebarVisible, 
    mockMode, 
    connected,
    initMockData 
  } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing Agent Factory Smallville');
      
      try {
        // Try to connect to WebSocket server
        await wsService.connect();
        
        // Fetch initial data if connected
        if (wsService.isConnected()) {
          await fetchInitialData();
        }
        
      } catch (error) {
        console.log('🎭 WebSocket connection failed, using mock mode');
        // Mock mode will be enabled automatically by WebSocket service
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, [initMockData]);

  const fetchInitialData = async () => {
    try {
      console.log('📥 Fetching initial data from API');
      
      // Fetch agents
      const agentsResponse = await fetch('/api/agents');
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        if (agentsData.success) {
          useAppStore.getState().setAgents(agentsData.data.agents);
          console.log(`✅ Loaded ${agentsData.data.agents.length} agents`);
        }
      }

      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks');
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        if (tasksData.success) {
          useAppStore.getState().setTasks(tasksData.data.tasks);
          console.log(`✅ Loaded ${tasksData.data.tasks.length} tasks`);
        }
      }

      // Fetch system stats
      const statsResponse = await fetch('/api/system/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          useAppStore.getState().updateSystemStats(statsData.data);
          console.log('✅ Loaded system stats');
        }
      }

    } catch (error) {
      console.error('❌ Error fetching initial data:', error);
      setError('无法加载初始数据');
    }
  };

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h2>Agent Factory Smallville</h2>
          <p>正在初始化系统...</p>
          {mockMode && <p className="mock-notice">演示模式</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <div className="error-container">
          <h2>🚨 初始化失败</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={handleToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1>Agent Factory Smallville</h1>
          {mockMode && <span className="mode-badge">演示模式</span>}
          {connected && !mockMode && <span className="mode-badge connected">已连接</span>}
        </div>
        
        <div className="header-right">
          <div className="header-info">
            <span className="agent-count">
              代理: {Object.keys(useAppStore.getState().agents).length}
            </span>
            <span className="task-count">
              任务: {Object.keys(useAppStore.getState().tasks).length}
            </span>
          </div>
          
          <div className="header-actions">
            <button 
              className="refresh-button"
              onClick={handleRefresh}
              title="刷新页面"
            >
              🔄
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout">
          <div className={`game-section ${sidebarVisible ? 'with-sidebar' : 'full-width'}`}>
            <Game className="game-canvas-container" />
          </div>
          
          {sidebarVisible && (
            <div className="sidebar-section">
              <Sidebar />
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span>Agent Factory Smallville Dashboard</span>
            {mockMode && <span> • 演示模式（无需后端服务器）</span>}
          </div>
          <div className="footer-right">
            <span>🤖 AI Agent 可视化监控平台</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;