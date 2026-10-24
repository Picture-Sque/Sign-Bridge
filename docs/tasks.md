# SignBridge Meet: Phase 0 and Phase 1 tasks

| | |
|---|---|
| Version | 0.2 (draft) |
| Date | 2026-10-24 |
| Source | [PRD.md](PRD.md) section 10, [architecture.md](architecture.md) |

Changes in 0.2:

- Consent split so team recording does not wait on ethics approval: new P0-11a (faculty question) and P1-17a (interim team consent). P1-17 is now final consent only. P1-20 dependencies updated.
- Workstream D no longer waits on our recordings: new P1-22a (INCLUDE-only splits). P1-23 first run uses P1-22a and is retrained on P1-22.
- The 10 Phase 1 signs must be in INCLUDE: added to P0-04 and P0-08 acceptance.
- End-to-end loop before P1-25: new P1-13a (stub caption publisher). P1-14, P1-15 and P1-25 depend on it.
- Shared capture code location set to `packages/capture-web/` (P1-10, architecture.md section 11). Removed from open items.
- P0-12 depends on P0-11a being sent, not answered.
- P1-22 keeps the INCLUDE signer assignments from P1-22a unchanged.
- P0-11a also asks what happens to interim-consent recordings once the final form is approved.
- `packages/schemas` added to architecture.md section 11.
- Status field added to every task (all `todo`).

Each task is sized at 1 to 2 days for one person. Estimates are guesses until the team has done a few. IDs are stable; reference them in commits and PRs.

Each task has a **Status**: `todo`, `in progress`, `blocked (<reason>)` or `done`. A status changes only through an approved update. `blocked` is set when a task is actually waiting on something, such as an outside person, and always gives the reason.

Tasks marked **Decision** produce a record in `docs/decisions/` that must be Accepted before implementation starts, except measurement code for a record marked Proposed (needs measurement). Tasks marked **External** depend on people outside the team and can slip for reasons we do not control. Any new dependency named below still needs approval before it is added (CLAUDE.md).

---

## Phase 0: Foundations (weeks 1 to 3)

Exit criteria (PRD 10): domain list frozen; dataset coverage checked; LiveKit chosen and running locally; consent form drafted; roles assigned.

### P0-01 Assign roles (0.5 d)
- **Status:** todo
- **Goal:** Fill the owner column in PRD section 11.
- **Files:** `docs/PRD.md`
- **Acceptance:** Every role has one named owner. Each owner has agreed.
- **Test:** Team review of the PRD diff.
- **Depends on:** none

### P0-02 Repository scaffold (1 d)
- **Status:** done
- **Goal:** Create the directory layout from architecture section 11 with placeholder READMEs, plus `.gitignore` and `.env.example`.
- **Files:** `apps/*`, `services/*`, `packages/*` (including `packages/schemas`), `ml/*`, `infra/`, `.gitignore`, `.env.example`, `README.md`
- **Acceptance:** Layout matches architecture section 11 plus `packages/schemas`. `.gitignore` excludes `.env`, video files, raw landmark dumps and dataset folders.
- **Test:** `git check-ignore` returns a match for sample paths such as `.env`, `ml/data/raw/x.webm`, `ml/data/raw/x.npy`.
- **Depends on:** none

### P0-03 Dev tooling and CI (2 d) **Decision**
- **Status:** todo
- **Goal:** Pick and set up package managers, linters, formatters and test runners for TypeScript and Python 3.11. Run lint and tests on every push.
- **Files:** root `package.json` (workspaces), `package-lock.json`, `pyproject.toml` files, `uv.lock`, `.python-version`, Node version pin, lint and test configs, placeholder tests, `.gitattributes`, CI config (`.github/workflows/ci.yml`), `docs/decisions/0001-tooling.md`, `CLAUDE.md` Stack and Commands sections, `README.md` (setup steps)
- **Acceptance:** One command each for lint and test, for TS and Python, that pass on the empty scaffold. CI runs them. CLAUDE.md Commands section filled in. Licence of each chosen tool confirmed from its installed package metadata and recorded in decision 0001's licence table.
- **Test:** Push a branch with a deliberate lint error and a failing placeholder test. CI fails. Fix both. CI passes.
- **Depends on:** P0-02. Tool choices need team approval.

