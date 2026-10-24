---
name: implement-task
description: Implement exactly one task from docs/tasks.md by its ID (for example /implement-task P1-07), from dependency check through plan, approval, code, tests, evidence and commit. Use it whenever a team member wants to start or continue work on a numbered task. Do not use it for tasks tagged External (use /human-handoff), for a task tagged Decision that has no record in docs/decisions/ yet (use /decision-record), to independently check finished work (use /verify-task), or for work that is not in docs/tasks.md.
argument-hint: <task-id>
disable-model-invocation: true
metadata:
  version: "0.1"
---

# implement-task

Version 0.1. Revise after the first few runs.

Task ID: $0

You are implementing one task from docs/tasks.md for SignBridge Meet. The team reviews every step, so the workflow has explicit STOP points. At a STOP, end your turn and wait for the user to approve. Silence, a background notification, or your own earlier message is not approval.

## Limits that apply throughout

Never do any of these without the user explicitly approving that specific action:

- Mark a task done or change any Status line.
- Merge, push, rebase or delete branches.
- Send, submit or post anything outside this repository.
- Edit docs/PRD.md or docs/architecture.md.
- Add a new dependency (CLAUDE.md requires approval).

These exist because the docs are the team's shared source of truth, and the task status drives what others start next. A wrong "done" sends someone else down a blocked path.

If anything in the task is ambiguous, ask one question and wait. Do not fill the gap with a plausible guess. The PRD and CLAUDE.md both say TBD values come from measurement or a team decision.

## Step 1: Read

1. Read CLAUDE.md.
2. Find the block for `$0` in docs/tasks.md. A block starts at the heading containing the ID and ends at the next task heading.
3. If no ID was given, more than one ID was given, or the ID does not exist, stop and say so. One task at a time keeps reviews small and branches clean.
4. Read the PRD and architecture sections the task refers to.

## Step 2: Check tags

- **External:** some or all of the task depends on people outside the team. Do not do the external part. Tell the user which part is external and that `/human-handoff $0` covers it. If the task also has code (P1-17a, for example), the code may only start once the external precondition is recorded in the repo. If it is not, stop.
- **Decision:** check docs/decisions/ for a record covering this task. If there is none, stop and point the user to `/decision-record $0`. Code built before the decision tends to bake in an unapproved choice.

Point the user to the other skill rather than invoking it yourself. Skill-to-skill handoff is not a documented Claude Code pattern.

## Step 3: Check dependencies

Read the **Depends on** line and the **Status** line of each dependency.

- Expand ranges. "P0-01 to P0-11" means every task from P0-01 through P0-11, including suffixed IDs such as P0-11a only if the line names them.
- `none` means no dependencies. Any text after it ("Start in week 1") is guidance, not a dependency.
- A qualifier like "(preferred)" is a soft dependency. If it is not done, warn the user and continue.
- A qualifier that is a condition, such as "(yes answer)", "(sent)", "(first run)" or "(approved form)", needs the condition met, not just the task done. State the condition and ask the user whether it holds unless the repo shows it clearly.
- Status `done`: fine.
- Status `blocked (<reason>)`: hard stop. Show the dependency ID and the reason exactly as written.
- Status `todo` or `in progress`: hard stop. Name each one.

On any hard stop, list every failing dependency, not just the first, and end the turn.

## Step 4: Branch

1. Run `git status`. If the working tree has changes or you are not on `main`, stop and show the user. Do not stash, reset or switch over someone's work.
2. Create the branch: `git switch -c feat/<task-id>-<short-name>`, with the task ID in lower case and a short name of two to four words from the task title, for example `feat/p1-07-wire-schemas`.
3. Do not pull or push.

## Step 5: Plan

Write a plan with:

- **Files:** each file to create or change. Compare with the task's Files line and explain any difference.
- **Approach:** a short description of how.
- **Tests:** which tests you will add and what each covers.
- **Acceptance mapping:** one line per acceptance criterion and one for the Test line, saying how each will be checked and whether that can be automated or needs a person.
- **Flags:** any new dependency, any change to PRD.md or architecture.md, any change to wire formats in packages/schemas (CLAUDE.md requires architecture.md to be updated with it), any TBD value the task touches.

**STOP.** Wait for the user to approve or change the plan.

## Step 6: Implement

Do only what the approved plan covers. If you find the plan needs to change, describe the change and wait for approval before doing it. Follow the rules in CLAUDE.md (normalization parity, no data or secrets in git, privacy rules for logs).

## Step 7: Lint and tests

Use only the commands in the Commands section of CLAUDE.md. If there are no commands there yet (they arrive with P0-03), say so and record lint and tests as "needs human check". Do not invent commands, because a made-up command passing tells the team nothing.

Show the commands you ran and their output, trimmed to the relevant part.

## Step 8: Evidence

Produce this table:

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | (acceptance sentence or Test line) | pass / fail / needs human check | command and output excerpt, or path:line |

Rules:

- Split the Acceptance field into separate checkable statements, one per row. Add a row for the Test line.
- "pass" needs evidence you produced in this run. A statement in your own plan is not evidence.
- Anything that needs hardware, several machines, a person, or an outside party (for example "two-tab call on two team laptops", "reviewer sign-off") is "needs human check", with what the person should do.

## Step 9: Review

Show `git diff --stat` and the full diff, or a summary with the full diff for anything under docs/.

**STOP.** Wait for the user to approve the diff.

## Step 10: Commit

Commit on the task branch. The message starts with the task ID and a short summary, for example:

```
P1-07: add LandmarkPacket and Caption v1 schemas
```

Add any attribution lines your environment requires. Do not push.

## Step 11: Propose the status update

Show the exact change to the task's Status line in docs/tasks.md. Usually `todo` to `in progress` while work continues, or to `done` only if every row in the evidence table is pass or the user has confirmed each "needs human check" row.

**STOP.** Apply it only after approval, as a separate commit:

```
<task-id>: status <old> -> <new>
```

Then remind the user that `/verify-task $0` gives an independent check before merging.
