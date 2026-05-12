# AGENTS.md

## Project

Chrome/Firefox extension that injects RateMyProfessors data into GMU's course registration page. WXT + SolidJS + TypeScript + Tailwind CSS v4.

## Commands

- `bun install` — installs deps; postinstall runs `wxt prepare` (generates `.wxt/` which `tsconfig.json` extends)
- `bun run dev` / `bun run dev:firefox` — dev server with auto-reload
- `bun run build` / `bun run build:firefox` — production build → `.output/`
- `bun run compile` — type-check only (`tsc --noEmit`). Requires `bun install` first
- `bun run zip` / `bun run zip:firefox` — package extension

No tests, no linter, no formatter configured. There is a `cspell.json` for spell-checking.

## Architecture

WXT manages manifest and entrypoints. Adding a file to `src/entrypoints/` auto-registers it in the manifest.

**Entrypoints** (`src/entrypoints/`):
- `background.ts` — service worker; listens for `rmp:searchProfessors` messages, proxies to RMP GraphQL API
- `content.ts` — content script on `*://ssbstureg.gmu.edu/StudentRegistrationSsb/*`; finds `#tabs-classSearch`, observes tables for mutations, creates `EnhancedTable` instances
- `popup/` — SolidJS popup (currently WXT boilerplate, not yet customized)

**Enhancer system** (the core pattern):
- `src/utils/enhanced-table.ts` — `EnhancedTable` class; maintains a static registry of column enhancers keyed by `xe-field` attribute value
- `src/enhancers/*.tsx` — each file self-registers at import time via `EnhancedTable.registerEnhancer("fieldName", fn)`. Content script imports them as side effects
- Enhancers match table cells by the `xe-field` attribute (e.g., `"instructor"`, `"status"`, `"meetingTime"`)
- Each enhancer creates an overlay div over the cell (`createOverlay` from `src/utils/overlay.ts`), then mounts a SolidJS component into it via `render()`
- To add a new column enhancer: create `src/enhancers/your-field.tsx`, call `EnhancedTable.registerEnhancer("xe-field-value", fn)` at module level, import it in `content.ts`

**RMP API client** (`src/utils/rmp/`):
- `api.ts` — GraphQL queries, `rmpQuery` helper with Zod validation
- `schemas.ts` — Zod response schemas
- `normalize.ts` — transforms API nodes into normalized interfaces
- `types.ts` — TypeScript interfaces
- `index.ts` — re-exports everything
- Auth token (`dGVzdDp0ZXN0`) is a public hardcoded token, not a secret
- GMU school legacy ID: `352` (exported as `GMU_SCHOOL_LEGACY_ID`)

**Utilities** (`src/utils/`):
- `names.ts` — professor name normalization and fuzzy matching (search words ⊆ RMP name words)
- `overlay.ts` — creates positioned overlay divs over table cells
- `tooltip.tsx` — custom SolidJS `use:tooltip` directive; renders tooltips in `document.body` with fixed positioning
- `carousel.tsx` — vertical carousel helper (unused)

**Tailwind in content script**: `src/assets/tailwind-content.css` imports only theme + utilities (no preflight) to avoid breaking the host page's styles.

## Conventions

- SolidJS JSX, not React — `tsconfig.json` uses `"jsx": "preserve"` + `"jsxImportSource": "solid-js"`
- Path alias `@/` → `src/`
- All RMP API responses validated with Zod before use
- `wxt.config.ts` sets `host_permissions` for `https://www.ratemyprofessors.com/*`
- WXT `webExt.startUrls` is `https://patriotweb.gmu.edu/` (opens on dev start)

## Gotchas

- `.wxt/` and `.output/` are gitignored and auto-generated — never edit manually
- `.wxt/` must exist before `tsc` works — always `bun install` first
- `src/components/` exists but is empty; all UI components live inside enhancer files or `src/utils/`
- The popup (`src/entrypoints/popup/`) is still default WXT template boilerplate
- Root files `registration.html`, `row.html`, `example.html` are saved HTML for offline DOM inspection — not part of the build
- `rpm-spec.md` is RMP GraphQL API reference docs — not source code
