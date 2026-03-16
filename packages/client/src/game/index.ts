import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';

export interface GameInstance {
  game: Phaser.Game;
  scene: MainScene;
  destroy: () => void;
}

export function createGame(parent: string | HTMLElement): GameInstance {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: parent,
    backgroundColor: '#2c3e50',
    pixelArt: true, // Important for crisp pixel art
    antialias: false,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: MainScene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true
    }
  };

  const game = new Phaser.Game(config);
  const scene = game.scene.getScene('MainScene') as MainScene;

  console.log('🎮 Phaser game initialized');

  return {
    game,
    scene,
    destroy: () => {
      console.log('🎮 Destroying Phaser game');
      game.destroy(true);
    }
  };
}