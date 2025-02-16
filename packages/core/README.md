# @ddag/core

Define the flow of your in-memory data in a highly customisable, framework-agnostic DAG.

## API (WIP)

```ts
import * as ddag from "@ddag/core";

const graph = ddag.graph();

const a = graph.source(15);
const b = graph.derived(() => {
  const r = a() * 2;
  console.log("derive", r);
  return r;
}, [a]);

graph.effect(() => console.log("effect", b() * 2), [b]);

// ... later in your program if needed ...

graph.destroy();
```
