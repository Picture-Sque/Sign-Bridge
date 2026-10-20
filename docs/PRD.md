# SignBridge Meet: Product Requirements Document

| | |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-10-20 |
| Team | Krishnadas P S, Rahul P, Shakkira V A, Sruthi M J |
| Status | Draft for team review. Supersedes conflicting sections of the SRS (6 Oct 2026) once agreed. |
| Companion doc | [architecture.md](architecture.md) |

Items marked **TBD** need a team decision or a measured number. Do not fill them with guesses.

---

## 1. Summary

SignBridge Meet is a web video meeting platform with live, sentence-level Indian Sign Language (ISL) to English captioning. A deaf participant signs to their webcam. Other participants see partial captions while the signing is in progress and a fluent English sentence when the utterance ends. Malayalam captions and spoken output are optional layers on top of the English output.

The meeting platform is the environment, not the contribution. The contribution is the continuous ISL translation engine, evaluated honestly within a bounded academic/meeting domain.

## 2. Problem

Hearing participants in video meetings cannot follow continuous ISL without a human interpreter, and certified ISL interpreters are scarce. Mainstream meeting tools offer speech captions but nothing for signed input. Existing ISL research systems mostly recognize isolated signs offline, not continuous signing inside a live call.

## 3. Goals and non-goals

### 3.1 Goals (MVP)

1. Translate continuous ISL signing to English text, live, inside a real meeting room, for a closed domain of 40 to 80 signs and 30 to 50 sentence templates.
2. Show partial captions during signing and a final sentence after the utterance ends.
3. Run on laptop-class client hardware with an ordinary webcam. No gloves, depth cameras or client GPU.
4. Provide Malayalam captions through an existing MT model.
5. Provide optional speech output through an existing TTS model or service.
6. Publish an honest evaluation: recognition WER, translation quality, latency per stage, and signer-dependent vs. signer-independent results.

### 3.2 Non-goals

- Open-vocabulary, unconstrained conversational ISL.
- Speech/text to ISL (avatar) in either direction other than ISL to text.
- Guaranteed accuracy for signers outside the training and validation set.
- Languages other than English and Malayalam.
- Recognizing more than one signer per video stream.
- Building video conferencing infrastructure (signaling, SFU) from scratch.
- Training large vision models from scratch.

### 3.3 Stretch goals (only after MVP is solid)

