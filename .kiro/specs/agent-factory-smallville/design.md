# Agent Factory Smallville Dashboard - System Design

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────┐    WebSocket    ┌──────────────────┐    Runtime State    ┌─────────────────┐
│  Frontend       │◄──────────────►│  Backend API     │◄─────────────────►│  Agent Runtime  │
│  (Phaser+React) │                │  (Express+WS)    │                     │  (Mock Seeder)  │
│                 │                │                  │                     │                 │
│ ┌─────────────┐ │    REST API    │ ┌──────────────┐ │    Event Bus       │ ┌─────────────┐ │
│ │ Game Scene  │ │◄──────────────►│ │ HTTP Server  │ │◄─────────────────►│ │ Agent Pool  │ │
│ │ (Phaser 3)  │ │                │ │ (Express)    │ │                     │ │ (5-8 Agents)│ │
│ └─────────────┘ │                │ └──────────────┘ │                     │ └─────────────┘ │
│ ┌─────────────┐ │                │ ┌──────────────┐ │                     │ ┌─────────────┐ │
│ │ UI Shell    │ │                │ │ WebSocket    │ │                     │ │ Task Queue  │ │
│ │ (React)     │ │                │ │ Hub          │ │                     │ │ Manager     │ │
│ └─────────────┘ │                │ └──────────────┘ │                     │ └─────────────┘ │
└─────────────────┘                └──────────────────┘                     └─────────────────┘
```

### 1.2 Data Flow Architecture

```
Agent State Changes → Runtime Event Bus → WebSocket Hub → Client State Manager → Phaser Scene Update
      ↓                       ↓                  ↓                    ↓                   ↓
