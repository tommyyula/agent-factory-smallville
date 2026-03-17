import Phaser from 'phaser';
import { Agent, AgentStatus } from '@agent-factory/shared';

// Zone definitions for the town
const ZONES = [
  { id: 'warehouse', name: '仓储区', x: 900, y: 100, w: 280, h: 200, color: 0x8B4513, buildingColor: 0xA0522D },
  { id: 'transport', name: '运输区', x: 900, y: 380, w: 280, h: 200, color: 0x4169E1, buildingColor: 0x6495ED },
  { id: 'customer_service', name: '客服中心', x: 100, y: 100, w: 260, h: 180, color: 0x228B22, buildingColor: 0x32CD32 },
  { id: 'data_center', name: '数据中心', x: 100, y: 380, w: 260, h: 200, color: 0x483D8B, buildingColor: 0x7B68EE },
  { id: 'development', name: '开发中心', x: 500, y: 380, w: 280, h: 200, color: 0x8B008B, buildingColor: 0xBA55D3 },
  { id: 'common', name: '公共区域', x: 480, y: 100, w: 300, h: 180, color: 0x2F4F4F, buildingColor: 0x696969 },
  { id: 'rest', name: '休息区', x: 500, y: 650, w: 280, h: 160, color: 0x006400, buildingColor: 0x3CB371 },
  { id: 'quality', name: '质检区', x: 100, y: 650, w: 260, h: 160, color: 0xB8860B, buildingColor: 0xDAA520 },
];

const AGENT_COLORS = [
  0xFF6464, // Red - Warehouse
  0x6496FF, // Blue - Transport
  0x64FF64, // Green - Customer Service
  0xFFC864, // Orange - Data Analyst
  0x9664FF, // Purple - Developer
  0xFFFF64, // Yellow - Quality
  0xFF64FF, // Magenta - Planning
  0x64FFFF, // Cyan - Coordinator
];

const STATUS_COLORS: Record<string, number> = {
  idle: 0x808080,
  thinking: 0xFFD700,
  executing: 0x00FF00,
  communicating: 0x00BFFF,
  error: 0xFF0000,
  sleeping: 0x4444AA,
};

interface AgentGameObject {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  statusDot: Phaser.GameObjects.Graphics;
  roleLabel: Phaser.GameObjects.Text;
  thoughtBubble: Phaser.GameObjects.Container | null;
  targetX: number;
  targetY: number;
  moving: boolean;
  colorIndex: number;
}

export default class MainScene extends Phaser.Scene {
  private agentObjects = new Map<string, AgentGameObject>();
  private communicationLines: Phaser.GameObjects.Graphics | null = null;
  private selectedAgentId: string | null = null;
  private selectionIndicator: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // Draw the town
    this.drawTown();
    
    // Setup camera
    this.cameras.main.setBounds(0, 0, 1300, 900);
    this.cameras.main.setZoom(0.85);
    this.cameras.main.centerOn(650, 450);

    // Mouse wheel zoom
    this.input.on('wheel', (_p: any, _g: any, _dx: number, dy: number) => {
      const z = Phaser.Math.Clamp(this.cameras.main.zoom + (dy > 0 ? -0.05 : 0.05), 0.4, 2.0);
      this.cameras.main.setZoom(z);
    });

