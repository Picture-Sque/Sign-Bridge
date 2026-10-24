---
name: implement-task
description: Implement exactly one task from docs/tasks.md by its ID (for example /implement-task P1-07), from dependency check through plan, approval, code, tests, evidence and commit. Use it whenever a team member wants to start or continue work on a numbered task. Do not use it for tasks tagged External (use /human-handoff), for a task tagged Decision whose record in docs/decisions/ is missing or not yet Accepted (use /decision-record), to independently check finished work (use /verify-task), or for work that is not in docs/tasks.md.
argument-hint: <task-id>
disable-model-invocation: true
metadata:
  version: "0.2.2"
---

# implement-task

Version 0.2.2. Revised after the P0-03 run: no destructive git, placeholders, CI round trip, merge order (0.2.2). Decision tasks need an Accepted record (0.2.1); revised after the first real run, P0-02 (0.2).

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

Never use `git checkout -- <path>`, `git restore`, `git reset`, `git clean`, `git stash` or similar commands to undo edits, including temporary edits made to test that a check fails. They can wipe out work you did not make. Make throwaway changes in a scratch copy outside the repo, or in new files you then delete by name. Undo them with targeted edits, or with `git revert` of one specific commit. In P0-03 a command that included `git checkout -- .` was denied, and it turned out it wasn't needed.

If anything in the task is ambiguous, ask one question and wait. Do not fill the gap with a plausible guess. The PRD and CLAUDE.md both say TBD values come from measurement or a team decision.

If the user's message contains an unfilled placeholder, such as `[paste]`, `[green/red]` or `[e.g. ...]`, ask for the real value. Do not read it from the machine, infer it from context, or pick the likeliest option, and do not proceed on that point until the user answers. Work that doesn't depend on the value may continue within the current step, but never past a STOP gate. A placeholder usually means the user meant to check something themselves, and a value you supply hides that the check never happened.

## Step 1: Read

1. Read CLAUDE.md.
2. Find the block for `$0` in docs/tasks.md. A block starts at the heading containing the ID and ends at the next task heading.
3. If no ID was given, more than one ID was given, or the ID does not exist, stop and say so. One task at a time keeps reviews small and branches clean.
4. Read the PRD and architecture sections the task refers to.

## Step 2: Check tags

- **External:** some or all of the task depends on people outside the team. Do not do the external part. Tell the user which part is external and that `/human-handoff $0` covers it. If the task also has code (P1-17a, for example), the code may only start once the external precondition is recorded in the repo. If it is not, stop.
- **Decision:** find the record for this task in docs/decisions/ and read its Status. Code built before the decision tends to bake in an unapproved choice.
  - `Accepted`: continue.
  - No record, or `Proposed`: stop and point the user to `/decision-record $0`.
  - `Proposed (needs measurement)`: continue, but build only the measurement the record describes. Mark that code as throwaway in the plan. The task cannot be marked done until the record is Accepted.
  - `Rejected` or `Superseded by NNNN`: stop and show the status. The task probably needs a new record.

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

## Step 4: Sync and branch

1. Ask the user to sync `main` in GitHub Desktop: switch to `main`, click Fetch origin, then Pull origin. You do not fetch, pull or push, so your view of `origin/main` is only as fresh as their last fetch. A branch cut from a stale `main` gives the PR avoidable conflicts.

   **STOP.** Wait for the user to confirm `main` is synced.

2. Run `git status -sb`. Stop and show the user if any of these hold: the working tree has changes, you are not on `main`, or `main` is ahead of or behind `origin/main`. Do not stash, reset or switch over someone's work.
3. Create the branch: `git switch -c feat/<task-id>-<short-name>`, with the task ID in lower case and a short name of two to four words from the task title, for example `feat/p1-07-wire-schemas`.
4. Do not pull or push.

## Step 5: Plan

Write a plan with:

