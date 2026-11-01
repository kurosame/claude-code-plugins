---
name: review-python
description: Python-focused code review of the entire codebase. Reports findings only — does not edit files.
---

Review a **Python** project.

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/review-rules.md` first.

## Focus

- **Language pitfalls**: mutable default arguments; closures in loops capturing the loop variable late.
- **Errors**: bare or broad `except` that swallows errors; re-raising without `from`, losing the cause.
- **Types**: values that contradict their type hints; `Optional` results used without a `None` check.
- **Resources**: files, clients, or connections not closed via `with`; outbound calls without timeouts.
- **Async**: blocking calls inside `async def`; coroutines never awaited; tasks created without keeping a reference.
- **Security**: SQL built by string formatting; `subprocess` with `shell=True` on user input; `pickle` / `yaml.load` on untrusted data; path traversal; secrets hard-coded or logged.
- **LLM calls**: untrusted text placed in prompts; model output stored or acted on without validation.
- **Batch jobs**: re-runs that duplicate or corrupt data; whole datasets loaded into memory; external API calls without retry or rate limiting.
