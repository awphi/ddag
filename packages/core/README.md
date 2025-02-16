# @ddag/core

Define the flow of your in-memory data in a highly customisable, framework-agnostic DAG.

## API (WIP)

```ts
import { graph } from "@ddag/core";

const g = graph();

const a = g.source(15);
const b = g.derived(() => {
  const r = a() * 2;
  console.log("derive", r);
  return r;
}, [a]);

g.effect(() => console.log("effect", b() * 2), [b]);

// ... later in your program if needed ...

g.destroy();
```
