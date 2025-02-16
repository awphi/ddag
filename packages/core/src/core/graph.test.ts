import { it, expect } from "vitest";
import { graph } from "./graph.js";
import { LRUMultiCache } from "./caching/lru.js";

it("creates a graph with a name", () => {
  const g = graph("test-graph");
  expect(g.name).toBe("test-graph");
});

it("creates source nodes with initial values", () => {
  const g = graph();
  const source = g.source(42);
  expect(source()).toBe(42);
});

it("updates source node values", () => {
  const g = graph();
  const source = g.source(42);
  source.set(100);
  expect(source()).toBe(100);
});

it("creates derived nodes that depend on source nodes", () => {
  const g = graph();
  const source = g.source(42);
  const derived = g.derived(() => source() * 2, [source]);
  expect(derived()).toBe(84);
});

it("updates derived nodes when source nodes change", () => {
  const g = graph();
  const source = g.source(42);
  const derived = g.derived(() => source() * 2, [source]);
  source.set(50);
  expect(derived()).toBe(100);
});

it("handles multiple dependencies in derived nodes", () => {
  const g = graph();
  const a = g.source(10);
  const b = g.source(5);
  const sum = g.derived(() => a() + b(), [a, b]);
  expect(sum()).toBe(15);

  a.set(20);
  expect(sum()).toBe(25);

  b.set(10);
  expect(sum()).toBe(30);
});

it("executes effects when dependencies change", () => {
  const g = graph();
  const source = g.source(0);
  let effectValue = 0;

  g.effect(() => {
    effectValue = source() * 2;
  }, [source]);

  expect(effectValue).toBe(0);
  source.set(5);
  expect(effectValue).toBe(10);
});

it("throws error when adding dependency on node outside of graph", () => {
  const g1 = graph();
  const g2 = graph();
  const sourceA = g1.source(10);
  const sourceB = g2.source(20);

  expect(() => {
    g1.derived(() => sourceA() + sourceB(), [sourceA, sourceB]);
  }).toThrow("Cannot add dependency on node outside of graph");
});

it("handles eager derived nodes", () => {
  const g = graph();
  const source = g.source(42);
  let computeCount = 0;

  const derived = g.derived(
    () => {
      computeCount++;
      return source() * 2;
    },
    [source],
    { eager: true }
  );

  // initial computation happens immediately due to eager: true
  expect(computeCount).toBe(1);

  source.set(50);
  // should recompute automatically due to eager: true
  expect(computeCount).toBe(2);
  expect(derived()).toBe(100);
  // should not recompute again when accessed
  expect(computeCount).toBe(2);
});

it("cleans up graph when destroyed", () => {
  const g = graph();
  const source = g.source(42);
  let computeCount = 0;

  const derived = g.derived(
    () => {
      computeCount++;
      return source() * 2;
    },
    [source],
    { eager: true }
  );

  // Initial computation
  expect(derived()).toBe(84);
  expect(computeCount).toBe(1);

  g.destroy();

  // after destroy, source updates should not trigger recomputation
  source.set(50);
  expect(computeCount).toBe(1);
});

it("respects cache capacity in derived values", () => {
  const g = graph();
  const source = g.source(1);
  let computeCount = 0;

  const derived = g.derived(
    () => {
      computeCount++;
      return source() * 2;
    },
    [source],
    { cache: new LRUMultiCache(2) }
  );

  // initial computation
  derived();
  expect(computeCount).toBe(1);

  // should hit cache
  derived();
  expect(computeCount).toBe(1);

  source.set(2);
  derived();
  expect(computeCount).toBe(2);

  // should still hit cache for previous value
  source.set(1);
  derived();
  expect(computeCount).toBe(2);

  // should evict lru value (2) from cache
  source.set(3);
  derived();
  expect(computeCount).toBe(3);

  // should recompute since value 1 was evicted
  source.set(2);
  derived();
  expect(computeCount).toBe(4);

  // should hit cache for recent values
  source.set(3);
  derived();
  expect(computeCount).toBe(4);
  source.set(2);
  derived();
  expect(computeCount).toBe(4);
});

it("works with disabled cache", () => {
  const g = graph();
  const source = g.source(1);
  let computeCount = 0;

  const derived = g.derived(
    () => {
      computeCount++;
      return source() * 2;
    },
    [source],
    { cache: null }
  );

  // should compute every time
  derived();
  expect(computeCount).toBe(1);
  derived();
  expect(computeCount).toBe(2);
  derived();
  expect(computeCount).toBe(3);

  // should compute even with same source value
  source.set(1);
  derived();
  expect(computeCount).toBe(4);
  derived();
  expect(computeCount).toBe(5);
});
