# AGENTS.md — Agent Factory Smallville Dashboard

## Project Overview
Stanford Generative Agents (Smallville) style immersive 2D pixel-art real-time dashboard for ITEM's Agent Factory platform. Visualizes AI agents as characters in a virtual town with real-time state monitoring via WebSocket.

## Quick Map
- **Specs & PRD**: `.kiro/specs/agent-factory-smallville/` — requirements, design, domain analysis, tasks
- **Server Source**: `packages/server/src/`
- **Client Source**: `packages/client/src/`
- **Shared Types**: `packages/shared/src/`
- **Assets**: `packages/client/public/assets/`
- **Architecture**: See `.kiro/specs/agent-factory-smallville/design.md` §1

## Tech Stack
- **Game Engine**: Phaser 3 (2D pixel-art rendering, sprites, tilemap, pathfinding)
- **UI Framework**: React 18 + TypeScript + Vite
- **UI Components**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand (React-Phaser bridge)
- **Backend**: Node.js + Express + ws (WebSocket)
- **Monorepo**: npm workspaces
- **Deploy**: GitHub Pages (client) + local/docker (server)

## Architecture Rules
1. **Layered architecture**: domain types → server services → API routes → WebSocket → client stores → UI/Phaser
2. **Dependency direction**: shared types ← server, shared types ← client. Server and client never import each other.
3. **Phaser-React bridge**: Zustand store is the single source of truth. Phaser reads from store, React reads from store. No direct Phaser↔React communication.
4. **Mock-first**: V1 uses mock behavior simulator. Real Agent Factory API integration in v2.
5. **Event-driven**: All real-time updates flow through WebSocket events, never polling.

## Coding Conventions
- TypeScript strict mode, no `any`
- Shared types in `packages/shared/src/`
- Chinese UI labels, English code/comments
- Component files < 300 lines; extract sub-components if longer
- Phaser scenes in `packages/client/src/game/scenes/`
- React components in `packages/client/src/components/`

## Key Design Decisions
- **Tilemap**: Code-generated (no Tiled dependency) — 40x30 grid, 32px tiles
- **Sprites**: Programmatically generated pixel art (colored rectangles with features) — no external asset dependency
- **Pathfinding**: Simple A* on grid
- **State sync**: REST for initial load, WebSocket for incremental updates

## Deployment
- Client: GitHub Pages via gh-pages branch, base path: `/agent-factory-smallville/`
- Server: runs locally or in Docker, client connects via WebSocket URL config
- For demo: client includes embedded mock mode (no server needed)
