---
description: Auto-detect testable surfaces from the repo and ask the Playwright planner agent to write E2E scenarios under tests/.
---

## Pre-flight check

Before doing anything else, run `test -f .claude/agents/playwright-test-planner.md` via Bash. If it fails (non-zero exit), STOP immediately and report:

> Playwright agents are not initialized.
> Run `npx playwright init-agents --loop=claude`, then **restart Claude Code** so the `playwright-test` MCP server is loaded, then rerun this command.

Do NOT proceed to the Task section. Without the init step (and a Claude Code restart afterwards in interactive use), `@agent-playwright-test-planner` cannot be resolved and the `mcp__playwright-test` tools are unavailable, which leads to silently degraded output.

## Task

Only run this section when the pre-flight check above passes.

@agent-playwright-test-planner

Decide what to E2E-test for this repository, then write scenarios.

## Choosing what to test

Inspect the repository before planning. Pick targets in this order:

1. Read `playwright.config.*` first to learn `baseURL`, `testDir`, and `webServer.command` — these tell you where the app is served and where specs live.
2. Enumerate user-facing routes / pages from framework config and the file-based router. Sources to inspect, by stack:
   - Nuxt: `nuxt.config.*`, `app.vue`, `pages/`, `app/`, `layouts/`.
   - Next.js: `next.config.*`, `app/`, `pages/`.
   - SvelteKit: `svelte.config.*`, `src/routes/`.
   - Astro / Remix / Vite-SPA / others: their respective config + routing directories.
   - If no framework is detected, treat top-level HTML entry points (`index.html` and any sibling pages) as routes.
3. Read the README, product docs, and key page components to understand which flows matter to users.
4. Prioritize flows that exercise real product value:
   - Interactive forms (submission happy path + validation + error states).
   - Navigation between top-level pages.
   - Search, filtering, auth, checkout, or any flow named in the README as core.
   - Static pages with no interactive elements get at most a single render check.
5. If the project clearly ships one dominant interactive surface (e.g. a single contact form), focus there rather than spreading thin.

Do not invent flows that have no corresponding code in the repo.

## Output

- Save plan files under the project's `testDir` (default `tests/`), one Markdown file per scenario group.
- On re-runs, replace stale plans rather than appending — overwrite any plan file you previously produced for the same scenario group so plans and specs stay in sync across CI runs.
- Match the language of the project's existing user-facing copy / docs. If the UI copy is in Japanese, write the plans in Japanese; otherwise match the project's dominant language.
