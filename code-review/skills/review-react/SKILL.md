---
name: review-react
description: React/Next.js-focused code review of the entire codebase. Reports findings only — does not edit files.
---

Review the **React / Next.js-specific** parts of a React project. Apply the Next.js section only if `next.config.*` exists or `next` is a dependency. Framework-agnostic web concerns belong to `/review-frontend`, which runs alongside this one.

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/review-rules.md` first.

## Skills to apply

- `vercel-react-best-practices`: waterfalls, bundle size, server-side performance, re-renders, Server Action auth.

## React focus

Pitfalls `vercel-react-best-practices` does not spell out:

- Async effects whose stale results can overwrite newer state, or subscriptions that outlive the effect.
- Stale closures: callbacks, intervals, or handlers reading outdated state or props.
- State or props mutated in place instead of replaced.
- Array indexes or unstable values used as `key` in lists that reorder, insert, or delete.

## Next.js focus

- **Server / Client boundary**: server-only modules reachable from client components.
- **Server Actions / Route Handlers**: they are public endpoints; apply the Focus items of `${CLAUDE_PLUGIN_ROOT}/skills/review-node/SKILL.md` to them.
- **Caching**: mutations that leave cached data stale; per-user or dynamic data cached unintentionally.
- **Middleware**: sensitive operations whose only authorization check is in middleware.
- **Metadata**: indexable routes with no `metadata` / `generateMetadata` from the page or its layouts.