### P0-04 Candidate domain list (2 d)
- **Status:** todo
- **Goal:** Draft 40 to 80 signs and 30 to 50 short sentence templates for academic and meeting communication.
- **Files:** `docs/domain/signs.csv` (gloss, English meaning, notes), `docs/domain/templates.csv` (template id, gloss sequence, English sentence, slots)
- **Acceptance:** Counts are within range. Every gloss in every template is in `signs.csv`. Templates are short (team agrees a max length). The 10 signs for the Phase 1 classifier are marked. The 10 Phase 1 signs are chosen from signs present in INCLUDE, to the best of our knowledge at drafting time.
- **Test:** Manual cross-check, or a small check script once tooling exists.
- **Depends on:** none

### P0-05 Find an ISL-fluent reviewer (1 d effort, elapsed time unknown) **External**
- **Status:** todo
- **Goal:** Get a reviewer (via NISH or an ISLRTC-listed interpreter) to validate the domain list now and recorded data later.
- **Files:** `docs/domain/reviewer.md` (role and availability only; contact details kept out of git)
- **Acceptance:** A named reviewer has agreed to review the domain list and a sample of recordings, with expected turnaround.
- **Test:** Written confirmation from the reviewer.
- **Depends on:** none. Start in week 1 because it gates P0-06.

### P0-06 Review and freeze domain list (1 d) **External**
- **Status:** todo
- **Goal:** Reviewer checks the signs and templates for correct ISL. Apply corrections and freeze v1.0.
- **Files:** `docs/domain/signs.csv`, `docs/domain/templates.csv`, `docs/domain/CHANGELOG.md`
- **Acceptance:** Reviewer sign-off recorded. Files tagged v1.0. Later changes go through the changelog.
- **Test:** Changelog entry references the review.
- **Depends on:** P0-04, P0-05

### P0-07 Dataset licence survey (1 d) **External review**
- **Status:** todo
- **Goal:** Record licence terms and access conditions for INCLUDE, ISL-CSLTR, ISLTranslate / iSign. Collect the questions faculty need to answer (PRD 13).
- **Files:** `docs/data/sources.md`
- **Acceptance:** Per dataset: URL, licence text or link, what we plan to do with it, open questions. Marked for faculty review. The team does not issue its own verdict on permitted use.
- **Test:** Faculty or institutional reviewer has the document.
- **Depends on:** none

### P0-08 Dataset coverage check (2 d)
- **Status:** todo
- **Goal:** Map the domain vocabulary against INCLUDE and ISL-CSLTR. Confirm whether ISL-CSLTR has gloss labels and boundaries, and whether ISLTranslate / iSign has glosses.
- **Files:** `docs/data/coverage.md`, `docs/domain/signs.csv`, `docs/domain/CHANGELOG.md`
- **Acceptance:** Per sign: which datasets contain it, sample and signer counts. List of signs that need self-recording. Annotation format of each dataset described. All 10 Phase 1 signs confirmed in INCLUDE with sample and signer counts. Any that are missing are replaced, and `signs.csv` is updated through the changelog.
- **Test:** Spot-check five signs by opening the dataset files directly.
- **Depends on:** P0-04 (P0-06 preferred), P0-07 (download permitted)

### P0-09 LiveKit running locally (1 d)
- **Status:** todo
- **Goal:** Self-hosted LiveKit server in Docker Compose with dev keys from `.env`.
- **Files:** `infra/docker-compose.yml`, `.env.example`, `infra/README.md`
- **Acceptance:** `docker compose up` starts LiveKit. Two browser tabs (LiveKit example app or CLI) join one room and exchange audio and video.
- **Test:** Manual two-tab call on two team laptops.
- **Depends on:** P0-02

