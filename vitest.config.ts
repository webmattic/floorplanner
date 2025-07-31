import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    include: ["src/components/**/*.test.{ts,tsx,js,jsx}"],
    coverage: {
      reporter: ["text", "json", "lcov"],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
});
