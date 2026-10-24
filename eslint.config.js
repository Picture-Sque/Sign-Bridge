import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/node_modules/", "**/dist/", "**/build/", "**/.venv/"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.tsx"],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    // Node scripts (for example .claude/hooks). Listed by hand to avoid
    // adding the `globals` package.
    files: ["**/*.mjs"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly" },
    },
  },
  // Last, so formatting rules defer to Prettier.
  prettier,
]);
