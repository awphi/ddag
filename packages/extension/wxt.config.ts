import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  runner: {
    startUrls: ["http://localhost:5173"],
  },
  modules: ["@wxt-dev/module-react"],
});
