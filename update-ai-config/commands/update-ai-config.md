---
description: Review the codebase against AI meta configuration files (CLAUDE.md, AGENTS.md) and report what should be added, updated, or restructured. Read-only — does not edit files.
---

Follow these instructions strictly.

This is a **review-only** command. Do NOT edit, branch, commit, push, or run check commands — only produce findings. The expected next step is `/apply-fix`, which will consume these findings and edit (or create) the files; after that, `/pr` will commit and open a pull request.

## Scope

- Read-only review of the entire codebase to determine whether the project's AI meta configuration files accurately describe the current state of the project.
- Project-local files only. Never inspect or reference `~/.claude/`, `~/.codex/`, or any path outside the repository.

In-scope meta files:

- `CLAUDE.md` (root and any nested `CLAUDE.md` under subdirectories)
- `AGENTS.md` (root and any nested `AGENTS.md`). Note: `AGENTS.md` is a shared file that other AI tools (Codex, Cursor, Cline, etc.) may also consume — only review parts that state repository-level facts. Do NOT touch sections that clearly belong to another specific tool (heuristic: the section heading or its leading sentence names another tool, e.g. "## Cursor", "### For Codex", "Notes for Cline").

When searching for nested `CLAUDE.md` / `AGENTS.md`, exclude common non-source directories: `node_modules/`, `vendor/`, `.git/`, build outputs (`dist/`, `build/`, `.next/`, `.nuxt/`, `target/`), and any path listed in `.gitignore`.

Out of scope (do NOT report on these in this command):

- `.claude/rules/*.md` — intentionally not part of the canonical structure (see "Why no `.claude/rules/`" under Target structure). **Exception**: when a `.claude/rules/` directory is present as leftover from earlier attempts, flag it under Structural drift so its content is consolidated into `AGENTS.md` and the directory is deleted.
- `.claude/agents/*.md`, `.claude/commands/*.md`
- `.claude/settings.json` / `settings.local.json`
- User-global config (`~/.claude/...`)
- Other AI tools' meta files (`.cursorrules`, `.cursor/rules/*`, `.windsurfrules`, `.github/copilot-instructions.md`) — future extension, not now.
- Any code files. This command judges meta config only.

## Target structure

When in-scope meta files are missing or being newly populated, the project should converge on this canonical layout:

- **`AGENTS.md`** (project root, optionally nested for monorepo workspaces) — full inline content. The single source of truth for project facts. Consumed by Codex, Cursor, Cline, and any other agent that follows the agents.md spec. Target **≤200 lines** (see "Size guideline" below).
- **`CLAUDE.md`** (project root) — primarily a one-line `@AGENTS.md` import. May optionally carry a small trailing section of Claude-Code-specific instructions below the import. The tail section MUST: (a) appear AFTER the `@AGENTS.md` line, (b) stay within ~20 lines, (c) contain only instructions that genuinely do not apply to other AI tools (e.g. plan-mode hints for a specific subdirectory, Claude Code skill or hook references). A tail section that meets these conditions is NOT Structural drift; anything beyond is.

This is the canonical structure — recommend it by default. The one-line `@AGENTS.md` pattern is the official Claude Code recommendation for AGENTS.md interop (`code.claude.com/docs/en/memory`, AGENTS.md section: "create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them").

### Why no `.claude/rules/`

Earlier iterations of this spec recommended splitting content into `.claude/rules/<topic>.md` files. That approach has been removed because it is **unmaintainable in CI**:

- Claude Code v2.1.78+ enforces a built-in "protected directory" check that blocks writes to `.claude/**` paths. In headless / `-p` mode (which is what `anthropics/claude-code-action` uses), the check returns an immediate error and is **not overridable** by `--permission-mode` (acceptEdits, bypassPermissions, dontAsk all fail), settings.json `permissions.allow`, `--allowedTools`, or PermissionRequest hooks. Refs: `anthropics/claude-code#37253` (open), `#36282`, `#35646`.
- This makes any `/apply-fix`-style automated maintenance of `.claude/rules/*.md` impossible from CI.
- AGENTS.md as a single inline source of truth covers the same need (one canonical place for project facts) without hitting the protected-dir guard.

