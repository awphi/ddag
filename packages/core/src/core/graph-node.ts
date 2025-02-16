let nextId = 0;

/** @internal */
export abstract class GraphNodeInternal<T = unknown> {
  public readonly id: number = nextId++;

  constructor(public readonly name: string = `node-${this.id}`) {}

  abstract get(): T;
}
