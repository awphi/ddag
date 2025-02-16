import { arraysEqual } from "../util.js";
import type { MultiCache } from "../public-types.js";

export class LRUMultiCache<K extends unknown[], V> implements MultiCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private capacity: number) {}

  private find(key: K): K | null {
    for (const otherKey of this.cache.keys()) {
      if (arraysEqual(key, otherKey)) {
        return otherKey;
      }
    }

    return null;
  }

  get(key: K): V | null {
    const existingKey = this.find(key);
    if (existingKey === null) {
      return null;
    }

    const value = this.cache.get(existingKey)!;
    this.cache.delete(existingKey);
    this.cache.set(existingKey, value);

    return value;
  }

  set(key: K, value: V): void {
    const existingKey = this.find(key);
    if (existingKey !== null) {
      this.cache.delete(existingKey);
    }

    if (this.cache.size === this.capacity) {
      const oldestKey = this.cache.keys().next().value!;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
  }
}