If/when Claude Code provides a CI override for the protected-dir check, this section can be revisited and the rules/-based structure considered again.

### Size guideline

Per Claude Code memory docs, CLAUDE.md adherence degrades above ~200 lines. Because `CLAUDE.md = @AGENTS.md` loads AGENTS.md transitively at session start, **AGENTS.md should target ≤200 lines** as well.

When AGENTS.md grows past that target, prune content that is **derivable from code** (exhaustive dependency version listings, full package script descriptions that mirror `package.json`, directory trees that mirror an obvious filesystem layout) before considering structural changes. Splitting content into `@`-imports does NOT reduce context — imported files load in full at launch (memory docs, "Import additional files").

### Monorepos / nested workspaces

When the project has nested workspaces (pnpm workspace, Cargo workspace, Go modules in subdirectories) whose conventions differ meaningfully from the repo root, apply the Target structure independently per workspace root. Each workspace root may have its own `AGENTS.md` + `CLAUDE.md` (= `@AGENTS.md`) pair. Do not hoist child-workspace facts into the repo-root files; the repo root only carries facts that apply to the whole repo. Flag a single-root meta config in a divergent monorepo as Structural drift.

## Workflow

1. Explore the codebase to build a model of its current reality. Inspect, at minimum:
   - **Package / build manifests**: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `Makefile`, `justfile`, `pnpm-workspace.yaml` — note declared scripts, dependencies, toolchain, and whether the repo is a monorepo / workspace.
   - **Top-level directory layout**: which directories exist and what role they serve (`src/`, `tests/`, `docs/`, `cmd/`, `internal/`, etc.).
   - **Major framework / runtime indicators**: `next.config.*`, `nuxt.config.*`, `vite.config.*`, `tsconfig.json`, `astro.config.*`, `Dockerfile`, `pytest.ini`, `tox.ini`, `noxfile.py`, Cargo workspace `[workspace]` blocks, etc. Adapt the inspection to the actual language ecosystem of the repo — do not insist on Node-specific files when the project is Python / Go / Rust / etc.
   - **Test, lint, format, type-check setup**: test runner, linter / formatter config, CI workflow files under `.github/workflows/`.
   - **The in-scope meta files themselves** (and any leftover `.claude/rules/` directory — see Structural drift).
2. Read each in-scope meta file that exists, fully. If `CLAUDE.md` contains `@AGENTS.md` (or any other `@<path>` import), follow the import and read the target so you have the complete picture.
3. Compare the project reality against the meta files. Classify each piece of drift into exactly one of the categories below. Apply the categories in this **precedence order** so a single issue is not double-reported: `Missing file` → `Structural drift` → `Stale` → `Missing content`. Stop at the first category that fits.
   - **Missing file**: NEITHER `CLAUDE.md` NOR `AGENTS.md` exists, AND the project warrants meta config (substantial conventions, non-trivial build/test setup). Recommend creating the **Target structure** in full: an inline `AGENTS.md` plus an import-only `CLAUDE.md` (= `@AGENTS.md`). If at least one of the two files exists, this category does not apply; use Structural drift instead.
   - **Structural drift**: at least one in-scope meta file exists but the project deviates from the **Target structure** at the file/surface level. Concretely:
     - `CLAUDE.md` carries inline rule content beyond `@AGENTS.md` (and the optional tail section per Target structure). Recommend moving the inline content into `AGENTS.md` and replacing `CLAUDE.md`'s body with `@AGENTS.md`. If `AGENTS.md` does not yet exist, this fix decomposes into two findings: a `create-new` for `AGENTS.md` (containing the extracted content) plus an `update-existing` for `CLAUDE.md` (replace body with `@AGENTS.md`).
     - `AGENTS.md` exists with content but `CLAUDE.md` does not import it (CLAUDE.md is empty, missing, or carries unrelated content). Recommend replacing `CLAUDE.md` with `@AGENTS.md` (or creating `CLAUDE.md` with that single line if missing).
     - A `.claude/rules/` directory exists in the repo as a leftover from earlier attempts. Recommend consolidating its content into `AGENTS.md` and deleting the directory. (Note: the consolidation step is the only place this command considers `.claude/rules/` — once removed, it is out of scope per the Scope rules.)
     - The project is a monorepo with workspaces whose conventions diverge meaningfully from the repo root, but only a single root meta config exists. Recommend per-workspace splits (see Target structure → Monorepos).
   - **Stale**: a meta file states a *specific fact* that no longer matches reality (e.g. lists a script that was removed or renamed, references a directory that no longer exists, names a framework the project no longer uses). The fact category is present but the value is wrong.
   - **Missing content**: a meta file exists and is otherwise sound, but a *fact category* an agent would need is not represented at all (e.g. `AGENTS.md` does not mention how to run type checks even though `package.json` declares a `check:types` script).
