## Context

The repo contains documentation only: `CLAUDE.md` (which carries the authoritative ruleset), `PRODUCT.md`, and the openspec scaffold. There is no `package.json`, no source, and no CI.

Three sibling repos establish the architecture this change copies rather than reinvents: `align3`, `ostomachion`, and `senet`, all Svelte 5 + TypeScript + Vite with a pure logic layer, a runes store, and components. Two constraints make patolli diverge from them.

First, this project is built on the current Svelte line and the current build tooling, while the siblings sit one major behind on Vite, Vitest, and the Svelte Vite plugin. Second, no sibling has any linting at all, and align3's strict `tsconfig.json` is never actually read by anything, so a type error there would reach production. Patolli adds both lint and `svelte-check` as CI gates.

The rules are settled and unusually well specified for this game: R. C. Bell's 60-square reconstruction, with the board geometry measured off the printable board in the source PDF. Three genuine ambiguities were resolved with the user and are recorded in the proposal.

## Goals / Non-Goals

**Goals:**

- A repo that builds, lints, type-checks, tests, and deploys to GitHub Pages at base `/patolli/`.
- The complete Patolli rule engine as pure, framework-free, deterministically testable code, with every rule in the spec covered by tests.
- The 60-square track proven correct by assertion, before any rendering depends on it.
- `GameState` as plain serializable data, with mid-game persistence working from day one.
- A hand-authored `index.html` carrying SEO metadata and the shared service-worker registration.

**Non-Goals:**

- Any playable UI. The shell is a placeholder; board, pieces, throws, and turn flow belong to the next change.
- Any visual identity. `DESIGN.md` does not exist yet, so tokens ship as explicitly provisional placeholders and no palette, type, or motion decision is made here.
- Landing-page integration in the `aakkagam.github.io` repo, which happens only once the game is playable.
- Three- and four-player support. Bell's rules allow both, but this build is two-player hotseat.

## Decisions

### Model the board as a cyclic index, not as geometry

The engine represents the board as indices 0..59 with a per-player direction of `+1` or `-1`. The saltire shape, the U-turns at the arm tips, and the pinwheel of entry squares are rendering concerns handled in a later change.

This mirrors what the siblings already do — align3 maps two different board topologies onto nine point indices, senet maps a boustrophedon onto a linear 1..30 path — so it is the established pattern rather than a new one.

The board shape forces this particular cycle rather than merely permitting it: each arm is a 2×7 dead end, so the only way to cover an arm and leave it is to run outward along one file, turn at the rounded tip, and come back along the other, then cross one central square into the next arm. That yields 14 + 1 = 15 squares per quadrant and 60 in total, with every square and every central square used exactly once.

*Alternative considered:* modelling squares as (arm, file, rank) coordinates with adjacency rules. Rejected because every rule in the spec — movement, blocking, bearing off at index 59, entry at index 0 — is naturally expressed as arithmetic on a cycle, and coordinates would force a translation layer at every call site.

### Prove the track in tests before anything renders

The derived cycle is the single largest unknown in the project, and it was reconstructed from board artwork rather than from rule text. It is also cheap to verify: that the track holds 60 distinct squares, that each quadrant contributes 14 arm squares plus one central square, that all four central squares are consumed exactly once, and that two opposed players' entry squares are exactly 30 apart.

Asserting these in this change means the later rendering work is a coordinate mapping with no open questions, rather than a debugging exercise conducted through SVG.

### Injected bean faces, randomness only in the store

Scoring takes the five bean faces as an argument and returns a score. Nothing in `src/lib/game/` calls a random number generator. The store draws the faces and hands them to the pure layer.

This makes every rule deterministically testable, including the throw distribution itself, which the source PDF states explicitly and which is therefore worth asserting: over all 32 combinations, 2 and 3 occur ten times each, 1 and 4 five times each, and 10 and the no-score once each.

*Alternative considered:* an injected RNG seed. Rejected as a weaker guarantee — a seeded generator still couples the logic layer to a generator implementation, whereas passing faces makes the rules total functions of their inputs.

### Immutable transitions returning `null` for illegal moves

Rule functions take a state and return a new state, or `null` when the move is illegal. This is exactly the convention align3 and senet already use, and it suits Patolli particularly well because illegality is central here rather than incidental: an occupied destination is not a special case but the game's entire strategic mechanism, and overshooting the bear-off square is likewise simply not a move.

