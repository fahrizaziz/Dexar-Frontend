import { MfeEvent, MfeEventListener } from './types';

class CrossMfeEventBus {
  private listeners: Map<string, Set<MfeEventListener>> = new Map();
  private history: MfeEvent[] = [];
  private maxHistory = 50;

  public publish<T = any>(sourceMfeId: string, eventName: string, payload: T): void {
    const event: MfeEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      sourceMfeId,
      eventName,
      payload,
    };

    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error processing MFE event ${eventName} in listener:`, err);
        }
      });
    }

    // Also trigger wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((listener) => listener(event));
    }
  }

  public subscribe<T = any>(eventName: string, listener: MfeEventListener<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(listener);

    return () => {
      const set = this.listeners.get(eventName);
      if (set) {
        set.delete(listener);
      }
    };
  }

  public getEventHistory(): MfeEvent[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }
}

export const mfeEventBus = new CrossMfeEventBus();
