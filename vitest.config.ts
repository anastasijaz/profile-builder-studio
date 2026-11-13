// Standalone Vitest config: the app's vite.config.ts pulls in the Lovable /
// Cloudflare plugins, which aren't needed (or wanted) for unit tests.
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
