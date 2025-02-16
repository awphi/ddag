import { DerivedNodeInternal } from "./derived-node.js";
import type { GraphNodeInternal } from "./graph-node.js";
import type {
  DerivedGraphNode,
  DerivedNodeOptions,
  EffectNodeOptions,
  GraphNode,
  SourceGraphNode,
  SourceNodeOptions,
} from "./public-types.js";
import { SourceNodeInternal } from "./source-node.js";

let nextId: number = 0;

class Graph {
  public readonly id: number = nextId++;

  /** @internal */
  private _links = new Map<GraphNodeInternal, Set<GraphNodeInternal>>(); // parent -> set of children
  /** @internal */
  private _allNodes = new Set<GraphNodeInternal>();
  /** @internal */
  private _externalToInternal = new WeakMap<GraphNode, GraphNodeInternal>();

  constructor(public readonly name: string = `graph-${this.id}`) {}

  /** @internal */
  _bfs(root: GraphNodeInternal): GraphNodeInternal[] {
    const traversed: GraphNodeInternal[] = [];
    const visited = new Set<GraphNodeInternal>();
    const queue: GraphNodeInternal[] = [root];

    while (queue.length > 0) {
      const current = queue.shift()!;
      traversed.push(current!);

      if (visited.has(current)) {
        throw new Error("Cycle detected"); // TODO more helpful error message
      }

      // Enqueue all children of the current node, if they exist in the tree
      const children = this._links.get(current);
      if (children !== undefined) {
        for (const child of children) {
          queue.push(child);
        }
      }
    }

    return traversed;
  }

  source<T>(
    initialVal: T,
    opts?: Partial<SourceNodeOptions>
  ): SourceGraphNode<T> {
    const sourceNode = new SourceNodeInternal<T>(opts?.name, initialVal);
    const sourceNodeExternal: SourceGraphNode<T> = Object.assign(
      sourceNode.get.bind(sourceNode),
      {
        set: (val: T) => {
          sourceNode.set(val);

          for (const child of this._bfs(sourceNode)) {
            if (child instanceof DerivedNodeInternal && child.eager) {
              child.get();
            }
          }
        },
      }
    );
    this._externalToInternal.set(sourceNodeExternal, sourceNode);
    return sourceNodeExternal;
  }

  derived<T>(
    fn: () => T,
    deps: GraphNode[],
    opts?: Partial<DerivedNodeOptions>
  ): DerivedGraphNode<T> {
    const depsInternal: GraphNodeInternal[] = [];

    for (const dep of deps) {
      const internalDep = this._externalToInternal.get(dep);
      if (internalDep === undefined) {
        throw new Error("Cannot add dependency on node outside of graph."); // TODO use names to produce more useful warning message
      }
      depsInternal.push(internalDep);
    }

    const derived = new DerivedNodeInternal<T>(
      opts?.name,
      fn,
      depsInternal,
      opts?.eager ?? false
    );

    return derived.get.bind(derived);
  }

  effect(
    fn: () => void | PromiseLike<void>,
    deps: GraphNode[],
    opts?: Partial<EffectNodeOptions>
  ): void {
    // effects are just a special case of derived values that are always eager and
    // cannot be fed into other derived values so we enforce this by hard-coding eager: true
    // and hiding the reference to the value from the API user
    this.derived(fn, deps, { ...opts, eager: true });
  }

  destroy(): void {
    this._links.clear();
    this._allNodes.clear();
    // TODO inform devtools
  }
}

export function graph(name?: string): Graph {
  return new Graph(name);
}

export { type Graph };
