# Proposal: playable-core

## Why

The rules engine, persistence and deploy pipeline are done, but the live page at games.aakkagam.com/patolli/ is a placeholder shell: nobody can play. This change ships the playable game, wired to the existing pure engine, so two people can finish a hotseat match.

`DESIGN.md` now exists, so this change also renders in the real identity rather than the provisional greys, which avoids drawing every component twice.

## What Changes

- Render the 60-square board as **an axis-aligned cross (+)** rather than the diagonal saltire of the printed source. The engine's cycle is orientation-agnostic; this is purely a rendering choice, taken so each player's arm points squarely at them across a passed device and the board fills a portrait screen. Geometry lives in `src/lib/geometry.ts` in abstract viewBox units, never pixels.
- Draw the board as a region of the mat, not an object on it: Mat ground filling the viewport, Mat Woven field, every line Ulli with slight hand-drawn irregularity, no card, panel, frame or shadow.
- Mark the special squares structurally, per `DESIGN.md`: rounded end squares curve their own outline, the wedge bites into the single penalised square rather than straddling a seam, and the pinwheel of entry squares is drawn so a player can trace their own loop.
- Draw pieces with identity by **shape first**: Cochineal disc against Indigo tile, so it survives `grayscale(1)`, with colour reinforcing rather than carrying it.
- Piece interaction: drag with a spring and the Grip shadow, tap-tap fallback for every drag, legal destinations shown as a maize wash inside a rubber ring plus a ghost silhouette, illegal drops springing back to origin so the no-landing-on-occupied rule teaches itself.
- **Direction choice through the board**: on a player's first entry both possible landing squares light up as legal targets, and tapping one fixes that player's direction for the game. No prompt, no words.
- Turn flow: bean throw with tumble and a large tabular numeral, extra turns on rounded squares, the no-score turn end, the no-legal-move pot penalty, the win banner, and starting a new game.
- Pot ledger as ruled account-book lines in Ulli, updated by direct replacement, never animated.
- Stake stepper for the agreed stake and penalty before play.
- Replace the provisional token layer with the real one from `DESIGN.md`, and **remove the dark-theme block**, which `DESIGN.md` explicitly forbids.
- Add the two shared webfonts (`Marcellus`, `Alegreya Sans`) via `@fontsource`, as `DESIGN.md` requires.
- Spring motion in `src/lib/motion.ts`, degrading under `prefers-reduced-motion` to short fades and instant results.
- No landing-page updates in the user-site repo yet; those ship with the launch change.

## Capabilities

### New Capabilities

- `visual-identity`: the token layer and typography realised from `DESIGN.md` — the four dyes, the type scale, the flat-mat elevation rule, and the greyscale and contrast floors that make the rest legible.
- `board-rendering`: the 60-square cross drawn from the engine's cyclic track, its special-square marks, and the board-is-the-page layout across phone, tablet and laptop.
- `piece-interaction`: selecting and moving pieces by drag or tap-tap, legal-target highlighting, illegal-drop rejection, the first-entry direction choice, and the accessibility floors.
- `turn-flow-ui`: throwing, the numeral result, extra turns, forced-move and no-move outcomes, the pot ledger, the stake stepper, win and new-game flow.

### Modified Capabilities

- `app-scaffold`: the "Placeholder application shell" requirement is replaced — the app now mounts the playable game. The "Styles foundation" requirement is replaced — tokens are no longer provisional placeholders but the real values from `DESIGN.md`, and no dark theme ships.

## Impact

- New: `src/lib/geometry.ts`, `src/lib/motion.ts`, and board, piece, bean, ledger and HUD components under `src/lib/components/`.
- Modified: `src/lib/components/App.svelte` (placeholder to game), `src/lib/store.svelte.ts` (exposing whatever the UI needs, such as legal targets per piece), `src/styles/tokens.css` (real values, dark block removed), `index.html` (`theme-color` to match the mat).
- New dependencies: `@fontsource/marcellus` and `@fontsource/alegreya-sans`, matching the sibling repos' approach.
- The pure layer `src/lib/game/` is not expected to change. Any addition must be a read-only helper, with existing tests untouched and still passing.
- Resume-from-localStorage becomes live behaviour rather than a tested-but-unused module.
- `DESIGN.md` describes the board as a "saltire" in four places while this change renders an axis-aligned cross. The two are the same 60-cell graph rotated 45 degrees, and the orientation was decided with the user after that file was written, so the wording there should be reconciled.
