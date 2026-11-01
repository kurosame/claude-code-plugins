---
name: review-go
description: Go-focused code review of the entire codebase. Reports findings only — does not edit files.
---

Review a **Go** project.

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/review-rules.md` first.

## Skills to apply

- `golang-error-handling`: wrapping, `errors.Is` / `As`, the single handling rule, logging.
- `golang-concurrency`: goroutine leaks, channels vs mutexes, `errgroup`, shared state.
- `golang-context`: propagation, cancellation, timeouts, background work.
- `golang-safety`: nil panics, slice aliasing, numeric truncation, `defer` in loops.
- `golang-security`: injection, crypto, SSRF, secrets, HTTP hardening.

## Go focus

Pitfalls these skills do not spell out:

- `sql.Rows` not closed or `rows.Err()` unchecked; transactions not rolled back on error paths.
- HTTP handlers that keep running after writing an error response.
- Servers that drop in-flight requests on `SIGTERM` instead of calling `Shutdown`.
- Outbound HTTP calls with neither a client timeout nor a context deadline.
- Goroutines doing work after the response is sent, which serverless platforms may throttle or kill.
