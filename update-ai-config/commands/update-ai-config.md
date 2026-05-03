---
description: Review the entire codebase against AI meta configuration files (CLAUDE.md, AGENTS.md, .claude/rules/*.md) and report what should be added, updated, or created. Read-only — does not edit files.
---

Follow these instructions strictly.

This is a **review-only** command. Do NOT edit, branch, commit, push, or run check commands — only produce findings. The expected next step is `/apply-fix`, which will consume these findings and edit (or create) the files; after that, `/pr` will commit and open a pull request.

## Scope

- Read-only review of the entire codebase to determine whether the project's AI meta configuration files accurately describe the current state of the project.
- Project-local files only. Never inspect or reference `~/.claude/`, `~/.codex/`, or any path outside the repository.

In-scope meta files:

- `CLAUDE.md` (root and any nested `CLAUDE.md` under subdirectories)
- `AGENTS.md` (root and any nested `AGENTS.md`). Note: `AGENTS.md` is a shared file that other AI tools (Codex, Cursor, etc.) may also consume — only review parts that state repository-level facts. Do NOT touch sections that clearly belong to another specific tool (heuristic: the section heading or its leading sentence names another tool, e.g. "## Cursor", "### For Codex", "Notes for Cline").
- `.claude/rules/*.md`

When searching for nested `CLAUDE.md` / `AGENTS.md`, exclude common non-source directories: `node_modules/`, `vendor/`, `.git/`, build outputs (`dist/`, `build/`, `.next/`, `.nuxt/`, `target/`), and any path listed in `.gitignore`.

Out of scope (do NOT report on these in this command):

- `.claude/agents/*.md`, `.claude/commands/*.md`
- `.claude/settings.json` / `settings.local.json`
- User-global config (`~/.claude/...`)
- Other AI tools' meta files (`.cursorrules`, `.cursor/rules/*`, `.windsurfrules`, `.github/copilot-instructions.md`) — future extension, not now.
- Any code files. This command judges meta config only.

## Workflow

1. Explore the codebase to build a model of its current reality. Inspect, at minimum:
   - **Package / build manifests**: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `Makefile`, `justfile`, `pnpm-workspace.yaml` — note declared scripts, dependencies, toolchain, and whether the repo is a monorepo / workspace.
   - **Top-level directory layout**: which directories exist and what role they serve (`src/`, `tests/`, `docs/`, `cmd/`, `internal/`, `.claude/`, etc.).
   - **Major framework / runtime indicators**: `next.config.*`, `nuxt.config.*`, `vite.config.*`, `tsconfig.json`, `astro.config.*`, `Dockerfile`, `pytest.ini`, `tox.ini`, `noxfile.py`, Cargo workspace `[workspace]` blocks, etc. Adapt the inspection to the actual language ecosystem of the repo — do not insist on Node-specific files when the project is Python / Go / Rust / etc.
   - **Test, lint, format, type-check setup**: test runner, linter / formatter config, CI workflow files under `.github/workflows/`.
   - **Existing `.claude/` contents** (if any) and the in-scope meta files themselves.
2. Read each in-scope meta file that exists, fully.
3. Compare the project reality against the meta files. Identify drift in three categories:
   - **Stale**: a meta file states something that no longer matches reality (e.g. lists a script that was removed or renamed, references a directory that no longer exists, names a framework the project no longer uses).
   - **Missing content**: a meta file exists but omits important facts an agent would need to work effectively in this codebase (e.g. how to run / build / test, project layout, framework, key conventions).
   - **Missing file**: an in-scope meta file does not exist but plausibly should given the project's scale and structure. Be conservative: only flag this when the project clearly has enough structure to warrant it (e.g. a `.claude/` directory exists, or the codebase has well-established conventions worth documenting).
4. Output a findings report. For each item include:
   - **File path** (and line number / section heading if applicable). For "missing file" findings, the path of the file to be created.
   - **Severity**: `high` (factually wrong content actively misleading agents) / `medium` (omits or under-specifies meaningful facts) / `low` (factually accurate but lacks a small piece of useful context — e.g. a minor script or convention).
   - **Type**: `update-existing` / `create-new`.
   - **Description**: what the drift is, citing concrete evidence from the codebase (e.g. "`package.json` declares a `check:types` script, but CLAUDE.md does not mention how to run type checks").
   - **Suggested fix**: described in prose, NOT as a patch. State *what* to add/remove/change, not *how* to write it line by line. (`/apply-fix` will produce the actual edit, or create the file from your description.)
5. **Empty-result handling.** If no in-scope meta files exist AND the project structure does not warrant creating any (no `.claude/` directory, no substantial conventions to document), report "no in-scope meta files; nothing to review" and exit. If meta files exist or should plausibly exist but no drift was found, say so explicitly and exit.

## Review Guidelines

- Do NOT edit any files. This command is read-only.
- Do NOT suggest formatting-only changes (whitespace, line breaks, heading style) — those are not drift.
- Do NOT invent commands, scripts, paths, or behaviors absent from the codebase. Every finding must cite specific evidence from real project files (with paths).
- Match the language of the existing meta file (Japanese vs English) when phrasing the suggested fix. When creating a new file, follow the dominant language used by other in-scope meta files in the repo; default to English if there are none.
- Preserve the user's editorial voice. Suggest the smallest viable change rather than a rewrite.
- Focus on facts an agent needs to do useful work: how to run / build / test, where things live, what conventions apply. Do NOT pad meta files with general project marketing, onboarding prose, or aspirational roadmaps.
- Personal preferences / feedback-style content belongs in agent memory, not in `CLAUDE.md`. Do NOT recommend adding such content to a meta file.

## Policies

- Do NOT edit, branch, commit, push, or open a PR.
- Do NOT run check / lint / build / test commands.
- Do NOT touch files outside the in-scope meta file list above.
- Do NOT recommend deletions of meta content unless the codebase makes the content factually wrong (be conservative).
- If unsure whether a finding is warranted, prefer to skip rather than over-report.
