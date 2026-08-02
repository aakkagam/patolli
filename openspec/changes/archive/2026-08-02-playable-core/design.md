## Context

`setup-base` shipped a repo that builds, lints, type-checks, tests and deploys, plus the complete rules engine and persistence. The live page is a placeholder shell.

Two things make this change easier than it would otherwise have been. The engine models the board as a cyclic index 0..59 with a per-player direction, so rendering is a mapping problem with no rules logic in it, and the track's structural invariants are already asserted in tests. And `DESIGN.md` now exists, with a specific enough identity ("The Painted Mat", four dyes, flat elevation, hand-drawn rubber line) that this change can render the real thing rather than drawing every component twice.

The sibling repos supply the architecture: abstract viewBox geometry, spring motion degrading under `prefers-reduced-motion`, drag with a tap-tap fallback, and identity by shape plus colour.

## Goals / Non-Goals

**Goals:**

- Two people can finish a hotseat game at games.aakkagam.com/patolli/.
- The board, pieces, throw, turn flow, pot ledger and win all rendered in the identity `DESIGN.md` defines.
- Direction of travel chosen by acting on the board rather than by answering a prompt.
- Resume-from-localStorage becomes live behaviour.

**Non-Goals:**

- The full teach-through-the-board treatment. Legal targets highlight and illegal drops bounce back, because those are inherent to playing at all, but the dedicated moments that explain the three surprising rules, and the work to make the blocking squeeze legible, belong to the follow-up change.
- Landing-page integration in `aakkagam.github.io`, which ships with launch.
- Any change to rules behaviour. The pure layer is closed for business here.
- Three- and four-player support.

## Decisions

### Render an axis-aligned cross, not the printed saltire

The engine's cycle is orientation-agnostic, so this is purely a rendering choice, and it was taken with the user.

A cross beats a saltire here on two counts. Each player's arm points squarely at them across a device passed between two people sitting opposite, which suits a hotseat game; on a saltire the players sit at opposite corners. And the arms run along the viewport axes, so a portrait phone is filled rather than wasted on the diagonal's bounding box. The same 60-cell graph rotated 45 degrees, with nothing lost but the printed board's silhouette.

*Alternative considered:* rotating a saltire so the active player's arm is always nearest. Rejected because a board that moves on every handover is harder to hold in the head than one that never moves, and it would animate the whole board twice a turn.

**Note for whoever reconciles it:** `DESIGN.md` calls the board a "saltire" in four places, having been written before this decision. The wording there should be updated; the identity itself is unaffected.

### Geometry maps from the track index, and does not re-derive it

`geometry.ts` exposes a position per track index 0..59 and knows nothing about how the track was constructed. The arm, file and rank of an index already come from `board.ts` via `locationOf`, which is tested.

The alternative, building the cross from its own coordinate model, would duplicate the one piece of knowledge in this project that was reconstructed rather than stated, and the two copies could then disagree. Rendering asks the engine where a square is, and gets an answer that is already proven correct.

### The direction choice is two live targets, not a prompt

At a player's first entry the engine already returns both directions as genuinely distinct legal moves, because they lead to different squares which may or may not be occupied. The UI therefore needs no special mode: it renders the legal moves it is given, and one tap fixes the direction for the game.

This satisfies the product's second principle directly, teaching the rule through the board with no words, and it costs nothing to build because the engine did the work already.

*Alternative considered:* a worded two-option control before the first entry. Rejected as an interruption that states a rule in text, which is what the principle exists to avoid.

### Identity is shape first

Cochineal disc against Indigo tile. Colour reinforces and is never asked to carry the distinction alone, so the board survives `grayscale(1)`, colour blindness and the smallest board scale. This is a floor from `PRODUCT.md` and a named rule in `DESIGN.md`, and it is cheap to hold if it is built in from the first component rather than retrofitted.

### The mat is the page, so there are no containers

`DESIGN.md` is unusually strict here: no card, panel, frame or shadow anywhere except a piece in the grip. That has a structural consequence worth stating before any component is written, because it is much harder to remove containers later than to never add them: the board, the ledger, the turn indicator and the throw all position themselves on a single ground rather than nesting inside layout boxes.

### Remove the dark theme rather than port it

`tokens.css` currently ships a `prefers-color-scheme: dark` block, written when the tokens were provisional placeholders. `DESIGN.md` forbids a dark theme outright, on the grounds that inverting dyed fiber in daylight produces exactly the torchlight aesthetic the brand rejects. The block is deleted, not adapted.

### Fonts are bundled, not fetched

`Marcellus` and `Alegreya Sans` load via `@fontsource`, matching senet. Self-hosting keeps the game working offline through the shared service worker, which is the whole point of that worker, and avoids a third-party request on a site that otherwise makes none.

## Risks / Trade-offs

- **`DESIGN.md` says "saltire" while this renders a cross** → The graph is identical and only the silhouette differs, so nothing in the identity depends on it. Flagged in the proposal for a wording fix rather than silently diverging.
- **The no-containers rule is easy to violate by habit** → Build the ground first and position onto it, rather than reaching for a wrapper per component. A container added late is expensive to remove because layout comes to depend on it.
- **Maize fails contrast alone (1.35:1 on the mat)** → It is never a stroke, never text, and never a state carried by itself; every live square pairs a maize wash with a rubber-line ring. This is a named rule in `DESIGN.md` and is specced as a scenario rather than left to discipline.
- **Drag on touch competes with page scroll** → The mat fills the viewport and the board should not scroll, so this is mostly avoided by construction; where it is not, the tap-tap path is the fallback that always works.
- **A 60-cell board on a 360px phone** → Cells get small. The touch-target floor applies to the interactive area, not the drawn cell, so targets can exceed their squares where needed; the responsive requirement is specced with an explicit narrow-viewport scenario.
- **The store grows into a god object** → Keep it a bridge. Anything that is a rule belongs in `src/lib/game/`, and anything the UI needs to know that the rules can compute should be a read-only helper there, not logic reimplemented in the store.
- **Scope creep from teaching** → The line is drawn deliberately: highlighting legal targets and bouncing illegal drops are needed to play at all; explaining the surprising rules and making the squeeze legible are the next change.

## Migration Plan

Additive. The pure layer and its tests are untouched, so the risk is confined to presentation. The placeholder shell is replaced in a single change; there is no interim state where both exist. Rollback is reverting the commit, which returns the deployed site to the placeholder.

One behavioural change reaches existing users: resume-from-localStorage becomes live. Anything saved by the placeholder build is discarded by the existing version and validation checks, so there is no upgrade path to write.

## Open Questions

- Whether the four central squares should be visually distinct from the four entry squares. `DESIGN.md` requires the pinwheel be legible enough to trace a loop, which may or may not need two marks.
- Where the stake and penalty setup lives: a pre-game step, or settings reachable mid-game. The spec requires only that it exist and clamp.
- Whether the bean throw is a button or a gesture on the beans themselves. Specced as an outcome, deliberately leaving the affordance to implementation.
