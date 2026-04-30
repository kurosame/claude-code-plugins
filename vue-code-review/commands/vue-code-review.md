---
description: Vue/Nuxt-focused code review of the entire codebase. Reports findings only — does not edit files.
---

Follow these instructions strictly. This command targets **Vue projects** (Vue 3 with `<script setup>` / Composition API). If the project is a **Nuxt** project, also apply the Nuxt-specific guidelines in this document.

This is a **review-only** command. Do NOT edit, branch, commit, or open a PR — only produce findings.

## Scope

- Read-only review of the codebase to identify Vue/Nuxt-specific issues across multiple files.
- Produce a structured findings report at the end of the run.

## Stack Detection

Before reviewing, infer the stack so you can apply the correct rule set:

- **Vue version**: check `package.json` dependencies (`vue`).
- **Nuxt**: present if `nuxt.config.ts` / `nuxt.config.js` exists or any `nuxt` / `@nuxt/*` dependency is declared. If absent, skip the Nuxt section entirely.
- **State management**: detect Pinia (`pinia`) / Vuex if present.
- **Router**: `vue-router` for Vue projects; Nuxt uses file-based routing under `pages/`.

State the detected stack at the top of the findings report.

## Workflow

1. Detect the stack (Vue-only vs Vue + Nuxt) as described above.
2. Explore `.vue`, `.ts`, `.js` files (and `server/`, `pages/`, `layouts/`, `middleware/`, `plugins/`, `composables/`, `stores/` for Nuxt) to identify files with potential issues.
3. Review files focusing on Vue/Nuxt-specific logic, reactivity correctness, lifecycle handling, SSR/CSR boundaries, and architectural improvements.
4. Output a findings report with one section per file. For each issue include:
   - File path (and line number if applicable)
   - Severity (high / medium / low)
   - Description of the problem
   - Suggested fix (described in prose; do NOT write the patch)
5. If no issues are found, say so explicitly and exit.

## Vue Review Guidelines

Focus on:

- **Reactivity**
  - Loss of reactivity via destructuring of `reactive` objects or props (use `toRefs` / `toRef`).
  - Misuse of `ref` vs `reactive` (e.g. wrapping primitives in `reactive`, deep `reactive` on large objects causing perf issues).
  - Mutating props directly instead of emitting events or using `v-model` / `defineModel`.
  - Side effects inside `computed` (computed should be pure).
- **Composition API & `<script setup>`**
  - Logic that should be extracted into composables (`useXxx`).
  - Lifecycle hooks called conditionally or after `await` boundaries (must be registered synchronously at setup).
  - `defineProps` / `defineEmits` typing — prefer typed declarations; flag missing validation on runtime-only declarations.
  - `defineExpose` leaking internal state without intent.
- **Templates**
  - `v-for` combined with `v-if` on the same element.
  - Missing or non-unique `:key` on `v-for`.
  - Expensive expressions or function calls in templates that could be `computed`.
  - Mutating reactive state from within template expressions.
- **Watchers**
  - `watch` vs `watchEffect` chosen incorrectly; missing/over-broad sources.
  - Missing cleanup for async work in watchers (use `onWatcherCleanup` / `onCleanup`).
  - Watchers that could be replaced by `computed`.
- **Components**
  - Two-way binding patterns: incorrect `v-model` usage, missing `update:xxx` events, multiple `v-model` collisions.
  - Provide / inject without typed `InjectionKey` or without default handling.
  - Async components without `Suspense` or error boundaries when needed.
- **Lifecycle & resources**
  - Event listeners, timers, observers, or subscriptions not cleaned up in `onBeforeUnmount` / `onScopeDispose`.
- **State management (Pinia)**
  - State mutated outside actions (when discipline is expected); getters with side effects; actions doing UI work.
  - Stores instantiated at module scope causing cross-request leaks (especially with SSR).
- **TypeScript**
  - `any` on props/emits/composable return types where inference is feasible.
  - Generic component patterns (`<script setup generic>`) used incorrectly.

## Nuxt Review Guidelines (apply only if Nuxt is detected)

Focus on:

- **Data fetching**
  - `useFetch` / `useAsyncData`: missing or non-unique `key`, causing duplicate / mis-cached requests.
  - `lazy`, `server`, `immediate`, `transform`, `pick` options chosen inconsistently with intent.
  - Calling `$fetch` directly inside components for data that should hydrate via `useAsyncData` (causing client/server double-fetching or hydration mismatch).
  - Error handling: ignoring `error` ref / not using `createError` on the server.
- **SSR / CSR boundaries**
  - Browser-only APIs (`window`, `document`, `localStorage`) accessed outside `onMounted` / `import.meta.client` / `<ClientOnly>`.
  - Server-only code (`server/`, `nitro` utilities) imported into client bundles.
  - Hydration mismatches caused by non-deterministic rendering (`Date.now()`, `Math.random()`, locale-dependent formatting) without guarding.
- **State**
  - Module-level `ref` / `reactive` shared across requests — should be `useState` for SSR-safe shared state.
  - `useState` keys colliding or not stable.
- **Routing & pages**
  - `definePageMeta` misuse (e.g. dynamic values that aren't statically analyzable).
  - Middleware (`defineNuxtRouteMiddleware`): blocking work, missing `navigateTo` / `abortNavigation`, running on server when client-only is intended (or vice versa).
  - Layouts assigned conditionally without considering hydration.
- **Server routes (`server/api/`, `server/routes/`)**
  - Missing input validation, unhandled errors, leaking stack traces.
  - Using request-scoped state incorrectly across handlers.
- **Plugins & modules**
  - `defineNuxtPlugin` without `.client` / `.server` suffix when side effects are environment-specific.
  - Plugin order dependencies not made explicit.
- **Configuration**
  - Secrets in `runtimeConfig.public`; should live in `runtimeConfig` (server-only).
  - `useRuntimeConfig` accessed at module scope instead of inside setup / handlers.
- **SEO / meta**
  - `useHead` / `useSeoMeta` missing on routes that need indexable content; duplicated titles.
- **Auto-imports**
  - Manual imports of symbols that Nuxt auto-imports (redundant), or relying on auto-imports for symbols that aren't actually auto-imported in the current config.

## Review Guidelines (general)

- Do **NOT** edit any files. This command is read-only.
- Do **NOT** suggest formatting changes (indentation, spacing, line breaks, etc.).
- Do **NOT** suggest import statement changes (ordering, grouping, etc.).
- Code formatting and import ordering are managed by formatters/linters (Prettier, ESLint, Stylelint, Biome, etc.) and enforced via git hooks.
- Focus only on logic, potential bugs, security issues, and architectural improvements.

## UI/UX Review (optional)

- If the project ships UI code and the `ui-ux-pro-max` skill is available in the current session, use it to review UI/UX quality.
- Adapt the review to the project's Vue/Nuxt stack inferred from the codebase.
