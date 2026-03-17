import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';

export interface GameInstance {
  game: Phaser.Game;
  getScene: () => MainScene | null;
  destroy: () => void;
}

export function createGame(parent: string | HTMLElement): GameInstance {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    width: 1024,
    height: 768,
    parent: parent,
    backgroundColor: '#1a1a2e',
    pixelArt: true,
    antialias: false,
    scene: [MainScene],
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

  return {
    game,
    getScene: () => game.scene.getScene('MainScene') as MainScene | null,
    destroy: () => {
      game.destroy(true);
    }
  };
}
