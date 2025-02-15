import { source, derived, effect } from "@ddag/core";
import "./style.css";

const a = source(15);
const b = derived(() => {
  const r = a() * 2;
  console.log("derive", r);
  return r;
}, [a]);
effect(() => console.log("effect", b() * 2), [b]);
