import { useEffect } from 'react';
import Game from './components/Game.js';
import Sidebar from './components/Sidebar.js';
import { useAppStore } from './store/index.js';
import './App.css';

function App() {
  const mockMode = useAppStore(s => s.mockMode);
  const initMockMode = useAppStore(s => s.initMockMode);

  useEffect(() => {
    // Always start in mock mode for now (no backend required)
    initMockMode();
  }, [initMockMode]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">🏘️</span>
          <h1 className="app-title">Agent Factory Smallville</h1>
        </div>
        <div className="header-right">
          <span className={`status-badge ${mockMode ? 'mock' : 'live'}`}>
            {mockMode ? '🔶 模拟模式' : '🟢 已连接'}
          </span>
        </div>
      </header>
      <main className="app-main">
        <div className="game-panel">
          <Game />
        </div>
        <div className="sidebar-panel">
          <Sidebar />
        </div>
      </main>
    </div>
  );
}

export default App;
