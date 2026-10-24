# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

SignBridge Meet is a web meeting platform with live Indian Sign Language (ISL) to English captioning, plus optional Malayalam captions and TTS. The repo contains design docs ([docs/PRD.md](docs/PRD.md), [docs/architecture.md](docs/architecture.md), and [docs/tasks.md](docs/tasks.md), which breaks Phase 0 and Phase 1 into tasks with stable IDs, dependencies and acceptance criteria), decision records in [docs/decisions/](docs/decisions/), and the dev tooling and CI from P0-03. There is no application code yet; the only tests are the toolchain placeholders in `tests/`. Update this file as code lands.

Read docs/PRD.md and docs/architecture.md before planning any feature. When working on a task from docs/tasks.md, use its ID and check its dependencies.

The docs are drafts. Values marked TBD or "tunable" are deliberately unset and must come from measurement or a team decision. Do not fill them with plausible numbers. The PRD supersedes the older SRS (6 Oct 2026); the SRS targets (250 ms end-to-end, 20% WER, 50+ streams on an A6000) were explicitly rejected.

## Stack

React + TS (apps/web), Python 3.11 (services/, ml/), LiveKit, Docker Compose.

Tooling ([decision 0001](docs/decisions/0001-tooling.md)): Node 24 with npm workspaces (`apps/*`, `packages/*`), ESLint + Prettier, Vitest. uv workspace with one `uv.lock` (uv version pinned in `pyproject.toml`), Ruff for lint and format, pytest. GitHub Actions CI. Text files are LF (`.gitattributes`).

## Commands

Setup: install Node 24 and uv (the version in `[tool.uv] required-version`), then run `npm install` and `uv sync`.

| Purpose | Command |
|---|---|
| TS lint (ESLint + Prettier check) | `npm run lint` |
| TS test (Vitest) | `npm test` |
| Python lint (`ruff check` + `ruff format --check`) | `npm run lint:py` |
| Python test (pytest) | `uv run pytest` |

To fix formatting: `npx prettier --write .` and `uv run ruff format`.

CI (`.github/workflows/ci.yml`) runs all four on Linux on every push, and again on Windows for pull requests to `main`.

Adding a package: list a new TS package under `apps/` or `packages/` with its own `package.json` (the workspace globs pick it up). Add a new Python package to `[tool.uv.workspace] members` in the root `pyproject.toml` and run `uv lock`. Commit the updated lockfiles. Once a member with heavy dependencies (PyTorch, ONNX Runtime) exists, CI must stop using plain `uv sync` and sync light members with `uv sync --locked --package <name> --group dev`, so heavy packages are never installed there (decision 0001). Dev server and `docker compose up` commands arrive with the tasks that add them.

## Architecture (big picture)

The pieces that span multiple components:

- The signer's browser runs MediaPipe Tasks (hands, upper-body pose, small face subset), normalizes landmarks, and sends them as binary LiveKit data packets. Raw video never goes to the recognition service.
- LiveKit (self-hosted via Docker for dev) handles rooms, media, chat, screen share and data packets. No custom signaling or SFU code. A small backend (FastAPI or Node, undecided) issues tokens and manages users and meetings.
- A Python caption agent built on LiveKit Agents joins each room as a hidden participant, one pipeline per active signer: ring buffer, sliding-window recognizer (conv + Transformer encoder, CTC head, ONNX Runtime on CPU) for partial captions, rule-based end-of-utterance detector, CTC beam search for top-k gloss sequences, LLM re-rank and sentence formation, then English to Malayalam MT. Captions go back through LiveKit; clients need no other server connection.
- Partial and final captions share an utterance `id`; the client replaces the partial when the final arrives. Message kinds are `partial`, `final`, `flagged`, `retracted`. Wire formats for `LandmarkPacket` and `Caption` are specified in architecture.md sections 4.3 and 4.4.
- Training uses PyTorch, exports to ONNX, and is evaluated on gloss WER, BLEU, chrF, template accuracy, hallucination rate and per-stage latency.

Proposed layout (architecture.md section 11): `apps/{web,recorder,backend}`, `services/{caption-agent,mt}`, `packages/{landmarks-ts,landmarks-py,capture-web,schemas}`, `ml/{data,train,eval}`, `infra/docker-compose.yml`.

## Rules

- Work on one task at a time. Plan first, wait for approval, then code.
- Every feature needs tests. Run them before saying a task is done.
- Ask before adding a new dependency.
- One normalization module everywhere. `packages/landmarks-py` is the reference; `packages/landmarks-ts` is a port and must stay in sync with it, and the golden tests on fixed inputs must pass. The recorder, training pipeline, browser client and agent all use it, to avoid train/serve skew. Normalization: origin at shoulder midpoint, scale by shoulder width, zero-fill missing hands with a per-hand presence flag, interpolate short gaps.
- Wire formats (`LandmarkPacket`, `Caption`) live in `packages/schemas`. Don't change them without updating architecture.md.
- No raw video, landmarks or datasets in git; `ml/data` holds manifests and split definitions only. No secrets in code; use .env.
- Fail visibly. Low confidence yields a flagged caption or nothing, never a confident guess. The LLM step may only express meaning present in the chosen glosses (no added facts, names or numbers) and returns `null` when nothing fits. This is measured (FR-R8).
- Every message carries timestamps so latency can be broken down per stage.
- Logs contain no landmarks, video or caption text unless debug consent is given. Landmarks and captions stay in memory unless the user opts in.
- Test splits are held out by signer and by sentence. Natural-signing test sets are never used for training or tuning and never mixed with synthetic data. Report signer-dependent and signer-independent results separately.
- Hosted LLM and local model sit behind one interface so they can be swapped.
- Reused model code (for example from Kaggle sign language competition solutions) must have its origin and licence recorded.

Legal and ethics questions (consent, DPDP Act applicability, dataset licences, hosted API terms) are listed in PRD section 13 as items for human review. Flag them rather than resolving them.