- In-browser inference (model runs on the signer's machine, only text leaves).
- Domain expansion beyond the initial template set.
- Meeting transcript export and summary.
- Fingerspelling for names and out-of-vocabulary words.

## 4. Users

| User | Needs |
|---|---|
| Deaf / hard-of-hearing signer | Clear framing guidance, captions produced without manual steps, a way to see and correct what the system said on their behalf, control over whether captions are shown or spoken. |
| Hearing participant | Readable live captions tied to the signer's video, language choice (English / Malayalam), adjustable text size, optional audio. |
| Meeting host | Create and manage rooms, enable or disable sign captioning for the room. |
| Team / developer | Diagnostics: per-stage latency, landmark quality, model confidence, logs that contain no personal data by default. |

## 5. User stories

1. As a signer, I see a framing guide before joining so my hands, torso and face are in view.
2. As a signer, I get a warning when tracking quality drops (hands out of frame, poor lighting).
3. As a signer, I see my own captions as others see them, so I know what was communicated.
4. As a signer, I can retract or mark a wrong caption so the others know to ignore it.
5. As a hearing participant, I see grey partial captions while the person signs, replaced by a final sentence when they stop.
6. As a hearing participant, I can switch captions between English and Malayalam.
7. As a hearing participant, I can turn on spoken output for final captions.
8. As a hearing participant, I can change caption size and use a high-contrast style.
9. As a host, I can create a meeting, share a link, and let people join with audio, video, chat and screen share.
10. As a developer, I can open a diagnostics panel showing latency per stage and current model confidence.

## 6. Functional requirements

Priority: **P0** = MVP must have, **P1** = MVP should have, **P2** = stretch.

### 6.1 Meeting platform

| ID | Requirement | Priority |
|---|---|---|
| FR-M1 | User sign-up / login | P0 |
| FR-M2 | Create meeting, join by link | P0 |
| FR-M3 | Audio, video, text chat | P0 |
| FR-M4 | Screen share | P1 |
| FR-M5 | Host can enable/disable sign captioning per room | P1 |
| FR-M6 | Built on an existing SFU (LiveKit, see architecture.md) | P0 |

### 6.2 Signer capture

| ID | Requirement | Priority |
|---|---|---|
| FR-C1 | Pre-join framing guide with live landmark overlay | P0 |
| FR-C2 | Landmark extraction in the signer's browser (MediaPipe Tasks) at 15 to 30 FPS | P0 |
| FR-C3 | Landmarks normalized client-side and sent as a compact stream, not raw video | P0 |
| FR-C4 | Tracking quality indicator and warnings (hands missing, low confidence) | P1 |
| FR-C5 | Signer can pause captioning without leaving the call | P1 |

### 6.3 Recognition and translation

| ID | Requirement | Priority |
|---|---|---|
| FR-R1 | Continuous recognition of gloss sequences without manual segmentation (CTC-based) | P0 |
| FR-R2 | End-of-utterance detection (rest pose + low motion) | P0 |
| FR-R3 | Partial captions (streaming glosses) during signing | P0 |
| FR-R4 | Final caption: gloss sequence converted to a fluent English sentence | P0 |
| FR-R5 | N-best gloss hypotheses re-ranked using an LLM and recent caption context | P1 |
| FR-R6 | Out-of-vocabulary / low-confidence segments flagged instead of guessed | P0 |
| FR-R7 | Sentence-template retrieval baseline, usable as a fallback mode | P1 |
| FR-R8 | Sentence generation must not add content absent from the glosses; violations are measured | P0 |

### 6.4 Caption delivery

| ID | Requirement | Priority |
|---|---|---|
| FR-D1 | Captions delivered to every participant in the room in real time | P0 |
| FR-D2 | Partial captions visually distinct from final captions | P0 |
| FR-D3 | Caption toggle, size control, high-contrast style | P0 |
| FR-D4 | Malayalam captions via existing MT (IndicTrans2-class model) | P1 |
| FR-D5 | Optional TTS of final captions (English, then Malayalam) | P1 |
| FR-D6 | Signer can retract a final caption; retraction shown to all | P1 |
| FR-D7 | Session transcript view during the meeting | P2 |

### 6.5 Diagnostics

| ID | Requirement | Priority |
|---|---|---|
| FR-X1 | Per-stage latency logging (capture, transport, recognition, LLM, MT, display) | P0 |
| FR-X2 | Developer panel: FPS, landmark quality, model confidence | P1 |
| FR-X3 | Logs contain no landmarks, video or caption text unless debug consent is given | P0 |

### 6.6 Data tooling (internal)

| ID | Requirement | Priority |
|---|---|---|
| FR-T1 | Recording web app: shows prompt sentence, records landmarks and video, uses the same preprocessing code as the live system | P0 |
| FR-T2 | Consent captured per recording session | P0 |
| FR-T3 | Annotation workflow for gloss labels and sentence boundaries | P0 |
| FR-T4 | Synthetic sentence generator (concatenating isolated-sign clips) | P1 |

## 7. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Partial caption latency (sign completes to gloss shown) | TBD after baseline measurement |
| NFR-2 | Final caption latency (end of utterance to English sentence shown) | TBD after baseline measurement |
| NFR-3 | Client hardware | Laptop-class CPU, 8 GB RAM, 720p webcam, current Chrome / Edge / Firefox |
| NFR-4 | Inference server | Runs on CPU for one or a few concurrent signers. Concurrency target TBD from load test. |
| NFR-5 | Privacy | Video never leaves the browser for recognition. Landmarks and captions not persisted without explicit consent. |
| NFR-6 | Accessibility | Caption UI usable with keyboard; contrast and size options; target WCAG level TBD |
| NFR-7 | Robustness | Handles left- and right-hand dominant signers; warns rather than fails on poor tracking |
| NFR-8 | Reproducibility | Every reported metric traceable to a versioned model, dataset split and config |

Note: the SRS targets (250 ms end-to-end, ≤ 20% WER, 50+ concurrent streams on an A6000) were taken from other systems on other datasets. They are not adopted here. Replace with our own measured numbers.

## 8. Domain and data

### 8.1 Domain

Academic and meeting communication. Final list of 40 to 80 signs and 30 to 50 sentence templates is **TBD** (Phase 0 deliverable). Keep templates short; accuracy drops with sentence length.

### 8.2 Sources

| Source | Use | To verify |
|---|---|---|
| INCLUDE (AI4Bharat) | Isolated ISL signs for encoder pretraining | Licence, overlap with our vocabulary |
| ISL-CSLTR | Continuous sentences, multiple signers | Licence, gloss annotation format |
| ISLTranslate / iSign | Sentence structure, possible domain overlap | Whether gloss labels exist (we believe they do not) |
| Self-recorded | Our domain vocabulary and sentences | Validation by ISL-fluent reviewer |
| Synthetic concatenation | Multiply sentence variants | Keep a natural-signing test set separate |

### 8.3 Data rules

- Prefer more signers with fewer samples each.
- Test splits held out by signer and by sentence.
- Dataset correctness validated by an ISL-fluent reviewer (e.g. contact via NISH or an ISLRTC-listed interpreter).

## 9. Success metrics

| Metric | How measured |
|---|---|
| Gloss WER | Held-out natural-signing test set, signer-dependent and signer-independent reported separately |
| Sentence quality | BLEU and chrF on held-out sentences; exact-template accuracy |
| Hallucination rate | Share of final sentences containing content not supported by the glosses (manual review of a sample) |
| Latency | Per stage and end-to-end, on stated hardware |
| Baseline comparison | CTC + LLM pipeline vs. template retrieval baseline |
| Usability | Qualitative session with at least one deaf signer and hearing participants (if consent and access allow) |

A suspiciously high score on a small test set is treated as a possible leak and investigated before reporting.

## 10. Milestones (28 working weeks)

The main change from the original plan is an end-to-end skeleton by week 9, so integration risk is retired early.

| Phase | Weeks | Exit criteria |
|---|---|---|
| 0. Foundations | 1 to 3 | Domain list frozen; dataset coverage checked; LiveKit chosen and running locally; consent form drafted; roles assigned |
| 1. Skeleton | 4 to 9 | Meeting rooms working; browser landmark extraction; recording app collecting data; a crude isolated-sign classifier (about 10 signs) captioning live in a room |
| 2. Core model | 10 to 17 | Encoder pretrained on isolated signs; CTC continuous model; template baseline; first held-out numbers |
| 3. Full pipeline | 18 to 24 | End-of-utterance detection; partial/final UX; LLM sentence step and re-ranking; Malayalam MT; TTS; diagnostics |
| 4. Evaluation | 25 to 28 | Full evaluation, error analysis, documentation, demo rehearsal, buffer |

## 11. Team roles

| Role | Focus | Owner |
|---|---|---|
| ML / translation core | Landmark preprocessing, CTC model, LLM step | TBD |
| Data and evaluation | Recording sessions, annotation, consent, evaluation harness | TBD |
| Platform | LiveKit setup, auth, rooms, caption agent service | TBD |
| Frontend and accessibility | Caption UX, framing guide, settings, Malayalam/TTS hookup, demo polish | TBD |

## 12. Risks

| Risk | Mitigation |
|---|---|
| Domain vocabulary missing from public datasets | Self-record; validate with ISL-fluent reviewer |
| Poor generalization to unseen signers | Landmark augmentation, normalization, more signers; report both numbers |
| LLM adds content the signer did not sign | Constrained prompts, hallucination metric, show glosses alongside sentence in debug view |
| Latency too high for conversation | Measure per stage early (Phase 1); small model; partial captions cover the wait |
| Team ML experience | Start from published landmark + CTC designs; front-load ML work |
| Late integration | End-to-end skeleton by week 9 |
| Timeline slippage | Cut P2, then P1 items, in that order |
| Dataset licence restrictions | Check licences in Phase 0 |

## 13. Items for human review

- Ethics approval and consent forms for recording signers (video includes faces). Get institutional guidance.
- Whether India's DPDP Act 2023 applies to the recording and processing of participant data, and what that requires. Faculty or institutional review, not a team decision.
- Licence terms of INCLUDE, ISL-CSLTR, ISLTranslate / iSign, and any reused model code.
- Terms of any hosted LLM / TTS API used, especially around sending caption text.

## 14. Open questions

1. Final domain sign list and sentence templates.
2. Hosted LLM API vs. self-hosted small open model for the sentence step.
3. Which face landmarks to include.
4. Self-hosted LiveKit vs. LiveKit Cloud for the demo.
5. Latency targets, once a baseline exists.

## 15. Changes from the SRS

| SRS | This PRD |
|---|---|
| 3D-ResNet/MC3_18 + Transformer on video | Landmark-only conv + Transformer encoder |
| CDCM / BART consistency loss | LLM n-best re-ranking; CDCM moved to future work |
| 6 FPS model input | 15 to 30 FPS landmarks |
| 443 to 543 features, contradictory on depth | Hands + upper-body pose + small face subset (exact set TBD) |
| P2P WebRTC + custom FastAPI/WebSocket | LiveKit SFU + LiveKit Agents worker |
| GPU server ≥ 12 GB, 50+ streams | CPU inference; concurrency measured |
| 250 ms end-to-end, ≤ 20% WER | Targets set from our own baseline |
| No Malayalam / TTS | Included as P1 |