### P0-10 LiveKit Agents data-packet spike (2 d)
- **Status:** todo
- **Goal:** Retire the main integration risk early: a Python agent joins a room, receives data packets on a named topic, and publishes a reply all participants see.
- **Files:** `services/caption-agent/` (spike, may be rewritten in Phase 1), `docs/decisions/0002-livekit.md`
- **Acceptance:** A message sent from a browser arrives at the agent and the reply shows in every tab. Round-trip time logged. Decision record confirms LiveKit and lists self-hosted vs Cloud for the demo as still open.
- **Test:** Two tabs plus agent. Send 100 messages and check none are lost and order is as expected.
- **Depends on:** P0-09

### P0-11 Consent form and data handling draft (2 d) **External review**
- **Status:** todo
- **Goal:** Draft the recording consent form and a short data handling note: video with faces, landmarks, storage, access, retention, withdrawal, debug data donation.
- **Files:** `docs/data/consent-form-draft.md`, `docs/data/data-handling.md`
- **Acceptance:** Drafts cover each item above and are marked for ethics and institutional review (PRD 13, including the DPDP Act question). Submitted to whoever grants approval.
- **Test:** Submission confirmed. Note the expected approval date, because P1-20 cannot record non-team signers without it.
- **Depends on:** none

### P0-11a Ask faculty about interim team consent (0.5 d) **External**
- **Status:** todo
- **Goal:** Ask faculty in writing whether team members may record under an internal consent text before ethics approval, and what happens to those interim-consent recordings once the final form is approved (re-consent, keep, or delete).
- **Files:** `docs/data/faculty-questions.md`
- **Acceptance:** Question sent in writing. The written answer, including any conditions, is recorded. The answer is not assumed either way.
- **Test:** The written reply is filed.
- **Depends on:** none. Start in week 1.

### P0-12 Phase 0 exit check (0.5 d)
- **Status:** todo
- **Goal:** Confirm the PRD exit criteria.
- **Files:** `docs/tasks.md` (status), `docs/PRD.md` if open questions closed
- **Acceptance:** All five exit criteria met, or the gap is written down with a date. P0-11a needs only to have been sent. If it is unanswered, record it as a gap with a follow-up date.
- **Test:** Team walkthrough.
- **Depends on:** P0-01 to P0-11, P0-11a (sent)

---

## Phase 1: Skeleton (weeks 4 to 9)

Exit criteria (PRD 10): meeting rooms working; browser landmark extraction; recording app collecting data; a crude isolated-sign classifier (about 10 signs) captioning live in a room.

Workstreams can run in parallel: A (meeting platform), B (landmarks and transport), C (recording and data), D (model and agent).

### A. Meeting platform

#### P1-01 Token backend (2 d) **Decision**
- **Status:** todo
- **Goal:** Small backend that issues short-lived, room-scoped LiveKit tokens. Choose FastAPI or Node (architecture 3.2).
- **Files:** `apps/backend/`, `infra/docker-compose.yml`, `docs/decisions/0003-backend.md`
- **Acceptance:** Endpoint returns a token for a given user and room. Token expires after a set time and only grants access to that room. Secrets come from `.env`.
- **Test:** Unit tests for token claims and expiry. Manual: a token for room A cannot join room B.
- **Depends on:** P0-03, P0-09

#### P1-02 User sign-up and login (2 d) **Decision**
- **Status:** todo
- **Goal:** FR-M1. Choose an auth approach and implement sign-up, login, logout.
- **Files:** `apps/backend/`, `apps/web/` (auth pages), `docs/decisions/0004-auth.md`
- **Acceptance:** A user can register, log in and log out. Token endpoint requires a logged-in user. Passwords (if used) are hashed.
- **Test:** Backend tests for register, login, wrong password, unauthenticated token request. Manual browser flow.
- **Depends on:** P1-01

#### P1-03 Meetings: create and join by link (1.5 d)
- **Status:** todo
- **Goal:** FR-M2. Host creates a meeting and gets a shareable link. Others join through it.
- **Files:** `apps/backend/`, `apps/web/`
- **Acceptance:** Link opens the meeting for a logged-in user. Unknown meeting IDs show an error. Host is recorded on the meeting (needed later for FR-M5).
- **Test:** Backend tests for create, join, unknown ID. Manual two-user join.
- **Depends on:** P1-02

