---
name: patolli
description: Mesoamerican cross-board race game as a dyed mat, four dyes at full strength in daylight
colors:
  mat: 'oklch(0.91 0.022 96)'
  mat-woven: 'oklch(0.86 0.028 96)'
  mat-shadow: 'oklch(0.80 0.032 96)'
  ulli: 'oklch(0.24 0.018 130)'
  ulli-muted: 'oklch(0.46 0.016 128)'
  cochineal: 'oklch(0.58 0.20 20)'
  cochineal-deep: 'oklch(0.46 0.18 18)'
  indigo: 'oklch(0.28 0.12 272)'
  indigo-lift: 'oklch(0.42 0.13 272)'
  maize: 'oklch(0.82 0.16 88)'
typography:
  display:
    fontFamily: "'Marcellus', 'Iowan Old Style', 'Palatino Linotype', serif"
    fontSize: '2.25rem'
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: '0.01em'
  headline:
    fontFamily: "'Marcellus', 'Iowan Old Style', 'Palatino Linotype', serif"
    fontSize: '1.5rem'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 'normal'
  title:
    fontFamily: "'Alegreya Sans', 'Gill Sans', 'Segoe UI', sans-serif"
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 'normal'
  body:
    fontFamily: "'Alegreya Sans', 'Gill Sans', 'Segoe UI', sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  label:
    fontFamily: "'Alegreya Sans', 'Gill Sans', 'Segoe UI', sans-serif"
    fontSize: '0.75rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '0.08em'
  numeral:
    fontFamily: "'Alegreya Sans', 'Gill Sans', 'Segoe UI', sans-serif"
    fontSize: '3.5rem'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '-0.01em'
    fontFeature: 'tnum'
rounded:
  sm: '2px'
  md: '4px'
  pill: '999px'
spacing:
  xs: '0.25rem'
  sm: '0.5rem'
  md: '1rem'
  lg: '1.5rem'
  xl: '2.5rem'
  '2xl': '4rem'
components:
  button-primary:
    backgroundColor: '{colors.ulli}'
    textColor: '{colors.mat}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '0.75rem 1.25rem'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.cochineal-deep}'
    textColor: '{colors.mat}'
  button-ghost:
    backgroundColor: '{colors.mat}'
    textColor: '{colors.ulli}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '0.75rem 1.25rem'
    height: '44px'
  button-ghost-hover:
    backgroundColor: '{colors.mat-shadow}'
    textColor: '{colors.ulli}'
  piece-cochineal:
    backgroundColor: '{colors.cochineal}'
    rounded: '{rounded.pill}'
    size: '2.25rem'
  piece-indigo:
    backgroundColor: '{colors.indigo}'
    rounded: '{rounded.sm}'
    size: '2.25rem'
  square-legal:
    backgroundColor: '{colors.maize}'
    rounded: '{rounded.sm}'
    size: '3rem'
  throw-numeral:
    textColor: '{colors.ulli}'
    typography: '{typography.numeral}'
  turn-indicator:
    backgroundColor: '{colors.mat}'
    textColor: '{colors.ulli}'
    typography: '{typography.title}'
    padding: '{spacing.sm} {spacing.md}'
  pot-ledger:
    backgroundColor: '{colors.mat}'
    textColor: '{colors.ulli}'
    typography: '{typography.label}'
    padding: '{spacing.md}'
  stake-stepper:
    backgroundColor: '{colors.mat}'
    textColor: '{colors.ulli}'
    typography: '{typography.title}'
    rounded: '{rounded.sm}'
    height: '44px'
    padding: '0 {spacing.sm}'
---

# Design System: Patolli

## 1. Overview

**Creative North Star: "The Painted Mat"**

A woven agave mat unrolled on the floor between two people, its saltire laid down in liquid rubber, counters of dyed stone sitting in the squares. Daylight, not torchlight. The mat is not a widget on a page; the mat IS the page, filling the viewport edge to edge with nothing behind it and nothing framing it. Turn state, the throw, the pot and settings sit directly on the fiber, quiet and peripheral, never in a panel.

Over that material sits a duel. Nothing is ever captured, so there are no blowouts to hide behind: every square you occupy is a square your opponent cannot use. The design has one job beyond legibility, which is to make that squeeze visible. Options closing must be something a player watches happen, not something they infer from losing.

This is the fourth game in Aakkagam Games and it must not read as the third. Senet is carved wood, align3 is stone and oxide floor, Ostomachion is fired clay: all low-chroma earth. Patolli is not earth, it is **dye on fiber**. Cochineal and indigo were the two most valuable dyes in the pre-Columbian world and they belong here at full strength, saturated the way a thread takes colour, against an undyed ground that is greener and cooler than any of the sibling creams. This system explicitly rejects casino and gambling UI, generic SaaS and flat web, and cheap mobile-game clutter.

