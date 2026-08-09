# AGENTS.md

## Project

Chrome/Firefox extension that improves George Mason University's registration tables and adds RateMyProfessors data. The stack is WXT, SolidJS, TypeScript, Tailwind CSS v4, Zod, and Bun.

## Commands

- `bun install` — install dependencies; `postinstall` runs `wxt prepare` and generates `.wxt/`
- `bun run dev` / `bun run dev:firefox` — start the Chrome/Firefox development build with auto-reload
- `bun run build` / `bun run build:firefox` — create production builds in `.output/chrome-mv3/` or `.output/firefox-mv2/`
- `bun run compile` — type-check with `tsc --noEmit`; run `bun install` first so `.wxt/tsconfig.json` exists
- `bun run zip` / `bun run zip:firefox` — create distributable archives in `.output/`

There is no test runner, linter, or formatter configured. `cspell.json` contains project-specific spelling exceptions but no spell-check script is defined.

## Architecture

WXT generates the extension manifest and discovers entrypoints from `src/entrypoints/`.

### Entrypoints

- `src/entrypoints/background.ts` — background service worker. It synchronously registers a raw `browser.runtime.onMessage` listener, handles `rmp:searchProfessors`, normalizes the requested name, queries up to 10 GMU professors, and replies asynchronously. Failures return `null`.
- `src/entrypoints/content.ts` — content script for `*://ssbstureg.gmu.edu/StudentRegistrationSsb/*`. It imports every enhancer for registration side effects, selects the table container for the current path, waits for dynamically rendered containers/tables with `MutationObserver`, and starts one `EnhancedTable` per table.
- `src/entrypoints/popup/` — custom SolidJS promotional popup. `App.tsx` contains its copy and links, `style.css` contains most popup styling, and `index.html` also imports the shared full Tailwind stylesheet.

The content script maps registration views to these container IDs:

- default: `tabs-classSearch`
- paths containing `classSearch`: `searchResultsParent`
- paths containing `registrationHistory`: `lookupScheduleTable`
- paths containing `courseSearch`: `searchResults`

### Enhancer system

- `src/utils/enhanced-table.ts` owns the static enhancer registry keyed by the cell's `xe-field` value.
- Each `src/enhancers/*.tsx` module registers itself at module evaluation time with `EnhancedTable.registerEnhancer(key, fn)`.
- `EnhancedTable` styles headers, compacts cell padding, marks processed rows with `data-rmp-enhanced`, and reprocesses newly inserted rows after table mutations.
- UI enhancers call `createOverlay()` from `src/utils/overlay.ts` and mount a SolidJS component with `render()`. `createOverlay()` returns `null` if the cell already contains one.
- `src/utils/tooltip.tsx` implements the `use:tooltip` Solid directive and portals a single active fixed-position tooltip into `document.body`.
- `src/utils/carousel.tsx` rotates multiple meeting or attribute values vertically every three seconds by default.

Registered `xe-field` keys:

- `instructor` — searches RMP through the background worker, caches matches by displayed name, shows the rating and detail tooltip, and links to the professor or a prefilled RMP search
- `meetingTime` — parses days, time, location, date, and type; presents multiple meetings in a carousel and tooltip
- `status` — displays seat and waitlist counts plus time-conflict and linked-section indicators
- `attribute` — displays course attributes in a carousel and tooltip
- `note` — replaces section-note text with an icon and tooltip
- `scheduleType` — displays a deterministic color-coded schedule-type label
- `add` — removes the host tooltip and normalizes the cell height/padding
- `linked` — removes the host tooltip

To add an enhancer, create `src/enhancers/your-field.tsx`, register the exact `xe-field` key at module scope, and add a side-effect import in `src/entrypoints/content.ts`.

### RateMyProfessors client

`src/utils/rmp/` contains a reusable GraphQL client beyond the professor-search call currently used by the extension:

- `api.ts` — Relay ID helpers, GraphQL operations, pagination helpers, and `RmpError`
- `schemas.ts` — Zod schemas for GraphQL envelopes and nodes
- `normalize.ts` — converts API nodes to the public snake_case interfaces
- `types.ts` — normalized domain and option types
- `index.ts` — public exports

Every RMP response is structurally validated with Zod. The hard-coded Basic auth value (`dGVzdDp0ZXN0`) is a public RMP token, not a project secret. GMU's legacy school ID is `352`; use the exported `GMU_SCHOOL_LEGACY_ID` and Relay ID helpers rather than duplicating it.

### Styling and assets

- `src/assets/tailwind-content.css` imports only Tailwind theme and utilities, intentionally excluding preflight so the content script does not reset GMU's page styles. It also defines table hover behavior.
- `src/assets/tailwind.css` imports full Tailwind and is used by the popup.
- `public/icon/` contains the extension SVG and PNG icon variants. Root `public/icon.svg`, `public/wxt.svg`, and `src/assets/solid.svg` are legacy/template assets and are not referenced by current source.

## Conventions

- Use SolidJS semantics, not React semantics. Components execute once, signals are called as functions, and reactive props should not be destructured at component scope.
- JSX is configured with `"jsx": "preserve"` and `"jsxImportSource": "solid-js"`.
- Prefer the `@/` alias for imports from `src/`.
- Keep WXT entrypoint runtime code inside `main`/entrypoint callbacks and register background listeners synchronously.
- Use the cross-browser `browser` API supplied by WXT rather than `chrome`.
- Preserve the enhancer registration pattern and exact `xe-field` casing (for example, `meetingTime` and `scheduleType`).
- Keep RMP requests in the background entrypoint; content scripts should use extension messaging rather than calling RMP directly.
- Continue validating new RMP operations with Zod before normalizing or returning data.
- Avoid Tailwind preflight in the content script.

## Gotchas

- `.wxt/` and `.output/` are generated and gitignored; never edit them manually.
- The extension version comes from `wxt.config.ts` (`0.2.2` currently), while `package.json` currently says `0.2.1`. Keep both aligned when releasing.
- The popup's `REPOSITORY_URL` is currently the placeholder `https://github.com/cbas23/REPOSITORY`.
- `src/components/` is empty; current UI lives in enhancer modules, popup files, or `src/utils/`.
- `example.html` is a saved registration-page fixture for offline DOM inspection, not a build input. `rpm-spec.md` is RMP GraphQL reference material, not source code.
- `TODO.md` is intentionally gitignored even though an older copy remains tracked.
