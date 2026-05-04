---
description: Review the entire codebase against AI meta configuration files (CLAUDE.md, .claude/rules/*.md, AGENTS.md) and report what should be added, updated, created, or restructured. Read-only — does not edit files.
---

Follow these instructions strictly.

This is a **review-only** command. Do NOT edit, branch, commit, push, or run check commands — only produce findings. The expected next step is `/apply-fix`, which will consume these findings and edit (or create) the files; after that, `/pr` will commit and open a pull request.

## Scope

- Read-only review of the entire codebase to determine whether the project's AI meta configuration files accurately describe the current state of the project.
- Project-local files only. Never inspect or reference `~/.claude/`, `~/.codex/`, or any path outside the repository.

In-scope meta files:

- `CLAUDE.md` (root and any nested `CLAUDE.md` under subdirectories)
- `.claude/rules/*.md` (recursively, including subdirectories under `.claude/rules/`)
- `AGENTS.md` (root and any nested `AGENTS.md`). Note: `AGENTS.md` is a shared file that other AI tools (Codex, Cursor, etc.) may also consume — only review parts that state repository-level facts. Do NOT touch sections that clearly belong to another specific tool (heuristic: the section heading or its leading sentence names another tool, e.g. "## Cursor", "### For Codex", "Notes for Cline").

When searching for nested `CLAUDE.md` / `AGENTS.md`, exclude common non-source directories: `node_modules/`, `vendor/`, `.git/`, build outputs (`dist/`, `build/`, `.next/`, `.nuxt/`, `target/`), and any path listed in `.gitignore`.

Out of scope (do NOT report on these in this command):

- `.claude/agents/*.md`, `.claude/commands/*.md`
- `.claude/settings.json` / `settings.local.json`
- User-global config (`~/.claude/...`)
- Other AI tools' meta files (`.cursorrules`, `.cursor/rules/*`, `.windsurfrules`, `.github/copilot-instructions.md`) — future extension, not now.
- Any code files. This command judges meta config only.

## Target structure

When in-scope meta files are missing or being newly populated, the project should converge on this canonical layout:

- **`.claude/rules/<topic>.md`** — the actual rule content, split by topic (one concern per file: stack, commands, layout, conventions, deployment, runtime-config, external-services, etc.). Descriptive filenames in lowercase-kebab-case. May use YAML frontmatter with a `paths:` field to scope a rule to specific glob patterns when the rule only applies to a subset of the codebase.
- **`CLAUDE.md`** (project root) — contains only `@.claude/rules/<topic>.md` import lines (one per rule file) plus, optionally, a small section of Claude-Code-specific instructions that genuinely do not apply to other AI tools. No inline rule content that duplicates `.claude/rules/`.
- **`AGENTS.md`** (project root) — full inline content mirroring the union of `.claude/rules/*.md`. The agents.md spec does not support imports, so AGENTS.md must carry its content inline. Consumed by Codex, Cursor, Cline, and other agents that follow agents.md.

`.claude/rules/*.md` and `AGENTS.md` are two views of the same facts. Their content MUST stay in sync: every project fact that appears in one should appear in the other. `CLAUDE.md` is primarily a delegation surface that imports the rules; a small trailing section of Claude-Code-specific instructions is allowed but optional.

This is the canonical structure — recommend it by default. Do not propose a single monolithic `CLAUDE.md` with inline rules; if a project currently has that shape, recommend migrating to the canonical layout (see "Structural drift" below).

**Constraints on rules files:**
- Rules files MUST NOT use `@<path>` imports themselves. Imports live only in `CLAUDE.md` (one hop deep). This keeps the `.claude/rules/*.md` ↔ `AGENTS.md` mirror flat and the diff simple.
- A rules file with `paths:` frontmatter (path-scoped) corresponds in `AGENTS.md` to a section whose heading carries an explicit scope marker, e.g. `## API conventions (applies to: src/api/**/*.ts)`. The scope marker is the way path-scoping survives the round-trip into AGENTS.md, since AGENTS.md has no frontmatter mechanism.

**Monorepos / nested workspaces.** When the project has nested workspaces (pnpm workspace, Cargo workspace, Go modules in subdirectories, etc.), apply the Target structure independently per workspace root that already has — or warrants — its own meta config. Each workspace root may have its own `CLAUDE.md` + `.claude/rules/` + `AGENTS.md` triple. Do not hoist child-workspace facts into the repo-root files; the repo root only carries facts that apply to the whole repo. If a project currently has a single root meta file but is a monorepo where child workspaces have meaningfully distinct conventions, flag it as Structural drift and recommend per-workspace splits.

## Workflow

1. Explore the codebase to build a model of its current reality. Inspect, at minimum:
   - **Package / build manifests**: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `Makefile`, `justfile`, `pnpm-workspace.yaml` — note declared scripts, dependencies, toolchain, and whether the repo is a monorepo / workspace.
   - **Top-level directory layout**: which directories exist and what role they serve (`src/`, `tests/`, `docs/`, `cmd/`, `internal/`, `.claude/`, etc.).
   - **Major framework / runtime indicators**: `next.config.*`, `nuxt.config.*`, `vite.config.*`, `tsconfig.json`, `astro.config.*`, `Dockerfile`, `pytest.ini`, `tox.ini`, `noxfile.py`, Cargo workspace `[workspace]` blocks, etc. Adapt the inspection to the actual language ecosystem of the repo — do not insist on Node-specific files when the project is Python / Go / Rust / etc.
   - **Test, lint, format, type-check setup**: test runner, linter / formatter config, CI workflow files under `.github/workflows/`.
   - **Existing `.claude/` contents** (if any) and the in-scope meta files themselves.
2. Read each in-scope meta file that exists, fully. For `CLAUDE.md` files that contain `@<path>` imports, also read the imported files in `.claude/rules/` so you have the full picture.
3. Compare the project reality against the meta files AND check internal consistency between `.claude/rules/*.md` and `AGENTS.md`. Classify each piece of drift into exactly one of the categories below. Apply the categories in this **precedence order** so a single issue is not double-reported: `Missing file` → `Structural drift` → `Stale` → `Missing content` → `Sync drift`. Stop at the first category that fits.
   - **Missing file**: NO in-scope meta file exists at all (no `CLAUDE.md`, no `.claude/rules/`, no `AGENTS.md`) AND the project warrants meta config (substantial conventions, an existing `.claude/` directory, or non-trivial build/test setup). When this fits, recommend creating the **Target structure** in full: per-topic `.claude/rules/<topic>.md` files, a matching inline `AGENTS.md`, and an import-only `CLAUDE.md`. Be conservative only about whether *any* meta config is warranted — once it is, propose the canonical layout, not a single monolithic file. If at least one in-scope meta file exists, this category does not apply; use Structural drift instead.
   - **Structural drift**: at least one in-scope meta file exists but the project deviates from the **Target structure** at the *file/surface* level. This category covers cases where an entire surface is wrong or missing relative to the others — including the case where one of `.claude/rules/` or `AGENTS.md` is wholly absent while the other has content. Concretely:
     - `CLAUDE.md` carries inline rule content beyond `@<path>` imports (and an optional small Claude-specific tail section). Recommend moving the inline content into appropriately split `.claude/rules/<topic>.md` files and replacing `CLAUDE.md`'s body with the corresponding `@` imports.
     - `.claude/rules/` is populated but `AGENTS.md` is missing or empty. Recommend creating/populating `AGENTS.md` to mirror the rules.
     - `AGENTS.md` carries content but `.claude/rules/` does not exist. Recommend extracting AGENTS.md into per-topic `.claude/rules/<topic>.md` files and adding an import-only `CLAUDE.md`. When AGENTS.md contains tool-specific sections that the Scope rules above tell you not to touch (`## Cursor`, `### For Codex`, etc.), exclude those from the extraction — they remain only in AGENTS.md.
     - The project is a monorepo with workspaces whose conventions diverge meaningfully from the repo root, but only a single root meta config exists. Recommend per-workspace splits (see Target structure → Monorepos).
   - **Stale**: a meta file states a *specific fact* that no longer matches reality (e.g. lists a script that was removed or renamed, references a directory that no longer exists, names a framework the project no longer uses). The fact category is present but the value is wrong.
   - **Missing content**: a meta file exists and is otherwise sound, but a *fact category* an agent would need is not represented at all (e.g. neither `scripts.md` nor `AGENTS.md` mentions how to run type checks, even though `package.json` has a `check:types` script). Use this when the omission is in *both* surfaces; if only one surface is missing the fact, use Sync drift.
   - **Sync drift**: a *specific fact* exists in `.claude/rules/*.md` but not in `AGENTS.md` (or vice versa), or the two state the same fact differently in a way that could mislead an agent. Use this only when both surfaces exist and differ at the fact level — total absence of one surface is Structural drift, total absence of a fact category from both is Missing content.
4. Output a findings report. For each item include:
   - **File path** (and line number / section heading if applicable). For "missing file" / "structural drift" findings, the path of the file to be created or restructured.
   - **Severity**: `high` (factually wrong content actively misleading agents, or the structure is so off that maintenance is broken) / `medium` (omits or under-specifies meaningful facts, or notable structural drift) / `low` (factually accurate but lacks a small piece of useful context — e.g. a minor script or convention).
   - **Type**: `update-existing` (edit a file that already exists) / `create-new` (create a file the findings explicitly call for).
   - **Description**: what the drift is, citing concrete evidence from the codebase (e.g. "`package.json` declares a `check:types` script, but neither `.claude/rules/scripts.md` nor `AGENTS.md` mention how to run type checks").
   - **Suggested fix**: described in prose, NOT as a patch. State *what* to add/remove/change/move, not *how* to write it line by line. (`/apply-fix` will produce the actual edit, or create the file from your description.) For structural-drift fixes, decompose into the concrete create / update operations needed (e.g. "create `.claude/rules/stack.md` with the stack section currently in `CLAUDE.md` lines 5-25" + "replace `CLAUDE.md` body with `@.claude/rules/<topic>.md` import lines").
   - **Sync pair**: every fact change must be emitted as **two findings, one per surface** (`.claude/rules/<topic>.md` AND `AGENTS.md`), not as one finding that mutates both. The two findings each have their own File path / Type / Suggested fix, and each carries a `Sync pair: <other-finding-id-or-path>` cross-reference so a human reviewer can see they belong together. This keeps `/apply-fix`'s contract simple: it applies one finding at a time using the standard `update-existing` / `create-new` types, and the pair-completeness check is the responsibility of `/update-ai-config` (this command) at emission time. Findings that touch only `CLAUDE.md` (e.g. updating its `@`-import list during a structural fix) do not need a sync pair, because `CLAUDE.md` is not part of the rules ↔ AGENTS mirror.
5. **Empty-result handling.** If no in-scope meta files exist AND the project structure does not warrant creating any (no `.claude/` directory, no substantial conventions to document), report "no in-scope meta files; nothing to review" and exit. If meta files exist or should plausibly exist but no drift was found, say so explicitly and exit.

## Review Guidelines

- Do NOT edit any files. This command is read-only.
- Do NOT suggest formatting-only changes (whitespace, line breaks, heading style) — those are not drift.
- Do NOT invent commands, scripts, paths, or behaviors absent from the codebase. Every finding must cite specific evidence from real project files (with paths).
- Language priority: keep `.claude/rules/*.md` and `AGENTS.md` in the **same** language so they stay easy to diff — this overrides per-file language matching. Pick the dominant language used across both surfaces today; if one is empty, follow the language of the populated one; if both are empty, follow the project's other docs (root README, etc.); default to English when nothing is populated.
- Preserve the user's editorial voice. Suggest the smallest viable change rather than a rewrite — except for `structural drift` findings, which by definition reorganize content.
- Focus on facts an agent needs to do useful work: how to run / build / test, where things live, what conventions apply. Do NOT pad meta files with general project marketing, onboarding prose, or aspirational roadmaps.
- Personal preferences / feedback-style content belongs in agent memory, not in `.claude/rules/` or `AGENTS.md`. Do NOT recommend adding such content to a meta file.
- When recommending new `.claude/rules/<topic>.md` filenames, choose lowercase-kebab-case names that describe the topic (`stack.md`, `scripts.md`, `layout.md`, `conventions.md`, `deployment.md`, `runtime-config.md`, `external-services.md`, etc.). One topic per file. Do NOT pre-create empty files for topics with no content.
- When recommending the import-only `CLAUDE.md` body, list the `@.claude/rules/<topic>.md` imports in a stable order (e.g. the order in which the topics naturally read: stack → commands → layout → conventions → deployment → runtime → external services). Optionally allow a short trailing section of Claude-Code-specific instructions below the imports if the project genuinely has any; otherwise CLAUDE.md is imports only.

## Policies

- Do NOT edit, branch, commit, push, or open a PR.
- Do NOT run check / lint / build / test commands.
- Do NOT touch files outside the in-scope meta file list above.
- Do NOT recommend deletions of meta content unless the codebase makes the content factually wrong (be conservative).
- If unsure whether a finding is warranted, prefer to skip rather than over-report.
