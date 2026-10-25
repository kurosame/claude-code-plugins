---
name: review-frontend
description: Framework-agnostic frontend code review of the entire codebase. Reports findings only — does not edit files.
---

Review the **framework-agnostic web layer** of a frontend project, including general application logic and architecture. Leave framework-specific patterns to the matching `/review-<stack>` skill, which runs alongside this one.

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/review-rules.md` first.

## Skills to apply

- `ui-ux-pro-max`: UI/UX quality of the shipped UI.
- `modern-web-guidance`: legacy patterns (JS workarounds, polyfills, dependencies) that a Baseline web platform feature replaces.

## Focus

- **Accessibility**: non-semantic interactive elements, missing labels / alt text, broken keyboard navigation or focus management.
- **Browser security**: unsanitized HTML or URLs reaching the DOM; secrets in client-exposed env vars or the bundle; untrusted third-party scripts.
- **Performance**: heavy dependencies or missing code splitting; images without dimensions, lazy loading, or modern formats; render-blocking resources; layout shift.
- **Async UI**: missing loading / error states; races between overlapping requests.
