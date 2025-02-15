import { Node } from "./types";

export class GlobalContext {
  private devToolsEnabled = false;
  private parentToChildren = new Map<Node, Set<Node>>();
  private nodeToId = new Map<Node, number>();
  private nextId = 0;

  addNode(node: Node): void {
    this.nodeToId.set(node, this.nextId);
    this.nextId++;
    this.updateDevToolsWithState();
  }

  registerDeps(node: Node, deps: Node[]): void {
    const map = this.parentToChildren;
    for (const em of deps) {
      if (!map.has(em)) {
        map.set(em, new Set());
      }
      map.get(em)!.add(node);
    }
    this.updateDevToolsWithState();
  }

  bfs(root: Node): Node[] {
    const traversed: Node[] = [];
    const visited = new Set<Node>();
    const queue: Node[] = [root];

    while (queue.length > 0) {
      const current = queue.shift()!;
      traversed.push(current!);

      if (visited.has(current)) {
        // TODO more helpful error message
        throw new Error("Cycle detected");
      }

      // Enqueue all children of the current node, if they exist in the tree
      const children = this.parentToChildren.get(current);
      if (children !== undefined) {
        for (const child of children) {
          queue.push(child);
        }
      }
    }

    return traversed;
  }

  enableDevTools(): void {
    this.devToolsEnabled = true;
    this.updateDevToolsWithState();
  }

  private serialize(): any {
    const parentToChildren: [number, number][] = [];
    const nodes: { id: number }[] = [];

    for (const [parent, children] of this.parentToChildren.entries()) {
      for (const child of children) {
        parentToChildren.push([
          this.nodeToId.get(parent)!,
          this.nodeToId.get(child)!,
        ]);
      }
    }

    for (const [node, id] of this.nodeToId.entries()) {
      nodes.push({ id, ...node.serialize() });
    }

    return {
      nodes,
      parentToChildren,
    };
  }

  /**
   * Send the most recent copy of the context to the extension if enabled.
   */
  private updateDevToolsWithState(): void {
    if (this.devToolsEnabled) {
      window.postMessage({
        ddag: true,
        from: "page",
        state: { ...this.serialize() },
      });
    }
  }

  // TODO some way the ddag primitives can inform the context (and thus the devtools) when they recompute as well as how long it took
}

export const context = new GlobalContext();

window.addEventListener("message", ({ data }) => {
  if (data.ddag && data.from === "ext") {
    if (data.type === "canary") {
      context.enableDevTools();
    }
  }
});
