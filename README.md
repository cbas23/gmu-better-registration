# GMU Better Registration

A Chrome and Firefox extension that makes George Mason University's course-registration tables easier to scan and adds RateMyProfessors data directly beside each instructor.

It runs on GMU's `StudentRegistrationSsb` pages, follows their dynamically rendered tables, and enhances course search, class search, registration history, and the default registration view.

## Features

- Shows each matched instructor's RateMyProfessors score inline, with a tooltip for difficulty, would-take-again percentage, rating count, and department.
- Links matched instructors to their RMP profile and unmatched instructors to a prefilled RMP search.
- Presents meeting days and times compactly, including asynchronous meetings, rotating multiple meeting records, and showing location/date details on hover.
- Turns seat availability, waitlists, time conflicts, and linked sections into compact status indicators.
- Condenses course attributes, section notes, and schedule types into readable labels and tooltips.
- Restyles table headers, tightens row spacing, and highlights hovered rows.
- Includes a custom extension popup and supports Chrome Manifest V3 and Firefox Manifest V2 builds through WXT.

## Tech stack

- [WXT](https://wxt.dev/) for extension entrypoints, manifests, development, and packaging
- [SolidJS](https://www.solidjs.com/) for popup and injected UI
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zod](https://zod.dev/) for RateMyProfessors response validation
- [Bun](https://bun.sh/) for dependency management and scripts

## Development

Prerequisites: install [Bun](https://bun.sh/) and a supported Chrome/Chromium browser or Firefox.

```sh
bun install
```

The install step also runs `wxt prepare`, which generates the `.wxt/` types and TypeScript configuration required by the project.

Start a development browser with automatic extension reload:

```sh
bun run dev
```

For Firefox:

```sh
bun run dev:firefox
```

WXT opens `https://patriotweb.gmu.edu/` by default. Sign in and navigate to registration; the content script itself matches `*://ssbstureg.gmu.edu/StudentRegistrationSsb/*`.

## Validation and builds

Type-check the project:

```sh
bun run compile
```

Create production builds:

```sh
bun run build
bun run build:firefox
```

The unpacked builds are written to:

- Chrome: `.output/chrome-mv3/`
- Firefox: `.output/firefox-mv2/`

Create distributable archives with:

```sh
bun run zip
bun run zip:firefox
```

There is currently no test runner, linter, formatter, or spell-check script configured.

## Manual installation

After creating a production build:

### Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose `.output/chrome-mv3/`.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**.
3. Choose `.output/firefox-mv2/manifest.json`.

Temporary Firefox add-ons must be loaded again after restarting Firefox.

## How it works

```text
GMU registration table
        │
        ▼
content.ts observes new tables and rows
        │
        ▼
EnhancedTable dispatches cells by xe-field
        │
        ├── meeting/status/attribute/note/schedule enhancers
        │       └── SolidJS overlays and tooltips
        │
        └── instructor enhancer
                │ runtime message
                ▼
          background.ts → RMP GraphQL API
                │
                ▼
          Zod validation → normalized professor data
```

The background service worker owns RateMyProfessors network requests because the extension needs host access to `https://www.ratemyprofessors.com/*`. Professor matches are cached in the content-script context by the displayed instructor name.

## Project structure

```text
public/icon/                 Extension icons
src/
  assets/                   Popup and content-script Tailwind entrypoints
  enhancers/                Self-registering table-cell enhancers
  entrypoints/
    background.ts           RateMyProfessors message handler
    content.ts              GMU table discovery and observation
    popup/                  Custom SolidJS extension popup
  utils/
    enhanced-table.ts       Enhancer registry and row processing
    overlay.ts              Cell-overlay creation
    tooltip.tsx             SolidJS tooltip directive
    carousel.tsx            Vertical value carousel
    names.ts                Instructor-name normalization and matching
    rmp/                    GraphQL client, Zod schemas, normalization, types
wxt.config.ts               WXT, manifest, browser, and Tailwind configuration
```

## Adding a table enhancer

Enhancers are registered by the GMU cell's `xe-field` attribute.

1. Create `src/enhancers/your-field.tsx`.
2. Register the enhancer at module scope with `EnhancedTable.registerEnhancer("fieldName", enhancerFn)`.
3. Add a side-effect import to `src/entrypoints/content.ts`.

The registered fields are currently `instructor`, `meetingTime`, `status`, `attribute`, `note`, `linked`, `add`, and `scheduleType`.

## Development notes

- Do not edit `.wxt/` or `.output/`; WXT regenerates both directories.
- Content-script CSS imports Tailwind theme and utilities without preflight so it does not reset GMU's styles.
- The RMP Basic auth value in the source is a public API token, not a project secret. API responses are validated with Zod before use.
- `example.html` is a saved page used for offline DOM inspection, and `rpm-spec.md` is API reference material. Neither is part of the build.