Memory Updates → Reflection Engine → Broadcast Event → React UI Update → Visual Feedback
```

### 1.3 Component Communication

- **Frontend Phaser ↔ React**: Custom event bridge with shared Zustand store
- **Frontend ↔ Backend**: WebSocket for real-time + REST for CRUD operations
- **Backend ↔ Runtime**: Event-driven architecture with pub/sub pattern
- **Inter-Agent**: Message passing through central communication hub

## 2. Project Structure (Monorepo)

```
agent-factory-smallville/
├── README.md
├── package.json
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── packages/
│   ├── server/                          # Backend Node.js API
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                 # Entry point
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   └── websocket.ts
│   │   │   ├── routes/
│   │   │   │   ├── agents.ts            # Agent CRUD endpoints
│   │   │   │   ├── tasks.ts             # Task management endpoints
│   │   │   │   ├── scene.ts             # Scene configuration endpoints
│   │   │   │   └── analytics.ts         # Analytics endpoints
│   │   │   ├── websocket/
│   │   │   │   ├── server.ts            # WebSocket server setup
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── agent-events.ts  # Agent event handlers
│   │   │   │   │   ├── client-commands.ts # Client command handlers
│   │   │   │   │   └── system-events.ts # System event handlers
│   │   │   │   └── protocols/
│   │   │   │       ├── message-types.ts # Message type definitions
│   │   │   │       └── validation.ts    # Message validation
│   │   │   ├── services/
│   │   │   │   ├── agent-service.ts     # Agent business logic
│   │   │   │   ├── task-service.ts      # Task management logic
│   │   │   │   ├── memory-service.ts    # Memory management
│   │   │   │   ├── communication-service.ts # Inter-agent communication
│   │   │   │   └── scene-service.ts     # Scene configuration logic
│   │   │   ├── models/
│   │   │   │   ├── agent.ts             # Agent data model
│   │   │   │   ├── task.ts              # Task data model
│   │   │   │   ├── memory.ts            # Memory data model
│   │   │   │   ├── message.ts           # Message data model
│   │   │   │   └── scene.ts             # Scene configuration model
│   │   │   ├── runtime/
│   │   │   │   ├── agent-runtime.ts     # Agent lifecycle management
│   │   │   │   ├── task-executor.ts     # Task execution engine
│   │   │   │   ├── memory-engine.ts     # Observation→Reflection→Plan engine
│   │   │   │   ├── communication-hub.ts # Message routing
│   │   │   │   └── state-manager.ts     # Global state management
│   │   │   ├── mock/
│   │   │   │   ├── agent-seeder.ts      # Mock agent creation
│   │   │   │   ├── task-generator.ts    # Mock task generation
│   │   │   │   ├── behavior-simulator.ts # Agent behavior simulation
│   │   │   │   └── data/
│   │   │   │       ├── agent-templates.json # Pre-defined agent types
│   │   │   │       ├── task-templates.json  # Task templates
│   │   │   │       └── dialogue-samples.json # Communication samples
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── helpers.ts
│   │   │   └── types/
│   │   │       ├── api.ts               # API type definitions
│   │   │       ├── websocket.ts         # WebSocket message types
│   │   │       └── shared.ts            # Shared types
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   └── dist/                        # Built output
│   │
│   └── client/                          # Frontend React + Phaser app
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/
│       │   ├── assets/
│       │   │   ├── sprites/             # Agent sprite sheets
│       │   │   │   ├── warehouse-worker.png
│       │   │   │   ├── transport-manager.png
│       │   │   │   ├── customer-service.png
│       │   │   │   ├── data-analyst.png
│       │   │   │   └── developer.png
│       │   │   ├── tilesets/            # Town tilemap assets
│       │   │   │   ├── buildings.png    # Building tiles
│       │   │   │   ├── ground.png       # Ground/road tiles
│       │   │   │   ├── props.png        # Decorative props
│       │   │   │   └── ui-elements.png  # UI overlay elements
│       │   │   ├── audio/
│       │   │   │   ├── ambient.mp3
│       │   │   │   ├── notification.mp3
│       │   │   │   └── error.mp3
│       │   │   └── tilemaps/
│       │   │       ├── town-layout.json # Tiled map export
│       │   │       └── collision-map.json # Pathfinding data
│       │   └── favicon.ico
│       ├── src/
│       │   ├── main.tsx                 # Entry point
│       │   ├── App.tsx                  # Root React component
│       │   ├── game/                    # Phaser 3 game logic
│       │   │   ├── index.ts             # Game initialization
│       │   │   ├── scenes/
│       │   │   │   ├── PreloadScene.ts  # Asset preloading
│       │   │   │   ├── MainScene.ts     # Main town scene
│       │   │   │   └── UIScene.ts       # UI overlay scene
│       │   │   ├── entities/
│       │   │   │   ├── Agent.ts         # Agent sprite class
│       │   │   │   ├── Building.ts      # Building sprite class
│       │   │   │   ├── ThoughtBubble.ts # Thought bubble UI
│       │   │   │   └── CommunicationLine.ts # Agent communication visual
│       │   │   ├── systems/
│       │   │   │   ├── MovementSystem.ts # Agent movement/pathfinding
│       │   │   │   ├── AnimationSystem.ts # Sprite animations
│       │   │   │   ├── InteractionSystem.ts # Click/hover handling
│       │   │   │   └── EffectsSystem.ts # Visual effects (particles, etc.)
│       │   │   ├── managers/
│       │   │   │   ├── AssetManager.ts  # Asset loading management
│       │   │   │   ├── SceneManager.ts  # Scene transitions
│       │   │   │   └── InputManager.ts  # Input handling
│       │   │   └── utils/
│       │   │       ├── pathfinding.ts   # A* pathfinding algorithm
│       │   │       ├── coordinates.ts   # Coordinate transformations
│       │   │       └── constants.ts     # Game constants
│       │   ├── components/              # React UI components
│       │   │   ├── layout/
│       │   │   │   ├── Layout.tsx       # Main layout component
│       │   │   │   ├── Sidebar.tsx      # Control panel sidebar
│       │   │   │   └── Header.tsx       # Top navigation bar
│       │   │   ├── panels/
│       │   │   │   ├── AgentDetailPanel.tsx # Agent info popup
│       │   │   │   ├── SystemStatusPanel.tsx # System health display
│       │   │   │   ├── TaskQueuePanel.tsx # Global task queue
│       │   │   │   └── CommunicationPanel.tsx # Message log
│       │   │   ├── controls/
│       │   │   │   ├── SceneControls.tsx # Scene manipulation controls
│       │   │   │   ├── FilterControls.tsx # Agent/event filtering
│       │   │   │   ├── PlaybackControls.tsx # Time manipulation
│       │   │   │   └── ConfigurationPanel.tsx # System configuration
│       │   │   ├── visualization/
│       │   │   │   ├── AgentMetrics.tsx # Agent performance charts
│       │   │   │   ├── CommunicationGraph.tsx # Network visualization
│       │   │   │   └── SystemLoad.tsx   # System performance metrics
│       │   │   └── common/
│       │   │       ├── Button.tsx
│       │   │       ├── Modal.tsx
│       │   │       ├── LoadingSpinner.tsx
│       │   │       └── Tooltip.tsx
│       │   ├── hooks/                   # React custom hooks
│       │   │   ├── useWebSocket.ts      # WebSocket connection management
│       │   │   ├── useAgentData.ts      # Agent data management
│       │   │   ├── useGameEngine.ts     # Phaser integration
│       │   │   └── useRealTimeUpdates.ts # Real-time state management
│       │   ├── services/                # API services
│       │   │   ├── api.ts               # REST API client
│       │   │   ├── websocket.ts         # WebSocket client
│       │   │   ├── agent-service.ts     # Agent-related API calls
│       │   │   └── task-service.ts      # Task-related API calls
│       │   ├── store/                   # State management
│       │   │   ├── index.ts             # Store configuration
│       │   │   ├── slices/
│       │   │   │   ├── agents.ts        # Agent state slice
│       │   │   │   ├── tasks.ts         # Task state slice
│       │   │   │   ├── scene.ts         # Scene state slice
│       │   │   │   ├── ui.ts            # UI state slice
│       │   │   │   └── websocket.ts     # WebSocket connection state
│       │   │   └── middleware/
│       │   │       ├── websocket.ts     # WebSocket middleware
│       │   │       └── persistence.ts   # Local storage middleware
│       │   ├── types/                   # TypeScript type definitions
│       │   │   ├── agent.ts
│       │   │   ├── task.ts
│       │   │   ├── game.ts
│       │   │   └── api.ts
│       │   ├── utils/
│       │   │   ├── game-bridge.ts       # React ↔ Phaser communication
│       │   │   ├── formatters.ts        # Data formatting utilities
│       │   │   ├── validators.ts        # Client-side validation
│       │   │   └── constants.ts         # Application constants
│       │   └── styles/
│       │       ├── globals.css          # Global styles
│       │       ├── components/          # Component-specific styles
│       │       └── game.css             # Game canvas styling
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       └── dist/                        # Built output
│
├── docs/                                # Documentation
│   ├── api.md                          # API documentation
│   ├── deployment.md                   # Deployment guide
│   ├── development.md                  # Development setup
│   └── architecture.md                 # Architecture documentation
│
└── scripts/                            # Build and deployment scripts
    ├── build.sh                       # Build script
    ├── deploy.sh                      # Deployment script
    ├── dev.sh                         # Development server script
    └── seed-data.sh                   # Mock data seeding script
