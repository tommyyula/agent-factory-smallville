import Phaser from 'phaser';
import { PixelArtGenerator } from '../graphics/pixel-art-generator.js';
import { Agent, AgentStatus, Task } from '@agent-factory/shared';

export default class MainScene extends Phaser.Scene {
  private pixelGenerator!: PixelArtGenerator;
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private agents = new Map<string, Phaser.GameObjects.Sprite>();
  private agentLabels = new Map<string, Phaser.GameObjects.Text>();
  private agentStatusIndicators = new Map<string, Phaser.GameObjects.Sprite>();
  private thoughtBubbles = new Map<string, Phaser.GameObjects.Container>();
  private communicationLines: Phaser.GameObjects.Graphics[] = [];
  
  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    // No external assets needed - everything generated programmatically
  }

  create(): void {
    console.log('🎮 MainScene created');
    
    // Initialize pixel art generator
    this.pixelGenerator = new PixelArtGenerator(this);
    
    // Generate all graphics
    this.generateAllGraphics();
    
    // Create the town
    this.createTownTilemap();
    
    // Setup camera
    this.setupCamera();
    
    // Setup input
    this.setupInput();
    
    // Setup animation configs
    this.setupAnimations();
    
    console.log('✅ MainScene ready');
  }

  private generateAllGraphics(): void {
    console.log('🎨 Generating pixel art...');
    
    // Generate tileset
    this.pixelGenerator.generateTileset();
    
    // Generate buildings
    this.pixelGenerator.generateBuildings();
    
    // Generate agent sprites
    this.pixelGenerator.generateAgentSprites();
    
    // Generate UI elements
    this.pixelGenerator.generateUIElements();
    
    console.log('✅ Pixel art generated');
  }

  private createTownTilemap(): void {
    const mapWidth = 48;
    const mapHeight = 36;
    const tileWidth = 32;
    const tileHeight = 32;
    
    // Create tilemap
    this.tilemap = this.make.tilemap({
      data: this.pixelGenerator.generateTownTilemap(),
      tileWidth: tileWidth,
      tileHeight: tileHeight,
      width: mapWidth,
      height: mapHeight
    });
    
    // Create tileset
    const tileset = this.tilemap.addTilesetImage('tiles', null, tileWidth, tileHeight, 0, 0, 0);
    
    // Add tile textures to tileset
    tileset.setImage(this.textures.get('tile-grass'), 0);
    tileset.setImage(this.textures.get('tile-path'), 1);
    tileset.setImage(this.textures.get('tile-road'), 2);
    tileset.setImage(this.textures.get('tile-water'), 3);
    
    // Create layer
    const groundLayer = this.tilemap.createLayer(0, tileset, 0, 0);
    
    if (groundLayer) {
      groundLayer.setDepth(-10);
    }
    
    // Add buildings
    this.addBuildings();
    
    // Add zone labels
    this.addZoneLabels();
  }

  private addBuildings(): void {
    const buildings = [
      { x: 1100, y: 450, texture: 'building-warehouse', label: '仓库' },
      { x: 700, y: 300, texture: 'building-office', label: '客服中心' },
      { x: 1100, y: 800, texture: 'building-datacenter', label: '数据中心' },
      { x: 300, y: 850, texture: 'building-office', label: '开发中心' },
      { x: 1100, y: 650, texture: 'building-transport', label: '运输枢纽' },
      { x: 200, y: 200, texture: 'building-house', label: '宿舍' },
      { x: 500, y: 500, texture: 'building-meeting', label: '会议室' }
    ];

    buildings.forEach(building => {
      const sprite = this.add.sprite(building.x, building.y, building.texture);
      sprite.setOrigin(0.5, 0.5);
      sprite.setDepth(0);
      
      // Add building label
      const label = this.add.text(building.x, building.y + 60, building.label, {
        fontSize: '14px',
        color: '#000000',
        backgroundColor: '#FFFFFF',
        padding: { x: 4, y: 2 }
      });
      label.setOrigin(0.5);
      label.setDepth(5);
    });
  }

  private addZoneLabels(): void {
    const zones = [
      { x: 1150, y: 380, text: '仓储区', color: '#FFE4B5' },
      { x: 1150, y: 580, text: '运输区', color: '#E6F3FF' },
      { x: 750, y: 250, text: '客服区', color: '#E6FFE6' },
      { x: 1150, y: 750, text: '数据中心区', color: '#F0E6FF' },
      { x: 350, y: 780, text: '开发区', color: '#FFE6F0' },
      { x: 600, y: 450, text: '公共区域', color: '#F5F5F5' }
    ];

    zones.forEach(zone => {
      const background = this.add.graphics();
      background.fillStyle(Phaser.Display.Color.HexStringToColor(zone.color).color, 0.3);
      background.fillRoundedRect(-60, -12, 120, 24, 4);
      
      const text = this.add.text(0, 0, zone.text, {
        fontSize: '16px',
        color: '#333333',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      const container = this.add.container(zone.x, zone.y, [background, text]);
      container.setDepth(1);
    });
  }

  private setupCamera(): void {
    // Set camera bounds to tilemap size
    const mapWidth = 48 * 32;
    const mapHeight = 36 * 32;
    
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setZoom(0.8);
    
    // Center camera on the town
    this.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
    
    // Enable camera controls
    const cursors = this.input.keyboard?.createCursorKeys();
    
    if (cursors) {
      // Camera movement with arrow keys
      this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
        const speed = 5;
        switch (event.code) {
          case 'ArrowLeft':
            this.cameras.main.scrollX -= speed;
            break;
          case 'ArrowRight':
            this.cameras.main.scrollX += speed;
            break;
          case 'ArrowUp':
            this.cameras.main.scrollY -= speed;
            break;
          case 'ArrowDown':
            this.cameras.main.scrollY += speed;
            break;
        }
      });
    }
    
    // Mouse wheel zoom
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
      const zoomChange = deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + zoomChange, 0.4, 2.0);
      this.cameras.main.setZoom(newZoom);
    });
  }

  private setupInput(): void {
    // Click handling for agent selection
    this.input.on('gameobjectdown', (pointer: any, gameObject: any) => {
      if (gameObject.getData && gameObject.getData('agentId')) {
        this.selectAgent(gameObject.getData('agentId'));
      }
    });
    
    // Scene click for deselection
    this.input.on('pointerdown', (pointer: any) => {
      if (pointer.downElement === this.game.canvas) {
        this.selectAgent(null);
      }
    });
  }

  private setupAnimations(): void {
    // Setup agent animations for all agent types
    for (let i = 0; i < 8; i++) {
      const agentKey = `agent-${i}`;
      
      // Idle animations (4 directions)
      this.anims.create({
        key: `${agentKey}-idle-down`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [0, 1] }),
        frameRate: 2,
        repeat: -1
      });
      
      this.anims.create({
        key: `${agentKey}-idle-up`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [12, 13] }),
        frameRate: 2,
        repeat: -1
      });
      
      this.anims.create({
        key: `${agentKey}-idle-left`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [24, 25] }),
        frameRate: 2,
        repeat: -1
      });
      
      this.anims.create({
        key: `${agentKey}-idle-right`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [36, 37] }),
        frameRate: 2,
        repeat: -1
      });
      
      // Walking animations
      this.anims.create({
        key: `${agentKey}-walk-down`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [0, 1, 2, 3] }),
        frameRate: 8,
        repeat: -1
      });
      
      this.anims.create({
        key: `${agentKey}-walk-up`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [12, 13, 14, 15] }),
        frameRate: 8,
        repeat: -1
      });
      
      this.anims.create({
        key: `${agentKey}-walk-left`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [24, 25, 26, 27] }),
        frameRate: 8,
        repeat: -1
      });
      
      this.anims.create({
        key: `${agentKey}-walk-right`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [36, 37, 38, 39] }),
        frameRate: 8,
        repeat: -1
      });
      
      // Working animation
      this.anims.create({
        key: `${agentKey}-working`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [32, 33, 34, 35] }),
        frameRate: 4,
        repeat: -1
      });
      
      // Thinking animation
      this.anims.create({
        key: `${agentKey}-thinking`,
        frames: this.anims.generateFrameNumbers(agentKey, { frames: [8, 9, 10, 11] }),
        frameRate: 2,
        repeat: -1
      });
    }
  }

  // Public methods for external control
  public addAgent(agent: Agent): void {
    const agentTypeIndex = this.getAgentTypeIndex(agent.type);
    const spriteKey = `agent-${agentTypeIndex}`;
    
    // Create agent sprite
    const sprite = this.add.sprite(agent.location.x, agent.location.y, spriteKey);
    sprite.setOrigin(0.5, 1.0);
    sprite.setDepth(10);
    sprite.setInteractive();
    sprite.setData('agentId', agent.id);
    
    // Create name label
    const nameLabel = this.add.text(agent.location.x, agent.location.y - 60, agent.name, {
      fontSize: '12px',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 4, y: 2 }
    });
    nameLabel.setOrigin(0.5);
    nameLabel.setDepth(15);
    
    // Create status indicator
    const statusKey = this.getStatusIndicatorKey(agent.status);
    const statusIndicator = this.add.sprite(agent.location.x + 16, agent.location.y - 48, statusKey);
    statusIndicator.setOrigin(0.5);
    statusIndicator.setDepth(16);
    
    // Store references
    this.agents.set(agent.id, sprite);
    this.agentLabels.set(agent.id, nameLabel);
    this.agentStatusIndicators.set(agent.id, statusIndicator);
    
    // Set initial animation
    this.updateAgentAnimation(agent.id, agent.status, false);
    
    console.log(`➕ Added agent: ${agent.name} at (${agent.location.x}, ${agent.location.y})`);
  }

  public updateAgent(agentId: string, agent: Agent): void {
    const sprite = this.agents.get(agentId);
    const label = this.agentLabels.get(agentId);
    const indicator = this.agentStatusIndicators.get(agentId);
    
    if (sprite && label && indicator) {
      // Update position
      sprite.setPosition(agent.location.x, agent.location.y);
      label.setPosition(agent.location.x, agent.location.y - 60);
      indicator.setPosition(agent.location.x + 16, agent.location.y - 48);
      
      // Update status indicator
      const statusKey = this.getStatusIndicatorKey(agent.status);
      indicator.setTexture(statusKey);
      
      // Update animation
      this.updateAgentAnimation(agentId, agent.status, false);
    }
  }

  public moveAgent(agentId: string, fromLocation: any, toLocation: any): void {
    const sprite = this.agents.get(agentId);
    const label = this.agentLabels.get(agentId);
    const indicator = this.agentStatusIndicators.get(agentId);
    
    if (sprite && label && indicator) {
      // Calculate direction for animation
      const deltaX = toLocation.x - fromLocation.x;
      const deltaY = toLocation.y - fromLocation.y;
      let direction = 'down';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      
      // Start walking animation
      const agentTypeIndex = this.getAgentTypeFromSprite(sprite);
      sprite.play(`agent-${agentTypeIndex}-walk-${direction}`);
      
      // Tween movement
      const duration = 2000; // 2 seconds
      
      this.tweens.add({
        targets: sprite,
        x: toLocation.x,
        y: toLocation.y,
        duration: duration,
        ease: 'Linear',
        onComplete: () => {
          // Switch back to idle
          sprite.play(`agent-${agentTypeIndex}-idle-${direction}`);
        }
      });
      
      this.tweens.add({
        targets: label,
        x: toLocation.x,
        y: toLocation.y - 60,
        duration: duration,
        ease: 'Linear'
      });
      
      this.tweens.add({
        targets: indicator,
        x: toLocation.x + 16,
        y: toLocation.y - 48,
        duration: duration,
        ease: 'Linear'
      });
      
      console.log(`🚶 Moving agent ${agentId} to (${toLocation.x}, ${toLocation.y})`);
    }
  }

  public showThoughtBubble(agentId: string, content: string, duration: number): void {
    const sprite = this.agents.get(agentId);
    if (!sprite) return;
    
    // Remove existing thought bubble
    this.hideThoughtBubble(agentId);
    
    // Create thought bubble container
    const bubble = this.add.container(sprite.x, sprite.y - 80);
    
    // Background bubble
    const bubbleSprite = this.add.sprite(0, 0, 'thought-bubble');
    bubbleSprite.setScale(1);
    
    // Text content (truncated to fit)
    const text = this.add.text(0, -5, this.truncateText(content, 60), {
      fontSize: '10px',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 70 }
    });
    text.setOrigin(0.5);
    
    bubble.add([bubbleSprite, text]);
    bubble.setDepth(20);
    
    this.thoughtBubbles.set(agentId, bubble);
    
    // Auto-hide after duration
    this.time.delayedCall(duration, () => {
      this.hideThoughtBubble(agentId);
    });
    
    console.log(`💭 Showing thought bubble for ${agentId}: "${content}"`);
  }

  public hideThoughtBubble(agentId: string): void {
    const bubble = this.thoughtBubbles.get(agentId);
    if (bubble) {
      bubble.destroy();
      this.thoughtBubbles.delete(agentId);
    }
  }

  public showCommunicationLine(fromAgentId: string, toAgentId: string, duration: number = 2000): void {
    const fromSprite = this.agents.get(fromAgentId);
    const toSprite = this.agents.get(toAgentId);
    
    if (fromSprite && toSprite) {
      const line = this.add.graphics();
      line.lineStyle(3, 0x00BFFF, 0.8);
      line.beginPath();
      line.moveTo(fromSprite.x, fromSprite.y - 24);
      line.lineTo(toSprite.x, toSprite.y - 24);
      line.strokePath();
      line.setDepth(5);
      
      // Add animated dots
      const dots = [];
      for (let i = 0; i < 3; i++) {
        const dot = this.add.circle(fromSprite.x, fromSprite.y - 24, 3, 0x00BFFF);
        dot.setDepth(6);
        dots.push(dot);
        
        this.tweens.add({
          targets: dot,
          x: toSprite.x,
          y: toSprite.y - 24,
          duration: duration,
          delay: i * 200,
          ease: 'Power2',
          onComplete: () => {
            dot.destroy();
          }
        });
      }
      
      this.communicationLines.push(line);
      
      // Remove line after duration
      this.time.delayedCall(duration, () => {
        line.destroy();
        const index = this.communicationLines.indexOf(line);
        if (index > -1) {
          this.communicationLines.splice(index, 1);
        }
      });
      
      console.log(`📞 Communication line: ${fromAgentId} → ${toAgentId}`);
    }
  }

  public selectAgent(agentId: string | null): void {
    // Remove previous selection indicators
    this.agents.forEach(sprite => {
      sprite.clearTint();
    });
    
    if (agentId) {
      const sprite = this.agents.get(agentId);
      if (sprite) {
        // Highlight selected agent
        sprite.setTint(0xffff88);
        
        // Focus camera on agent
        this.cameras.main.pan(sprite.x, sprite.y, 500, 'Power2');
        
        console.log(`👆 Selected agent: ${agentId}`);
        
        // Emit selection event (will be handled by React)
        this.events.emit('agentSelected', agentId);
      }
    }
  }

  // Helper methods
  private getAgentTypeIndex(type: string): number {
    const typeMap: Record<string, number> = {
      'warehouse': 0,
      'transportation': 1,
      'customer_service': 2,
      'data_analyst': 3,
      'developer': 4,
      'quality': 5,
      'planning': 6,
      'coordinator': 7
    };
    return typeMap[type] || 0;
  }

  private getAgentTypeFromSprite(sprite: Phaser.GameObjects.Sprite): number {
    const textureKey = sprite.texture.key;
    return parseInt(textureKey.split('-')[1]) || 0;
  }

  private getStatusIndicatorKey(status: AgentStatus): string {
    const statusMap: Record<string, string> = {
      'idle': 'status-idle',
      'thinking': 'status-thinking',
      'executing': 'status-executing',
      'communicating': 'status-communicating',
      'error': 'status-error',
      'sleeping': 'status-sleeping'
    };
    return statusMap[status] || 'status-idle';
  }

  private updateAgentAnimation(agentId: string, status: AgentStatus, isMoving: boolean): void {
    const sprite = this.agents.get(agentId);
    if (!sprite) return;
    
    const agentTypeIndex = this.getAgentTypeFromSprite(sprite);
    const direction = 'down'; // Default direction
    
    let animationKey = '';
    
    if (isMoving) {
      animationKey = `agent-${agentTypeIndex}-walk-${direction}`;
    } else {
      switch (status) {
        case AgentStatus.THINKING:
          animationKey = `agent-${agentTypeIndex}-thinking`;
          break;
        case AgentStatus.EXECUTING:
          animationKey = `agent-${agentTypeIndex}-working`;
          break;
        case AgentStatus.COMMUNICATING:
          animationKey = `agent-${agentTypeIndex}-idle-${direction}`;
          break;
        default:
          animationKey = `agent-${agentTypeIndex}-idle-${direction}`;
      }
    }
    
    if (sprite.anims.currentAnim?.key !== animationKey) {
      sprite.play(animationKey);
    }
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }
}