A consequence worth noting for the next change: because states are reassigned wholesale rather than mutated, the store should hold them in `$state.raw` rather than deeply-proxied `$state`, per Svelte's own best-practice guidance.

### Wedge squares: eight, at rank 3

Bell's text says eight squares are reduced by wedge markings; the printable board draws eight wedges, each straddling the boundary between ranks 3 and 4 in a file, which would leave sixteen squares flanked. The text and the art cannot both be right.

The engine implements the text's count: one penalty square per file per arm, eight in total, at the 3rd rank from each arm tip. The rank itself is arbitrary, since the wedge is drawn symmetrically about the 3/4 boundary, so the choice is recorded here rather than justified.

### Penalties are capped, never debts

Bell is silent on what happens when a player cannot pay. The engine pays out only what a player holds: balances never go below zero and shortfalls are forgiven.

This keeps the race the deciding mechanism, which follows PRODUCT.md's principle that the pot is a ledger rather than a jackpot. A bankruptcy-loses rule would let a game end with nobody having borne off a piece; a debt model would show players negative balances mid-game.

### Entry lands at index equal to the throw

Rule 7 reads "enters a new piece onto the board from the central square closest to him, moving around the track by the number of spaces according to his score". The engine treats the entry square as index 0 and lands the entering piece at the index equal to the throw. The alternative reading, in which the piece simply occupies the entry square, leaves the throw doing no work.

### Take the current dependency line, do not copy senet's `package.json`

Scaffolding from senet and then bumping only Svelte produces a peer-dependency conflict: `@sveltejs/vite-plugin-svelte` v6 accepts Vite 6 or 7 and will not accept Vite 8. The whole set moves together — Svelte `^5.56`, plugin `^7.2`, Vite `^8.1`, Vitest `^4.1` — and the layout, not the versions, is what gets copied.

### Lint and check are both CI gates, and neither substitutes for the other

`svelte-check` catches type and Svelte diagnostics; ESLint catches rule violations including the Svelte-specific ones. The flat config applies the Prettier compatibility configs last so formatting rules always lose to Prettier.

Two configuration details fail silently if missed, so they are called out for implementation: `svelte-eslint-parser` needs `parserOptions.parser` pointed at the TypeScript parser or `<script lang="ts">` blocks will not parse, and the plugin needs `svelteConfig` passed through `languageOptions.parserOptions` or the Svelte-specific rules go quiet without erroring.

`svelte-check` stays a whole-project command rather than a per-file hook, because it must see the whole project by design: renaming a prop breaks its usage sites in files that were not touched.

## Risks / Trade-offs

- **The track derivation is reconstructed from board artwork, not stated in the rules** → Assert its structural invariants as tests in this change, so that if the reading is wrong it fails here rather than during rendering. The invariants are strong enough that an incorrect cycle is very unlikely to satisfy all of them.
- **The wedge-square decision contradicts the board art** → Isolate the penalty-square set behind a single definition in the board module so switching to the sixteen-square reading is a one-line change plus test updates, not a rewrite.
- **This chunk is large: toolchain plus a complete rule engine** → The two halves are independent, so implementation can land the scaffold first and get CI green before any rule exists, keeping the change reviewable in stages.
- **Being first in the workspace to use Vite 8 and ESLint 10** → Versions were checked against the registry and peer ranges verified rather than assumed. If a conflict appears, falling back to the siblings' Vite 7 line is possible, but it would then also mean dropping the Svelte plugin to v6.
- **Provisional style tokens could harden into an accidental identity** → Mark them as placeholders in the file itself, and keep the shell visually plain enough that nobody mistakes it for a design.
- **Persistence written before there is a UI to exercise it** → Cover it with tests at the serialization boundary, and treat a corrupt, absent, or version-mismatched payload as a discard rather than something to partially apply.

## Migration Plan

The repo is empty, so there is nothing to migrate and no rollback beyond reverting the commit. One manual step sits outside the pipeline: after the first push, GitHub Pages must be enabled for the repo with source "GitHub Actions", or the workflow will build successfully and publish nothing.

## Open Questions

None blocking. The three rule ambiguities that would have blocked this change were resolved with the user and are recorded above.

Deferred to later changes, listed here so they are not lost: whether the board renders as a diagonal saltire or an axis-aligned cross; how a player chooses travel direction at first entry; and whether three- and four-player support, which Bell's rules cover, is ever worth adding.
