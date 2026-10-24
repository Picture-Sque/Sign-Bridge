# 0001: Dev tooling and CI

- **Status:** Proposed
- **Task:** P0-03
- **Decided by:**
- **Date:**

## Context

P0-03 picks the package managers, linters, formatters and test runners for TypeScript and Python 3.11, and sets up CI to run lint and tests on every push. The acceptance criterion is one command each for lint and test, for TS and for Python. All four have to pass on the empty scaffold, CI has to run them, and the CLAUDE.md Commands section has to be filled in. Every later code task depends on this, because the implement-task and verify-task skills only run commands listed in CLAUDE.md.

Requirements, numbered so the options below can refer to them:

- **R1** One lint command and one test command per language, passing on the empty scaffold, run by CI on every push (tasks.md P0-03 Goal, Acceptance).
- **R2** A deliberate lint error and a failing placeholder test each make CI fail (P0-03 Test).
- **R3** TS uses workspaces under a root `package.json`. Python uses `pyproject.toml` files (P0-03 Files).
- **R4** React + TS in `apps/web`, Python 3.11 in `services/` and `ml/` (CLAUDE.md Stack). The frontend runs on the Vite dev server (architecture 9).
- **R5** The layout follows architecture 11. TS: `apps/web`, `apps/recorder`, `packages/landmarks-ts`, `packages/capture-web`, the TS half of `packages/schemas`. Python: `services/caption-agent`, `services/mt`, `packages/landmarks-py`, the Python half of `packages/schemas`, `ml/*`.
- **R6** `landmarks-py` is the reference and `landmarks-ts` must pass golden tests against it on fixed inputs (CLAUDE.md Rules, architecture 4.2). Both test runners must read the same JSON fixtures, and Python and TS code in the same package (`packages/schemas`) must be supported.
- **R7** Every command works the same on every OS the team uses. The team asked for this. The actual OS mix is still an open question below.
- **R8** Reproducibility: every reported metric traces to a versioned model, split and config (PRD 7 NFR-8). This argues for locked dependency versions, Python included.
- **R9** CI needs no secrets and no datasets (CLAUDE.md: no secrets in code, no data in git).
- **R10** CI should not install heavy ML dependencies (PyTorch, ONNX Runtime) just to lint and run unit tests. This is a team request.
- **R11** The tooling must not settle the backend language. P1-01 decides FastAPI vs Node (record 0003). `apps/backend` has to fit either.
- **R12** Every tool picked here is a new dependency and needs approval (CLAUDE.md).

Conflicts:

- R8 vs R10. With one shared lock, versions stay consistent across packages, which helps R8 and normalization parity (R6). But CI then has to install only part of what is locked. Fully separate environments make R10 simple and let versions drift between training and the agent.
- R10 vs later tasks. P1-24 (ONNX export and parity) and P1-25 (agent inference) will have tests that need ONNX Runtime. If CI never installs it, those tests run only on developer machines. See Open questions.

Without a decision here, each task picks its own tools, CLAUDE.md has no commands, and no task can be verified.

The record splits the decision into areas because the choices are mostly independent. Each area lists real options.

## Options

### Area 1: Python environments and packaging

#### Option 1A: uv workspace, one lockfile, CI installs only lightweight packages

- **How it works:** A root `pyproject.toml` declares a uv workspace. Each Python package (`packages/landmarks-py`, `services/caption-agent`, `services/mt`, `ml/train`, ...) has its own `pyproject.toml` with its own dependencies. One `uv.lock` at the root pins versions for the whole workspace. Developers run `uv sync` and get one `.venv`. CI installs only the members that have no heavy dependencies. It does that either with `uv sync --package <name>` for each lightweight member, or by keeping torch and onnxruntime in a dependency group or extra that CI leaves out. Whether uv supports either form in the way described here is **to verify**. That includes whether `uv sync --package` installs only that member's dependencies, and how a "lightweight only" selection is written for several members at once.
- **Pros:** One resolved version per library across training, recorder and agent, which supports R6 and R8. One lockfile to update. uv can install Python 3.11 itself, so Windows, macOS and Linux all use the same commands without separate Python installers (**to verify** on each OS the team uses). `uv run <cmd>` works without activating a venv, which avoids the per-OS activation difference.
- **Cons:** All members have to resolve together. If livekit-agents, PyTorch and ONNX Runtime ever require incompatible versions of a shared library, the whole workspace fails to lock until that's fixed. Members also share one `requires-python` range. The CI subset has to be maintained as packages are added. Tests that need torch or onnxruntime need a marker so the CI job skips them, and that is a coverage gap (see Open questions). uv is newer than pip, so some team members will be learning it.
- **Team effort:** Low to medium. Most of it is getting the CI subset right and deciding the skip marker.
- **Requirements:** meets R1, R3, R5, R6, R7 (to verify), R8, R9, R10. Weakens R10 only if the subset is set up wrong.