#### P1-04 Web meeting room (2 d)
- **Status:** todo
- **Goal:** FR-M3. React + TypeScript room using LiveKit React components: audio, video, text chat.
- **Files:** `apps/web/`
- **Acceptance:** Three participants on separate machines see and hear each other and can chat. Leave and rejoin works.
- **Test:** Component tests for room join and error states. Manual three-person call.
- **Depends on:** P1-03

#### P1-05 Screen share (1 d)
- **Status:** todo
- **Goal:** FR-M4 (P1 priority). Do it if workstream A has time.
- **Files:** `apps/web/`
- **Acceptance:** A participant can start and stop screen share. Others see it.
- **Test:** Manual on Chrome, Edge and Firefox.
- **Depends on:** P1-04

### B. Landmarks and transport

#### P1-06 Landmarker benchmark (2 d) **Decision**
- **Status:** todo
- **Goal:** Close open decision 1: Holistic Landmarker vs separate hand and pose landmarkers. Measure FPS and CPU on team laptops at 720p.
- **Files:** throwaway benchmark page under `apps/web/`, `docs/decisions/0005-landmarker.md`
- **Acceptance:** Table of FPS, CPU load and dropped frames per option, per laptop, per browser. Decision recorded. Capture FPS starting value chosen within 15 to 30.
- **Test:** Each team member runs the benchmark on their laptop. Results committed.
- **Depends on:** P0-03

#### P1-07 Wire format schemas (2 d)
- **Status:** todo
- **Goal:** Define `LandmarkPacket` v1 and `Caption` v1 (architecture 4.3, 4.4) with encode and decode in TS and Python. Choose MessagePack or raw typed array.
- **Files:** `packages/schemas/`, `docs/architecture.md` (if anything changes)
- **Acceptance:** Both languages encode and decode both message types. Point list for v1 is hands + upper-body pose; face subset left out and noted as open. Version field checked on decode.
- **Test:** Cross-language round-trip: TS encodes fixtures, Python decodes and compares, and the reverse. Size of a 100 ms packet recorded.
- **Depends on:** P0-03, P1-06 (point count)
- **Note:** Revisit type checking (`tsc --noEmit`, mypy or pyright) now that cross-language schemas exist (decision 0001).

#### P1-08 Python reference normalization (2 d)
- **Status:** todo
- **Goal:** `landmarks-py`: shoulder-midpoint origin, shoulder-width scale, missing-hand zero-fill with presence flags, short-gap interpolation, mirror-with-channel-swap helper for augmentation.
- **Files:** `packages/landmarks-py/`
- **Acceptance:** Each step is a tested function. Golden fixtures (input frames and expected output) committed, generated from synthetic data, not real recordings.
- **Note:** Fixtures are JSON.
- **Test:** Unit tests per step, including edge cases: both hands missing, gap longer than the interpolation limit, zero shoulder width.
- **Depends on:** P0-03, P1-06

#### P1-09 TypeScript normalization port (1.5 d)
- **Status:** todo
- **Goal:** `landmarks-ts` port that matches `landmarks-py`.
- **Files:** `packages/landmarks-ts/`
- **Acceptance:** All golden fixtures pass within a stated float tolerance.
- **Test:** Golden tests run in CI for both packages.
- **Depends on:** P1-08

#### P1-10 Browser capture module (2 d)
- **Status:** todo
- **Goal:** Shared capture code for the web client and recorder: webcam, MediaPipe Tasks (per P1-06), raw landmarks with per-frame capture timestamps, GPU delegate with CPU fallback.
- **Files:** `packages/capture-web/`
- **Acceptance:** Emits landmark frames at the configured FPS with timestamps. Falls back to CPU without crashing. Stops cleanly when the camera is released.
- **Test:** Unit tests with recorded fixture frames for the frame and timestamp logic. Manual on two laptops.
- **Depends on:** P1-06

