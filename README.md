# SignBridge Meet

A web meeting platform with live Indian Sign Language (ISL) to English captioning, plus optional Malayalam captions and speech output.

The project is in Phase 0. There is no application code yet.

## Setup

Tool choices are recorded in [docs/decisions/0001-tooling.md](docs/decisions/0001-tooling.md).

1. Install Node 24 (see `.nvmrc`) and uv (the version in `[tool.uv] required-version` in `pyproject.toml`). On Windows: `winget install --id astral-sh.uv -e`, then install that exact uv version if winget gives a different one.
2. From the repo root:

   ```sh
   npm install
   uv sync
   ```

uv installs Python 3.11 itself if it is not already on the machine (`.python-version`).

## Lint and test

```sh
npm run lint      # TypeScript: ESLint and Prettier check
npm test          # TypeScript: Vitest
npm run lint:py   # Python: ruff check and ruff format --check
uv run pytest     # Python: pytest
```

CI runs the same four commands on every push (Linux) and on pull requests to `main` (Windows).

## Docs

- [docs/PRD.md](docs/PRD.md): product requirements
- [docs/architecture.md](docs/architecture.md): system design
- [docs/tasks.md](docs/tasks.md): Phase 0 and Phase 1 tasks, with status

## Layout

```text
apps/
  web/              React client, caption UI, MediaPipe capture
  recorder/         Data recording app
  backend/          Token issuing, users, meetings
services/
  caption-agent/    LiveKit Agents worker
  mt/               English to Malayalam service
packages/
  landmarks-ts/     Normalization, TypeScript
  landmarks-py/     Normalization, Python (reference implementation)
  capture-web/      Browser webcam + MediaPipe capture, shared by web and recorder
  schemas/          Wire formats (LandmarkPacket, Caption), TS and Python
ml/
  data/             Manifests and split definitions only (no raw data in git)
  train/            Training code and configs
  eval/             Evaluation harness
infra/              Docker Compose and deployment
docs/
```

Raw video, landmark dumps, datasets, model weights and `.env` files are kept out of git (see `.gitignore`).
