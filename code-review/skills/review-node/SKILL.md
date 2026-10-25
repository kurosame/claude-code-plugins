---
name: review-node
description: Node.js server-side code review of the entire codebase. Reports findings only — does not edit files.
---

Review **server-side TypeScript / JavaScript in the Node ecosystem**: API servers, serverless functions, CLIs, and scripts. For server code inside Nuxt or Next.js, use the matching `/review-<stack>` skill.

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/review-rules.md` first.

## Focus

- **Trust boundaries**: unvalidated HTTP bodies, query params, and event / trigger payloads; missing authorization checks.
- **Injection**: SQL / NoSQL / command injection, path traversal, SSRF via user-supplied URLs.
- **Async errors**: floating promises, unhandled rejections, swallowed errors; internal errors or stack traces returned to clients.
- **Resources**: outbound calls without timeouts; unbounded concurrency or loading whole datasets into memory; connections or clients recreated per request.
- **Serverless**: work left un-awaited after the handler returns; non-idempotent handlers for retried events; mutable per-request state kept in module scope.
- **Config**: secrets hard-coded or logged; env vars used without validation at startup.
