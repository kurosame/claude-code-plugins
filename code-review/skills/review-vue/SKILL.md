---
name: review-vue
description: Vue/Nuxt-focused code review of the entire codebase. Reports findings only — does not edit files.
---

Review the **Vue / Nuxt-specific** parts of a Vue 3 project. Apply the Nuxt section only if `nuxt.config.*` exists or `nuxt` is a dependency. Framework-agnostic web concerns belong to `/review-frontend`, which runs alongside this one.

Read and follow `${CLAUDE_PLUGIN_ROOT}/references/review-rules.md` first.

## Skills to apply

- `vue-best-practices`: reactivity, SFC structure, component data flow, composables, Pinia.

## Vue focus

Pitfalls `vue-best-practices` does not spell out:

- Lifecycle hooks or `watch` registered after an `await` in setup (they never bind to the component).
- Async watchers without `onWatcherCleanup` / `onCleanup`, letting stale results overwrite newer ones.
- Listeners, timers, or observers not disposed in `onBeforeUnmount` / `onScopeDispose`.

## Nuxt focus

- **Data fetching**: `useFetch` / `useAsyncData` with colliding keys; options (`lazy`, `server`, `immediate`, `pick`) that contradict intent; bare `$fetch` in setup that double-fetches on hydration; ignored `error`.
- **SSR / CSR boundaries**: browser APIs outside `onMounted` / `import.meta.client` / `<ClientOnly>`; server-only code reaching the client bundle; non-deterministic rendering (`Date.now()`, `Math.random()`, locale formatting) causing hydration mismatches.
- **Cross-request state**: module-level `ref` / `reactive` or stores shared across requests instead of `useState`; unstable `useState` keys.
- **Routing**: non-static `definePageMeta` values; route middleware that blocks, or runs on the wrong side.
- **Server routes**: missing input validation, unhandled errors, leaked stack traces.
- **Plugins**: environment-specific side effects without a `.client` / `.server` suffix; implicit ordering dependencies.
- **Config**: secrets in `runtimeConfig.public`; `useRuntimeConfig` called at module scope.
- **SEO**: indexable routes without `useHead` / `useSeoMeta`, or duplicated titles.
- **Auto-imports**: manual imports of auto-imported symbols, or reliance on symbols the current config doesn't auto-import.
