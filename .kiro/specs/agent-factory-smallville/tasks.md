# Agent Factory Smallville Dashboard - Implementation Tasks

## Phase 1: Project Infrastructure (Complexity: Medium)

### Task 1.1: Monorepo Setup
- Initialize monorepo with npm workspaces
- Create `packages/server` and `packages/client` directories
- Configure shared TypeScript config (`tsconfig.base.json`)
- Set up `.gitignore`, `.env.example`, `README.md`
- **Completion**: `npm install` works in root, both packages resolve

### Task 1.2: Server Package Setup
- Initialize `packages/server` with Express + TypeScript
- Install dependencies: express, ws, cors, uuid, typescript, tsx, @types/*
- Configure `tsconfig.json` extending base
- Create entry point `src/index.ts` with basic health check
- **Completion**: `npm run dev` starts server on port 3001

### Task 1.3: Client Package Setup
- Initialize `packages/client` with Vite + React + TypeScript
- Install dependencies: react, phaser, zustand, @types/*
- Install UI: tailwindcss v4, shadcn/ui prerequisites
- Configure Vite with proxy to server (dev mode)
- Configure base path for GitHub Pages: `/<repo-name>/`
- **Completion**: `npm run dev` shows React app on port 5173

### Task 1.4: Pixel Art Assets
- Create or source tileset for town map (32x32 tiles):
  - Ground tiles (grass, path, road)
  - Building tiles (office, warehouse, server room, meeting room, home)
  - Decoration tiles (trees, benches, signs)
- Create or source character sprites (32x32 per frame):
  - 8 distinct agent character designs (different colors/roles)
  - 4-directional walk animations (4 frames each)
  - Idle animation (2 frames)
  - Working animation (2 frames)
- Create thought bubble / speech bubble sprites
- Create status indicator sprites (green=ok, yellow=busy, red=error)
- **Note**: Use programmatically generated pixel art or open-source assets (LPC, kenney.nl)
- **Completion**: All sprite sheets and tilesets in `packages/client/public/assets/`

### Task 1.5: Tilemap Design
- Design town layout in Tiled JSON format (or code-generated):
  - 40x30 tile map (1280x960 pixels at 32px tiles)
  - Zones: Data Processing (数据处理), Customer Service (客服), Analytics (分析), Development (开发), Warehouse (仓储), Transport (运输), Common Area (公共区), Rest Area (休息区)
  - Pathfinding grid (walkable vs non-walkable tiles)
  - Building entrance points for agent navigation
- **Completion**: Tilemap JSON loads in Phaser without errors

**Phase 1 Milestone**: Project builds, dev servers run, assets load in Phaser scene

---

## Phase 2: Shared Domain Types (Complexity: Low)

### Task 2.1: Shared Type Definitions
- Create `packages/shared/` (or inline in both packages)
- Define all TypeScript interfaces from domain analysis:
  - `Agent` (id, name, type, role, status, location, currentTask, memories)
  - `AgentStatus` enum (idle, thinking, executing, communicating, error, sleeping)
  - `AgentType` enum (warehouse, transport, customer_service, data_analysis, development, quality, planning, coordinator)
  - `Task` (id, title, description, status, assignee, priority, progress)
  - `TaskStatus` enum (pending, assigned, in_progress, completed, failed)
  - `Memory` (id, type, content, timestamp, importance)
  - `MemoryType` enum (observation, reflection, plan)
  - `Message` (id, from, to, content, type, timestamp)
  - `MessageType` enum (direct, broadcast, request, response)
  - `Location` (x, y, zone, building)
  - `Building` (id, name, zone, position, size, entrancePoint)
  - `Zone` (id, name, type, bounds, color)
- Define WebSocket message protocol types:
  - `WSMessage<T>` wrapper (type, payload, timestamp)
  - Event types: `agent:state`, `agent:move`, `agent:thought`, `task:update`, `message:new`, `memory:new`, `system:status`
- **Completion**: All types compile, no `any` types

---

## Phase 3: Backend Runtime API (Complexity: High)

### Task 3.1: Data Models & In-Memory Store
- Implement in-memory store (Map-based, no database needed for v1)
- `AgentStore` — CRUD for agents with event emission
- `TaskStore` — task lifecycle management
- `MessageStore` — message history with pagination
- `MemoryStore` — agent memory streams
- `SceneStore` — building/zone configuration
- **Completion**: Store operations pass unit tests

### Task 3.2: REST API Routes
- `GET /api/agents` — list all agents (with optional status filter)
- `GET /api/agents/:id` — get agent detail
- `POST /api/agents` — register new agent
- `PATCH /api/agents/:id` — update agent (status, location, etc.)
- `DELETE /api/agents/:id` — remove agent
- `GET /api/agents/:id/memories` — get agent's memory stream
- `GET /api/tasks` — list tasks (filter by status, assignee)
- `POST /api/tasks` — create task
- `PATCH /api/tasks/:id` — update task status/progress
- `GET /api/messages` — recent messages (pagination)
- `POST /api/messages` — send message between agents
- `GET /api/scene` — get scene configuration (buildings, zones)
- `GET /api/stats` — system dashboard stats
- **Completion**: All endpoints respond correctly with Postman/curl

### Task 3.3: WebSocket Server
- Set up `ws` WebSocket server on same Express server
- Implement message protocol:
  - Client → Server: `subscribe`, `unsubscribe`, `command`
  - Server → Client: `agent:state`, `agent:move`, `agent:thought`, `task:update`, `message:new`, `memory:new`
- Connection management (client tracking, heartbeat/ping-pong)
- Broadcast to all connected clients on state changes
- **Completion**: WebSocket clients receive real-time events

### Task 3.4: Agent Runtime Engine
- `AgentRuntime` class — manages agent lifecycle
- State machine implementation (idle → thinking → executing → communicating → idle)
- Location-aware movement (agents move to relevant zones for tasks)
- Task assignment and execution simulation
- Memory creation (observations during task execution)
- **Completion**: Runtime runs agents through realistic state cycles

### Task 3.5: Mock Data Seeder & Behavior Simulator
- Create 8 pre-defined agent templates (ITEM logistics roles):
  1. **仓储管家 (Warehouse Manager)** — inventory monitoring, stock alerts
  2. **运输调度 (Transport Dispatcher)** — route planning, fleet monitoring
  3. **客服代表 (Customer Service Rep)** — inquiry handling, complaint resolution
  4. **数据分析师 (Data Analyst)** — report generation, trend analysis
  5. **开发工程师 (Dev Engineer)** — code review, bug fixing
  6. **质检专员 (QA Inspector)** — quality audits, compliance checks
  7. **规划师 (Planner)** — demand forecasting, capacity planning
  8. **协调员 (Coordinator)** — cross-team sync, escalation handling
- Task generator: creates realistic tasks every 10-30 seconds
- Behavior simulator: agents pick up tasks, execute, communicate, reflect
- Communication patterns: coordinator broadcasts, analysts request data from warehouse, etc.
- Memory generation: observations → periodic reflections → plans
- **Completion**: `npm run seed` starts simulation with visible agent activity

**Phase 3 Milestone**: Backend running with 8 mock agents, REST + WebSocket APIs functional

---

## Phase 4: Phaser Game Scene (Complexity: High)

### Task 4.1: Phaser Bootstrap
- Initialize Phaser 3 game instance
- Configure game settings (800x600 canvas, pixel art rendering, no anti-aliasing)
- Create main `TownScene` extending Phaser.Scene
- Load tileset and spritesheet assets in preload
- **Completion**: Phaser canvas renders in browser

### Task 4.2: Tilemap Rendering
- Load and render the town tilemap
- Layer order: ground → buildings → decorations → agents
- Zone highlighting (subtle colored overlays per zone)
- Building labels (zone names in pixel font)
- Camera: scrollable/zoomable with bounds
- **Completion**: Full town visible with buildings and zones

### Task 4.3: Agent Sprite System
- `AgentSprite` class extending Phaser.GameObjects.Sprite
- Load character spritesheets (8 distinct characters)
- Animation states: idle, walk-up, walk-down, walk-left, walk-right, working, error
- Status indicator (colored dot above sprite)
- Name label below sprite (bitmap text)
- **Completion**: Agent sprites render with correct animations

### Task 4.4: Agent Movement & Pathfinding
- Simple grid-based pathfinding (A* or Phaser pathfinding plugin)
- Agents move between buildings/zones based on state
- Movement speed: ~2 tiles/second
- Smooth tweened movement between tiles
- Queue movements (don't interrupt current path)
- **Completion**: Agents visually walk between locations

### Task 4.5: Thought Bubbles & Communication
- Thought bubble: shows above agent head when thinking/executing
  - Contains truncated task description or thought text
  - Auto-fades after 5 seconds
- Communication visualization:
  - When agents communicate: both stop, face each other
  - Speech bubbles with message preview
  - Animated dotted line between communicating agents
- **Completion**: Bubbles appear and disappear correctly

**Phase 4 Milestone**: Phaser scene with animated agents moving around town

---

## Phase 5: React Shell & Phaser Integration (Complexity: Medium)

### Task 5.1: React App Shell
- Layout: Game canvas (left/center, ~70%) + Side panel (right, ~30%)
- Top bar: system status, connected agents count, clock
- Side panel tabs: Agents List, Task Queue, Messages, System Stats
- Dark theme using ITEM theme CSS (oklch color system)
- shadcn/ui components for panels and lists
- **Completion**: React shell renders with placeholder content

### Task 5.2: Phaser-React Bridge
- Mount Phaser game inside React component
- Zustand store as shared state layer
- Event flow: WebSocket → Zustand store → React UI + Phaser scene
- Phaser reads from store for agent positions/states
- React reads from store for panel data
- Click events: Phaser emits agent click → React opens detail panel
- **Completion**: Click agent in Phaser → detail shows in React panel

### Task 5.3: Agent List Panel
- List all agents with avatar, name, role, status badge
- Sort by status (error first, then active, then idle)
- Click agent in list → camera pans to agent in Phaser + opens detail
- Real-time status badge updates
- **Completion**: Agent list syncs with game state

### Task 5.4: Agent Detail Panel
- Current task with progress bar
- Memory stream (scrollable timeline)
- Recent communications
- Performance stats (tasks completed, avg time, error rate)
- Location history
- **Completion**: Detail panel shows comprehensive agent info

### Task 5.5: Task Queue Panel
- Active tasks with assigned agent and progress
- Pending tasks queue
- Completed tasks (recent 20)
- Failed tasks with error info
- **Completion**: Task panel updates in real-time

### Task 5.6: Message Feed Panel
- Chronological message feed (all inter-agent messages)
- Filter by agent or message type
- Click message → highlight communicating agents in scene
- **Completion**: Messages stream in real-time

**Phase 5 Milestone**: Full integrated UI with game + panels, all interactive

---

## Phase 6: Real-time Data Connection (Complexity: Medium)

### Task 6.1: WebSocket Client
- WebSocket connection manager with auto-reconnect
- Message parser and dispatcher to Zustand store
- Connection status indicator in UI
- **Completion**: Client connects and receives events

### Task 6.2: State Synchronization
- Initial state load via REST API on connect
- Incremental updates via WebSocket
- Optimistic updates for user commands
- Reconnection state recovery (full refresh on reconnect)
- **Completion**: State stays in sync across page refreshes

### Task 6.3: Animation Orchestration
- Map WebSocket events to Phaser animations:
  - `agent:state` → update sprite animation + status indicator
  - `agent:move` → pathfind to new location
  - `agent:thought` → show thought bubble
  - `message:new` → show communication between agents
  - `task:update` → update task panel + agent thought
- Queue animations to prevent visual glitches
- **Completion**: All events have smooth visual responses

**Phase 6 Milestone**: Dashboard fully connected to backend, all data flows real-time

---

## Phase 7: Polish & UX (Complexity: Medium)

### Task 7.1: Visual Polish
- Day/night cycle (gradual tint change over time)
- Particle effects (sparkles on task completion, smoke on error)
- Ambient animations (trees swaying, lights flickering)
- Screen-wide notification for important events
- **Completion**: Scene feels alive and polished

### Task 7.2: System Stats Dashboard
- Total agents (by status breakdown)
- Tasks completed (last hour / today)
- Message throughput
- Average task completion time
- System health score
- Mini charts (sparklines)
- **Completion**: Stats panel shows meaningful metrics

### Task 7.3: Responsive & Performance
- Canvas auto-resize on window resize
- Side panel collapsible on smaller screens
- Optimize sprite rendering (culling off-screen sprites)
- WebSocket message batching for performance
- **Completion**: Smooth on 1080p+, acceptable on 768p

**Phase 7 Milestone**: Production-quality UX

---

## Phase 8: Deployment (Complexity: Low)

### Task 8.1: Build Pipeline
- Client build: `vite build` with correct base path
- Server build: `tsc` compile
- Combined start script
- **Completion**: `npm run build` produces deployable artifacts

### Task 8.2: GitHub Pages Deployment
- Deploy client to GitHub Pages (gh-pages branch)
- Server: include instructions for local/docker run
- Or: bundle server as serverless function / embed mock mode in client
- **Completion**: Live URL accessible

### Task 8.3: Documentation
- README with screenshots, architecture overview, setup instructions
- API documentation (endpoints + WebSocket protocol)
- Development guide
- **Completion**: README is comprehensive

**Phase 8 Milestone**: Live deployment, accessible via URL

---

## Dependency Graph

```
Phase 1 (Infrastructure) → Phase 2 (Types)
Phase 2 → Phase 3 (Backend) + Phase 4 (Phaser)  [parallel]
Phase 3 + Phase 4 → Phase 5 (Integration)
Phase 5 → Phase 6 (Real-time Connection)
Phase 6 → Phase 7 (Polish)
Phase 7 → Phase 8 (Deploy)
```

## Technical Risks

1. **Phaser + React integration complexity** — Mitigate: use Zustand as bridge, keep Phaser state minimal
2. **Pixel art asset quality** — Mitigate: use programmatic generation or well-known free assets (kenney.nl)
3. **WebSocket performance with many agents** — Mitigate: batch updates, throttle animations
4. **Tilemap design** — Mitigate: code-generate simple tilemap rather than depending on Tiled editor
5. **Monorepo build complexity** — Mitigate: npm workspaces (simple), avoid Turborepo overhead
