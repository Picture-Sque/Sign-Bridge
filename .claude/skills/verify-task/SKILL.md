---
name: verify-task
description: Independently verify one task from docs/tasks.md against its acceptance criteria (for example /verify-task P1-07). Runs in a fresh subagent with no access to the conversation, re-runs lint and tests, and checks each criterion against the actual files. Use it after implementing a task, before changing its status to done, or before merging its branch. Do not use it to implement, fix or edit anything; it is read only.
argument-hint: <task-id>
context: fork
agent: general-purpose
background: false
disallowed-tools: Edit, Write, NotebookEdit
metadata:
  version: "0.1.1"
---

# verify-task

Version 0.1.1. Revise after the first few runs.

Task ID: $0

You are an independent reviewer for SignBridge Meet. Someone else implemented task `$0`. Your job is to find out whether it actually meets its acceptance criteria. You were started without the implementer's conversation on purpose, so that their reports cannot shape your judgement. Keep it that way: judge only by the code, files and command output you see yourself.

## Read only

Do not edit, create or delete files. Do not commit, switch branches, stash, change any Status line, install packages or make network calls. Use Bash only for:

- the lint and test commands listed in CLAUDE.md
- read-only git: `git status`, `git diff`, `git log --stat`, `git show --stat`, `git ls-files`, `git branch --show-current`, `git check-ignore -v <paths>`

If a check would need anything else, mark it "needs human check" and say what a person should run. A reviewer that changes things is no longer independent.

If the task ID is missing, has more than one value, or does not exist in docs/tasks.md, report that and stop. If a criterion is too vague to check, mark it "needs human check" and say what is unclear. Do not guess what it meant.

## Step 1: Read the task

1. Read CLAUDE.md.
2. Find the block for `$0` in docs/tasks.md. It starts at the heading with the ID and ends at the next task heading.
3. Note the Files, Acceptance, Test and Depends on lines and the Status.

Do not read commit messages, PR descriptions or earlier reports as evidence that something works. You may use git to find which files changed (`git diff --stat main...HEAD`, `git log --stat`), then read those files directly.

## Step 2: Lint and tests

Run the lint and test commands from the Commands section of CLAUDE.md. If none are defined yet, record one row saying so as "needs human check". Do not invent commands.

Record each command and the part of its output that shows the result.

## Step 3: Check each criterion

Build the list of rows:

1. Split the Acceptance field into separate checkable statements, one per row.
2. Add a row for the Test line.
3. Add a row "Dependencies done": check the Status of every task on the Depends on line.
4. Add a row for each path on the Files line: does it exist and was it changed?

For each row, look at the actual files or command output. Result values:

- **pass:** you saw direct evidence in this run.
- **fail:** you saw evidence that it is not met, or the thing it requires is missing.
- **needs human check:** it needs hardware, several machines, a person or an outside party, or you could not confirm it. When in doubt, use this rather than pass.

## Step 4: Report

Output exactly this:

```
## verify-task $0

Branch: <branch>   Commit: <short hash>

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | ... | pass | `path/to/file.py:42` ... |

Summary: <n> pass, <n> fail, <n> needs human check.
```

Evidence is a path with line numbers, or a command with a short output excerpt. Keep each cell short. After the table, list in one or two sentences any "needs human check" item that blocks marking the task done.
