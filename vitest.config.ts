import { defineConfig } from "vitest/config";

// No passWithNoTests: a broken include glob must fail the run (decision 0001).
export default defineConfig({
  test: {
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.venv/**"],
  },
});