```

## 3. Data Models

### 3.1 Core Entity Models

```typescript
// Agent Entity (Enhanced)
interface Agent {
  // Identity
  id: string;
  name: string;
  type: AgentType;
  role: string;
  description: string;
  
  // State Management
  status: AgentStatus;
  previousStatus: AgentStatus;
  statusHistory: StatusChange[];
  
  // Location & Movement
  location: Location;
  targetLocation?: Location;
  movementSpeed: number;
  
  // Task Management
  currentTask?: Task;
  taskQueue: Task[];
  taskHistory: Task[];
  
  // Capabilities & Configuration
  capabilities: Capability[];
  configuration: AgentConfiguration;
  
  // Memory & Learning
  memories: Memory[];
  memoryCapacity: number;
  learningRate: number;
  
  // Performance Metrics
  metrics: AgentMetrics;
  
  // Visual Representation
  visual: AgentVisual;
  
  // Timestamps
  createdAt: Date;
  lastActiveAt: Date;
  lastStatusChange: Date;
}

// Location & Spatial Data
interface Location {
  x: number;
  y: number;
  z?: number;
  building?: string;
  zone: ZoneType;
  metadata: Record<string, any>;
}

interface Building {
  id: string;
  name: string;
  type: BuildingType;
  location: Location;
  size: { width: number; height: number };
  capacity: number;
  occupants: string[];
  facilities: Facility[];
  accessRules: AccessRule[];
}

// Task System
interface Task {
  // Identity
  id: string;
  title: string;
  description: string;
  type: TaskType;
  
  // Status & Lifecycle
  status: TaskStatus;
  priority: Priority;
  complexity: number;
  
  // Assignment
  assignedTo?: string;
  createdBy: string;
  
  // Dependencies & Relationships
  dependencies: string[];
  subtasks: Task[];
  parentTask?: string;
  
  // Timing
  estimatedDuration: number;
  actualDuration?: number;
  deadlineAt?: Date;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Resources
  requiredCapabilities: Capability[];
  resourceRequirements: Resource[];
  
  // Progress & Results
  progress: number;
  results?: TaskResult[];
  
  // Communication
  communications: Message[];
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
}

// Memory System (Based on Smallville Paper)
interface Memory {
  id: string;
  agentId: string;
  type: MemoryType;
  content: string;
  importance: number; // 1-10 scale
  timestamp: Date;
  
  // Relationships
  relatedMemories: string[];
  relatedAgents: string[];
  relatedTasks: string[];
  
  // Context
  location?: Location;
  situation: string;
  emotions: string[];
  
  // Reflection System
  reflections: Reflection[];
  planInfluence: number;
  
  // Search & Retrieval
  embeddings?: number[];
  tags: string[];
  keywords: string[];
  
  // Metadata
  accessLevel: AccessLevel;
  retention: RetentionPolicy;
  metadata: Record<string, any>;
}

interface Reflection {
  id: string;
  content: string;
  importance: number;
  timestamp: Date;
  triggerMemories: string[];
  insights: string[];
}

// Communication System
interface Message {
  id: string;
  type: MessageType;
  
  // Participants
  fromAgent: string;
  toAgent?: string; // undefined for broadcast
  ccAgents: string[];
  
  // Content
  content: string;
  attachments: Attachment[];
  
  // Routing & Delivery
  priority: Priority;
  deliveryMode: DeliveryMode;
  timestamp: Date;
  deliveredAt?: Date;
  readAt?: Date;
  
  // Context
  conversationId?: string;
  replyToMessage?: string;
  tags: string[];
  
  // Visual Representation
  visualDuration: number;
  displayStyle: MessageDisplayStyle;
  
  // Metadata
  metadata: Record<string, any>;
}
```

### 3.2 Visual & Game Models

```typescript
// Agent Visual Representation
interface AgentVisual {
  spritesheet: string;
  animations: AnimationConfig[];
  scale: number;
  tint: number;
  
  // Status Indicators
  statusIndicator: StatusIndicatorConfig;
  healthBar: HealthBarConfig;
  thoughtBubble: ThoughtBubbleConfig;
  
  // Movement
  movementStyle: MovementStyle;
  pathColor: number;
  
  // Interactive Elements
  clickableArea: Rectangle;
  hoverEffects: EffectConfig[];
  selectionIndicator: SelectionIndicatorConfig;
}

// Scene Configuration
interface SceneConfig {
  id: string;
  name: string;
  description: string;
  
  // Layout
  layout: SceneLayout;
  buildings: Building[];
  zones: Zone[];
  paths: Path[];
  
  // Visual Settings
  backgroundTilemap: string;
  lighting: LightingConfig;
  weather: WeatherConfig;
  
  // Game Settings
  cameraConfig: CameraConfig;
  physics: PhysicsConfig;
  
  // Agent Spawn Points
  spawnPoints: SpawnPoint[];
  
