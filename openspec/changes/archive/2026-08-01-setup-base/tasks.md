## 1. Project scaffold

- [x] 1.1 Create `package.json` with the dependency set from design (Svelte `^5.56`, Vite `^8.1`, `@sveltejs/vite-plugin-svelte` `^7.2`, Vitest `^4.1`, `svelte-check` `^4.7`, TypeScript) and the scripts `dev`, `build`, `preview`, `lint`, `format`, `check`, `test`, `test:watch`
- [x] 1.2 Add `vite.config.ts` with the Svelte plugin and Vitest config including `src/**/*.test.ts`, copying senet's shape; do NOT set `base` here, it is passed on the command line
- [x] 1.3 Add `tsconfig.json` (strict, `verbatimModuleSyntax`, `isolatedModules`, `noEmit`) and `svelte.config.js`, copied from senet
- [x] 1.4 Add `.gitignore` covering `node_modules/` and `dist/`
- [x] 1.5 Run `npm install` and confirm it completes with no peer-dependency conflicts

## 2. Lint and format

- [x] 2.1 Add `eslint.config.js` as flat config composing `@eslint/js` recommended, `typescript-eslint` recommended, and `eslint-plugin-svelte` recommended, with the Prettier compatibility configs last
- [x] 2.2 Set `parserOptions.parser` to the TypeScript parser for `.svelte` files and pass `svelteConfig` through `languageOptions.parserOptions`, or `<script lang="ts">` will not parse and Svelte rules will silently do nothing
- [x] 2.3 Add `.prettierrc` with `prettier-plugin-svelte`, and `.prettierignore` plus an ESLint ignore for `dist/`
- [x] 2.4 Verify `npm run lint` and `npm run format` both work, and confirm the `.claude/settings.json` formatting hook now fires on edit instead of no-opping

## 3. Board and track

- [x] 3.1 Implement the board module in `src/lib/game/board.ts`: the 60-square cyclic track, the four arms of 2 files × 7 ranks, and the central 2×2
- [x] 3.2 Define the special-square sets in one place: 8 rounded squares at the arm tips, 8 wedge squares at rank 3 of each file of each arm, and the four entry squares
- [x] 3.3 Write `board.test.ts` asserting the structural invariants: 60 distinct squares, 14 arm squares plus 1 central square per quadrant, each central square used exactly once, opposed entry squares exactly 30 apart
- [x] 3.4 Assert the special-square counts: exactly 8 rounded and exactly 8 wedge squares

## 4. Beans

- [x] 4.1 Implement bean scoring in `src/lib/game/beans.ts` as a pure function of five bean faces: one point per marked face, 10 for all five, 0 for none
- [x] 4.2 Write `beans.test.ts` covering each score, and assert the full distribution over all 32 combinations (2 and 3 ten times each, 1 and 4 five times each, 10 and no-score once each)

## 5. Game state and types

- [x] 5.1 Define `GameState` and supporting types in `src/lib/game/types.ts` as plain serializable data: piece positions, pieces in hand, borne-off counts, turn, per-player direction, pending throw, counters, pot, stake, penalty, win state
- [x] 5.2 Implement game setup: six pieces per player in hand, empty board, stakes taken from both players into the pot
- [x] 5.3 Implement the opening-throw rule, including repeating on a tie

## 6. Rules engine

- [x] 6.1 Implement entry in `src/lib/game/rules.ts`: first piece enters at track index equal to the throw; subsequent pieces enter only on a throw of 1, and never compulsorily
- [x] 6.2 Implement per-player direction, chosen at first entry and fixed thereafter, allowing the two players to travel the same way or opposite ways
- [x] 6.3 Implement movement: one piece per throw, advancing by the score in the owner's direction, returning `null` when the destination is occupied by any piece
- [x] 6.4 Implement legal-move enumeration, plus the forced-move rule and the no-legal-move penalty into the pot
- [x] 6.5 Implement wedge squares (double penalty to the opponent on landing) and rounded squares (another turn on landing), with no effect for merely passing over either
- [x] 6.6 Implement bearing off by exact throw onto index 59, rejecting overshoot as illegal, and collecting the penalty from the opponent
- [x] 6.7 Implement the pot and penalty payments, capped at the payer's holdings so balances never go below zero and shortfalls are forgiven
- [x] 6.8 Implement win detection: first player to bear off all six pieces takes the pot, after which no throw or move is accepted

## 7. Rules tests

- [x] 7.1 Add `src/lib/game/test-helpers.ts` for building states and injecting bean faces
- [x] 7.2 Cover entry: first entry lands at the throw, later entries require a 1, and a 1 does not compel entry
- [x] 7.3 Cover movement and blocking: occupied destinations are illegal for both own and opponent pieces, passing over occupied squares is legal, and nothing is ever captured
- [x] 7.4 Cover forced moves and the no-legal-move penalty
- [x] 7.5 Cover wedge and rounded squares, including landing versus passing over
- [x] 7.6 Cover bearing off: exact throw succeeds, overshoot is illegal, borne-off pieces stop blocking
- [x] 7.7 Cover the pot: stakes open it, a penalty is capped at the payer's holdings, and a player with nothing pays nothing
- [x] 7.8 Cover winning and the frozen post-win state

## 8. Persistence

- [x] 8.1 Implement `src/lib/persist.ts`: save to and load from localStorage under a versioned key
- [x] 8.2 Validate loaded state and discard anything absent, malformed, or version-mismatched rather than partially applying it
- [x] 8.3 Swallow storage errors so private browsing or a full quota never breaks play
- [x] 8.4 Clear or mark finished a completed game so a reload does not resume a decided one
- [x] 8.5 Write `persist.test.ts` covering JSON round-trip, corrupt payloads, version mismatch, and the finished-game case

## 9. App shell

- [x] 9.1 Add `src/styles/tokens.css` and `src/styles/base.css`, with token values as clearly marked provisional placeholders pending the identity change
- [x] 9.2 Add `src/main.ts` and a placeholder `src/lib/components/App.svelte` that mounts and loads styles but renders no board, pieces, or throw controls
- [x] 9.3 Add a store stub at `src/lib/store.svelte.ts` holding game state in `$state.raw`, as the wholesale-reassignment pattern requires

## 10. SEO document and deploy

- [x] 10.1 Hand-author `index.html` with title, meta description, canonical, hreflang, OG and Twitter tags, and `VideoGame` JSON-LD for `https://games.aakkagam.com/patolli/`
- [x] 10.2 Add crawlable prose below the mount point describing Patolli, taking care to describe Bell's 60-square no-capture game rather than the popular 52-square version
- [x] 10.3 Copy the service-worker registration block verbatim from the bottom of `../senet/index.html`, adjusting only the wording of its comment
- [x] 10.4 Add `public/og.png` and `public/icon.svg` placeholders, referenced by absolute URL, to be replaced in the identity change
- [x] 10.5 Add `.github/workflows/deploy.yml` running `npm ci` → `npm run lint` → `npm run check` → `npm test` → `npm run build -- --base=/patolli/` → GitHub Pages

## 11. Verification

- [x] 11.1 Run `npm run lint`, `npm run check`, and `npm test` locally and confirm all pass
- [x] 11.2 Run `npm run build -- --base=/patolli/` and confirm every asset path in `dist/` is rooted at `/patolli/` and the crawlable prose survives the build
- [x] 11.3 Push to `main`, then enable GitHub Pages with source "GitHub Actions" (manual, out of band), and confirm the deploy succeeds