#### Option 1B: Independent uv project per package

- **How it works:** Each Python package is its own uv project with its own `uv.lock` and `.venv`. Shared code such as `landmarks-py` is a path dependency of the packages that use it. CI runs a matrix with one job per package, and heavy packages get their own job or are left out.
- **Pros:** Full isolation, so a dependency conflict in one package doesn't block the others. Heavy dependencies exist only where declared. Per-package CI jobs give clear failure signals.
- **Cons:** Versions drift. Training and the agent can end up on different numpy or onnxruntime versions, which is the train/serve skew CLAUDE.md warns about. There are N lockfiles and N environments to update, and one lint or test command for the whole Python side has to loop over packages.
- **Team effort:** Medium. Effort grows with each package added.
- **Requirements:** meets R3, R5, R7 (to verify), R9, R10. Weakens R1 (one command needs a wrapper), R6 and R8 (drift).

#### Option 1C: pip + venv + pip-tools, requirements files per package

- **How it works:** Each package has a `pyproject.toml` for metadata plus `requirements.in`, compiled to a pinned `requirements.txt` with pip-tools. Developers create venvs with `python -m venv`. CI installs only the lightweight requirements files.
- **Pros:** The tools most Python developers already know. No new package manager, only pip-tools.
- **Cons:** Python 3.11 must be installed separately on each machine. Venv activation differs by OS (`.venv\Scripts\activate` vs `source .venv/bin/activate`), which works against R7. Workspace-wide pinning means either one combined requirements file or manual alignment. Installs are slower in CI.
- **Team effort:** Low to start, higher to keep pins aligned across packages.
- **Requirements:** meets R3, R5, R9, R10. Weakens R1, R7 and R8.

### Area 2: Python lint, format and test

#### Option 2A: Ruff (lint and format) + pytest

- **How it works:** Ruff handles both linting and formatting (`ruff check`, `ruff format --check`), configured once in the root `pyproject.toml`. pytest runs tests.
- **Pros:** One tool, one config, fast. pytest is the common default and reads JSON fixtures easily (R6).
- **Cons:** Ruff's formatter is close to Black's output but not identical (**to verify** for edge cases). That only matters if someone already uses Black.
- **Team effort:** Low.
- **Requirements:** meets R1, R2, R6, R7.

#### Option 2B: Flake8 + Black + isort + pytest

- **How it works:** The classic separate tools, each with its own config section.
- **Pros:** Long-established, widely documented.
- **Cons:** Three tools instead of one, so three dependencies to approve and three configs to keep consistent. Slower.
- **Team effort:** Low to medium.
- **Requirements:** meets R1, R2, R6, R7. Adds more dependencies under R12.

pytest exits with a non-zero code when it collects no tests. The empty scaffold therefore needs one trivial placeholder test so that R1 passes. This applies to both options.

### Area 3: TypeScript package manager

#### Option 3A: npm workspaces

- **How it works:** A root `package.json` with a `workspaces` list. npm ships with Node.
- **Pros:** Nothing extra to install on any OS. Every Node tutorial uses it.
- **Cons:** Slower installs than pnpm. It doesn't stop a package importing a dependency it never declared ("phantom" dependencies).
- **Team effort:** Low.
- **Requirements:** meets R1, R3, R5, R7, R11.

#### Option 3B: pnpm workspaces

- **How it works:** `pnpm-workspace.yaml` lists the packages. pnpm is installed separately or through corepack. Corepack's status in current Node releases is **to verify**.
- **Pros:** Faster installs and less disk use. Strict about undeclared dependencies, which catches mistakes early.
- **Cons:** One more tool to install on every machine and in CI. Some tooling and tutorials assume npm.
- **Team effort:** Low to medium.
- **Requirements:** meets R1, R3, R5, R7 (once installed), R11.