  // Interactive Elements
  interactableObjects: InteractableObject[];
  
  // Metadata
  version: string;
  tags: string[];
  metadata: Record<string, any>;
}

// Pathfinding & Movement
interface Path {
  id: string;
  points: Location[];
  type: PathType;
  bidirectional: boolean;
  capacity: number;
  restrictions: PathRestriction[];
}

interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  bounds: Rectangle;
  color: number;
  allowedAgentTypes: AgentType[];
  maxOccupancy: number;
  currentOccupants: string[];
}
```

### 3.3 Performance & Analytics Models

```typescript
// Agent Performance Metrics
interface AgentMetrics {
  agentId: string;
  
  // Task Performance
  tasksCompleted: number;
  tasksInProgress: number;
  tasksFailed: number;
  averageTaskDuration: number;
  taskSuccessRate: number;
  
  // Communication Metrics
  messagesSent: number;
  messagesReceived: number;
  averageResponseTime: number;
  communicationPartners: string[];
  
  // Activity Metrics
  totalActiveTime: number;
  idleTime: number;
  errorTime: number;
  
  // Learning & Memory
  memoriesCreated: number;
  reflectionsGenerated: number;
  knowledgeUtilization: number;
  
  // Social Metrics
  collaborationScore: number;
  helpfulness: number;
  
  // Timestamps
  lastCalculated: Date;
  calculationPeriod: TimeRange;
}

// System Performance
interface SystemMetrics {
  // Agent Population
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  errorAgents: number;
  
  // Task Throughput
  tasksPerHour: number;
  averageTaskCompletion: number;
  taskBacklog: number;
  
  // Communication Volume
  messagesPerSecond: number;
  communicationLatency: number;
  
  // System Health
  uptime: number;
  errorRate: number;
  responseTime: number;
  
  // Resource Utilization
  memoryUsage: number;
  cpuUsage: number;
  networkBandwidth: number;
  
  timestamp: Date;
}
```

## 4. REST API Endpoints (Detailed)

### 4.1 Agent Management API

```typescript
// GET /api/v1/agents
interface GetAgentsResponse {
  agents: Agent[];
  pagination: Pagination;
  filters: FilterInfo;
  totalCount: number;
}

// POST /api/v1/agents
interface CreateAgentRequest {
  name: string;
  type: AgentType;
  role: string;
  description?: string;
  location: Location;
  capabilities: string[];
  configuration: AgentConfiguration;
}

interface CreateAgentResponse {
  agent: Agent;
  message: string;
}

// PUT /api/v1/agents/{id}/status
interface UpdateAgentStatusRequest {
  status: AgentStatus;
  location?: Location;
  metadata?: Record<string, any>;
}

// GET /api/v1/agents/{id}/metrics
interface GetAgentMetricsResponse {
  metrics: AgentMetrics;
  trends: MetricTrend[];
  comparisons: AgentComparison[];
}
```

### 4.2 Task Management API

```typescript
// GET /api/v1/tasks
interface GetTasksResponse {
  tasks: Task[];
  queueStats: QueueStatistics;
  filters: FilterInfo;
}

// POST /api/v1/tasks
interface CreateTaskRequest {
  title: string;
  description: string;
  type: TaskType;
  priority: Priority;
  assignTo?: string;
  dependencies?: string[];
  estimatedDuration: number;
  deadlineAt?: Date;
  requiredCapabilities: Capability[];
}

// POST /api/v1/tasks/{id}/assign
interface AssignTaskRequest {
  agentId: string;
  forceAssignment?: boolean;
  scheduledStartTime?: Date;
}
```

### 4.3 Scene Configuration API

```typescript
// GET /api/v1/scene/config
interface GetSceneConfigResponse {
  config: SceneConfig;
  metadata: SceneMetadata;
}

// PUT /api/v1/scene/config
interface UpdateSceneConfigRequest {
  layout?: SceneLayout;
  buildings?: Building[];
  zones?: Zone[];
  settings?: SceneSettings;
}

// GET /api/v1/scene/buildings
interface GetBuildingsResponse {
  buildings: Building[];
  occupancyData: OccupancyData[];
}
```

## 5. WebSocket Protocol (Detailed)

### 5.1 Real-time Event Messages

```typescript
// Agent State Changes
interface AgentStatusEvent {
  type: 'agent.status.changed';
  payload: {
    agentId: string;
    from: AgentStatus;
    to: AgentStatus;
    timestamp: Date;
    location: Location;
    trigger: StatusChangeTrigger;
    metadata: Record<string, any>;
  };
}

// Agent Movement Events
interface AgentMovementEvent {
  type: 'agent.movement';
  payload: {
    agentId: string;
    from: Location;
    to: Location;
    path: Location[];
    speed: number;
    estimatedArrival: Date;
    movementType: MovementType;
  };
}

// Task Events
interface TaskEvent {
  type: 'task.created' | 'task.started' | 'task.completed' | 'task.failed';
  payload: {
    taskId: string;
    agentId?: string;
    task: Task;
    timestamp: Date;
    details: Record<string, any>;
  };
}

// Communication Events
interface CommunicationEvent {
  type: 'agent.communication';
  payload: {
    messageId: string;
    fromAgent: string;
    toAgent?: string;
    messageType: MessageType;
    content: string;
    timestamp: Date;
    visualConfig: {
      duration: number;
      style: MessageDisplayStyle;
      animation: AnimationType;
    };
  };
}