    // Drag to pan
    let dragStartX = 0, dragStartY = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      dragStartX = p.worldX;
      dragStartY = p.worldY;
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) {
        this.cameras.main.scrollX += dragStartX - p.worldX;
        this.cameras.main.scrollY += dragStartY - p.worldY;
      }
    });

    // Communication lines layer
    this.communicationLines = this.add.graphics();
    this.communicationLines.setDepth(5);

    // Selection indicator
    this.selectionIndicator = this.add.graphics();
    this.selectionIndicator.setDepth(25);

    console.log('✅ MainScene ready');
    this.events.emit('sceneReady');
  }

  update(_time: number, _delta: number): void {
    // Animate agent movement
    this.agentObjects.forEach((obj) => {
      if (obj.moving) {
        const dx = obj.targetX - obj.container.x;
        const dy = obj.targetY - obj.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) {
          obj.container.setPosition(obj.targetX, obj.targetY);
          obj.moving = false;
        } else {
          const speed = 1.5;
          obj.container.x += (dx / dist) * speed;
          obj.container.y += (dy / dist) * speed;
        }
      }

      // Bob the thought bubble
      if (obj.thoughtBubble) {
        obj.thoughtBubble.y = -50 + Math.sin(this.time.now / 500) * 3;
      }
    });

    // Update selection ring
    if (this.selectionIndicator && this.selectedAgentId) {
      const obj = this.agentObjects.get(this.selectedAgentId);
      if (obj) {
        this.selectionIndicator.clear();
        this.selectionIndicator.lineStyle(2, 0xFFFF00, 0.8);
        this.selectionIndicator.strokeCircle(obj.container.x, obj.container.y - 8, 22);
      }
    }
  }

  // --- Drawing the town ---

  private drawTown(): void {
    // Background grass
    const bg = this.add.graphics();
    bg.fillStyle(0x2d5a27, 1);
    bg.fillRect(0, 0, 1300, 900);
    bg.setDepth(-10);

    // Paths between zones (roads)
    const roads = this.add.graphics();
    roads.fillStyle(0x666666, 1);
    // Horizontal road
    roads.fillRect(0, 310, 1300, 50);
    // Vertical road
    roads.fillRect(420, 0, 50, 900);
    // Cross road
    roads.fillRect(820, 0, 50, 900);
    // Road markings
    roads.lineStyle(2, 0xCCCC00, 0.5);
    for (let x = 0; x < 1300; x += 30) {
      roads.lineBetween(x, 335, x + 15, 335);
    }
    for (let y = 0; y < 900; y += 30) {
      roads.lineBetween(445, y, 445, y + 15);
      roads.lineBetween(845, y, 845, y + 15);
    }
    roads.setDepth(-5);

    // Draw zones
    ZONES.forEach(zone => {
      this.drawZone(zone);
    });

    // Decorations — trees
    const treePositions = [
      [30, 40], [380, 50], [1250, 40], [30, 850], [1250, 850],
      [460, 640], [380, 640], [880, 640], [460, 300], [880, 300],
    ];
    treePositions.forEach(([tx, ty]) => this.drawTree(tx, ty));
  }

  private drawZone(zone: typeof ZONES[0]): void {
    const g = this.add.graphics();

    // Zone ground (slightly different shade)
    g.fillStyle(zone.color, 0.15);
    g.fillRoundedRect(zone.x, zone.y, zone.w, zone.h, 8);
    g.lineStyle(1, zone.color, 0.4);
    g.strokeRoundedRect(zone.x, zone.y, zone.w, zone.h, 8);
    g.setDepth(-3);

    // Building
    const bx = zone.x + zone.w / 2 - 40;
    const by = zone.y + 20;
    const bw = 80;
    const bh = 60;

    const building = this.add.graphics();
    // Building body
    building.fillStyle(zone.buildingColor, 0.9);
    building.fillRect(bx, by, bw, bh);
    // Roof
    building.fillStyle(zone.buildingColor, 1);
    building.fillTriangle(bx - 5, by, bx + bw / 2, by - 20, bx + bw + 5, by);
    // Door
    building.fillStyle(0x4a3728, 1);
    building.fillRect(bx + bw / 2 - 8, by + bh - 20, 16, 20);
    // Windows
    building.fillStyle(0xFFFF88, 0.8);
    building.fillRect(bx + 10, by + 10, 14, 14);
    building.fillRect(bx + bw - 24, by + 10, 14, 14);
    building.fillRect(bx + 10, by + 32, 14, 14);
    building.fillRect(bx + bw - 24, by + 32, 14, 14);
    building.setDepth(-2);

    // Zone label
    const label = this.add.text(zone.x + zone.w / 2, zone.y + zone.h - 15, zone.name, {
      fontSize: '13px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    label.setOrigin(0.5);
    label.setDepth(-1);
  }

  private drawTree(x: number, y: number): void {
    const tree = this.add.graphics();
    // Trunk
    tree.fillStyle(0x8B4513, 1);
    tree.fillRect(x - 3, y, 6, 12);
    // Leaves
    tree.fillStyle(0x1B5E20, 1);
    tree.fillCircle(x, y - 4, 12);
    tree.fillStyle(0x2E7D32, 0.8);
    tree.fillCircle(x - 4, y, 8);
    tree.fillCircle(x + 4, y, 8);
    tree.setDepth(-1);
  }

  // --- Agent management ---

  public addAgent(agent: Agent): void {
    if (this.agentObjects.has(agent.id)) return;

    const colorIndex = this.getAgentColorIndex(agent.type);
    const color = AGENT_COLORS[colorIndex] ?? 0xCCCCCC;
    const loc = this.getZonePosition(agent.location?.zone || 'common');

    const container = this.add.container(loc.x, loc.y);
    container.setDepth(10);
    container.setSize(32, 48);
    container.setInteractive();

    // Character body (simple pixel person)
    const body = this.add.graphics();
    this.drawCharacter(body, color);
    container.add(body);

    // Status dot
    const statusDot = this.add.graphics();
    const sc = STATUS_COLORS[agent.status] ?? 0x808080;
    statusDot.fillStyle(sc, 1);
    statusDot.fillCircle(12, -22, 5);
    statusDot.lineStyle(1, 0x000000, 0.5);
    statusDot.strokeCircle(12, -22, 5);
    container.add(statusDot);

    // Name label
    const label = this.add.text(0, 18, agent.name, {
      fontSize: '10px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    });
    label.setOrigin(0.5, 0);
    container.add(label);

    // Role label
    const roleLabel = this.add.text(0, 30, agent.role || '', {
      fontSize: '9px',
      color: '#AAAAAA',
      stroke: '#000000',
      strokeThickness: 1,
    });
    roleLabel.setOrigin(0.5, 0);
    container.add(roleLabel);

    // Click handler
    container.on('pointerdown', () => {
      this.selectAgent(agent.id);
    });

    // Hover effect
    container.on('pointerover', () => {
      container.setScale(1.15);
    });
    container.on('pointerout', () => {
      container.setScale(1.0);
    });

    const obj: AgentGameObject = {
      container,
      body,
      label,
      statusDot,
      roleLabel,
      thoughtBubble: null,
      targetX: loc.x,
      targetY: loc.y,
      moving: false,
      colorIndex,
    };

    this.agentObjects.set(agent.id, obj);

    // Show thought if agent is working
    if (agent.status === AgentStatus.EXECUTING || agent.status === AgentStatus.THINKING) {
      const taskDesc = (agent as any).currentTaskTitle || agent.role || '工作中...';
      this.showThoughtBubble(agent.id, taskDesc, 8000);
    }
  }

  private drawCharacter(g: Phaser.GameObjects.Graphics, color: number): void {
    // Head
    g.fillStyle(0xFFDBB0, 1); // skin
    g.fillRect(-5, -24, 10, 10);
    // Hair
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(-6, -26, 12, 4);
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(-3, -20, 2, 2);
    g.fillRect(1, -20, 2, 2);
    // Body (colored by role)
    g.fillStyle(color, 1);
    g.fillRect(-6, -14, 12, 14);
    // Arms
    g.fillStyle(color, 0.8);
    g.fillRect(-9, -12, 3, 10);
    g.fillRect(6, -12, 3, 10);
    // Legs
    g.fillStyle(0x2a2a5a, 1);
    g.fillRect(-5, 0, 4, 8);
    g.fillRect(1, 0, 4, 8);
    // Shoes
    g.fillStyle(0x333333, 1);
    g.fillRect(-6, 7, 5, 3);
    g.fillRect(1, 7, 5, 3);
  }

  public updateAgent(agentId: string, agent: Agent): void {
    const obj = this.agentObjects.get(agentId);
    if (!obj) return;

    // Update status dot
    const sc = STATUS_COLORS[agent.status] ?? 0x808080;
    obj.statusDot.clear();
    obj.statusDot.fillStyle(sc, 1);
    obj.statusDot.fillCircle(12, -22, 5);
    obj.statusDot.lineStyle(1, 0x000000, 0.5);
    obj.statusDot.strokeCircle(12, -22, 5);

    // Move to new zone if changed
    const targetZone = agent.location?.zone || 'common';
    const targetPos = this.getZonePosition(targetZone);
    
    // Add some randomness within the zone
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 60 + 40;

    obj.targetX = targetPos.x + offsetX;
    obj.targetY = targetPos.y + offsetY;
    obj.moving = true;

    // Manage thought bubbles based on status
    if (agent.status === AgentStatus.EXECUTING || agent.status === AgentStatus.THINKING) {
      const text = (agent as any).currentTaskTitle || agent.role || '工作中...';
      this.showThoughtBubble(agentId, text, 6000);
    } else if (agent.status === AgentStatus.IDLE || agent.status === AgentStatus.SLEEPING) {
      this.hideThoughtBubble(agentId);
    }
  }

  public showThoughtBubble(agentId: string, content: string, duration: number): void {
    const obj = this.agentObjects.get(agentId);
    if (!obj) return;
    this.hideThoughtBubble(agentId);

    const bubble = this.add.container(0, -50);

    // Bubble background
    const bg = this.add.graphics();
    const text = content.length > 30 ? content.substring(0, 27) + '...' : content;
    const textObj = this.add.text(0, -5, text, {
      fontSize: '9px',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 90 },
    });
    textObj.setOrigin(0.5);

    const tw = Math.max(textObj.width + 16, 40);
    const th = textObj.height + 12;
    bg.fillStyle(0xFFFFFF, 0.92);
    bg.fillRoundedRect(-tw / 2, -th / 2 - 5, tw, th, 6);
    // Tail
    bg.fillTriangle(-4, th / 2 - 5, 4, th / 2 - 5, 0, th / 2 + 5);

    bubble.add([bg, textObj]);
    bubble.setDepth(20);

    obj.container.add(bubble);
    obj.thoughtBubble = bubble;

    this.time.delayedCall(duration, () => {
      this.hideThoughtBubble(agentId);
    });
  }

  public hideThoughtBubble(agentId: string): void {
    const obj = this.agentObjects.get(agentId);
    if (obj?.thoughtBubble) {
      obj.thoughtBubble.destroy();
      obj.thoughtBubble = null;
    }
  }

  public showCommunicationLine(fromId: string, toId: string, duration: number = 2000): void {
    const from = this.agentObjects.get(fromId);
    const to = this.agentObjects.get(toId);
    if (!from || !to || !this.communicationLines) return;

    const g = this.add.graphics();
    g.setDepth(5);

    // Dashed line
    g.lineStyle(2, 0x00BFFF, 0.7);
    const x1 = from.container.x, y1 = from.container.y - 8;
    const x2 = to.container.x, y2 = to.container.y - 8;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const dashLen = 8;
    const steps = Math.floor(len / dashLen);
    for (let i = 0; i < steps; i += 2) {
      const sx = x1 + (dx * i) / steps;
      const sy = y1 + (dy * i) / steps;
      const ex = x1 + (dx * (i + 1)) / steps;
      const ey = y1 + (dy * (i + 1)) / steps;
      g.lineBetween(sx, sy, ex, ey);
    }

    // Animated dot
    const dot = this.add.circle(x1, y1, 4, 0x00FFFF, 1);
    dot.setDepth(6);
    this.tweens.add({
      targets: dot,
      x: x2, y: y2,
      duration,
      ease: 'Power2',
      onComplete: () => { dot.destroy(); g.destroy(); }
    });
  }

  public selectAgent(agentId: string | null): void {
    this.selectedAgentId = agentId;

    if (this.selectionIndicator) {
      this.selectionIndicator.clear();
    }

    if (agentId) {
      const obj = this.agentObjects.get(agentId);
      if (obj) {
        this.cameras.main.pan(obj.container.x, obj.container.y, 400, 'Power2');
      }
    }

    this.events.emit('agentSelected', agentId);
  }

  public moveAgent(agentId: string, _from: any, to: any): void {
    const obj = this.agentObjects.get(agentId);
    if (!obj) return;
    obj.targetX = to.x;
    obj.targetY = to.y;
    obj.moving = true;
  }

  // --- Helpers ---

  private getAgentColorIndex(type: string): number {
    const map: Record<string, number> = {
      warehouse: 0, transportation: 1, transport: 1,
      customer_service: 2, data_analyst: 3, data_analysis: 3,
      developer: 4, development: 4, quality: 5,
      planning: 6, coordinator: 7,
    };
    return map[type] ?? 0;
  }

  private getZonePosition(zoneId: string): { x: number; y: number } {
    const zone = ZONES.find(z => z.id === zoneId);
    if (zone) {
      return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
    }
    // Default to common area
    return { x: 630, y: 190 };
  }
}