### Area 4: TypeScript lint and format

#### Option 4A: ESLint (flat config, typescript-eslint, react-hooks plugin) + Prettier

- **How it works:** ESLint for lint rules, Prettier for formatting, `eslint-config-prettier` to stop the two fighting.
- **Pros:** The standard pairing with the largest rule ecosystem, including React hooks rules. The Vite React TS template ships an ESLint config (**to verify** for the current template version).
- **Cons:** Several packages and two configs.
- **Team effort:** Low to medium.
- **Requirements:** meets R1, R2, R7.

#### Option 4B: Biome

- **How it works:** One tool and one config for both lint and format.
- **Pros:** Fewer dependencies and a single config. Fast.
- **Cons:** Smaller rule set than ESLint's plugin ecosystem. React hooks coverage is **to verify**. The team is less likely to have used it.
- **Team effort:** Low.
- **Requirements:** meets R1, R2, R7. Fewer dependencies under R12.

### Area 5: TypeScript test runner

#### Option 5A: Vitest

- **How it works:** A Vite-native test runner that reuses the Vite config.
- **Pros:** Fits the Vite dev server already chosen (R4). Its API is close to Jest's.
- **Cons:** It may exit non-zero when it finds no test files unless `--passWithNoTests` (or the equivalent config option) is set. This is **to verify**. It matters because P0-03 requires the test command to pass on the empty scaffold. The scaffold gets either a placeholder test or that setting.
- **Team effort:** Low.
- **Requirements:** meets R1, R2, R4, R6, R7.

#### Option 5B: Jest

- **How it works:** A standalone test runner, with ts-jest or Babel for TypeScript.
- **Pros:** Very widely known.
- **Cons:** Needs separate TS and ESM transform setup alongside Vite, so there are two build configs to keep in step.
- **Team effort:** Medium.
- **Requirements:** meets R1, R2, R6, R7. Weakens R4 fit.

### Area 6: CI

#### Option 6A: GitHub Actions

- **How it works:** A workflow in `.github/workflows/` runs on every push. It has two jobs, TS and Python, each running the lint and test commands.
- **Pros:** The repo is already on GitHub (`Picture-Sque/Sign-Bridge`). No extra account. Results show on PRs.
- **Cons:** Free minutes for private repos are limited, and Windows and macOS runners count at higher rates. Both are **to verify** for this repo's plan and visibility.
- **Team effort:** Low.
- **Requirements:** meets R1, R2, R9.

#### Option 6B: No hosted CI, a local pre-push hook runs the same commands

- **How it works:** A git hook runs lint and tests before each push.
- **Pros:** No CI minutes. Works offline.
- **Cons:** Hooks can be skipped and aren't installed by cloning. This does not meet "CI runs them" in the acceptance criterion.
- **Team effort:** Low.
- **Requirements:** misses R1 and R2 as written.

## Recommendation

1A, 2A, 3A, 4A, 5A, 6A. In plain terms: a uv workspace with one lockfile, Ruff and pytest for Python, npm workspaces with ESLint, Prettier and Vitest for TypeScript, and GitHub Actions.

- 1A is the only Python option that keeps one version per library across training, recorder and agent (R6, R8), and still lets CI skip PyTorch and ONNX Runtime (R10). Running `uv run` without activating a venv also helps R7. The risk is the uv features marked to verify. If `--package` or group exclusion doesn't work as described, fall back to 1B for the heavy packages only, and record that change.
- 2A and 4B both reduce tool count. Ruff is recommended because it also covers formatting and is the usual choice for new Python projects. For TS, ESLint is recommended over Biome because of React hooks rules and because the Vite template uses it. Biome is a fair choice if the team prefers one tool.
- 3A because npm needs nothing installed beyond Node on any OS (R7), and the team is small enough that pnpm's speed matters less.
- 5A because the frontend is already on Vite (R4).
- 6A because the repo is on GitHub and 6B doesn't meet the acceptance criterion.

The proposed commands (exact flags to verify during implementation):

| Purpose | Command |
|---|---|
| TS lint | `npm run lint` (ESLint and Prettier check, from the root) |
| TS test | `npm test` (Vitest across workspaces) |
| Python lint | One command that runs `ruff check` and then `ruff format --check` (see Open question 3) |
| Python test | `uv run pytest` |