// Thought Bubble Events
interface ThoughtEvent {
  type: 'agent.thought';
  payload: {
    agentId: string;
    thoughtType: 'task' | 'reflection' | 'plan' | 'observation';
    content: string;
    importance: number;
    duration: number;
    style: ThoughtBubbleStyle;
    timestamp: Date;
  };
}

// System Events
interface SystemEvent {
  type: 'system.alert' | 'system.info' | 'system.error';
  payload: {
    eventType: string;
    severity: AlertSeverity;
    message: string;
    affectedAgents?: string[];
    actionRequired?: boolean;
    timestamp: Date;
    metadata: Record<string, any>;
  };
}
```

### 5.2 Client Command Messages

```typescript
// Agent Selection
interface AgentSelectCommand {
  type: 'agent.select';
  payload: {
    agentId: string;
    showDetails: boolean;
    focusCamera: boolean;
  };
}

// Scene Manipulation
interface SceneCommand {
  type: 'scene.pan' | 'scene.zoom' | 'scene.reset';
  payload: {
    target?: Location;
    zoomLevel?: number;
    animated: boolean;
    duration?: number;
  };
}

// Filter Configuration
interface FilterCommand {
  type: 'filter.agents' | 'filter.tasks' | 'filter.messages';
  payload: {
    filters: FilterCriteria;
    includeInactive: boolean;
  };
}
```

## 6. Frontend Architecture

### 6.1 React Component Hierarchy

```
App
├── Layout
│   ├── Header (System status, controls)
│   ├── GameCanvas (Phaser container)
│   └── Sidebar
│       ├── AgentList
│       ├── TaskQueue
│       ├── SystemMetrics
│       └── CommunicationLog
├── Modals
│   ├── AgentDetailModal
│   ├── TaskDetailModal
│   ├── ConfigurationModal
│   └── HelpModal
└── Overlays
    ├── LoadingOverlay
    ├── ErrorOverlay
    └── NotificationOverlay
```

### 6.2 Phaser Scene Structure

```typescript
// MainScene.ts - Primary game scene
class MainScene extends Phaser.Scene {
  private agentManager: AgentManager;
  private buildingManager: BuildingManager;
  private effectsManager: EffectsManager;
  private uiManager: UIManager;
  private cameraController: CameraController;
  private inputHandler: InputHandler;
  
  // Scene lifecycle
  preload(): void;
  create(): void;
  update(time: number, delta: number): void;
  
  // Agent management
  spawnAgent(agentData: Agent): void;
  updateAgent(agentId: string, data: Partial<Agent>): void;
  removeAgent(agentId: string): void;
  
  // Visual effects
  showThoughtBubble(agentId: string, content: string, duration: number): void;
  showCommunicationLine(fromAgent: string, toAgent: string): void;
  showStatusEffect(agentId: string, effect: EffectType): void;
  
  // Camera and interaction
  focusOnAgent(agentId: string): void;
  handleAgentClick(agentId: string): void;
  handleSceneClick(pointer: Phaser.Input.Pointer): void;
}
```

### 6.3 State Management (Zustand)

```typescript
// Agent State Slice
interface AgentState {
  agents: Record<string, Agent>;
  selectedAgent: string | null;
  filter: AgentFilter;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, data: Partial<Agent>) => void;
  selectAgent: (id: string | null) => void;
  setFilter: (filter: AgentFilter) => void;
}

// WebSocket State Slice
interface WebSocketState {
  connection: WebSocket | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: any;
  messageQueue: any[];
  
  // Actions
  connect: (url: string) => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  processMessage: (message: any) => void;
}

// UI State Slice
interface UIState {
  showSidebar: boolean;
  activePanel: string | null;
  notifications: Notification[];
  isLoading: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setActivePanel: (panel: string | null) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}
```

## 7. Phaser Scene Design

### 7.1 Town Layout Description

```
Smallville Town Layout (48x36 tiles, 1536x1152 pixels at 32px per tile):

╔══════════════════════════════════════════════════╗
║                  HEADER AREA                     ║  (System status bar)
╠══════════════════════════════════════════════════╣
║ RESIDENTIAL QUARTER      │    BUSINESS DISTRICT  ║
║ ┌─────────┐ ┌─────────┐ │ ┌─────────┐ ┌───────┐ ║
║ │  House  │ │  House  │ │ │  Store  │ │ Cafe  │ ║
║ │ (Idle)  │ │ (Idle)  │ │ │(CustSrv)│ │(Social)│ ║
║ └─────────┘ └─────────┘ │ └─────────┘ └───────┘ ║
║                         │                       ║
║ ┌─────────┐ ┌─────────┐ │ ┌─────────┐ ┌───────┐ ║
║ │ Apt Bldg│ │ Apt Bldg│ │ │ Office  │ │ Bank  │ ║
║ │ (Sleep) │ │ (Sleep) │ │ │ (Admin) │ │(FinSrv)│ ║
║ └─────────┘ └─────────┘ │ └─────────┘ └───────┘ ║
╠═════════════════════════┼═══════════════════════╣
║       CENTRAL PARK      │    WAREHOUSE DISTRICT ║
║      (Meeting Point)    │ ┌─────────┐ ┌───────┐ ║
║         🌳🌳🌳         │ │Warehouse│ │Loading│ ║
║       🌳 💧 🌳       │ │  (Inv)  │ │ Dock  │ ║
║         🌳🌳🌳         │ └─────────┘ └───────┘ ║
║                         │                       ║
║                         │ ┌─────────┐ ┌───────┐ ║
║                         │ │Transport│ │Repair │ ║
║                         │ │  Hub    │ │ Shop  │ ║
║                         │ └─────────┘ └───────┘ ║
╠═════════════════════════┼═══════════════════════╣
║      TECH CAMPUS        │     DATA CENTER       ║
║ ┌─────────┐ ┌─────────┐ │ ┌─────────┐ ┌───────┐ ║
║ │   Dev   │ │   QA    │ │ │ Server  │ │Analytics│║
║ │  Bldg   │ │  Bldg   │ │ │  Farm   │ │ Center │ ║
║ └─────────┘ └─────────┘ │ └─────────┘ └───────┘ ║
║                         │                       ║
║ ┌─────────┐ ┌─────────┐ │ ┌─────────┐ ┌───────┐ ║
║ │Research │ │ Meeting │ │ │Security │ │Monitor│ ║
║ │  Lab    │ │  Room   │ │ │ Center  │ │ Room  │ ║
║ └─────────┘ └─────────┘ │ └─────────┘ └───────┘ ║
╚══════════════════════════════════════════════════╝

