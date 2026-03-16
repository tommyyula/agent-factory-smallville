import { useEffect, useState } from 'react'

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.ok && setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🏘️ Agent Factory Smallville</h1>
        <div className="status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          {connected ? '已连接' : '未连接'}
        </div>
      </header>
      
      <main className="main">
        <div className="game-area">
          <div className="placeholder">
            <h2>🎮 游戏场景</h2>
            <p>Phaser虚拟小镇将在这里渲染</p>
            <div className="progress">Phase 1 完成 ✅</div>
          </div>
        </div>
        
        <aside className="sidebar">
          <h3>控制面板</h3>
          <section>
            <h4>AI代理 (8)</h4>
            <ul>
              <li>🏭 仓储管家 - idle</li>
              <li>🚚 运输调度 - active</li>
              <li>💬 客服代表 - active</li>
              <li>📊 数据分析师 - thinking</li>
              <li>💻 开发工程师 - idle</li>
              <li>🔍 质检专员 - active</li>
              <li>📋 规划师 - thinking</li>
              <li>🤝 协调员 - active</li>
            </ul>
          </section>
          
          <section>
            <h4>系统状态</h4>
            <div className="stats">
              <div>活跃代理: 6/8</div>
              <div>今日任务: 47</div>
              <div>系统负载: 25%</div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App