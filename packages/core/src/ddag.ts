import { LRUMultiCache } from "./caching/lru";
import { Source, SourceOpts, Derived, DerivedOpts, Node } from "./types";
import { context } from "./context";

export function source<T>(initialVal: T, opts?: SourceOpts): Source<T> {
  let val = initialVal;
  const src = Object.assign(() => val, {
    set: (v: T) => {
      val = v;

      for (const child of context.bfs(src)) {
        if (child !== src && (child as Derived).eager) {
          child();
        }
      }
    },
    serialize: () => ({ type: "source", val, name: opts?.name ?? null }),
  });

  context.addNode(src);
  return src;
}

export function derived<T>(
  fn: () => T,
  deps: Node[],
  opts?: DerivedOpts<T>
): Derived<T> {
  const cache =
    opts?.cache !== null ? opts?.cache ?? new LRUMultiCache(1) : null;
  const eager = opts?.eager ?? false;

  const derive = Object.assign(
    cache === null
      ? () => fn()
      : () => {
          const args = deps.map((dep) => dep());
          const maybeResult = cache.get(args);
          if (maybeResult !== null) {
            return maybeResult;
          }

          const result = fn();
          cache.set(args, result);
          return result;
        },
    {
      eager,
      serialize: () => ({
        eager,
        type: "derived",
        cache: cache?.serialize() ?? null,
        name: opts?.name ?? null,
      }),
    }
  );

  context.addNode(derive);
  context.registerDeps(derive, deps);

  if (derive.eager) {
    derive();
  }

  return derive;
}

export function effect(fn: () => void | Promise<void>, deps: Node[]): void {
  // effects are just a special case of derived values that are always eager and
  // cannot be fed into other derived values so we enforce this by hard-coding eager: true
  // and hiding the reference to the value from the API user
  derived(fn, deps, { eager: true });
}
