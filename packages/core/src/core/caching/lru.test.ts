import { it, expect } from "vitest";
import { lru } from "./lru";

it("should store and retrieve values with array keys", () => {
  const cache = lru<[string, number], string>(3);
  cache.set(["a", 1], "value1");

  expect(cache.get(["a", 1])).toBe("value1");
});

it("should handle array key equality correctly", () => {
  const cache = lru<[string, number], string>(3);
  cache.set(["a", 1], "value1");

  // different array instance but same values should work
  expect(cache.get(["a", 1])).toBe("value1");
});

it("should maintain LRU order and respect capacity", () => {
  const cache = lru<[string], number>(2);

  cache.set(["a"], 1);
  cache.set(["b"], 2);
  cache.set(["c"], 3);

  // "a" should be evicted
  expect(cache.get(["a"])).toBeNull();
  expect(cache.get(["b"])).toBe(2);
  expect(cache.get(["c"])).toBe(3);
});

it("should update access order on get", () => {
  const cache = lru<[string], number>(2);

  cache.set(["a"], 1);
  cache.set(["b"], 2);

  // access "a" to make it most recently used
  cache.get(["a"]);

  // add new item, should evict "b" instead of "a"
  cache.set(["c"], 3);

  expect(cache.get(["a"])).toBe(1);
  expect(cache.get(["b"])).toBeNull();
  expect(cache.get(["c"])).toBe(3);
});

it("should update existing keys with new values", () => {
  const cache = lru<[string, number], string>(3);

  cache.set(["a", 1], "original");
  cache.set(["a", 1], "updated");

  expect(cache.get(["a", 1])).toBe("updated");
});

it("should handle empty cache correctly", () => {
  const cache = lru<[string], number>(1);

  expect(cache.get(["nonexistent"])).toBeNull();
});

it("should clear all entries from the cache", () => {
  const cache = lru<[string], number>(3);

  cache.set(["a"], 1);
  cache.set(["b"], 2);
  cache.set(["c"], 3);

  cache.clear();

  expect(cache.get(["a"])).toBeNull();
  expect(cache.get(["b"])).toBeNull();
  expect(cache.get(["c"])).toBeNull();
});