**Key Characteristics:**

- The mat drenches the viewport; no card, no container, no frame around the board
- Four dyes, each a named role: undyed fiber, rubber line, cochineal, indigo, maize
- Every stroke on screen is the same rubber line, slightly irregular, never machined
- Player identity is disc against tile first, red against blue second
- The pot is a written ledger, never a jackpot
- The bean throw is the one permitted moment of drama, and it always resolves to a numeral

## 2. Colors

Five roles, high chroma where it counts, on an undyed plant-fiber ground. Values are canonical in OKLCH; sRGB hex equivalents and eight-step tonal ramps live in `.impeccable/design.json`.

### Primary

- **Cochineal** `oklch(0.58 0.20 20)`: player one. A vivid carmine, the insect dye that was the most valuable red in the world. 3.6:1 on the mat, 3.1:1 on the woven field, and 3.2:1 against Indigo so the two players stay apart in greyscale.
- **Cochineal Deep** `oklch(0.46 0.18 18)`: the same dye soaked twice. Used only where cochineal has to carry text, which it cannot do at full strength (6.0:1 on the mat).

### Secondary

- **Indigo** `oklch(0.28 0.12 272)`: player two. A deep true indigo, nearly black in the thread and blue only where the light catches it. 11.5:1 on the mat, and dark enough to be its own text colour.
- **Indigo Lift** `oklch(0.42 0.13 272)`: hover and grabbed states for indigo pieces, where the darker step would read as a hole.

### Tertiary

- **Maize** `oklch(0.82 0.16 88)`: live state and nothing else. Legal destinations, the square the throw is about to land on, the active bean row. A fill, never a stroke, never text.

### Neutral

- **Mat** `oklch(0.91 0.022 96)`: undyed agave fiber. Fills the viewport. Warmer than paper and greener than clay, which is what keeps it out of the sibling repos' cream family.
- **Mat Woven** `oklch(0.86 0.028 96)`: the saltire's field, a slightly deeper area of the same fiber where the dye has soaked in. This is the board, and it is a region of the mat, not an object on it.
- **Mat Shadow** `oklch(0.80 0.032 96)`: pressed and sunken states, ledger rules, disabled controls.
- **Ulli** `oklch(0.24 0.018 130)`: liquid rubber. Every line on the board, every piece outline, every glyph of primary text. Warm-dark with a green cast, never `#000`. 12.6:1 on the mat.
- **Ulli Muted** `oklch(0.46 0.016 128)`: secondary text, spent rubber, the crawlable prose (5.4:1).

### Named Rules

**The Four Dyes Rule.** Fiber, rubber, cochineal, indigo, maize. Every element on screen maps to one of them. A sixth colour needs a reason strong enough to be written down in this file.

**The Rubber Ring Rule.** Maize scores 1.35:1 against the mat, which is hue with nothing behind it. It is therefore forbidden as a stroke, as text, and as a state carried alone. Every live square says it twice: a maize wash inside a rubber-line ring. The ring carries the contrast, the dye carries the meaning.

**The Greyscale Rule.** Every state a player must read, which pieces can move, where the throw sends them, whose piece occupies a square, has to survive `grayscale(1)`. Colour may reinforce it. Colour may never be the only thing carrying it.

**The Ledger Rule.** The pot and the penalties are written in Ulli on Mat, in tabular numerals, ruled like an account book. No dye, no glow, no fill, no animation of a number going up. The stake is real and it is recorded, not celebrated.

## 3. Typography

**Display Font:** `'Marcellus', 'Iowan Old Style', 'Palatino Linotype', serif`, an inscriptional serif, ancient without costume. Shared verbatim with senet, align3 and Ostomachion so all four wordmarks read as one family.
**Body Font:** `'Alegreya Sans', 'Gill Sans', 'Segoe UI', sans-serif`, humanist, quiet, warm. Also shared across the four games.

Both load via `@fontsource` in `main.ts` (Marcellus 400; Alegreya Sans 400/700). The system faces behind them carry first paint. Neither is installed yet; adding them is part of implementing this file.

**Character:** Ancient without costume. The serif appears rarely, at the title and the win, so it lands with ceremony. The sans does everything else: turn state, throw results, the pot, settings. No Aztec-glyph or "tribal" novelty faces, ever.

### Hierarchy