Roads/Paths: Connect all buildings with walkable paths
Agent Movement: Agents move along paths, enter buildings based on tasks
Zones: Each quarter represents different operational domains
```

### 7.2 Sprite Definitions

```typescript
// Agent Sprite Configuration
interface SpriteConfig {
  warehouse_worker: {
    spritesheet: '/assets/sprites/warehouse-worker.png';
    frameWidth: 32;
    frameHeight: 48;
    animations: {
      idle_down: { frames: [0, 1], frameRate: 2, repeat: -1 };
      idle_up: { frames: [12, 13], frameRate: 2, repeat: -1 };
      idle_left: { frames: [24, 25], frameRate: 2, repeat: -1 };
      idle_right: { frames: [36, 37], frameRate: 2, repeat: -1 };
      walk_down: { frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 };
      walk_up: { frames: [12, 13, 14, 15], frameRate: 8, repeat: -1 };
      walk_left: { frames: [24, 25, 26, 27], frameRate: 8, repeat: -1 };
      walk_right: { frames: [36, 37, 38, 39], frameRate: 8, repeat: -1 };
      working: { frames: [4, 5, 6, 7], frameRate: 4, repeat: -1 };
      thinking: { frames: [8, 9, 10, 11], frameRate: 2, repeat: -1 };
      error: { frames: [48, 49], frameRate: 4, repeat: -1 };
    };
  };
  
  transport_manager: {
    // Similar structure with different sprites
  };
  
  customer_service: {
    // Similar structure with different sprites
  };
  
  data_analyst: {
    // Similar structure with different sprites
  };
  
  developer: {
    // Similar structure with different sprites
  };
}

// Status Indicator Configuration
interface StatusIndicatorConfig {
  idle: { color: 0x808080, icon: '💤' };
  thinking: { color: 0xFFD700, icon: '💭' };
  executing: { color: 0x00FF00, icon: '⚙️' };
  communicating: { color: 0x00BFFF, icon: '💬' };
  error: { color: 0xFF0000, icon: '⚠️' };
  offline: { color: 0x666666, icon: '🔌' };
}

// Building Sprite Configuration
interface BuildingConfig {
  house: { sprite: 'house.png', size: { w: 64, h: 64 }, capacity: 1 };
  warehouse: { sprite: 'warehouse.png', size: { w: 128, h: 96 }, capacity: 8 };
  office: { sprite: 'office.png', size: { w: 96, h: 80 }, capacity: 6 };
  data_center: { sprite: 'datacenter.png', size: { w: 128, h: 128 }, capacity: 12 };
}
```

### 7.3 Animation State Machine

```typescript
// Agent Animation Controller
class AgentAnimationController {
  private sprite: Phaser.GameObjects.Sprite;
  private currentState: AgentStatus;
  private movementDirection: Direction;
  
  updateAnimation(status: AgentStatus, isMoving: boolean, direction?: Direction): void {
    const baseAnimation = this.getBaseAnimation(status);
    const directionSuffix = this.getDirectionSuffix(direction || this.movementDirection);
    const animationKey = `${baseAnimation}${isMoving ? '_walk' : '_idle'}_${directionSuffix}`;
    
    if (this.sprite.anims.currentAnim?.key !== animationKey) {
      this.sprite.play(animationKey);
    }
    
    // Apply status-specific effects
    this.applyStatusEffects(status);
  }
  
  private getBaseAnimation(status: AgentStatus): string {
    switch (status) {
      case AgentStatus.THINKING: return 'thinking';
      case AgentStatus.EXECUTING: return 'working';
      case AgentStatus.ERROR: return 'error';
      default: return 'normal';
    }
  }
  
