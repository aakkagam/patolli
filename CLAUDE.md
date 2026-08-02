# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A free browser version of **Patolli**, the Mesoamerican cross-board race game — two players, local hotseat, six pieces each, moves thrown with five marked beans. Part of Aakkagam Games; deploys to `games.aakkagam.com/patolli/`.

**The repo is currently empty — no commits, no files but this one.** Read `../CLAUDE.md` (the workspace file) for how the four repos and the shared service worker fit together, and `../senet/CLAUDE.md` + `../align3/CLAUDE.md` for the architecture this repo copies rather than reinvents.

### Bootstrap order (decided with the user)

1. `/impeccable teach` — **done**, wrote `PRODUCT.md`. (`init` is not an impeccable command; `teach` is the one that produces `PRODUCT.md`, and `/impeccable document` seeds `DESIGN.md`.) Read `PRODUCT.md` before any UI or visual work.
2. `/opsx:propose` — this repo adopts **openspec**; the `openspec/` config and `.claude/commands/opsx/` + `.claude/skills/openspec-*/` scaffold are already copied from `../senet`. Changes go propose → apply → archive; align3 predates this and does not have it.
3. Scaffold from `../senet` — copy `vite.config.ts`, `tsconfig.json`, `svelte.config.js`, `.gitignore`, and `.github/workflows/deploy.yml`, changing the name and the base path. **Take the dependency versions from the table below rather than copying senet's `package.json` verbatim**, and add the lint setup senet does not have.

## Stack: current Svelte, and lint on top

This project is built on the **latest Svelte** — the 5.x line (5.56.8 at the time of writing; there is no Svelte 6, so "latest" does not mean a new major). The other three repos pin one major behind on the build tooling, so scaffolding from them and then bumping only Svelte produces a peer-dependency conflict.

| Package | Take | Note |
|---|---|---|
| `svelte` | `^5.56.0` | latest |
| `@sveltejs/vite-plugin-svelte` | `^7.2.0` | peers `vite ^8`, `svelte ^5.46.4` — **v6 peers `vite ^6.3 \|\| ^7` and will not accept Vite 8** |
| `vite` | `^8.1.0` | siblings are on `^7` |
| `vitest` | `^4.1.0` | siblings are on `^3` |
| `svelte-check` | `^4.7.0` | |
| `eslint` | `^10.8.0` | new here — no sibling has linting |
| `eslint-plugin-svelte` | `^3.22.0` | peers `eslint ^8.57.1 \|\| ^9 \|\| ^10` |
| `typescript-eslint` | `^8.65.0` | peers `typescript >=4.8.4 <6.1.0` |
| `prettier` / `prettier-plugin-svelte` / `eslint-config-prettier` | `^3.9.6` / `^4.1.1` / `^10.1.8` | |

Linting is **flat config** in `eslint.config.js`: `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-svelte`'s `flat/recommended`, then `flat/prettier` and `eslint-config-prettier` **last** so formatting rules lose to Prettier. Two things bite if missed: `svelte-eslint-parser` needs `parserOptions.parser` set to the TS parser to read `<script lang="ts">`, and the plugin needs `svelteConfig` passed through `languageOptions.parserOptions` or the Svelte-specific rules go quiet without erroring. Prettier runs with `prettier-plugin-svelte`, and `dist/` is ignored by both.

`npm run lint` gates CI alongside `check` and `test` — a lint failure must fail the deploy, not just print.

## Planned commands

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — `eslint .` plus `prettier --check .`
- `npm run format` — `prettier --write .`
- `npm run check` — `svelte-check` (types and Svelte diagnostics; **not** a substitute for lint, and lint is not a substitute for it)
- `npm run assets` — regenerate `public/og.png` and `public/icon.svg` from the board. They are **generated, not drawn**: the script imports `src/lib/geometry.ts` and reads the palette out of `src/styles/tokens.css`, so the assets cannot drift from the game. Output is deterministic, so rerunning on an unchanged tree produces no diff — run it after any geometry or palette change. The icon deliberately renders a simplified solid cross rather than the full board, because sixty squares at favicon size is a smudge and a hairline stroke disappears entirely.
- `npm test` — Vitest once; `npm run test:watch` — watch
- Single test file: `npx vitest run src/lib/game/rules.test.ts`; filter by name: `npx vitest run -t "pattern"`

