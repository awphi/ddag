import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["./src/index.ts"],
    treeshake: true,
    minify: false,
    verbose: true,
    dts: true,
    clean: true,
    outDir: "./dist",
    format: "esm",
    target: "es6",
  },
]);
