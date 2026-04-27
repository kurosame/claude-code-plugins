---
description: Commit all uncommitted changes from a new branch off main, push, and open a single consolidated PR.
---

Follow these instructions strictly.

This command's job:
- Detect all uncommitted changes (and relevant untracked files) in the working tree.
- Create a new branch from `main`.
- Commit the changes.
- Push the branch and open a single consolidated PR to `main`.

This command does NOT run check commands and does NOT edit source files. Any verification (lint, type-check, build, test) is assumed to have happened beforehand.

## Workflow

1. Run `git status` to inspect the working tree. If there are no uncommitted changes and no relevant untracked files, report "no changes to commit" and exit.
2. **Sanity-check the change set before committing.** If `git status` shows files that look unrelated to the work in this session (e.g. local dev artifacts, IDE configs, files in unexpected directories, or files no prior step in this session touched), STOP and report what you found instead of committing. This prevents picking up a developer's in-progress work.
3. Create a new branch from `main` named: `claude/<YYYYMMDD-HHMMSS>` (e.g. `claude/20250101-123456`). Use the current date/time. If the `GITHUB_RUN_ID` environment variable is set (i.e. running inside a GitHub Actions runner), prefer `claude/<GITHUB_RUN_ID>-<YYYYMMDD-HHMMSS>` for traceability.
4. Stage and commit ALL relevant changes in a single commit. Use a concise English commit message that summarizes the overall change.
5. Push the branch to `origin`.
6. Create a PR with `main` as the base. Required format:
   - **Title** (Japanese): `[Claude] <改善内容の短い要約>`
   - **Body** (Japanese): a comprehensive summary organized by file as bullet points. If review findings or executed check commands are present in the conversation context, include them in the body.
7. Report the PR URL.

## Policies

- Never push to `main` directly; the PR base is always `main`.
- Do not run any check commands; they are assumed to have already been run.
- Do not edit any source files.
- Do not commit obviously sensitive files (`.env`, credential files, large binaries that look untracked-by-mistake). If such files appear staged, stop and report instead.
