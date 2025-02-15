export interface Node<T = unknown> {
  (): T;
  serialize(): any; // TODO types?
}

export interface Source<T = unknown> extends Node<T> {
  set(t: T): void;
}

export interface Derived<T = unknown> extends Node<T> {
  (): T;
  readonly eager: boolean;
}

export interface DerivedOpts<T> {
  eager?: boolean;
  cache?: MultiCache<unknown[], T> | null;
  name?: string;
}

export interface SourceOpts {
  name?: string;
}

export interface MultiCache<K extends unknown[], V> {
  get(key: K): V | null;
  set(key: K, value: V): void;
  serialize(): any; // TODO types?
}