- **Display** (Marcellus 400, 2.25rem, lh 1.1): game title and win banner only.
- **Headline** (Marcellus 400, 1.5rem, lh 1.2): the one-line result under a win.
- **Title** (Alegreya Sans 700, 1.25rem, lh 1.3): turn indicator, the sentence that names whose move it is.
- **Body** (Alegreya Sans 400, 1rem, lh 1.5): settings, the crawlable prose below the mount point. Capped at 68ch.
- **Label** (Alegreya Sans 700, 0.75rem, 0.08em tracking, uppercase): buttons, ledger headings, stake fields.
- **Numeral** (Alegreya Sans 700, 3.5rem, lh 1, `tnum`): the throw result, and only the throw result.

Fixed rem, never fluid clamps. This is a product surface viewed at a consistent distance, and a heading that shrinks with the viewport looks worse, not better.

### Named Rules

**The Rare Serif Rule.** The serif is ceremonial. If it appears more than twice on one screen, it has lost its weight.

**The Numeral Rule.** The throw always resolves to a large tabular numeral. The tumbling beans are theatre and the numeral is the fact, so the numeral is never withheld until the animation finishes and never replaced by counting the marked faces. Ten is two digits: tabular figures are not optional.

## 4. Elevation

Flat, with one exception. Dye soaks into fiber; it does not sit on top of it, and nothing on this mat casts a shadow because nothing on this mat is raised. Depth comes entirely from tonal layering within the fiber (Mat, Mat Woven, Mat Shadow) and from line weight. There are no cards, no panels, no elevated surfaces, and no `box-shadow` on any static element.

The exception is a piece in the player's grip. While a counter is lifted mid-drag it gets a single soft contact shadow that grows on pick-up and vanishes the instant it settles, because that is the one moment something genuinely is off the mat. Thrown beans may cast the same shadow while airborne.

### Shadow Vocabulary

- **Grip** (`box-shadow: 0 6px 14px oklch(0.24 0.018 130 / 0.22)`): a counter held or a bean in the air. Nothing else, ever.

### Named Rules

**The Flat Mat Rule.** If it is not in a player's hand, it has no shadow. A surface that needs elevation to be understood has been drawn wrong; deepen the fiber instead.

**The Lift-Only Rule.** The only shadows in the app belong to a piece in the grip and beans in flight.

## 5. Components

Everything is drawn with the same instrument. Buttons, board lines, piece outlines and ledger rules are all Ulli at a hairline weight with a slight hand-drawn irregularity, so the interface looks made by one person with one pot of rubber.

### Board

- **Ground:** Mat, filling the viewport. The saltire's field is Mat Woven, a region of the same fiber, with no border, no radius and no shadow separating it.
- **Lines:** Ulli, roughly 2px at board scale, with sub-pixel path jitter so no two strokes are identical. Never a stroke of uniform machine weight.
- **Squares:** 60 cells in a saltire of four 2x7 arms plus a central 2x2. Positions come from `src/lib/geometry.ts` in abstract viewBox units, never pixels.
- **Rounded end squares** (the 8 that grant another turn): the cell's own outline curves. The mark is structural, drawn into the board, not an overlay badge.
- **Wedge squares:** the wedge bites into the penalised square only, never straddling the boundary between two. The printed board art draws it across a seam, which is exactly the ambiguity that makes players expect both squares to cost double. The art must tell the truth about the rule, so the wedge points at the one square that charges.
- **Entry squares:** the pinwheel of decorated centre squares is drawn, because it encodes the track. A player must be able to trace their own loop with a finger.

### Pieces

- **Cochineal Disc:** a round counter, Cochineal fill, Ulli outline.
- **Indigo Tile:** a squared counter with a 2px radius, Indigo fill, Ulli outline.
- **Identity:** shape first, colour second. Disc against tile survives greyscale, small sizes and every form of colour blindness. Cochineal against Indigo reinforces it and is never asked to carry it alone.
- **States:** at rest, flat on the mat. Grabbable pieces take a maize ring at the moment a throw makes them movable. Held pieces take the Grip shadow and lag behind the pointer on a spring. An illegal drop springs back to origin, which is how the "you may not land on an occupied square" rule teaches itself.
- **Size:** at least 44px of touch target regardless of board scale, with a tap-tap fallback for every drag.

### Squares in play

- **Legal destination:** maize wash inside a rubber ring, per The Rubber Ring Rule, plus a ghost of the moving piece's own silhouette at low opacity. Said twice, in two channels.
- **Blocked square:** the occupant stays exactly as it is and the destination simply is not offered. Never a red cross, never a "no entry" glyph. Nothing is captured here, and nothing should look like it might be.
- **Exact-throw bear-off:** the final square lights only when the throw matches exactly. An overshoot offers nothing, so the rule reads as arithmetic rather than as a rejection.