  private applyStatusEffects(status: AgentStatus): void {
    switch (status) {
      case AgentStatus.ERROR:
        this.sprite.setTint(0xff6666);
        break;
      case AgentStatus.THINKING:
        this.sprite.setTint(0xffff66);
        break;
      case AgentStatus.EXECUTING:
        this.sprite.setTint(0x66ff66);
        break;
      default:
        this.sprite.clearTint();
    }
  }
}
```

## 8. Mock Data Specifications

### 8.1 Agent Templates

```json
{
  "agentTemplates": {
    "warehouse_supervisor": {
      "name": "Alex Chen",
      "type": "warehouse",
      "role": "Supervisor",
      "description": "Oversees warehouse operations and inventory management",
      "capabilities": ["inventory_management", "team_coordination", "quality_control"],
      "baseLocation": { "x": 1200, "y": 600, "zone": "warehouse" },
      "behaviorPatterns": {
        "workday_start": "08:00",
        "workday_end": "17:00",
        "break_times": ["10:00", "12:00", "15:00"],
        "patrol_frequency": "30min",
        "communication_frequency": "high"
      },
      "taskPreferences": ["inventory_check", "team_meeting", "report_generation"],
      "personality": {
        "communication_style": "direct",
        "decision_making": "analytical",
        "collaboration": "high"
      }
    },
    
    "transport_coordinator": {
      "name": "Maria Rodriguez",
      "type": "transportation",
      "role": "Coordinator",
      "description": "Manages transportation logistics and route optimization",
      "capabilities": ["route_planning", "vehicle_management", "delivery_scheduling"],
      "baseLocation": { "x": 1200, "y": 800, "zone": "transport" },
      "behaviorPatterns": {
        "workday_start": "06:00",
        "workday_end": "16:00",
        "route_check_frequency": "20min",
        "dispatch_window": "07:00-15:00"
      },
      "taskPreferences": ["route_optimization", "dispatch", "tracking"],
      "personality": {
        "communication_style": "efficient",
        "decision_making": "quick",
        "stress_tolerance": "high"
      }
    },
    
    "customer_advocate": {
      "name": "James Park",
      "type": "customer_service",
      "role": "Senior Advocate",
      "description": "Handles customer inquiries and resolves service issues",
      "capabilities": ["customer_support", "issue_resolution", "communication"],
      "baseLocation": { "x": 800, "y": 400, "zone": "business" },
      "behaviorPatterns": {
        "workday_start": "09:00",
        "workday_end": "18:00",
        "response_target": "5min",
        "escalation_threshold": "30min"
      },
      "taskPreferences": ["customer_inquiry", "issue_resolution", "feedback_collection"],
      "personality": {
        "communication_style": "empathetic",
        "decision_making": "customer_focused",
        "patience": "high"
      }
    },
    
    "data_scientist": {
      "name": "Dr. Sarah Kim",
      "type": "data_analyst",
      "role": "Senior Data Scientist",
      "description": "Analyzes operational data and generates insights",
      "capabilities": ["data_analysis", "pattern_recognition", "report_generation"],
      "baseLocation": { "x": 1200, "y": 1000, "zone": "data_center" },
      "behaviorPatterns": {
        "workday_start": "09:30",
        "workday_end": "17:30",
        "analysis_cycles": "2hours",
        "deep_work_blocks": ["10:00-12:00", "14:00-16:00"]
      },
      "taskPreferences": ["data_analysis", "trend_identification", "predictive_modeling"],
      "personality": {
        "communication_style": "analytical",
        "decision_making": "data_driven",
        "curiosity": "high"
      }
    },
    
    "system_developer": {
      "name": "Ryan O'Connor",
      "type": "developer",
      "role": "Full Stack Developer",
      "description": "Develops and maintains system applications",
      "capabilities": ["software_development", "system_integration", "debugging"],
      "baseLocation": { "x": 400, "y": 1000, "zone": "tech_campus" },
      "behaviorPatterns": {
        "workday_start": "10:00",
        "workday_end": "19:00",
        "code_review_time": "11:00",
        "deployment_window": "16:00-17:00"
      },
      "taskPreferences": ["feature_development", "bug_fixing", "code_review"],
      "personality": {
        "communication_style": "technical",
        "decision_making": "methodical",
        "problem_solving": "creative"
      }
    }
  }
}
```

### 8.2 Behavior Simulation Engine

```typescript
// Mock Behavior Simulator
class BehaviorSimulator {
  private agents: Agent[];
  private taskGenerator: TaskGenerator;
  private communicationEngine: CommunicationEngine;
  private memoryEngine: MemoryEngine;
  
  // Simulate realistic agent behaviors
  simulateAgentDay(agent: Agent): void {
    const schedule = this.generateDaySchedule(agent);
    
    schedule.forEach(activity => {
      setTimeout(() => {
        this.executeActivity(agent, activity);
      }, activity.startTime);
    });
  }
  
  private generateDaySchedule(agent: Agent): Activity[] {
    const template = this.getAgentTemplate(agent.type);
    const schedule: Activity[] = [];
    
    // Morning routine
    schedule.push({
      type: 'arrival',
      startTime: this.parseTime(template.behaviorPatterns.workday_start),
      duration: 5 * 60 * 1000, // 5 minutes
      location: agent.baseLocation
    });
    
    // Regular work tasks
    const workingHours = this.calculateWorkingHours(template);
    const taskCount = Math.floor(workingHours / 2) + Math.random() * 3;
    
    for (let i = 0; i < taskCount; i++) {
      const task = this.generateRandomTask(agent);
      schedule.push({
        type: 'task_execution',
        startTime: this.randomTimeInRange(template.workday_start, template.workday_end),
        duration: task.estimatedDuration,
        task: task
      });
    }
    
    // Break times
    template.behaviorPatterns.break_times.forEach(breakTime => {
      schedule.push({
        type: 'break',
        startTime: this.parseTime(breakTime),
        duration: 15 * 60 * 1000, // 15 minutes
        location: this.getBreakLocation()
      });
    });
    
    // Inter-agent communications
    const commCount = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < commCount; i++) {
      schedule.push({
        type: 'communication',
        startTime: this.randomTimeInRange(template.workday_start, template.workday_end),
        duration: Math.random() * 10 * 60 * 1000, // Up to 10 minutes
        target: this.selectCommunicationPartner(agent)
      });
    }
    
