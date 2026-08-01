# Proposal: setup-base

## Why

The patolli repo holds only documentation: nothing builds, tests, lints, or deploys. Every future change needs the project base in place, plus a fully tested pure rules core, so UI work can start against a correct engine. Patolli's track is not obvious from its board the way senet's is, so proving the 60-square cycle in tests here removes the project's biggest unknown before any rendering exists.

## What Changes

- Scaffold the project following the senet/align3 layout and conventions (Svelte 5 + TypeScript + Vite, `src/lib/game/` pure layer → `store.svelte.ts` → `components/`), taking the current dependency set rather than senet's pins: Svelte `^5.56`, Vite `^8.1`, `@sveltejs/vite-plugin-svelte` `^7.2`, Vitest `^4.1`.
- Add linting, which no sibling repo has: ESLint flat config with `typescript-eslint` and `eslint-plugin-svelte`, plus Prettier with `prettier-plugin-svelte`. `npm run lint` gates CI.
- Implement the complete pure game logic for R. C. Bell's 60-square ruleset (the spec in CLAUDE.md): the cyclic track derived from the saltire, five-bean throws, entry, per-player direction, movement with the no-landing-on-occupied rule, forced moves, wedge and rounded squares, exact-throw bearing off, the pot and penalties, and win detection — with unit tests for every rule.
- Resolve the three open rule questions (decided with the user): **8 wedge-penalty squares** at the 3rd rank from each arm tip, one per file per arm; **penalties are paid only up to what a player holds**, never below zero, with any shortfall forgiven; **entry places a piece at track index = the throw**, treating the entry square as index 0.
- Bean throws are pure functions of injected bean faces; randomness lives only in the store layer, so every rule is deterministically testable.
- `GameState` is plain serializable data from day one; full mid-game persistence (resume after refresh) via localStorage.
- Add `.github/workflows/deploy.yml` running `npm ci` → `lint` → `check` → `test` → `build -- --base=/patolli/` → GitHub Pages.
- Hand-author `index.html` with its title, canonical, hreflang, OG/Twitter tags, `VideoGame` JSON-LD, crawlable prose, and the service-worker registration block copied from senet.
- UI remains a placeholder shell (app mounts, styles load, no playable board). The playable game is a follow-up change.

## Capabilities

### New Capabilities

- `app-scaffold`: project structure, the build/test/check/lint toolchain, styles foundation, hand-authored SEO document, and the GitHub Pages deploy pipeline at base `/patolli/`.
- `game-rules`: the pure, framework-free Patolli rule engine — track construction, beans, entry, direction, movement and blocking, forced moves, wedge and rounded squares, bearing off, the pot and penalties, win.
- `game-persistence`: serialization and restore of a full in-progress game to localStorage, surviving page refresh.

### Modified Capabilities

None — this is the first change; no existing specs.

## Impact

- New repo content: `package.json`, `vite.config.ts`, `tsconfig.json`, `svelte.config.js`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.gitignore`, `index.html`, `.github/workflows/deploy.yml`, `public/`, `src/` (game logic, store stub, placeholder shell, styles).
- No existing code affected (the repo has no source). No backend, no external services.
- First lint setup in the workspace: the `.claude/settings.json` formatting hook is inert until `node_modules` exists and starts working once this change installs dependencies.
- Deploy pipeline requires GitHub Pages enabled with source "GitHub Actions" after the first push (manual, out of band).
- `DESIGN.md` does not exist yet. This change deliberately needs no visual identity: styles ship as a neutral token placeholder, and colour decisions belong to the later identity change.
- Landing-page updates in the user-site repo happen only after the playable game ships — explicitly out of scope here.
