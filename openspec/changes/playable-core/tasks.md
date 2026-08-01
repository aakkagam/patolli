## 1. Visual identity

- [x] 1.1 Add `@fontsource/marcellus` (400) and `@fontsource/alegreya-sans` (400, 700), importing them in `src/main.ts` as senet does
- [x] 1.2 Replace `src/styles/tokens.css` with the real palette from `DESIGN.md` in OKLCH: mat, mat-woven, mat-shadow, ulli, ulli-muted, cochineal, cochineal-deep, indigo, indigo-lift, maize
- [x] 1.3 **Delete the `prefers-color-scheme: dark` block.** `DESIGN.md` forbids a dark theme outright; it is not to be adapted
- [x] 1.4 Add the type scale as tokens (display, headline, title, body, label, numeral) in fixed rem steps, with `font-variant-numeric: tabular-nums` on the numeral role
- [x] 1.5 Add the spacing, radius and the single Grip shadow tokens; confirm no other shadow token exists
- [x] 1.6 Update `src/styles/base.css` for the mat ground filling the viewport, and update `theme-color` in `index.html` to the mat
- [x] 1.7 Verify contrast: every text and interactive pairing meets AA, and confirm maize is used only as a fill

## 2. Geometry

- [x] 2.1 Write `src/lib/geometry.ts` exposing a position per track index 0..59 in abstract viewBox units, deriving arm/file/rank from `board.ts`'s `locationOf` rather than re-deriving the track
- [x] 2.2 Lay the four arms out as an axis-aligned cross (2 files x 7 ranks per arm) around the central 2x2
- [x] 2.3 Expose the viewBox dimensions and a per-cell size so components never compute pixels
- [x] 2.4 Write `geometry.test.ts`: 60 distinct positions, one per index; consecutive indices share an edge including across each U-turn and each central square; nothing expressed in pixels

## 3. Board rendering

- [x] 3.1 Add `Board.svelte` drawing the 60 cells from geometry, with the Mat Woven field as a region of the mat and no container, border, radius or shadow
- [x] 3.2 Draw every line in Ulli at hairline weight with slight path irregularity, so no two strokes are identical
- [x] 3.3 Mark the 8 rounded end squares by curving the cell's own outline, not by overlaying a badge
- [x] 3.4 Mark the 8 wedge squares with the wedge biting into the penalised square only, never straddling a seam
- [x] 3.5 Draw the entry and central squares so a player can trace their own loop by eye
- [x] 3.6 Make the board responsive: whole board visible without horizontal scroll at 360px wide, scaling up on larger viewports

## 4. Pieces and motion

- [x] 4.1 Add `src/lib/motion.ts` with spring tuning, degrading to short fades or instant results under `prefers-reduced-motion`
- [x] 4.2 Add `Piece.svelte`: Cochineal disc and Indigo tile, Ulli outline, identity by shape first
- [x] 4.3 Give held pieces the Grip shadow and a spring lag behind the pointer; remove the shadow the instant they settle
- [x] 4.4 Hold a 44px minimum touch target regardless of board scale, decoupling the interactive area from the drawn cell where needed
- [x] 4.5 Verify identity survives `grayscale(1)` and the smallest board scale

## 5. Interaction

- [x] 5.1 Extend `store.svelte.ts` with what the UI needs: legal destinations per piece, which pieces are grabbable, and the selected piece; keep rules logic in `src/lib/game/`
- [x] 5.2 Implement drag to move, and the tap-tap fallback, so every drag has an equivalent two-tap path
- [x] 5.3 Show legal destinations as a maize wash inside a rubber-line ring plus a ghost of the moving piece's silhouette
- [x] 5.4 Bounce illegal drops back to origin with no capture affordance drawn anywhere
- [x] 5.5 Offer both landing squares on a first entry so tapping one fixes that player's direction; verify only one destination per piece is offered thereafter
- [x] 5.6 Add visible focus indicators to every interactive element

## 6. Turn flow

- [x] 6.1 Add `Beans.svelte`: five two-sided beans that tumble and settle on a spring, collapsing to a fade under reduced motion
- [x] 6.2 Show the result as a large tabular numeral as the beans land, never withheld until the animation ends
- [x] 6.3 Add the turn indicator: a sentence in Title type prefixed by the active player's own silhouette, naming what they may do now
- [x] 6.4 Surface the turn outcomes: extra turn on a rounded square, turn ending on a no-score, penalty into the pot when no piece can move
- [x] 6.5 Add the pot ledger as ruled Ulli lines with tabular numerals, updating by direct replacement with no animation, container or coin
- [x] 6.6 Add the stake and penalty stepper, clamping at its bounds with no free-text field
- [x] 6.7 Add the win banner naming the winner and showing the pot transferred, freezing further throws and moves
- [x] 6.8 Wire new game: clear the saved game and return to stake setup

## 7. App shell

- [x] 7.1 Replace the placeholder in `App.svelte` with the game, positioning board, turn indicator, throw and ledger on a single ground with no wrapper containers
- [x] 7.2 Confirm resume-from-localStorage is live: reloading mid-game restores position, turn, directions, counters and pot
- [x] 7.3 Confirm a finished game does not resume
- [x] 7.4 Verify the SEO head, JSON-LD, service-worker registration and crawlable prose are all still intact

## 8. Verification

- [x] 8.1 Run `svelte-autofixer` over every new and changed component, and fix what it reports
- [x] 8.2 Run `npm run lint`, `npm run check` and `npm test`; confirm the existing 74 rules and persistence tests still pass untouched
- [x] 8.3 Play a full game start to finish in the browser: entry, both directions, blocking, a wedge penalty, an extra turn, a bear-off, and a win
- [x] 8.4 Check the reduced-motion path, `grayscale(1)` legibility, keyboard focus, and 44px targets
- [x] 8.5 Check 360px portrait, tablet and laptop widths for horizontal scroll and cropping
- [x] 8.6 Run `npm run build -- --base=/patolli/` and confirm assets stay rooted at `/patolli/` and the prose survives
- [ ] 8.7 Push, confirm the deploy succeeds, and verify the live page plays