- **Files:** each file to create or change. Compare with the task's Files line and explain any difference.
- **Approach:** a short description of how.
- **Tests:** which tests you will add and what each covers.
- **Acceptance mapping:** one line per acceptance criterion and one for the Test line, saying how each will be checked and whether that can be automated or needs a person.
- **Later tasks:** read the Files line of every task after this one in docs/tasks.md and list any path this change affects. Examples: an ignore rule that would hide a file a later task must commit, a file this task creates that a later task also expects to create, or a path this task moves or renames. For each conflict, say which task and what you propose. Write "none found" if there are none. In P0-02, a `.gitignore` rule would have hidden files that P1-19 and P1-21 commit, and this check is what catches that early.
- **Scope changes:** every file the plan edits that is not on the task's Files line, including docs/tasks.md edits for other tasks. Each one needs explicit approval. Keep the list; it goes into the PR description in Step 13. Write "none" if there are none.
- **Flags:** any new dependency, any change to PRD.md or architecture.md, any change to wire formats in packages/schemas (CLAUDE.md requires architecture.md to be updated with it), any TBD value the task touches.

**STOP.** Wait for the user to approve or change the plan, including each scope change.

## Step 6: Implement

Do only what the approved plan covers. If you find the plan needs to change, describe the change and wait for approval before doing it. A change that touches a file outside the task's Files line is a new scope change: add it to the list. Follow the rules in CLAUDE.md (normalization parity, no data or secrets in git, privacy rules for logs).

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

### CI round trip

Use this when the task's Test line needs CI to fail and then pass, for example "push a branch with a deliberate lint error and a failing test; CI fails; fix both; CI passes". The work commit from Step 10 must already be on the branch.

1. Make one throwaway commit on top of the work, with the message `<task-id>: throwaway CI check (...)`. Put the deliberate failures in new files only, each with exactly one intended problem and otherwise passing lint and format, so the red run can only come from those failures. Show locally that each command exits non-zero.
2. Ask the user to push. Tell them which jobs should go red and at which steps. Tell them not to open the PR yet if any job runs only on pull requests, because it would run against the red commit.
3. **STOP.** Wait for the user to confirm CI is red, and that every expected step failed rather than being skipped.
4. Run `git revert` on the throwaway commit only, and commit the result. Never revert or reset anything else.
5. Ask the user to push and confirm CI is green. Then they can open the PR, which runs any PR-only jobs.

CI runs only on the tip of each push. If several commits go up together, the red run belongs to the tip commit, not to the throwaway commit itself. Record the commit hashes CI actually ran on in the evidence table and the PR description. In P0-03 the red run was on `83a50f9`, not on the throwaway `8b99509`.

## Step 11: Independent check

Ask the user to run `/verify-task $0` on this branch. It runs in a fresh context and checks the files, not your reports.

**STOP.** Wait for the user to share the result. If it reports any fail, describe the fix and go back to Step 6 once the user approves it. Points it raises outside the criteria (for example scope changes) go into the PR description.

## Step 12: Status update

Propose the exact change to the task's Status line in docs/tasks.md:

- `done` only if verify-task reports no fail and the user has confirmed each "needs human check" row. For a Decision task, the record must also be Accepted.
- Otherwise `in progress`, with a note of what remains.

**STOP.** Apply it only after the user approves. Commit it on the same task branch, as a separate commit, so the status change ships in the same PR as the work:

```
<task-id>: mark <status>
```

For example `P0-03: mark done` or `P0-05: mark blocked (waiting on reviewer reply)`.

## Step 13: PR description

Print a PR description the user can paste into GitHub Desktop or GitHub. You do not open the PR yourself. Use this structure:

```markdown
## <task-id>: <task title>

### Summary
<two to four sentences: what changed and why>

### Scope changes
<each approved file outside the task's Files line, with the reason; or "None">

### Known gaps
<anything deferred, out of scope, or "needs human check"; or "None">

### Verification
verify-task: <n> pass, <n> fail, <n> needs human check.
<one line per "needs human check" row and who confirmed it>

Status: <old> -> <new> (commit <short hash>)
```

Add any attribution lines your environment requires for PR descriptions.

End by reminding the user of the merge order. Merge the PR only after verify-task has passed and the status commit from Step 12 is on the same branch. Then the work and its status ship in one PR. In P0-03 the work PR was merged before verify-task ran, so a second PR was needed just for the status change.
