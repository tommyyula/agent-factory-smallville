import { EventEmitter } from 'events';
import { Agent, Task, Message, Memory, SceneConfig, AgentStatus, TaskStatus } from '@agent-factory/shared';

// In-memory store with event emission for real-time updates
export class MemoryStore<T> extends EventEmitter {
  private data = new Map<string, T>();

  set(id: string, item: T): void {
    this.data.set(id, item);
    this.emit('updated', id, item);
  }

  get(id: string): T | undefined {
    return this.data.get(id);
  }

  getAll(): T[] {
    return Array.from(this.data.values());
  }

  delete(id: string): boolean {
    const existed = this.data.has(id);
    this.data.delete(id);
    if (existed) {
      this.emit('deleted', id);
    }
    return existed;
  }

  clear(): void {
    this.data.clear();
    this.emit('cleared');
  }

  has(id: string): boolean {
    return this.data.has(id);
  }

  size(): number {
    return this.data.size;
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.getAll().find(predicate);
  }
}

// Global stores
export const agentStore = new MemoryStore<Agent>();
export const taskStore = new MemoryStore<Task>();
export const messageStore = new MemoryStore<Message>();
export const memoryStore = new MemoryStore<Memory>();

// Scene configuration store (singleton)
let sceneConfig: SceneConfig | null = null;

export const sceneStore = {
  get: () => sceneConfig,
  set: (config: SceneConfig) => {
    sceneConfig = config;
  },
  update: (updates: Partial<SceneConfig>) => {
    if (sceneConfig) {
      sceneConfig = { ...sceneConfig, ...updates };
    }
  }
};

// Store event handlers for WebSocket broadcasting
agentStore.on('updated', (id: string, agent: Agent) => {
  // Will be handled by WebSocket service
  console.log(`Agent ${id} updated:`, agent.status);
});

taskStore.on('updated', (id: string, task: Task) => {
  console.log(`Task ${id} updated:`, task.status);
});

messageStore.on('updated', (id: string, message: Message) => {
  console.log(`Message ${id} created from ${message.fromAgent}`);
});