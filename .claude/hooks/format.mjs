// PostToolUse hook: format the file Claude just edited or wrote (decision 0001).
// Prettier for TS/JS/JSON/YAML/CSS, Ruff for Python. Each tool's own ignore
// rules apply (.prettierignore, .gitignore, [tool.ruff] excludes).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const PRETTIER_EXTS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".css",
]);
const RUFF_EXTS = new Set([".py", ".pyi"]);
const SKIP_NAMES = new Set(["package-lock.json", "uv.lock"]);

const input = JSON.parse(readFileSync(0, "utf8"));
const file = input.tool_input?.file_path;
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd;
if (!file || !root) process.exit(0);

// Only files inside this repo.
const rel = path.relative(root, file);
if (rel.startsWith("..") || path.isAbsolute(rel)) process.exit(0);
if (SKIP_NAMES.has(path.basename(file))) process.exit(0);

const ext = path.extname(file).toLowerCase();
let result;
if (PRETTIER_EXTS.has(ext)) {
  const prettier = path.join(
    root,
    "node_modules",
    "prettier",
    "bin",
    "prettier.cjs",
  );
  if (!existsSync(prettier)) fail("Prettier not installed; run `npm install`.");
  result = spawnSync(
    process.execPath,
    [prettier, "--write", "--log-level", "warn", file],
    { cwd: root, encoding: "utf8" },
  );
} else if (RUFF_EXTS.has(ext)) {
  // --frozen: never touch uv.lock. --no-sync: never install or remove
  // packages; if Ruff is missing, the error tells Claude to run `uv sync`.
  result = spawnSync(
    "uv",
    [
      "run",
      "--frozen",
      "--no-sync",
      "--quiet",
      "ruff",
      "format",
      "--force-exclude",
      file,
    ],
    { cwd: root, encoding: "utf8" },
  );
} else {
  process.exit(0);
}

if (result.error) fail(`Could not run formatter: ${result.error.message}`);
if (result.status !== 0) {
  fail(`Formatter failed on ${rel}:\n${result.stderr || result.stdout}`);
}

// Exit 2 shows stderr to Claude, so it can fix or report the problem.
function fail(message) {
  process.stderr.write(`format hook: ${message}\n`);
  process.exit(2);
}
