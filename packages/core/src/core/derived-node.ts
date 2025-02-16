import { GraphNodeInternal } from "./graph-node.js";
import type { MultiCache } from "./public-types.js";

/** @internal */
export class DerivedNodeInternal<T = unknown> extends GraphNodeInternal<T> {
  private cache: MultiCache<unknown[], T> | null = null;

  constructor(
    name: string | undefined,
    private fn: () => T,
    private deps: GraphNodeInternal[],
    public readonly eager: boolean
  ) {
    super(name);
  }

  override get(): T {
    if (this.cache === null) {
      return this.fn();
    }

    const args = this.deps.map((dep) => dep.get());
    const maybeResult = this.cache.get(args);
    if (maybeResult !== null) {
      return maybeResult;
    }

    const result = this.fn();
    this.cache.set(args, result);
    return result;
  }
}