#### P1-11 Framing guide (1.5 d)
- **Status:** todo
- **Goal:** FR-C1. Pre-join screen with live landmark overlay and a simple in-frame check for hands, torso and face.
- **Files:** `apps/web/`
- **Acceptance:** Overlay follows the user. Clear message when hands or shoulders are out of frame. User can continue to the room.
- **Test:** Manual: move hands out of frame, step back, dim lights. Component test for the in-frame logic using fixture frames.
- **Depends on:** P1-04, P1-10

#### P1-12 Landmark publisher (1.5 d)
- **Status:** todo
- **Goal:** In the room, normalize frames, batch them (start at 100 ms), encode as `LandmarkPacket`, send on a dedicated data topic.
- **Files:** `apps/web/`
- **Acceptance:** Packets arrive at the agent with increasing `seq`. Signer can pause sending (FR-C5, if time). No raw video sent through this path.
- **Test:** Unit test for batching and sequencing. Integration test against the agent ingest from P1-13.
- **Depends on:** P1-04, P1-07, P1-09, P1-10

#### P1-13 Agent ingest and ring buffer (2 d)
- **Status:** todo
- **Goal:** Caption agent subscribes to the landmark topic, decodes packets, keeps a bounded ring buffer per signer, tracks packet loss and gaps.
- **Files:** `services/caption-agent/`, `infra/docker-compose.yml`
- **Acceptance:** Separate buffer per signer. Buffer length bounded. Missing `seq` counted. Logs contain counts and timings only, no landmark values (FR-X3).
- **Test:** Unit tests with synthetic packets: out of order, gaps, two signers. Integration test from P1-12.
- **Depends on:** P0-10, P1-07

#### P1-13a Stub caption publisher (1 d)
- **Status:** todo
- **Goal:** Agent publishes fake `Caption` v1 messages to all participants, a partial followed by a final with the same `id`, every few seconds per active signer. Gives an end-to-end loop before the real model exists.
- **Files:** `services/caption-agent/`
- **Acceptance:** Every participant receives them in order. The stub can be turned on and off with a config flag.
- **Test:** Three clients connected. Check order and partial/final `id` pairing on each.
- **Depends on:** P1-13

#### P1-14 Caption overlay v0 (1.5 d)
- **Status:** todo
- **Goal:** Client shows `Caption` messages over or beside the signer's video. Final replaces partial with the same `id`. Flagged captions look different. Caption toggle.
- **Files:** `apps/web/`
- **Acceptance:** Captions appear for every participant, tied to the right signer. Partial and final look distinct (FR-D2).
- **Test:** Component tests feeding fixture `Caption` sequences: partial then final, flagged, unknown signer. Then against live stub traffic from P1-13a.
- **Depends on:** P1-04, P1-07, P1-13a

#### P1-15 Latency timestamps (1.5 d)
- **Status:** todo
- **Goal:** FR-X1 skeleton. Carry timestamps from capture through agent to display and log each stage.
- **Files:** `apps/web/`, `services/caption-agent/`, `packages/schemas/` (if fields are missing)
- **Acceptance:** Each caption can be traced to capture, agent receive, inference done, client display. Client and server clock offset handled or measured, and the method written down.
- **Test:** Run with a fixed artificial delay in the agent and check it shows up in the right stage.
- **Depends on:** P1-12, P1-13, P1-13a, P1-14

### C. Recording and data

#### P1-16 Recorder app (2 d)
- **Status:** todo
- **Goal:** FR-T1. Web app that shows a prompt (sign or sentence from the domain list) and records landmarks and video using the shared capture and normalization code.
- **Files:** `apps/recorder/`
- **Acceptance:** Records one take per prompt with start and end times. Retake and skip work. Stored landmarks match what the live client would send for the same input.
- **Test:** Record a take, decode it, and compare against capture output for the same session. Component tests for prompt flow.
- **Depends on:** P0-06, P1-09, P1-10

