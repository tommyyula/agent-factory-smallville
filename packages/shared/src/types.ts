// Core Entity Types for Agent Factory Smallville

// Agent Types
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  role: string;
  status: AgentStatus;
  location: Location;
  currentTask?: Task;
  capabilities: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  lastActiveAt: Date;
  memories: Memory[];
  visual: AgentVisual;
  metrics: AgentMetrics;
}

export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  EXECUTING = 'executing',
  COMMUNICATING = 'communicating',
  ERROR = 'error',
  SLEEPING = 'sleeping',
  OFFLINE = 'offline'
}

export enum AgentType {
  WAREHOUSE = 'warehouse',
  TRANSPORTATION = 'transportation',
  CUSTOMER_SERVICE = 'customer_service',
  DATA_ANALYST = 'data_analyst',
  DEVELOPER = 'developer',
  QUALITY = 'quality',
  PLANNING = 'planning',
  COORDINATOR = 'coordinator'
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: string;
  createdBy: string;
  estimatedDuration: number;
  actualDuration?: number;
  progress: number;
  dependencies: string[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskType {
  INVENTORY_CHECK = 'inventory_check',
  ROUTE_OPTIMIZATION = 'route_optimization',
  CUSTOMER_INQUIRY = 'customer_inquiry',
  DATA_ANALYSIS = 'data_analysis',
  CODE_REVIEW = 'code_review',
  QUALITY_CONTROL = 'quality_control',
  TEAM_COORDINATION = 'team_coordination',
  REPORT_GENERATION = 'report_generation'
}

export enum Priority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

// Memory Types (Based on Smallville Paper)
export interface Memory {
  id: string;
  agentId: string;
  type: MemoryType;
  content: string;
  importance: number; // 1-10 scale
  timestamp: Date;
  relatedMemories: string[];
  relatedAgents: string[];
  relatedTasks: string[];
  location?: Location;
  tags: string[];
  metadata: Record<string, any>;
}

export enum MemoryType {
  OBSERVATION = 'observation',
  REFLECTION = 'reflection',
  PLAN = 'plan'
}

// Message Types
export interface Message {
  id: string;
  type: MessageType;
  fromAgent: string;
  toAgent?: string; // undefined for broadcast
  content: string;
  timestamp: Date;
  conversationId?: string;
  visualDuration: number;
  metadata: Record<string, any>;
}

export enum MessageType {
  DIRECT = 'direct',
  BROADCAST = 'broadcast',
  REQUEST = 'request',
  RESPONSE = 'response'
}

// Location and Spatial Types
export interface Location {
  x: number;
  y: number;
  zone: ZoneType;
  building?: string;
  metadata?: Record<string, any>;
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  position: Location;
  size: { width: number; height: number };
  entrancePoint: Location;
  capacity: number;
  occupants: string[];
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  bounds: Rectangle;
  color: string;
  allowedAgentTypes: AgentType[];
  maxOccupancy: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum ZoneType {
  WAREHOUSE = 'warehouse',
  TRANSPORT = 'transport',
  CUSTOMER_SERVICE = 'customer_service',
  DATA_CENTER = 'data_center',
  DEVELOPMENT = 'development',
  QUALITY = 'quality',
  PLANNING = 'planning',
  COMMON_AREA = 'common_area',
  REST_AREA = 'rest_area'
}

export enum BuildingType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  WAREHOUSE = 'warehouse',
  OFFICE = 'office',
  DATA_CENTER = 'data_center',
  TRANSPORT_HUB = 'transport_hub',
  MEETING_ROOM = 'meeting_room',
  BREAK_ROOM = 'break_room'
}

// Agent Visual Configuration
export interface AgentVisual {
  spriteKey: string;
  scale: number;
  tint: number;
  statusIndicator: StatusIndicator;
}

export interface StatusIndicator {
  color: number;
  icon: string;
  visible: boolean;
}

// Agent Performance Metrics
export interface AgentMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  tasksFailed: number;
  averageTaskDuration: number;
  messagesSent: number;
  messagesReceived: number;
  activeTime: number;
  idleTime: number;
  errorTime: number;
  lastCalculated: Date;
}

// WebSocket Message Protocol
export interface WSMessage<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  source?: string;
  correlationId?: string;
}

// WebSocket Event Types
export interface AgentStatusUpdate {
  type: 'agent:status';
  payload: {
    agentId: string;
    previousStatus: AgentStatus;
    currentStatus: AgentStatus;
    location: Location;
    timestamp: Date;
  };
}

export interface AgentMovement {
  type: 'agent:move';
  payload: {
    agentId: string;
    fromLocation: Location;
    toLocation: Location;
    path: Location[];
    speed: number;
    timestamp: Date;
  };
}

export interface AgentThought {
  type: 'agent:thought';
  payload: {
    agentId: string;
    content: string;
    thoughtType: 'task' | 'reflection' | 'plan';
    duration: number;
    timestamp: Date;
  };
}

export interface TaskUpdate {
  type: 'task:update';
  payload: {
    taskId: string;
    agentId?: string;
    status: TaskStatus;
    progress: number;
    timestamp: Date;
  };
}

export interface MessageNew {
  type: 'message:new';
  payload: {
    message: Message;
    visualConfig: {
      showLine: boolean;
      duration: number;
      style: string;
    };
  };
}

export interface MemoryNew {
  type: 'memory:new';
  payload: {
    memory: Memory;
  };
}

export interface SystemStatus {
  type: 'system:status';
  payload: {
    totalAgents: number;
    activeAgents: number;
    completedTasks: number;
    systemHealth: number;
    timestamp: Date;
  };
}

// Scene Configuration
export interface SceneConfig {
  buildings: Building[];
  zones: Zone[];
  spawnPoints: SpawnPoint[];
  tilemap: TilemapConfig;
}

export interface SpawnPoint {
  agentType: AgentType;
  location: Location;
  name: string;
}

export interface TilemapConfig {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  layers: TilemapLayer[];
}

export interface TilemapLayer {
  name: string;
  data: number[][];
  visible: boolean;
  opacity: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}