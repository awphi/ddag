import { Sandpack } from "@codesandbox/sandpack-react";
import { useColorMode } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import { useRef } from "react";
// @ts-ignore
import ddagRaw from "!!raw-loader!@ddag/core";

const defaultPlaygroundContent = `import { graph } from "@ddag/core";

const g = graph();

const a = g.source(15);

const b = g.derived(() => {
  const r = a() * 2;
  console.log("derive b", r);
  return r;
}, [a]);

const c = g.derived(() => {
  const r = a() * 4;
  console.log("derive c", r);
  return r;
}, [a]);

g.effect(() => console.log("effect", b() + c()), [b, c]);`;

function Playground(): React.ReactNode {
  const { colorMode } = useColorMode();
  // TODO index.js should probably be a renderer for the graph and hidden
  const files = useRef({
    "index.js": defaultPlaygroundContent,
    "/node_modules/@ddag/core/package.json": {
      hidden: true,
      code: JSON.stringify({
        name: "@ddag/core",
        main: "./index.js",
      }),
    },
    "/node_modules/@ddag/core/index.js": {
      hidden: true,
      code: ddagRaw,
    },
  });

  return (
    <>
      <Sandpack
        files={files.current}
        theme={colorMode}
        options={{
          showConsole: true,
          showLineNumbers: true,
          editorHeight: "calc(100vh - var(--ifm-navbar-height))",
        }}
      ></Sandpack>
    </>
  );
}

export default function PlaygroundWrapper(): React.ReactNode {
  return (
    <Layout title="playground">
      <Playground></Playground>
    </Layout>
  );
}
