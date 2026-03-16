import Phaser from 'phaser';

export interface PixelColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export class PixelArtGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Generate tileset for the town
  generateTileset(): void {
    this.createGrassTile();
    this.createPathTile();
    this.createRoadTile();
    this.createWaterTile();
  }

  // Generate building sprites
  generateBuildings(): void {
    this.createWarehouseSprite();
    this.createOfficeSprite();
    this.createDataCenterSprite();
    this.createHouseSprite();
    this.createTransportHubSprite();
    this.createMeetingRoomSprite();
  }

  // Generate agent sprites (8 different colored characters)
  generateAgentSprites(): void {
    const agentColors = [
      { r: 255, g: 100, b: 100 }, // Red - Warehouse
      { r: 100, g: 150, b: 255 }, // Blue - Transport
      { r: 100, g: 255, b: 100 }, // Green - Customer Service
      { r: 255, g: 200, b: 100 }, // Orange - Data Analyst
      { r: 150, g: 100, b: 255 }, // Purple - Developer
      { r: 255, g: 255, b: 100 }, // Yellow - Quality
      { r: 255, g: 100, b: 255 }, // Magenta - Planning
      { r: 100, g: 255, b: 255 }  // Cyan - Coordinator
    ];

    agentColors.forEach((color, index) => {
      this.createAgentSprite(`agent-${index}`, color);
    });
  }

  // Generate UI elements
  generateUIElements(): void {
    this.createThoughtBubble();
    this.createStatusIndicators();
  }

  // Tile generators
  private createGrassTile(): void {
    const graphics = this.scene.add.graphics();
    const tileSize = 32;
    
    // Base grass color
    const grassColor = 0x4a7c59;
    graphics.fillStyle(grassColor);
    graphics.fillRect(0, 0, tileSize, tileSize);
    
    // Add some texture with darker pixels
    const darkGrass = 0x3d6b4c;
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      graphics.fillStyle(darkGrass);
      graphics.fillRect(x, y, 1, 1);
    }
    
    // Add lighter highlights
    const lightGrass = 0x5a9c69;
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      graphics.fillStyle(lightGrass);
      graphics.fillRect(x, y, 1, 1);
    }

    graphics.generateTexture('tile-grass', tileSize, tileSize);
    graphics.destroy();
  }

  private createPathTile(): void {
    const graphics = this.scene.add.graphics();
    const tileSize = 32;
    
    // Base path color (light brown)
    const pathColor = 0xd2b48c;
    graphics.fillStyle(pathColor);
    graphics.fillRect(0, 0, tileSize, tileSize);
    
    // Add stones/texture
    const stoneColor = 0xc4a576;
    for (let i = 0; i < 15; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      graphics.fillStyle(stoneColor);
      graphics.fillRect(x, y, 1, 1);
    }

    graphics.generateTexture('tile-path', tileSize, tileSize);
    graphics.destroy();
  }

  private createRoadTile(): void {
    const graphics = this.scene.add.graphics();
    const tileSize = 32;
    
    // Dark gray road
    const roadColor = 0x555555;
    graphics.fillStyle(roadColor);
    graphics.fillRect(0, 0, tileSize, tileSize);
    
    // Road markings (dashed line)
    graphics.fillStyle(0xffffff);
    graphics.fillRect(14, 8, 4, 4);
    graphics.fillRect(14, 20, 4, 4);

    graphics.generateTexture('tile-road', tileSize, tileSize);
    graphics.destroy();
  }

  private createWaterTile(): void {
    const graphics = this.scene.add.graphics();
    const tileSize = 32;
    
    // Blue water
    const waterColor = 0x4a90e2;
    graphics.fillStyle(waterColor);
    graphics.fillRect(0, 0, tileSize, tileSize);
    
    // Water highlights
    const lightWater = 0x6bb6ff;
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      graphics.fillStyle(lightWater);
      graphics.fillRect(x, y, 1, 1);
    }

    graphics.generateTexture('tile-water', tileSize, tileSize);
    graphics.destroy();
  }

  // Building generators
  private createWarehouseSprite(): void {
    const graphics = this.scene.add.graphics();
    const width = 128;
    const height = 96;
    
    // Main building (brown)
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(0, 32, width, height - 32);
    
    // Roof (red)
    graphics.fillStyle(0xD2691E);
    graphics.fillPolygon([
      0, 32,
      width/2, 0,
      width, 32,
      0, 32
    ]);
    
    // Door
    graphics.fillStyle(0x654321);
    graphics.fillRect(width/2 - 8, height - 24, 16, 24);
    
    // Windows
    graphics.fillStyle(0x87CEEB);
    graphics.fillRect(20, 50, 12, 12);
    graphics.fillRect(width - 32, 50, 12, 12);
    
    // Loading dock
    graphics.fillStyle(0x696969);
    graphics.fillRect(0, height - 16, 32, 16);

    graphics.generateTexture('building-warehouse', width, height);
    graphics.destroy();
  }

  private createOfficeSprite(): void {
    const graphics = this.scene.add.graphics();
    const width = 96;
    const height = 80;
    
    // Main building (gray)
    graphics.fillStyle(0x708090);
    graphics.fillRect(0, 0, width, height);
    
    // Windows grid
    graphics.fillStyle(0x87CEEB);
    for (let row = 1; row < 4; row++) {
      for (let col = 1; col < 4; col++) {
        graphics.fillRect(col * 24 - 8, row * 16, 8, 8);
      }
    }
    
    // Entrance
    graphics.fillStyle(0x2F4F4F);
    graphics.fillRect(width/2 - 12, height - 16, 24, 16);

    graphics.generateTexture('building-office', width, height);
    graphics.destroy();
  }

  private createDataCenterSprite(): void {
    const graphics = this.scene.add.graphics();
    const width = 128;
    const height = 128;
    
    // Main building (dark blue)
    graphics.fillStyle(0x2F4F4F);
    graphics.fillRect(0, 0, width, height);
    
    // Server racks (vertical lines)
    graphics.fillStyle(0x00FF00);
    for (let i = 16; i < width - 16; i += 16) {
      for (let j = 16; j < height - 16; j += 8) {
        graphics.fillRect(i, j, 2, 4);
        graphics.fillRect(i + 4, j, 2, 4);
      }
    }
    
    // Cooling vents
    graphics.fillStyle(0x696969);
    graphics.fillRect(8, 8, width - 16, 4);
    graphics.fillRect(8, height - 12, width - 16, 4);

    graphics.generateTexture('building-datacenter', width, height);
    graphics.destroy();
  }

  private createHouseSprite(): void {
    const graphics = this.scene.add.graphics();
    const width = 64;
    const height = 64;
    
    // Main house (beige)
    graphics.fillStyle(0xF5DEB3);
    graphics.fillRect(0, 24, width, height - 24);
    
    // Roof (dark red)
    graphics.fillStyle(0x8B0000);
    graphics.fillPolygon([
      0, 24,
      width/2, 0,
      width, 24,
      0, 24
    ]);
    
    // Door
    graphics.fillStyle(0x654321);
    graphics.fillRect(width/2 - 6, height - 16, 12, 16);
    
    // Windows
    graphics.fillStyle(0x87CEEB);
    graphics.fillRect(12, 36, 8, 8);
    graphics.fillRect(width - 20, 36, 8, 8);

    graphics.generateTexture('building-house', width, height);
    graphics.destroy();
  }

  private createTransportHubSprite(): void {
    const graphics = this.scene.add.graphics();
    const width = 128;
    const height = 96;
    
    // Main building (green)
    graphics.fillStyle(0x228B22);
    graphics.fillRect(0, 16, width, height - 16);
    
    // Roof
    graphics.fillStyle(0x006400);
    graphics.fillRect(0, 0, width, 16);
    
    // Loading bays
    graphics.fillStyle(0x808080);
    for (let i = 0; i < 4; i++) {
      graphics.fillRect(i * 32, height - 24, 28, 24);
    }
    
    // Truck symbols
    graphics.fillStyle(0xFF4500);
    graphics.fillRect(8, height - 16, 12, 8);
    graphics.fillRect(40, height - 16, 12, 8);

    graphics.generateTexture('building-transport', width, height);
    graphics.destroy();
  }

  private createMeetingRoomSprite(): void {
    const graphics = this.scene.add.graphics();
    const width = 80;
    const height = 64;
    
    // Main room (light blue)
    graphics.fillStyle(0xADD8E6);
    graphics.fillRect(0, 0, width, height);
    
    // Table (brown)
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(width/2 - 16, height/2 - 8, 32, 16);
    
    // Chairs (black dots)
    graphics.fillStyle(0x000000);
    const chairPositions = [
      [width/2 - 20, height/2 - 4],
      [width/2 + 16, height/2 - 4],
      [width/2 - 4, height/2 - 16],
      [width/2 - 4, height/2 + 8]
    ];
    
    chairPositions.forEach(([x, y]) => {
      graphics.fillRect(x, y, 4, 4);
    });

    graphics.generateTexture('building-meeting', width, height);
    graphics.destroy();
  }

  // Agent sprite generator
  private createAgentSprite(key: string, color: PixelColor): void {
    const graphics = this.scene.add.graphics();
    const frameWidth = 32;
    const frameHeight = 48;
    const totalFrames = 52; // 13 animations × 4 frames
    
    const spriteWidth = frameWidth * 4; // 4 frames per row
    const spriteHeight = frameHeight * 13; // 13 rows total
    
    // Create spritesheet with all animations
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 4; col++) {
        const x = col * frameWidth;
        const y = row * frameHeight;
        
        this.drawAgentFrame(graphics, x, y, frameWidth, frameHeight, color, row, col);
      }
    }

    graphics.generateTexture(key, spriteWidth, spriteHeight);
    graphics.destroy();
  }

  private drawAgentFrame(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: PixelColor,
    animation: number,
    frame: number
  ): void {
    const pixelSize = 2;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Convert color to hex
    const agentColor = (color.r << 16) + (color.g << 8) + color.b;
    const shadowColor = 0x333333;
    const skinColor = 0xFFDBB3;
    const darkSkin = 0xE6C2A6;
    
    // Head
    graphics.fillStyle(skinColor);
    graphics.fillRect(centerX - 4, y + 8, 8, 8);
    
    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillRect(centerX - 3, y + 10, 1, 1);
    graphics.fillRect(centerX + 2, y + 10, 1, 1);
    
    // Body
    graphics.fillStyle(agentColor);
    graphics.fillRect(centerX - 6, y + 16, 12, 16);
    
    // Arms - animation affects arm position
    if (animation === 1 || animation === 2 || animation === 3 || animation === 4) { // Walking
      const armOffset = frame % 2 === 0 ? 0 : 1;
      graphics.fillRect(centerX - 8, y + 18 + armOffset, 2, 8);
      graphics.fillRect(centerX + 6, y + 18 - armOffset, 2, 8);
    } else if (animation === 8) { // Working
      graphics.fillRect(centerX - 8, y + 16, 2, 10);
      graphics.fillRect(centerX + 6, y + 20, 2, 6);
    } else { // Idle
      graphics.fillRect(centerX - 8, y + 18, 2, 8);
      graphics.fillRect(centerX + 6, y + 18, 2, 8);
    }
    
    // Legs - walking animation
    if (animation === 1 || animation === 2 || animation === 3 || animation === 4) { // Walking
      const legOffset = frame % 2 === 0 ? 1 : -1;
      graphics.fillStyle(0x0000FF); // Blue pants
      graphics.fillRect(centerX - 4, y + 32 + legOffset, 3, 8);
      graphics.fillRect(centerX + 1, y + 32 - legOffset, 3, 8);
    } else {
      graphics.fillStyle(0x0000FF); // Blue pants
      graphics.fillRect(centerX - 4, y + 32, 3, 8);
      graphics.fillRect(centerX + 1, y + 32, 3, 8);
    }
    
    // Feet
    graphics.fillStyle(0x000000);
    graphics.fillRect(centerX - 4, y + 40, 4, 2);
    graphics.fillRect(centerX + 1, y + 40, 4, 2);
    
    // Status effect overlay
    if (animation === 9) { // Error state
      graphics.fillStyle(0xFF0000);
      graphics.fillRect(x, y, width, height);
      graphics.setBlendMode(Phaser.BlendModes.MULTIPLY);
    }
  }

  private createThoughtBubble(): void {
    const graphics = this.scene.add.graphics();
    const width = 80;
    const height = 40;
    
    // Bubble background
    graphics.fillStyle(0xFFFFFF, 0.9);
    graphics.fillRoundedRect(0, 0, width, height - 8, 8);
    
    // Bubble tail
    graphics.fillTriangle(width/2 - 4, height - 8, width/2 + 4, height - 8, width/2, height);
    
    // Border
    graphics.lineStyle(2, 0x000000);
    graphics.strokeRoundedRect(0, 0, width, height - 8, 8);
    graphics.strokeTriangle(width/2 - 4, height - 8, width/2 + 4, height - 8, width/2, height);

    graphics.generateTexture('thought-bubble', width, height);
    graphics.destroy();
  }

  private createStatusIndicators(): void {
    const indicators = [
      { key: 'status-idle', color: 0x808080 },
      { key: 'status-thinking', color: 0xFFD700 },
      { key: 'status-executing', color: 0x00FF00 },
      { key: 'status-communicating', color: 0x00BFFF },
      { key: 'status-error', color: 0xFF0000 },
      { key: 'status-sleeping', color: 0x666666 }
    ];

    indicators.forEach(indicator => {
      const graphics = this.scene.add.graphics();
      
      // Small circular indicator
      graphics.fillStyle(indicator.color);
      graphics.fillCircle(8, 8, 6);
      
      // Border
      graphics.lineStyle(1, 0x000000);
      graphics.strokeCircle(8, 8, 6);
      
      graphics.generateTexture(indicator.key, 16, 16);
      graphics.destroy();
    });
  }

  // Generate the complete town tilemap data
  generateTownTilemap(): number[][] {
    const width = 48;
    const height = 36;
    const map: number[][] = [];
    
    // Initialize with grass (tile 0)
    for (let y = 0; y < height; y++) {
      map[y] = [];
      for (let x = 0; x < width; x++) {
        map[y][x] = 0; // Grass
      }
    }
    
    // Add paths (tile 1)
    // Horizontal main road
    for (let x = 0; x < width; x++) {
      map[18][x] = 2; // Road
      map[17][x] = 1; // Path
      map[19][x] = 1; // Path
    }
    
    // Vertical main road
    for (let y = 0; y < height; y++) {
      map[y][24] = 2; // Road
      map[y][23] = 1; // Path
      map[y][25] = 1; // Path
    }
    
    // Paths to buildings
    const pathConnections = [
      // Warehouse area
      { from: [24, 18], to: [36, 18] },
      { from: [36, 18], to: [36, 15] },
      
      // Transport area
      { from: [36, 18], to: [36, 22] },
      
      // Data center
      { from: [36, 22], to: [36, 28] },
      
      // Customer service
      { from: [24, 18], to: [20, 18] },
      { from: [20, 18], to: [20, 10] },
      
      // Development area
      { from: [24, 18], to: [12, 18] },
      { from: [12, 18], to: [12, 28] }
    ];
    
    pathConnections.forEach(connection => {
      this.drawPath(map, connection.from, connection.to, 1);
    });
    
    // Add water feature in the center park
    for (let y = 20; y < 24; y++) {
      for (let x = 14; x < 18; x++) {
        map[y][x] = 3; // Water
      }
    }
    
    return map;
  }

  private drawPath(map: number[][], from: number[], to: number[], tileType: number): void {
    const [startX, startY] = from;
    const [endX, endY] = to;
    
    // Simple line drawing algorithm
    if (startX === endX) {
      // Vertical line
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);
      for (let y = minY; y <= maxY; y++) {
        if (map[y] && map[y][startX] !== undefined) {
          map[y][startX] = tileType;
        }
      }
    } else if (startY === endY) {
      // Horizontal line
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      for (let x = minX; x <= maxX; x++) {
        if (map[startY] && map[startY][x] !== undefined) {
          map[startY][x] = tileType;
        }
      }
    }
  }
}