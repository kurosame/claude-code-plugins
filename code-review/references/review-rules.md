# Review Rules

## Project Rules (highest priority)

- Before reviewing, read the repository's `CLAUDE.md` / `AGENTS.md` and any
  files they import via `@<path>` (e.g. `docs/ai-rules.md`). They OVERRIDE the
  stack guidelines and your own knowledge of best practices.
- Never report a finding that contradicts a project rule, even if the
  convention looks outdated or incorrect to you.

## Constraints

- Read-only: do NOT edit files, branch, commit, or open a PR.
- Do NOT report formatting or import ordering; formatters and linters own them.
- Focus on logic, potential bugs, security issues, and architectural improvements.

## Workflow

1. State the detected stack (language, framework, notable libraries) at the top of the report.
2. Explore the codebase and review the files most likely to contain issues.
3. Report findings grouped by file. For each issue give:
   - File path (and line number if applicable)
   - Severity (high / medium / low)
   - The problem
   - Suggested fix, in prose (do NOT write the patch)
4. If there are no issues, say so explicitly.