## Deploy

`.github/workflows/deploy.yml` on push to main: `npm ci` → `npm run lint` → `npm run check` → `npm test` → `npm run build -- --base=/patolli/` → GitHub Pages. (senet's workflow has no lint step; add it.) **The base path is passed on the command line, not set in `vite.config.ts`** — building by hand without `--base=/patolli/` roots every asset at `/` and 404s once mounted. Enable Pages with source **GitHub Actions** after the first push.

`index.html` is hand-authored and carries its own title/canonical/hreflang/OG/Twitter tags, `VideoGame` JSON-LD, crawlable prose below `#app`, and — easy to forget, silently breaking offline play for search arrivals — the service-worker registration block copied verbatim from the bottom of `../senet/index.html`.

Once deployed, add Patolli to the `aakkagam.github.io` repo in five places: the game card in `index.html`, its `VideoGame` node in the inline JSON-LD `@graph`, a `<url>` in `sitemap.xml`, a bullet in `llms.txt`, and the `shortcuts` array in `manifest.webmanifest`. `og.png` and `icon.svg` live in this repo's `public/` and are referenced by absolute URL.

## Game rules (authoritative — implement exactly)

Source: **R. C. Bell's reconstruction** in *Board and Table Games* (1960), as printed in [this PDF](https://a4gamescompany.wordpress.com/wp-content/uploads/2018/04/patolli-19-2mb-pdf.pdf). Patolli has no surviving canonical ruleset — the Spanish accounts are fragmentary and Bell filled the gaps from other games.

**Most of the internet describes a different game.** Wikipedia, ancientgames.org, gambiter and friends give a **52**-square board where landing on an opponent **captures**. Bell's board has **60** squares and **no capture at all** — an occupied square simply cannot be entered, which is what makes blocking the whole of the strategy. Do not "correct" this implementation toward the popular version, and do not import capture, safe squares, or the Macuilxochitl bean-toss forfeit from it.

The pure logic layer (`src/lib/game/`) is the only unit-tested layer; every rule below needs coverage.

### Board and track

Geometry below is measured off the printable board on page 4 of the PDF; the rule text alone does not pin it down.

- A **saltire (X) of 60 squares**: two bands, each **2 squares wide × 16 long**, crossing at a shared **central 2×2**. That gives four arms of 2×7 = 14 squares each, plus 4 central squares: 4×14 + 4 = 60.
- **8 rounded squares** — the outermost rank of each arm, both files (2 × 4 arms). Landing on one grants **another turn**.
- **8 wedge markings** — one per file per arm, drawn straddling the boundary between the **3rd and 4th ranks** counting from the arm tip. Landing on a square reduced by a wedge costs a **double penalty**.
- **8 decorated squares at the centre** — the central 2×2, plus one **entry square per arm**, arranged as a pinwheel with 4-fold rotational symmetry: reading the arms clockwise from the top, the entry sits in the right file, the bottom file, the left file, the top file. This pinwheel is not decoration; it encodes the track.

**The track is a single 60-square cycle, and the board shape forces it.** Each arm is a 2×7 dead end, so the only way to cover it and get out is: enter at the innermost square of one file, run **outward** to the rounded tip, **U-turn** across to the other file, run back **inward**, then cross **one** central square into the next arm. That is 14 + 1 = 15 squares per quadrant, 60 in all, every square visited once, every central square used once. Each arm's decorated entry square and its undecorated inner neighbour are respectively where the loop arrives and leaves.

Model it as a **cyclic index 0..59** with a per-player direction of ±1. The X shape, the U-turns and the pinwheel are rendering concerns only — the same abstraction align3 uses for its two board topologies and senet uses for its boustrophedon. Two players seated opposite each other take opposite arms, so **their entry squares are exactly 30 apart on the cycle** — a good invariant to assert.

### Play

**Pieces.** 6 per player, all in hand at the start; the board begins empty.

**Beans.** Five two-sided beans, marked on one face. The score is one point per marked face showing, **except that five marked faces score 10**, and **no marked face scores nothing — the turn ends immediately**. The PDF states the resulting distribution and it is worth a test: 2 and 3 each come up 5 times in 16; 1 and 4 half as often; 10 and the no-score each once in 32. (That is just C(5,k)/32.)

**Opening.** Both players throw; highest starts, and throws again to begin.

**Entry.** The first piece enters from the player's **own central square** — the decorated entry square on the arm nearest them — and moves by the score, so it lands `score` squares along the track. Once a player has a piece on the board, further pieces enter **only on a throw of 1**; a 1 does not force an entry, the player may move a piece already in play instead.

**Direction.** Each player chooses clockwise or anticlockwise at their first entry and keeps it for the whole game. The two players may run the same way or opposite ways — it is a per-player choice, not a board property.

**Movement.** One piece per throw. A piece **may not land on an occupied square**, whether the occupant is the opponent's or the player's own; such a move is simply illegal and another piece must be moved. If a legal move exists the player **must** take it, even when every option hurts. If no piece can be moved at all, the player **pays a penalty into the pot**.

**No capture.** Every piece is safe wherever it stands. Blocking is the tactic the rules leave: a row of pieces on consecutive squares hampers an opponent, and the wedge squares help by making some squares expensive to sit on.

**Special squares.** Landing on a wedge-reduced square pays **double the agreed penalty to the opponent**. Landing on a rounded end square grants **another turn**.

**Bearing off.** After a complete circuit a piece bears off on reaching **the last square — the one before that player's own starting square** (index 59 measured from their entry, in their own direction) — and only by an **exact throw**. A move that would overshoot is illegal. Bearing a piece off collects a **penalty from the opponent**.

**Win.** First player to bear off all six pieces wins the game and the pot.

**Stakes (decided with the user: model them).** Each player stakes an agreed number of counters into the pot, and an agreed penalty amount is fixed at the same time; the pot and the penalties are real game state, not flavour. The PDF also offers a non-gambling variant (drop the pot, and make the wedge squares cost a missed turn or force the piece backwards next turn) — **that variant is not what we are building**, so do not quietly substitute it.

### Open rule questions — decide with the user, do not silently resolve

- **How many squares the wedges penalise.** Bell's text says "eight of those squares are reduced in size by wedge-shaped markings between them", but the board art draws 8 wedges each straddling a *boundary*, so 16 squares are flanked (ranks 3 and 4, both files, four arms). Text and art cannot both be right. Recommendation: keep the text's count of **8** — one penalty square per file per arm — and record which rank was chosen.
- **What happens when a player cannot pay a penalty** (rules 12, 13, 15). Bell does not say. Needs a decision before the pot is implemented.
- Rule 7 is read here as *entry square = index 0, the entering piece lands on index = score*. The alternative reading — the piece simply sits on the entry square — is possible but leaves a throw unused.

## Svelte best practices (required)

[svelte.dev/docs/svelte/best-practices](https://svelte.dev/docs/svelte/best-practices) is binding for this repo — prefer it over anything copied from a sibling that contradicts it. Verified against the official Svelte MCP server (`mcp.svelte.dev`), which is the tool to re-check it with rather than reciting this list from memory.

- **`$state` only for values that must be reactive** — i.e. that drive an `$effect`, a `$derived`, or a template expression. Everything else is a plain variable. `$state({…})` / `$state([…])` are deeply reactive through a proxy, which costs; a board snapshot that is only ever *reassigned* wholesale — exactly what the immutable-transition design produces — belongs in **`$state.raw`**.
- **`$derived`, not `$effect`, to compute from state.** It takes an *expression*, not a function; use `$derived.by` when the logic is too big for one. Deriveds are writable, and a derived object or array is **not** made deeply reactive.
- **Props change** — anything computed from a prop goes through `$derived` or it silently stops updating.
- **`$effect` is an escape hatch.** Never update state inside one. To sync with an external library use `{@attach}`; to react to user interaction put the code in the event handler or a function binding; to log use `$inspect` (and `$inspect.trace(label)` as the first line of an effect or `$derived.by` to find what actually triggered it); to observe something outside Svelte use **`createSubscriber`** from `svelte/reactivity`. Never wrap an effect's contents in `if (browser) {…}` — effects do not run on the server anyway.
- **Keyed `{#each}`**, keyed by piece identity — never the array index. Don't destructure an item you then mutate.
- **Snippets** for reusable markup. A top-level snippet can be referenced from `<script>`, and one that touches no component state can live in `<script module>` and be exported to other components.
- **CSS custom properties** to get JS values into styles (`style:--x={…}`) and to let a parent style a child (`<Piece --token-fill="…" />`). Reach for `:global` only when a custom property genuinely cannot.
- **Context over shared-module state** is the documented default, because module state leaks between users under SSR. **This repo keeps the singleton `store.svelte.ts` anyway** — it is a client-only SPA with no SSR and one game per tab, so the leak the rule guards against cannot occur. Recorded so nobody "fixes" it in either direction without a reason.
- **No legacy features**: `$state` not implicit reactivity; `$derived`/`$effect` not `$:`; `$props()` not `export let`/`$$props`/`$$restProps`; `onclick={…}` (shorthand `{onclick}` and spread both work) not `on:click`; `{#snippet}`/`{@render}` not `<slot>`/`$$slots`/`<svelte:fragment>`; `{@attach}` not `use:`; classes with `$state` fields not stores; `<DynamicComponent>` not `<svelte:component this={…}>`; `import Self from './ThisComponent.svelte'` not `<svelte:self>`. Window and document listeners go on `<svelte:window>` / `<svelte:document>`, never in an effect or `onMount`.
- **The one thing not to copy from the siblings:** all three use the `class:` directive (11 files between them), which the docs list as legacy. Use clsx-style `class={[…]}` / `class={{…}}` here. They are otherwise clean — no `export let`, `$:`, `<slot>`, `on:`, `use:` or stores anywhere.
- **Async Svelte** (`await` in components, `hydratable`) needs `experimental.async` in `svelte.config.js` and is not yet considered fully stable. Leave it off unless a change proposal argues for it; this game fetches nothing.

## Svelte tooling for agents (no hook required)

Install the official plugin once, globally — it carries the MCP server, the Svelte skills, a Svelte-editing subagent, and the `svelteserver` LSP:

```
/plugin marketplace add sveltejs/ai-tools
/plugin install svelte
```

Delegate `.svelte` and `.svelte.ts` edits to that subagent, and run `svelte-autofixer` over a component before showing it — cheaper than re-reading the docs, and it is the intended check on the rules above.

**No Claude Code hook enforces the best practices, by design.** The Svelte team's own plugin ships skills, agents and an LSP and deliberately no hooks; compliance here is a judgement call at authoring time, which is what the skill and autofixer are for. A hook is also the wrong shape for `svelte-check`, which must see the whole project (it cannot check only changed files — a renamed prop breaks its usage sites elsewhere), so that stays in `npm run check` and CI.

What **is** configured, in this repo's `.claude/settings.json`, is the mechanical half: a `PostToolUse` hook on `Write|Edit` that runs `node_modules/.bin/eslint --fix` then `node_modules/.bin/prettier --write` on the single file just edited, for `.svelte` / `.ts` / `.js` only. It is deliberately **project-scoped, not user scope** — the three sibling repos have no lint tooling and a global hook would fail in all of them. It resolves the binaries under `$CLAUDE_PROJECT_DIR` and skips silently when they are absent, so it is inert until the scaffold lands and needs no edit when it does. It never blocks: remaining lint errors are CI's job, not the hook's.

## Conventions that matter

Follow align3 and senet for structure; nothing architectural should be invented fresh.

- Three layers, strictly ordered: pure framework-free logic in `src/lib/game/` (immutable `GameState` transitions returning a new state or `null` for illegal moves) → a runes-based singleton store in `src/lib/store.svelte.ts` → components in `src/lib/components/`.
- Positions live in an abstract viewBox in `src/lib/geometry.ts`; components render in those units, never pixels.
- Motion is spring-based (`src/lib/motion.ts`) and degrades under `prefers-reduced-motion`.
- Teach through the board, not text: legal targets highlight, illegal drops bounce back, every drag has a tap-tap fallback.
- Accessibility floors: WCAG AA contrast, player identity by **shape + colour** never colour alone, touch targets ≥ 44px, and the bean throw always shown as a numeral rather than read off the bean faces.
