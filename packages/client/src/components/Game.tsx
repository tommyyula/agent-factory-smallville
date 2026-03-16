import React, { useEffect, useRef, useState } from 'react';
import { createGame, GameInstance } from '../game/index.js';
import { useAppStore } from '../store/index.js';
import { wsService } from '../services/websocket.js';
import { Agent } from '@agent-factory/shared';

interface GameProps {
  className?: string;
}

const Game: React.FC<GameProps> = ({ className }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<GameInstance | null>(null);
  const [gameReady, setGameReady] = useState(false);
  
  // Subscribe to store
  const agents = useAppStore(state => state.agents);
  const selectedAgentId = useAppStore(state => state.selectedAgentId);
  const selectAgent = useAppStore(state => state.selectAgent);

  // Initialize game
  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      console.log('🎮 Initializing Phaser game');
      
      try {
        const gameInstance = createGame(gameContainerRef.current);
        gameInstanceRef.current = gameInstance;
        
        // Set up game scene reference for WebSocket service
        wsService.setGameScene(gameInstance.scene);
        
        // Set up event listeners
        gameInstance.scene.events.on('agentSelected', (agentId: string) => {
          selectAgent(agentId);
          wsService.selectAgent(agentId);
        });
        
        // Wait for scene to be ready
        gameInstance.scene.events.once('create', () => {
          console.log('✅ Game scene created');
          setGameReady(true);
        });
        
      } catch (error) {
        console.error('❌ Failed to initialize game:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (gameInstanceRef.current) {
        console.log('🧹 Cleaning up game instance');
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
        setGameReady(false);
      }
    };
  }, [selectAgent]);

  // Update agents in game when store changes
  useEffect(() => {
    if (gameReady && gameInstanceRef.current) {
      const gameScene = gameInstanceRef.current.scene;
      const agentArray = Object.values(agents);
      
      console.log(`🎮 Updating ${agentArray.length} agents in game`);
      
      agentArray.forEach((agent: Agent) => {
        // Check if agent already exists in game
        const existingAgents = (gameScene as any).agents;
        
        if (existingAgents && existingAgents.has(agent.id)) {
          // Update existing agent
          gameScene.updateAgent(agent.id, agent);
        } else {
          // Add new agent
          gameScene.addAgent(agent);
        }
      });
    }
  }, [agents, gameReady]);

  // Handle agent selection from outside
  useEffect(() => {
    if (gameReady && gameInstanceRef.current && selectedAgentId) {
      gameInstanceRef.current.scene.selectAgent(selectedAgentId);
    }
  }, [selectedAgentId, gameReady]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.game.scale.refresh();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`game-container ${className || ''}`}>
      <div 
        ref={gameContainerRef} 
        className="game-canvas"
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#2c3e50',
          position: 'relative'
        }}
      />
      
      {!gameReady && (
        <div className="game-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>加载游戏场景中...</p>
          </div>
        </div>
      )}
      
      <div className="game-controls">
        <div className="control-hint">
          <small>
            🎮 使用方向键移动视角 | 鼠标滚轮缩放 | 点击代理查看详情
          </small>
        </div>
      </div>
    </div>
  );
};

export default Game;