#### P1-17 Recorder consent capture, final form (1 d)
- **Status:** todo
- **Goal:** FR-T2. Final consent capture using the approved form, required before any non-team signer records. A recording session cannot start without a consent record. Every recording links to it.
- **Files:** `apps/recorder/`
- **Acceptance:** Consent text matches the approved form. Non-team signers can record only under this final consent. Consent record ID stored with each take. Withdrawal can be found by consent ID.
- **Test:** Try to record without consent and confirm it is blocked. Check stored takes reference the consent ID.
- **Depends on:** P0-11 (approved form), P1-16

#### P1-17a Interim consent capture, team only (1 d) **External**
- **Status:** todo
- **Goal:** Consent capture for team members using an internal consent text, only if faculty confirms this is allowed.
- **Files:** `apps/recorder/`, `docs/data/interim-consent-team.md`
- **Acceptance:** Written faculty confirmation (from P0-11a) is on file. If the answer is no, this task is closed and team recording waits for P1-17. Only team signer IDs can use interim consent. Recording without a consent record is blocked. Each take stores its consent ID and consent type (interim or final).
- **Test:** Recording is blocked for a non-team signer and for a session with no consent. Stored takes carry consent ID and type.
- **Depends on:** P0-11a (yes answer), P1-16

#### P1-18 Raw store and manifests (2 d) **Decision**
- **Status:** todo
- **Goal:** Choose an access-controlled raw store and upload recorder output with a manifest per session (signer ID, consent ID, prompts, file hashes).
- **Files:** `apps/recorder/`, `ml/data/manifests/` (format only), `docs/decisions/0006-raw-store.md`
- **Acceptance:** Uploads land in the store, not in git. Only named team members can read them. Manifest validates against a defined schema.
- **Test:** Upload a session and check manifest contents and access from a non-team account.
- **Depends on:** P1-16

#### P1-19 Annotation format and isolated labelling (1.5 d) **Decision**
- **Status:** todo
- **Goal:** FR-T3 first pass. Define the annotation format (gloss labels now, sentence boundaries later) and pick a tool. Label isolated-sign takes.
- **Files:** `ml/data/annotation-format.md`, `docs/decisions/0007-annotation.md`
- **Acceptance:** Format covers gloss, start and end frame, annotator, review status. Isolated takes can be labelled in it.
- **Test:** Two team members label the same 20 takes and compare.
- **Depends on:** P1-18

#### P1-20 First recording sessions (2 d) **External**
- **Status:** todo
- **Goal:** Collect isolated takes of the 10 Phase 1 signs. Team members under P1-17a. Other signers only under P1-17.
- **Files:** none in git (data goes to the raw store); manifests in `ml/data/manifests/`
- **Acceptance:** Team agrees the target takes per sign per signer, and it is met. Every take has consent and a manifest entry. Reviewer checks a sample.
- **Test:** Manifest counts match the target. Reviewer notes recorded.
- **Depends on:** P1-17a (team signers), P1-17 (non-team signers), P1-18, P1-19

### D. Model and agent

#### P1-21 Public data extraction (2 d)
- **Status:** todo
- **Goal:** Extract landmarks from INCLUDE clips for the 10 signs with the same point set and `landmarks-py`.
- **Files:** `ml/data/scripts/` (extraction script), `ml/data/manifests/`
- **Acceptance:** Every selected clip has extracted landmarks or a logged failure reason. Differences between offline Python MediaPipe and browser MediaPipe on the same clip are measured and noted.
- **Test:** Run on 20 clips, inspect overlay plots, compare a few against browser capture of the same video.
- **Depends on:** P0-07, P0-08, P1-08

#### P1-22 Dataset manifest and splits (1 d)
- **Status:** todo
- **Goal:** Versioned dataset for the 10 signs combining INCLUDE and our recordings, split by signer.
- **Files:** `ml/data/manifests/`, `ml/data/splits/`
- **Acceptance:** No signer appears in more than one split. Split files versioned. Counts per sign per split reported. INCLUDE signers keep their P1-22a split assignments unchanged; only our own signers are newly assigned.
- **Test:** Check script that fails if any signer crosses splits, or if any INCLUDE signer's split differs from P1-22a.
- **Depends on:** P1-20, P1-21

