---
name: decision-record
description: Draft and record a team decision for one task tagged Decision in docs/tasks.md (for example /decision-record P1-01), as docs/decisions/NNNN-<topic>.md with options, trade-offs and a recommendation tied to the PRD and architecture. Also completes a record that was waiting on a measurement. Use it before implementing any Decision task. Do not use it for tasks without the Decision tag, to implement anything (use /implement-task once the record is Accepted), or for work that needs people outside the team (use /human-handoff).
argument-hint: <task-id>
disable-model-invocation: true
metadata:
  version: "0.1"
---

# decision-record

Version 0.1. Revise after the first few runs.

Task ID: $0

You are drafting a decision record for one task in docs/tasks.md for SignBridge Meet. The team makes the decision. You gather the requirements, lay out the options honestly, recommend one, and record what the team chose. You do not implement anything; implement-task does that once the record is Accepted.

The workflow has explicit STOP points. At a STOP, end your turn and wait for the user. Silence, a background notification, or your own earlier message is not approval.

## Limits that apply throughout

Never do any of these without the user explicitly approving that specific action:

- Change any Status line in docs/tasks.md. This skill never changes task status; implement-task does.
- Merge, push, rebase or delete branches.
- Send, submit or post anything outside this repository.
- Edit docs/PRD.md or docs/architecture.md.
- Add a dependency or write implementation code.

Also:

- Never choose the option on the team's behalf. A recommendation is not a decision.
- Never change the Recommendation text after the team decides. The record should show what was recommended and what was chosen, even when they differ.
- If anything is ambiguous, ask one question and wait. Do not fill the gap with a plausible guess.

## Step 1: Read and check

1. Read CLAUDE.md.
2. Find the block for `$0` in docs/tasks.md. A block starts at the heading containing the ID and ends at the next task heading. Stop if no ID was given, more than one was given, or it does not exist.
3. Stop if the heading is not tagged **Decision**. Say which skill fits instead.
4. Check dependencies with the same rules as implement-task Step 3:
   - Expand ranges ("P0-01 to P0-11").
   - `none` means no dependencies.
   - "(preferred)" is a soft dependency: warn and continue.
   - A condition such as "(yes answer)" or "(sent)" needs the condition met. Ask unless the repo shows it.
   - `todo`, `in progress` or `blocked (<reason>)` is a hard stop. List every failing dependency, with the reason for blocked ones exactly as written.
5. Look in docs/decisions/ for an existing record for this task. If there is one, read its Status and go to the step that fits:
   - `Proposed`: Step 7 (record the decision), after confirming with the user that the team has decided.
   - `Proposed (needs measurement)`: Step 6a (complete with measured results).
   - `Accepted`, `Rejected` or `Superseded by NNNN`: stop and show the status. A changed decision needs a new record that supersedes this one; ask the user before starting one.

## Step 2: Requirements

Collect what the decision must satisfy, with sources:

- The task's Goal and Acceptance lines.
- Relevant PRD sections, cited by number (for example "PRD 6.1 FR-M1", "PRD 7 NFR-5").
- Relevant architecture.md sections, cited by number.
- CLAUDE.md rules that constrain the choice (stack, privacy, no data in git, ask before new dependencies).
- Earlier records in docs/decisions/, especially Accepted ones this decision must fit with.

List them before drafting. If two requirements conflict, say so; that conflict belongs in the record.

## Step 3: Sync and branch

1. Ask the user to sync `main` in GitHub Desktop: switch to `main`, Fetch origin, then Pull origin. You do not fetch, pull or push.

   **STOP.** Wait for the user to confirm `main` is synced.

2. Run `git status -sb`. Stop and show the user if the working tree has changes, you are not on `main`, or `main` is ahead of or behind `origin/main`.
3. Create the branch: `git switch -c docs/<task-id>-decision-<topic>`, task ID in lower case, for example `docs/p1-01-decision-backend`.

## Step 4: Draft the record

Path: `docs/decisions/NNNN-<topic>.md`.

