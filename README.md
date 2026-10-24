# SignBridge Meet

A web meeting platform with live Indian Sign Language (ISL) to English captioning, plus optional Malayalam captions and speech output.

The project is at the start of Phase 0. There is no application code yet. Setup, build and test commands will be added with task P0-03.

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
