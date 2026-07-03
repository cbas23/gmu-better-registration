# GMU Better Registration

A Chrome and Firefox extension that enhances George Mason University's course registration page with RateMyProfessors data.

The extension runs on GMU's `StudentRegistrationSsb` course search pages, detects registration result tables, and overlays useful information directly into table cells. Instructor cells are enriched with RateMyProfessors ratings, difficulty, would-take-again percentage, rating counts, tooltips, and links to professor profiles.

## Features

- Injects professor ratings into GMU registration search results.
- Links instructors to matching RateMyProfessors profiles.
- Shows hover tooltips with rating details.
- Enhances multiple registration table columns using a reusable enhancer system.
- Supports Chrome and Firefox through WXT.
- Uses a background service worker to proxy RateMyProfessors GraphQL requests.

## Tech Stack

- [WXT](https://wxt.dev/) for extension development and builds
- [SolidJS](https://www.solidjs.com/) for injected UI
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zod](https://zod.dev/) for validating RateMyProfessors API responses
- [Bun](https://bun.sh/) for package management and scripts

## Getting Started

Install dependencies:

```sh
bun install
```

Start the Chrome development server:

```sh
bun run dev
```

Start the Firefox development server:

```sh
bun run dev:firefox
```

WXT will open the configured start URL, `https://patriotweb.gmu.edu/`, when the dev server starts.

## Build

Build for Chrome:

```sh
bun run build
```

Build for Firefox:

```sh
bun run build:firefox
```

Build output is written to `.output/`.

Create distributable zip files:

```sh
bun run zip
bun run zip:firefox
```

## Type Checking

```sh
bun run compile
```

The project does not currently have a test runner, linter, or formatter configured.

## Loading The Extension Manually

After running a build, load the generated extension from `.output/`.

For Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the Chrome build directory under `.output/`.

For Firefox:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click Load Temporary Add-on.
3. Select the generated manifest file in the Firefox build directory under `.output/`.

## Project Structure

```text
src/
  entrypoints/
    background.ts       RateMyProfessors API message handler
    content.ts          GMU registration page content script
    popup/              Extension popup UI
  enhancers/            Table column enhancers
  utils/
    enhanced-table.ts   Enhancer registry and table observer logic
    overlay.ts          Cell overlay positioning
    tooltip.tsx         SolidJS tooltip directive
    names.ts            Professor name normalization and matching
    rmp/                RateMyProfessors API client, schemas, and types
```

## Enhancer System

Enhancers are registered by `xe-field` value. Each enhancer inspects matching table cells, creates an overlay, and mounts a SolidJS component into that overlay.

To add a new enhancer:

1. Create a file in `src/enhancers/`.
2. Register it with `EnhancedTable.registerEnhancer("fieldName", enhancerFn)`.
3. Import the file in `src/entrypoints/content.ts` for side effects.

Example fields currently enhanced include `instructor`, `meetingTime`, `status`, `attribute`, `note`, `linked`, `add`, and `scheduleType`.

## RateMyProfessors Integration

The content script sends instructor names to the background service worker with the `rmp:searchProfessors` message. The background script normalizes names, queries RateMyProfessors for GMU professors, validates API responses with Zod, and returns normalized professor data.

The RateMyProfessors auth token used by the project is a public token and is not treated as a secret.

## Notes

- Generated directories such as `.wxt/` and `.output/` are ignored and should not be edited manually.
- Root HTML files such as `registration.html`, `row.html`, and `example.html` are saved pages for offline DOM inspection, not build inputs.
- Content-script Tailwind styles avoid preflight to prevent breaking GMU page styles.
