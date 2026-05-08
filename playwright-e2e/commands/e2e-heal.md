---
description: Ask the Playwright healer agent to analyze the latest run and fix the failing tests.
---

## Pre-flight check

Before doing anything else, run `test -f .claude/agents/playwright-test-healer.md` via Bash. If it fails (non-zero exit), STOP immediately and report:

> Playwright agents are not initialized.
> Run `npx playwright init-agents --loop=claude`, then **restart Claude Code** so the `playwright-test` MCP server is loaded, then rerun this command.

Do NOT proceed to the Task section. Without the init step (and a Claude Code restart afterwards in interactive use), `@agent-playwright-test-healer` cannot be resolved and the `mcp__playwright-test` tools are unavailable, which leads to silently degraded output.

## Task

Only run this section when the pre-flight check above passes.

@agent-playwright-test-healer

Analyze the most recent Playwright run and fix the failing tests.

- Locate the latest run output: prefer `test-results/` and Playwright's last-run report; fall back to the failure output already in the conversation context.
- Determine the root cause of each failure from that output.
- Fix selectors, assertions, or waits in the spec files when the test itself is wrong.
- If a failure looks like a real product regression rather than a flaky / mis-written test, surface it explicitly instead of masking it.

## Constraints

Limit `mcp__playwright-test__test_debug` to 3 calls per invocation. Stop healing when reached and report any unfixed tests.
