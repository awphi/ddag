import { GraphNodeInternal } from "./graph-node";
import type { MultiCache } from "./public-types";

/** @internal */
export class DerivedNodeInternal<T = unknown> extends GraphNodeInternal<T> {
  constructor(
    name: string | undefined,
    private fn: () => T,
    private deps: GraphNodeInternal[],
    public readonly eager: boolean,
    public readonly cache: MultiCache<unknown[], T> | null
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
