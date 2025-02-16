import { GraphNodeInternal } from "./graph-node.js";

/** @internal */
export class SourceNodeInternal<T = unknown> extends GraphNodeInternal<T> {
  private val: T;

  constructor(name: string | undefined, initialVal: T) {
    super(name);
    this.val = initialVal;
  }

  set(val: T): void {
    this.val = val;
  }

  override get(): T {
    return this.val;
  }
}