- Use the number and topic from the task's Files line if it names a record.
- Otherwise use the next free number: one that is not an existing file in docs/decisions/ and not reserved on any task's Files line in docs/tasks.md. Reserved numbers belong to the tasks that name them.

Use this structure:

```markdown
# NNNN: <Title>

- **Status:** Proposed
- **Task:** <task-id>
- **Decided by:**
- **Date:**

## Context

<The problem in a few sentences. Constraints, with citations (PRD, architecture, CLAUDE.md, earlier records). What happens if we do not decide.>

## Options

### Option A: <name>

- **How it works:** ...
- **Pros:** ...
- **Cons:** ...
- **Team effort:** <rough, relative; say what drives it>
- **Requirements:** meets <list>; misses or weakens <list>

### Option B: <name>

...

## Recommendation

<The option and why, tied to the requirements above.>

## Consequences

<What changes if the recommendation is accepted: files and folders in the repo, CLAUDE.md (stack, commands), architecture.md sections, and other tasks in docs/tasks.md.>

## Open questions

<Anything the team must answer, or "None".>
```

Give 2 to 4 options, and make them real ones the team could pick. A straw-man option makes the recommendation look stronger than it is.

## Step 5: Accuracy

- Mark any fact you are not sure of as **to verify**: versions, licences, feature support, pricing, limits, performance. This applies to things you remember but have not confirmed in this repo or in a source you can cite.
- Never invent benchmarks or numbers. Do not estimate performance and present it as data.
- If the decision depends on a measurement (as in P1-06), set the Status to `Proposed (needs measurement)` and replace the Recommendation with:
  - "Cannot decide until measured."
  - What to measure, on which hardware and browsers, how many runs.
  - What result would favour each option.
  - What code is needed to measure it. implement-task may build only that code, and the plan marks it as throwaway.

## Step 6: Review

Show the full draft and the requirement list.

**STOP.** The team discusses and decides. If the user asks for changes, revise the draft and STOP again.

## Step 6a: Complete with measured results

Use this step only when the record's Status is `Proposed (needs measurement)` and the measurement has been done (usually through implement-task).

1. Ask the user where the results are, for example committed files or a decision record attachment. Do not take numbers from memory or a chat summary you cannot trace to a file.
2. Add a `## Measured results` section to the record: what was measured, setup (hardware, browsers, versions), and the results as a table, each with its source path.
3. Keep the original "Cannot decide until measured" text. Add a `## Recommendation after measurement` section below it with the recommendation and why.
4. Set the Status to `Proposed`.

**STOP.** Show the updated record. The team decides.

## Step 7: Record the decision

When the user states the decision:

1. Set the Status to `Accepted`, `Rejected`, or `Superseded by NNNN`.
2. Add a `## Decision` section: the chosen option and any conditions the team attached.
3. Fill in Decided by and Date. Use the names and date the user gives; ask if they did not give them.
4. Do not edit the Recommendation (or Recommendation after measurement) text.
5. If the team chose a different option from the recommendation, add a `## Why we chose differently` section in the team's words.

## Step 8: Follow-up edits

List the edits the decision implies, each with the file, the exact change and why. Typical ones:

- CLAUDE.md: Stack, Commands, or a new rule.
- docs/architecture.md: the section the decision settles (for example an "Open decisions" item in section 14).
- docs/tasks.md: Files lines, dependencies, or notes on later tasks. Never Status lines.

**STOP.** Apply only the edits the user approves, on the same branch. Edits to PRD.md or architecture.md need that explicit approval.

## Step 9: Commit and PR description

Commit on the branch:

```
<task-id>: decision record NNNN <topic>
```

Add any attribution lines your environment requires. Do not push.

Then print a PR description the user can paste into GitHub Desktop or GitHub:

```markdown
## <task-id>: decision record NNNN <topic>

### Decision
<Status, chosen option, conditions, decided by, date>

### Options considered
<one line per option, and which was recommended>

### Follow-up edits
<each approved edit with its file; or "None">

### Open questions
<from the record; or "None">
```

Remind the user that implement-task can start on `$0` once this record is merged with Status Accepted.