## Consequences

If accepted, P0-03 implementation would add or change:

- Root: `package.json` (workspaces, lint and test scripts), `package-lock.json`, ESLint and Prettier configs, Vitest config, `pyproject.toml` (uv workspace, Ruff and pytest config), `uv.lock`, `.python-version` (3.11), a Node version pin (`.nvmrc` or `engines`, with the version to be chosen from the current LTS line at setup).
- Placeholder `pyproject.toml` / `package.json` in workspace members only where needed for the empty scaffold to pass. Each later task adds its own package manifest when it creates code.
- One trivial placeholder test per language so pytest and Vitest pass on the empty scaffold.
- `.github/workflows/ci.yml`, with TS and Python jobs on every push.
- `.gitignore`: already ignores `node_modules/` and `.venv/`. Lockfiles must stay committed, so no change is expected there. To check during implementation.
- `CLAUDE.md`: Commands section filled in with the four commands, plus setup steps (install Node and uv).
- `README.md`: replace the "commands will be added with task P0-03" line with setup steps.
- New dependencies needing approval (R12): uv, Ruff, pytest, ESLint, typescript-eslint, eslint-plugin-react-hooks, Prettier, eslint-config-prettier, Vitest, TypeScript. Licences are **to verify** before adding.
- architecture.md: no section depends on this choice. No change expected.
- tasks.md: P1-01 (backend) is unaffected either way. FastAPI would join the uv workspace and Node would join the npm workspaces. P1-08, P1-09, P1-24 and P1-25 will inherit the test-marker convention for heavy-dependency tests.

Planned follow-ups (not part of P0-03):

- **ONNX-only CI job, in P1-24.** When the parity tests exist, add a separate lightweight CI job that installs ONNX Runtime and not PyTorch. Two points for P1-24 to settle:
  - The P1-24 parity check compares ONNX Runtime against PyTorch. A job without PyTorch can only compare ONNX outputs against reference outputs saved earlier from PyTorch.
  - `.gitignore` excludes `*.onnx`, so CI has no model file unless it fetches one from somewhere outside git.
- **Type checking, revisited at P1-07.** P1-07 brings cross-language schemas, which is where type checking pays off first.

Follow-up edits to docs/tasks.md, each needing separate approval later (Status lines are not touched):

- P1-24: add `.github/workflows/ci.yml` to the Files line, plus a note: "Add a separate CI job that installs ONNX Runtime (no PyTorch) and runs the parity tests (decision 0001). Settle where the CI job gets the model and the PyTorch reference outputs, since `*.onnx` is git-ignored."
- P1-07: add a note: "Revisit type checking (`tsc --noEmit`, mypy or pyright) now that cross-language schemas exist (decision 0001)."

## Open questions

Items 2 to 5 have proposed answers. They are not decisions until the team accepts this record.

1. Which operating systems does the team use? The CI runner matrix depends on it. Ubuntu only is cheapest. Adding Windows and/or macOS catches OS-specific breakage, which R7 asks for, but costs more minutes. Still open until the team's operating systems are confirmed.
2. Should tests that need ONNX Runtime (P1-24 parity, P1-25) run in CI?
   **Proposed, pending team decision:** not now. Add a separate lightweight CI job that installs ONNX Runtime (no PyTorch) as part of P1-24, when the parity tests exist. See Planned follow-ups.
3. Should "Python lint" be one command covering lint and format check?
   **Proposed, pending team decision:** yes. One command runs `ruff check` and then `ruff format --check`, so CLAUDE.md has one lint command per language. The mechanism is still to confirm. One way that adds no dependency is a root `package.json` script such as `npm run lint:py` that runs `uv run ruff check && uv run ruff format --check`. That requires Node on machines that only do Python work. Whether npm's default shell on Windows handles `&&` the same way is **to verify**.
4. Type checking (`tsc --noEmit` for TS, mypy or pyright for Python): include it in the lint command now?
   **Proposed, pending team decision:** deferred. Revisit at P1-07, when cross-language schemas arrive. See Planned follow-ups.
5. Pre-commit hooks for formatting?
   **Proposed, pending team decision:** none for now. CI catches issues on push, and Claude Code hooks will cover Claude's edits once linting exists. Revisit if lint failures in CI become frequent.