4. Output a findings report. For each item include:
   - **File path** (and line number / section heading if applicable). For Missing file / Structural drift findings, the path of the file to be created or restructured.
   - **Severity**: `high` (factually wrong content actively misleading agents, or the structure is so off that maintenance is broken) / `medium` (omits or under-specifies meaningful facts, or notable structural drift) / `low` (factually accurate but lacks a small piece of useful context — e.g. a minor script or convention).
   - **Type**: `update-existing` (edit a file that already exists) / `create-new` (create a file the findings explicitly call for).
   - **Description**: what the drift is, citing concrete evidence from the codebase (e.g. "`package.json` declares a `check:types` script, but `AGENTS.md` does not mention how to run type checks").
   - **Suggested fix**: described in prose, NOT as a patch. State *what* to add/remove/change/move, not *how* to write it line by line. (`/apply-fix` will produce the actual edit, or create the file from your description.) For Structural-drift fixes that touch both files, decompose into the concrete create / update operations needed (e.g. "move the stack section from `CLAUDE.md` lines 5-25 into `AGENTS.md`" + "replace `CLAUDE.md` body with `@AGENTS.md`").
5. **Empty-result handling.** If no in-scope meta files exist AND the project structure does not warrant creating any (no substantial conventions to document, no build/test setup), report "no in-scope meta files; nothing to review" and exit. If meta files exist or should plausibly exist but no drift was found, say so explicitly and exit.

## Review Guidelines

- Do NOT edit any files. This command is read-only.
- Do NOT suggest formatting-only changes (whitespace, line breaks, heading style) — those are not drift.
- Do NOT invent commands, scripts, paths, or behaviors absent from the codebase. Every finding must cite specific evidence from real project files (with paths).
- Language: keep `AGENTS.md` and the optional `CLAUDE.md` tail section in the same language. Pick the dominant language used today; if both files are empty, follow the project's other docs (root README, etc.); default to English when nothing is populated.
- Preserve the user's editorial voice. Suggest the smallest viable change rather than a rewrite — except for Structural-drift findings, which by definition reorganize content.
- Focus on facts an agent needs to do useful work: how to run / build / test, where things live, what conventions apply. Do NOT pad meta files with general project marketing, onboarding prose, or aspirational roadmaps.
- Personal preferences / feedback-style content belongs in agent memory, not in `AGENTS.md`. Do NOT recommend adding such content to a meta file.
- Size: when `AGENTS.md` is approaching or exceeding 200 lines, recommend pruning facts that are derivable from code (exhaustive dependency version listings, full mirroring of `package.json` scripts, directory trees that mirror an obvious filesystem layout). Do NOT recommend splitting into `@`-imports as a size remedy — imported files load in full at launch and the total context cost is unchanged.

## Policies

- Do NOT edit, branch, commit, push, or open a PR.
- Do NOT run check / lint / build / test commands.
- Do NOT touch files outside the in-scope meta file list above.
- Do NOT recommend deletions of meta content unless the codebase makes the content factually wrong (be conservative). Deleting a leftover `.claude/rules/` directory under Structural drift is the explicit exception.
- If unsure whether a finding is warranted, prefer to skip rather than over-report.
