export interface GraphNodeOptions {
  name: string;
}

export interface SourceNodeOptions extends GraphNodeOptions {}

export interface DerivedNodeOptions<V> extends GraphNodeOptions {
  eager: boolean;
  cache: MultiCache<unknown[], V> | null;
}

export interface EffectNodeOptions extends GraphNodeOptions {}

export interface GraphNode<T = unknown> {
  (): T;
}

export interface SourceGraphNode<T = unknown> extends GraphNode<T> {
  set(t: T): void;
}

export interface DerivedGraphNode<T = unknown> extends GraphNode<T> {}

export interface MultiCache<K extends unknown[], V> {
  get(key: K): V | null;
  set(key: K, value: V): void;
}
