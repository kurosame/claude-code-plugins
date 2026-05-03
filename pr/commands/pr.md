---
description: Commit uncommitted changes from new branch(es) off main, push, and open one PR per related-change group.
---

Follow these instructions strictly.

This command's job:

- Detect all uncommitted changes (and relevant untracked files) in the working tree.
- Analyze the changes and split them into groups by relatedness (file-level granularity only).
- For each group, create a branch from `main`, commit only that group's files, push, and open a PR to `main`.
- If only one group results, fall back to a single consolidated PR (the original behavior).

This command does NOT run check commands and does NOT edit source files. Any verification (lint, type-check, build, test) is assumed to have happened beforehand.

## Workflow

1. Run `git status` to inspect the working tree. If there are no uncommitted changes and no relevant untracked files, report "no changes to commit" and exit.
2. **Sanity-check the change set.** If `git status` shows files that look unrelated to the work in this session (e.g. local dev artifacts, IDE configs, files in unexpected directories, or files no prior step in this session touched), STOP and wait for the user's explicit instruction before continuing — do NOT proceed automatically even in auto mode.
3. **Group the changes by relatedness** following the rules in the "Grouping rules" section below. Determine an internal list of groups, each with: `{theme, theme_slug, files[], commit_message, pr_title, pr_body}`. Briefly report the resulting groups to the user (format: `Group N (<theme>): <file list>`); do NOT wait for approval, just proceed.
4. Branch based on group count:
   - **Single group** → execute "Single-PR workflow" below (preserves the original behavior).
   - **Multiple groups** → execute "Multi-PR workflow" below.
5. Report all created PR URLs as a list.

## Grouping rules

Apply these rules in order:

1. **File-level granularity only.** This command cannot split a single file across PRs. If the same file is touched by multiple themes (e.g. one hunk fixes a bug, another renames a helper), MERGE those themes into one group. Never plan a hunk-level split.
2. **Dependency constraint (never split).** Changes that would break build, type-check, or tests if taken alone MUST stay in the same group. Examples: a function signature change and its callers; a new export and the files importing it; a new type and its usages; a test and the implementation it covers; a config file and the code that reads it. Rule of thumb: if applying one half without the other yields broken code, they belong together. Stacked PRs are NOT supported by this command — when in doubt, MERGE the groups instead of ordering them.
3. **Group by fix theme / source of the review finding.** If prior code-review findings exist in the conversation context, treat each finding as one theme and group the files that implement that finding together. If there is no review context, infer the theme from the diff itself (e.g. "form validation bug fix", "remove unused imports", "README update", "rename helper").
4. **Edge-case fallback to single group.** If any of these are present, do NOT attempt to split — fall back to a single PR:
   - Renamed files (rename detection across groups is fragile).
   - File-mode-only changes (e.g. executable bit) without content changes.
   - Submodule pointer changes.
   - Symlink changes.
   - Binary files or Git LFS-managed files (partial restore behavior is environment-dependent).
   - Changes to `.gitattributes` itself (would alter normalization of other files mid-restore).
   - Text files in environments with `core.autocrlf=true` or active smudge/clean filters (round-trip verification can yield false positives).

For each group, derive a short `theme_slug` (kebab-case, ≤ 24 chars, ASCII) from the theme — it will appear in the branch name for traceability across retries.

## Single-PR workflow

1. Create a new branch from `main` named `claude/<YYYYMMDD-HHMMSS>` (e.g. `claude/20250101-123456`). If `GITHUB_RUN_ID` is set (running inside a GitHub Actions runner), prefer `claude/<GITHUB_RUN_ID>-<YYYYMMDD-HHMMSS>` for traceability.
2. Stage and commit ALL relevant changes in a single commit with a concise English message.
3. Push the branch to `origin`.
4. Create a PR with `main` as the base. Required format:
   - **Title** (Japanese): `[Claude] <改善内容の短い要約>`
   - **Body** (Japanese): a comprehensive summary organized by file as bullet points. If review findings or executed check commands are present in the conversation context, include them in the body.
5. Report the PR URL.

## Multi-PR workflow

Precondition: the working tree carries all changes; HEAD is on `main` (or a branch equivalent to it).

