import React, { useEffect, useRef, useState } from 'react';
import { createGame, GameInstance } from '../game/index.js';
import { useAppStore } from '../store/index.js';
import { Agent } from '@agent-factory/shared';
import MainScene from '../game/scenes/MainScene.js';

const Game: React.FC<{ className?: string }> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameInstance | null>(null);
  const sceneRef = useRef<MainScene | null>(null);
  const [ready, setReady] = useState(false);

  const agents = useAppStore(s => s.agents);
  const selectAgent = useAppStore(s => s.selectAgent);

  // Init game
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const gi = createGame(containerRef.current);
    gameRef.current = gi;

    // Wait for scene to actually be ready
    const check = setInterval(() => {
      const scene = gi.getScene();
      if (scene && scene.scene.isActive()) {
        clearInterval(check);
        sceneRef.current = scene;

        scene.events.on('agentSelected', (id: string | null) => {
          selectAgent(id);
        });

        // Also listen for sceneReady event (belt + suspenders)
        setReady(true);
        console.log('✅ Game scene connected');
      }
    }, 100);

    return () => {
      clearInterval(check);
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
        sceneRef.current = null;
        setReady(false);
      }
    };
  }, [selectAgent]);

  // Sync agents to game
  useEffect(() => {
    if (!ready || !sceneRef.current) return;
    const scene = sceneRef.current;
    const agentArr = Object.values(agents);

    agentArr.forEach((agent: Agent) => {
      scene.addAgent(agent); // addAgent checks if already exists
      scene.updateAgent(agent.id, agent);
    });
  }, [agents, ready]);

  return (
    <div className={`game-wrapper ${className || ''}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', backgroundColor: '#1a1a2e' }}
      />
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#1a1a2e', color: '#ccc', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: 20 }}>🏘️ Agent Factory Smallville</div>
          <div style={{ fontSize: 14, opacity: 0.6 }}>加载中...</div>
        </div>
      )}
      {ready && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          fontSize: 11, color: '#888', pointerEvents: 'none',
        }}>
          🎮 拖动平移 | 滚轮缩放 | 点击代理查看详情
        </div>
      )}
    </div>
  );
};

export default Game;
