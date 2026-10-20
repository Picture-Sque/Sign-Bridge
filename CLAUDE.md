# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

SignBridge Meet is a web meeting platform with live Indian Sign Language (ISL) to English captioning, plus optional Malayalam captions and TTS. The repo currently contains only design docs: [docs/PRD.md](docs/PRD.md) and [docs/architecture.md](docs/architecture.md). There is no code, build system, or test runner yet, so there are no commands to document. Update this file when those land.

Both docs are v0.1 drafts. Values marked TBD or "tunable" are deliberately unset and must come from measurement or a team decision. Do not fill them with plausible numbers. The PRD supersedes the older SRS (6 Oct 2026); the SRS targets (250 ms end-to-end, 20% WER, 50+ streams on an A6000) were explicitly rejected.

## Architecture (big picture)

Read architecture.md before building anything. The pieces that span multiple components:

- The signer's browser runs MediaPipe Tasks (hands, upper-body pose, small face subset), normalizes landmarks, and sends them as binary LiveKit data packets. Raw video never goes to the recognition service.
- LiveKit (self-hosted via Docker for dev) handles rooms, media, chat, screen share and data packets. No custom signaling or SFU code. A small backend (FastAPI or Node, undecided) issues tokens and manages users and meetings.
- A Python caption agent built on LiveKit Agents joins each room as a hidden participant, one pipeline per active signer: ring buffer, sliding-window recognizer (conv + Transformer encoder, CTC head, ONNX Runtime on CPU) for partial captions, rule-based end-of-utterance detector, CTC beam search for top-k gloss sequences, LLM re-rank and sentence formation, then English to Malayalam MT. Captions go back through LiveKit; clients need no other server connection.
- Partial and final captions share an utterance `id`; the client replaces the partial when the final arrives. Message kinds are `partial`, `final`, `flagged`, `retracted`. Wire formats for `LandmarkPacket` and `Caption` are in architecture.md sections 4.3 and 4.4.
- Training uses PyTorch, exports to ONNX, and is evaluated on gloss WER, BLEU, chrF, template accuracy, hallucination rate and per-stage latency.

Proposed layout (architecture.md section 11): `apps/{web,recorder,backend}`, `services/{caption-agent,mt}`, `packages/{landmarks-ts,landmarks-py}`, `ml/{data,train,eval}`, `infra/docker-compose.yml`.

## Invariants to preserve

- One normalization module everywhere. `landmarks-py` is the reference; `landmarks-ts` is a port that must be tested against it on fixed inputs. The recorder, training pipeline, browser client and agent all use it, to avoid train/serve skew. Normalization: origin at shoulder midpoint, scale by shoulder width, zero-fill missing hands with a per-hand presence flag, interpolate short gaps.
- Fail visibly. Low confidence yields a flagged caption or nothing, never a confident guess. The LLM step may only express meaning present in the chosen glosses (no added facts, names or numbers) and returns `null` when nothing fits. This is measured (FR-R8).
- Every message carries timestamps so latency can be broken down per stage.
- Logs contain no landmarks, video or caption text unless debug consent is given. Landmarks and captions stay in memory unless the user opts in.
- Test splits are held out by signer and by sentence. Natural-signing test sets are never used for training or tuning and never mixed with synthetic data. Report signer-dependent and signer-independent results separately.
- Hosted LLM and local model sit behind one interface so they can be swapped.
- Reused model code (for example from Kaggle sign language competition solutions) must have its origin and licence recorded.
- No raw data in git; `ml/data` holds manifests and split definitions only.

Legal and ethics questions (consent, DPDP Act applicability, dataset licences, hosted API terms) are listed in PRD section 13 as items for human review. Flag them rather than resolving them.


# SignBridge Meet
Read docs/PRD.md and docs/architecture.md before planning any feature.

## Stack
React + TS (apps/web), Python 3.11 (services/, ml/), LiveKit, Docker Compose.

## Rules
- Work on one task at a time. Plan first, wait for approval, then code.
- Every feature needs tests. Run them before saying a task is done.
- packages/landmarks-ts and landmarks-py must stay in sync; golden tests must pass.
- Wire formats (LandmarkPacket, Caption) live in packages/schemas. Don't change them without updating architecture.md.
- No raw video, landmarks or datasets in git. No secrets in code; use .env.
- Ask before adding a new dependency.

## Commands
(fill in as they appear: dev server, tests, lint, docker compose up)