1. **Stash everything** (tracked + untracked) so the working tree becomes clean:
   - `git stash push --include-untracked -m "claude/pr-split-<YYYYMMDD-HHMMSS>"`
   - Verify with `git stash list` that the stash entry was actually created. If the stash is empty (e.g. only ignored files were "changed"), STOP and report — there is nothing to split.
   - **Pin the stash ref**: capture it once with `STASH_REF=$(git rev-parse stash@{0})` and use `$STASH_REF` (and `$STASH_REF^3` for untracked) in every subsequent step. Do NOT reuse the literal `stash@{0}`, which can shift if any other stash operation runs.
2. For each group N (1, 2, 3, ...) in order:
   1. **Verify clean main**: run `git checkout main`, then confirm the working tree is clean and `git rev-parse HEAD` matches the `main` ref the run started on. If `main` has drifted (e.g. a leftover commit from a previous failed run), STOP and report — do NOT continue. Do NOT run `git pull`.
   2. **Pre-check branch name collision**: compute the branch name `claude/<YYYYMMDD-HHMMSS>-<N>-<theme_slug>` (or `claude/<GITHUB_RUN_ID>-<YYYYMMDD-HHMMSS>-<N>-<theme_slug>` in GitHub Actions). Confirm the name is not already present locally (`git branch --list`) nor on the remote (`git ls-remote --heads origin <branch>`). If it exists, append `-r<retry>` until unique.
   3. Create the branch: `git checkout -b <branch>`.
   4. **Restore ONLY this group's files from the stash** (file-level granularity only; use `$STASH_REF` from step 1):
      - For files that exist in the stash's working tree (modified or newly added by the user):
        - Tracked file changes: `git restore --source=$STASH_REF --worktree --staged -- <file>...`
        - Untracked / newly added files: `git restore --source=$STASH_REF^3 --worktree --staged -- <file>...` (the 3rd parent of an `--include-untracked` stash holds the untracked tree)
      - For files this group deletes (i.e. the user deleted them in the working tree before running `/pr`):
        - First check if the file was tracked at HEAD: `git ls-files --error-unmatch -- <file>`. If it was, run `git rm -- <file>`. If it was not (the deletion was of a previously-untracked file), simply ensure the file is absent (`rm -f <file>`) — there is nothing to remove from the index.
   5. **Verify the staged set**: run `git status` and confirm only this group's files appear, in the expected mode (modified / added / deleted). If anything unexpected shows up — especially a `.env`, credential, or large binary — STOP and report.
   6. `git commit -m "<concise English message>"`.
   7. `git push -u origin <branch>`.
   8. `gh pr create --base main --title "[Claude] <日本語要約>" --body "<日本語本文>"`. Body must list only this group's files as bullets and include any related review findings from the conversation context.
   9. Capture the returned PR URL.
3. **Round-trip verification** (tree-level, to avoid smudge/clean filter and `core.autocrlf` false positives): after all groups are processed:
   1. `git checkout main`.
   2. Build a verification tree by cherry-picking every group's commit on top of `main`: `git checkout -b claude/pr-split-verify-<YYYYMMDD-HHMMSS>`, then `git cherry-pick <commit>` for each group commit in order.
   3. Compare trees directly (NOT via the working tree):
      - Tracked content: `git diff-tree -r --no-renames <verify-branch>^{tree} $STASH_REF^{tree}` — must produce no output.
      - Untracked content captured by the stash: `git diff-tree -r --no-renames <verify-branch>^{tree} $STASH_REF^3^{tree}` — every difference here must correspond to a file that existed at `main` (i.e. the untracked tree of the stash legitimately omits pre-existing files); paths that were untracked-and-newly-added by the user must appear identical in both trees.
      - If anything else differs, STOP and report exactly which paths drifted; do NOT drop the stash and do NOT delete the verify branch.
   4. If verification passes, delete the verify branch (`git checkout main && git branch -D <verify-branch>`) and drop the stash (`git stash drop $STASH_REF`).
4. Report all PR URLs as a list, in the order created.

## Policies

- Never push to `main` directly; the PR base is always `main`.
- Do not run any check commands; they are assumed to have already been run.
- Do not edit any source files.
- Do not commit obviously sensitive files (`.env`, credential files, large binaries that look untracked-by-mistake). Re-check this BOTH at sanity-check time AND after restoring each group's files (workflow step 2.5). If anything suspicious appears, stop and report.
- Do NOT produce a grouping that violates the dependency constraint or attempts hunk-level splitting. When in doubt, merge candidate groups back together.
- If `git push` or `gh pr create` fails partway through the multi-PR workflow, STOP immediately. Do NOT drop the stash. Report which PRs were created so far (with URLs), which branches exist locally / on the remote, and which files remain in the stash so the user can recover manually.
