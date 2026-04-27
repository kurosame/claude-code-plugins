---
description: Frontend-focused code review of the entire codebase. Reports findings only — does not edit files.
---

Follow these instructions strictly. This command targets **frontend projects in the Node ecosystem** (Vue/Nuxt, React/Next, Svelte/SvelteKit, etc., managed by `npm` / `yarn` / `pnpm`).

This is a **review-only** command. Do NOT edit, branch, commit, or open a PR — only produce findings.

## Scope

- Read-only review of the codebase to identify issues across multiple files.
- Produce a structured findings report at the end of the run.

## Workflow

1. Explore the codebase to identify files with potential issues.
2. Review files focusing on logic, potential bugs, security issues, and architectural improvements.
3. Output a findings report with one section per file. For each issue include:
   - File path (and line number if applicable)
   - Severity (high / medium / low)
   - Description of the problem
   - Suggested fix (described in prose; do NOT write the patch)
4. If no issues are found, say so explicitly and exit.

## Review Guidelines

- Do **NOT** edit any files. This command is read-only.
- Do **NOT** suggest formatting changes (indentation, spacing, line breaks, etc.).
- Do **NOT** suggest import statement changes (ordering, grouping, etc.).
- Code formatting and import ordering are managed by formatters/linters (Prettier, ESLint, Stylelint, Biome, etc.) and enforced via git hooks.
- Focus only on logic, potential bugs, security issues, and architectural improvements.

## UI/UX Review (optional)

- If the project ships UI code and the `ui-ux-pro-max` skill is available in the current session, use it to review UI/UX quality.
- Adapt the review to the project's frontend stack (Vue/Nuxt/Element Plus/UnoCSS, React/Next, Svelte/SvelteKit, etc.) inferred from the codebase.