    return schedule.sort((a, b) => a.startTime - b.startTime);
  }
  
  private executeActivity(agent: Agent, activity: Activity): void {
    switch (activity.type) {
      case 'arrival':
        this.updateAgentStatus(agent, AgentStatus.IDLE);
        this.moveAgentToLocation(agent, activity.location);
        this.createMemory(agent, `Arrived at work`, MemoryType.OBSERVATION);
        break;
        
      case 'task_execution':
        this.assignTaskToAgent(agent, activity.task);
        this.updateAgentStatus(agent, AgentStatus.THINKING);
        
        // Simulate task execution phases
        setTimeout(() => {
          this.updateAgentStatus(agent, AgentStatus.EXECUTING);
          this.createMemory(agent, `Working on: ${activity.task.title}`, MemoryType.OBSERVATION);
        }, 30000); // Think for 30 seconds
        
        setTimeout(() => {
          this.completeTask(agent, activity.task);
          this.updateAgentStatus(agent, AgentStatus.IDLE);
          this.createReflection(agent, activity.task);
        }, activity.duration);
        break;
        
      case 'communication':
        this.initiateCommunication(agent, activity.target);
        break;
        
      case 'break':
        this.updateAgentStatus(agent, AgentStatus.IDLE);
        this.moveAgentToLocation(agent, activity.location);
        this.createMemory(agent, `Taking a break`, MemoryType.OBSERVATION);
        break;
    }
  }
  
  // Generate realistic inter-agent communications
  private initiateCommunication(fromAgent: Agent, toAgent: Agent): void {
    const communicationType = this.selectCommunicationType(fromAgent, toAgent);
    const message = this.generateMessage(fromAgent, toAgent, communicationType);
    
    this.sendMessage(message);
    
    // Simulate response
    setTimeout(() => {
      const response = this.generateResponse(toAgent, fromAgent, message);
      this.sendMessage(response);
    }, Math.random() * 30000 + 5000); // 5-35 second response time
  }
  
  // Memory and reflection system
  private createReflection(agent: Agent, completedTask: Task): void {
    const reflectionContent = this.generateReflection(agent, completedTask);
    const reflection: Memory = {
      id: uuidv4(),
      agentId: agent.id,
      type: MemoryType.REFLECTION,
      content: reflectionContent,
      importance: Math.floor(Math.random() * 5) + 5, // 5-10 importance
      timestamp: new Date(),
      relatedMemories: this.findRelatedMemories(agent, completedTask),
      tags: ['reflection', 'task_completion', completedTask.type],
      metadata: { taskId: completedTask.id }
    };
    
    agent.memories.push(reflection);
    this.broadcastMemoryUpdate(agent, reflection);
  }
}
```

### 8.3 Mock Task Templates

```json
{
  "taskTemplates": {
    "warehouse": [
      {
        "title": "Inventory Count - Section A",
        "description": "Perform physical count of inventory in warehouse section A",
        "type": "inventory_management",
        "estimatedDuration": 1800000,
        "complexity": 3,
        "requiredCapabilities": ["inventory_management", "data_entry"]
      },
      {
        "title": "Quality Control Check",
        "description": "Inspect incoming shipment for quality standards",
        "type": "quality_control",
        "estimatedDuration": 900000,
        "complexity": 2,
        "requiredCapabilities": ["quality_control", "inspection"]
      }
    ],
    
    "transportation": [
      {
        "title": "Route Optimization - Zone 5",
        "description": "Optimize delivery routes for zone 5 deliveries",
        "type": "route_planning",
        "estimatedDuration": 1200000,
        "complexity": 4,
        "requiredCapabilities": ["route_planning", "data_analysis"]
      }
    ],
    
    "customer_service": [
      {
        "title": "Customer Inquiry - Order Status",
        "description": "Handle customer inquiry about order delivery status",
        "type": "customer_support",
        "estimatedDuration": 600000,
        "complexity": 1,
        "requiredCapabilities": ["customer_support", "order_tracking"]
      }
    ],
    
    "data_analysis": [
      {
        "title": "Weekly Performance Report",
        "description": "Generate weekly operational performance analysis",
        "type": "data_analysis",
        "estimatedDuration": 3600000,
        "complexity": 5,
        "requiredCapabilities": ["data_analysis", "report_generation"]
      }
    ],
    
    "development": [
      {
        "title": "Bug Fix - Login Issue",
        "description": "Investigate and fix user login authentication issue",
        "type": "bug_fixing",
        "estimatedDuration": 2700000,
        "complexity": 3,
        "requiredCapabilities": ["debugging", "authentication_systems"]
      }
    ]
  }
}
```

This design document provides a comprehensive blueprint for the Agent Factory Smallville Dashboard implementation, covering all aspects from system architecture to detailed mock data specifications. The monorepo structure supports both frontend and backend development, while the detailed data models and API specifications ensure clear interfaces between components.