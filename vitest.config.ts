import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    // axe-core scans of full responsive pages are CPU-heavy and can exceed the
    // 5s default on slower machines / under parallel load.
    testTimeout: 20000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
