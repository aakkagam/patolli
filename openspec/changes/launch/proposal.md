# Proposal: launch

## Why

Patolli is playable at games.aakkagam.com/patolli/, but nothing links to it. The landing repo has no mention of the game in any of its five integration points, so the only way to reach it is to already know the URL. Its social card and icon are also still the placeholders generated during scaffolding, which is what every share, search result and installed shortcut currently shows.

This change makes the game findable and gives it the assets it ships with. It deliberately does not attempt the teaching work, which is a design problem rather than a distribution one.

## What Changes

- Replace the placeholder `public/og.png` and `public/icon.svg` by **rendering them from the real board**: the drawn cross with its rubber line, wedge marks, entry pinwheel and a few cochineal and indigo counters on the mat. Generation reuses `src/lib/geometry.ts`, so the assets cannot drift from the board they depict and no hand-drawn artifact has to be maintained alongside it.
- Add a repeatable generation script rather than committing assets of unknown provenance, so regenerating after a visual change is a command and not an act of memory.
- Check the rendered icon at favicon size, where the full 60-square board would turn to mud, and simplify the icon's composition until it survives 32px.
- Register Patolli in the `aakkagam.github.io` repo in the five places the workspace requires, following the three siblings' pattern verbatim: the game card in `index.html`, its `VideoGame` node in the inline JSON-LD `@graph`, a `<url>` entry in `sitemap.xml`, a bullet in `llms.txt`, and an entry in the `shortcuts` array of `manifest.webmanifest`.
- Verify the whole path a real visitor takes: the landing page links to the game, the game is reachable offline through the shared service worker, and the social card resolves at its absolute URL.

## Capabilities

### New Capabilities

- `brand-assets`: the social card and icon this game ships, how they are generated from the board rather than drawn by hand, and the sizes they must survive.
- `site-integration`: Patolli's presence in the Aakkagam Games landing site — the card, structured data, sitemap, agent-readable index and installable shortcut.

### Modified Capabilities

- `app-scaffold`: the "Hand-authored SEO document" requirement gains the constraint that the OG and icon assets it references by absolute URL must actually resolve and must not be placeholders.

## Impact

- Modified in this repo: `public/og.png`, `public/icon.svg`, plus a generation script under `scripts/`.
- Modified in the **`aakkagam.github.io` repo** (a separate git repository): `index.html`, `sitemap.xml`, `llms.txt`, `manifest.webmanifest`. That repo has no CI and deploys straight from its branch, so a mistake there is live immediately and cannot be caught by a build.
- No change to the game itself: `src/lib/game/`, the store and the components are untouched, and the existing 83 tests should pass unchanged.
- The service worker in the landing repo needs no change. Its caching strategies already cover a new game's assets, and `VERSION` only exists to discard caches when their layout changes.
- Teaching, the blocking-squeeze legibility work and the three surprising rules remain out of scope and are the next change.