### Beans and the throw

- **Beans:** five two-sided markers, marked face in Ulli on fiber, unmarked face plain. They tumble and settle on a spring.
- **Result:** the numeral, always. Large, tabular, Ulli on Mat, appearing as the beans land rather than after them.
- **Zero:** a no-score ends the turn immediately, so the numeral shows the score and the turn passes in one beat. No failure sound, no shake, no red.
- **Reduced motion:** the tumble collapses to a short fade and the numeral appears at once.

### Buttons

- **Shape:** near-square (2px radius). Painted, not moulded.
- **Primary:** Ulli fill, Mat text, uppercase Label type, 0.75rem by 1.25rem padding, 44px minimum height.
- **Hover:** fill shifts to Cochineal Deep over 120ms. **Active:** fill holds, content shifts 1px down. **Focus:** 2px Ulli outline at 2px offset.
- **Ghost:** Mat fill, Ulli text, hairline Ulli border; hover fills to Mat Shadow.
- **Disabled:** Mat Shadow fill, Ulli Muted text, no border.

### Pot ledger

- **Style:** an account book ruled on the mat. Hairline Ulli rules, Label type for headings, tabular numerals for counts. No container, no background, no border box.
- **Content:** each player's stake, the pot, and the agreed penalty, all readable at a glance without a tap.
- **Behaviour:** values change by direct replacement. Never a count-up animation, never a coin, never a chip, never a badge.

### Stake stepper

- **Style:** Mat fill, hairline Ulli border, 2px radius, 44px tall, Title type with tabular numerals, minus and plus targets at 44px each.
- **Focus:** 2px Ulli outline at 2px offset. **Disabled at bounds:** Ulli Muted glyph, no border change.
- **Empty and error:** the stepper cannot be empty; it clamps. There is no free-text stake field to validate.

### Turn indicator

- **Style:** a plain sentence in Title type sitting on the fiber, prefixed by the active player's own piece silhouette at text size. Shape and colour together, no dot, no pill, no badge.
- **State:** it names what the player may do now, not what happened. "Throw to enter" reads better than "No moves last turn."

## 6. Do's and Don'ts

### Do:

- **Do** drench the viewport in Mat; the board is the page and its field is a deeper region of the same fiber.
- **Do** draw every line as Ulli with slight hand-drawn irregularity: board, pieces, buttons, ledger rules, one instrument throughout.
- **Do** state player identity as disc against tile first and Cochineal against Indigo second, so it survives `grayscale(1)`.
- **Do** pair every maize fill with a rubber ring, per The Rubber Ring Rule.
- **Do** show the throw as a numeral in tabular figures at the moment the beans land.
- **Do** make the squeeze visible: legal targets highlight, options closing are watched rather than inferred.
- **Do** bounce an illegal drop back to origin, so "you may not land on an occupied square" teaches itself at the moment it bites.
- **Do** keep the pot as ruled ledger lines in Ulli, updated by direct replacement.
- **Do** honour `prefers-reduced-motion` by collapsing springs and the bean tumble to short fades or instant results.
- **Do** hold 44px minimum touch targets and give every drag a tap-tap fallback.

### Don't:

- **Don't** produce "casino and gambling UI": no chips, felt green, jackpot glows, coin showers, or win jingles. The game has a real pot and must never feel like a betting app.
- **Don't** produce "generic SaaS and flat web": no sterile flat cards, default blues, corporate minimalism, dashboard chrome.
- **Don't** produce "cheap mobile-game clutter": no popups, neon gradients, fake-3D plastic buttons, reward animations, or currency badges.
- **Don't** put the board, the ledger or the turn state inside a card, panel or container. Nothing on this mat has a frame.
- **Don't** use maize as a stroke, as text, or as a state carried alone; 1.35:1 against the mat is hue with nothing behind it.
- **Don't** ship a dark theme. The identity is dyed fiber in daylight, and inverting it is the torchlight this brand rejects.
- **Don't** draw a capture affordance: no red cross, no strike-through, no "no entry" glyph on a blocked square. Nothing is ever captured in this game.
- **Don't** animate a number going up. The pot is a ledger, not a jackpot.
- **Don't** add a shadow to anything that is not in a player's grip or a bean in flight.
- **Don't** use `#000`, `#fff`, side-stripe borders, gradient text, or glassmorphism.
- **Don't** reach for Aztec-glyph or "tribal" display faces, gold-on-black, or obsidian-and-turquoise. That is the category reflex, and this mat is dye on fiber in daylight.
- **Don't** use fluid `clamp()` type. Fixed rem steps only.
- **Don't** use em dashes in any UI copy.
