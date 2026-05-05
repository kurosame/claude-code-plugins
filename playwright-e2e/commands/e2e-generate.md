---
description: Ask the Playwright generator agent to turn the plan files in tests/ into runnable spec files.
---

## Pre-flight check

Before doing anything else, run `test -f .claude/agents/playwright-test-generator.md` via Bash. If it fails (non-zero exit), STOP immediately and report:

> Playwright agents are not initialized.
> Run `npx playwright init-agents --loop=claude`, then **restart Claude Code** so the `playwright-test` MCP server is loaded, then rerun this command.

Do NOT proceed to the Task section. Without the init step (and a Claude Code restart afterwards in interactive use), `@agent-playwright-test-generator` cannot be resolved and the `mcp__playwright-test` tools are unavailable, which leads to silently degraded output.

## Task

Only run this section when the pre-flight check above passes.

@agent-playwright-test-generator

Generate Playwright test code from the plan files under the project's `testDir` (default `tests/`).

- Read every plan Markdown file produced by `/e2e-plan` under `testDir`.
- Produce `*.spec.ts` files for the planned scenarios.
- Do not add scenarios that the plans do not describe.