#### P1-22a INCLUDE-only manifest and splits (1 d)
- **Status:** todo
- **Goal:** Manifest and signer-held-out splits for the 10 signs using INCLUDE only, so model work does not wait on our recordings.
- **Files:** `ml/data/manifests/`, `ml/data/splits/`
- **Acceptance:** No signer appears in more than one split. Split files versioned and labelled INCLUDE-only. Counts per sign per split reported.
- **Test:** Same signer-crossing check as P1-22.
- **Depends on:** P1-21

#### P1-23 Isolated-sign classifier (2 d)
- **Status:** todo
- **Goal:** Small PyTorch classifier over normalized landmarks for the 10 signs, with basic augmentation (mirror with channel swap, scale, rotation).
- **Files:** `ml/train/`, config file per run
- **Acceptance:** Accuracy reported on the signer-held-out split. Run traceable to config, split version and code commit (NFR-8). No target number yet. Retrained on the combined dataset once P1-22 is ready; both runs reported with their split version.
- **Test:** Overfit a tiny subset to confirm the loop works, then the full run. Confusion matrix saved.
- **Depends on:** P1-22a (first run); P1-22 (retrain)

#### P1-24 ONNX export and parity check (1 d)
- **Status:** todo
- **Goal:** Export the classifier to ONNX and confirm ONNX Runtime matches PyTorch.
- **Files:** `ml/train/` (export), `ml/eval/`, `.github/workflows/ci.yml`
- **Acceptance:** Max output difference on the test split below a stated tolerance. CPU inference time per window recorded.
- **Test:** Parity script over the test split.
- **Depends on:** P1-23
- **Note:** Add a separate CI job that installs ONNX Runtime (no PyTorch) and runs the parity tests (decision 0001). Settle where the CI job gets the model and the PyTorch reference outputs, since `*.onnx` is git-ignored.

#### P1-25 Agent inference and caption publish (2 d)
- **Status:** todo
- **Goal:** Agent runs the ONNX classifier on a sliding window over each signer's buffer and publishes `Caption` messages. Low confidence publishes `flagged` or nothing (FR-R6).
- **Files:** `services/caption-agent/`
- **Acceptance:** A recognized sign produces one caption per occurrence, not a repeat per window. Confidence threshold is configurable. Window length and stride are configurable. Replaces the P1-13a stub as the default publisher; the stub stays available behind its config flag for testing.
- **Test:** Replay recorded landmark sequences through the agent without LiveKit and compare captions to labels. Then live in a room.
- **Depends on:** P1-13, P1-13a, P1-24

### Phase 1 close

#### P1-26 End-to-end run and first latency numbers (1.5 d)
- **Status:** todo
- **Goal:** Signer signs the 10 signs in a live room. Other participants see captions. Record per-stage latency.
- **Files:** `docs/architecture.md` (section 7 first numbers), `docs/tasks.md` (status)
- **Acceptance:** Captions appear for all participants. Per-stage latency on stated hardware filled into architecture section 7.
- **Test:** Scripted session with two signers, one not in training data. Report both.
- **Depends on:** P1-11, P1-15, P1-25

#### P1-27 Phase 1 exit check (0.5 d)
- **Status:** todo
- **Goal:** Confirm the PRD exit criteria and list what carries into Phase 2.
- **Files:** `docs/tasks.md`
- **Acceptance:** All four exit criteria met, or gaps written down with a plan.
- **Test:** Team walkthrough and demo.
- **Depends on:** all Phase 1 tasks

---

## Open items that block tasks

| Item | Blocks |
|---|---|
| ISL-fluent reviewer availability | P0-06, P1-20 |
| Ethics and institutional approval of consent form | P1-17, P1-20 for non-team signers |
| Faculty answer on interim team consent (P0-11a) | P1-17a, P1-20 for team signers |
| Faculty answer on dataset licences | P0-08, P1-21 |
| Face landmark subset | Deferred past Phase 1 |
