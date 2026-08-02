## ADDED Requirements

### Requirement: The four dyes

The token layer SHALL implement the palette defined in `DESIGN.md`: undyed fiber (Mat, Mat Woven, Mat Shadow), rubber line (Ulli, Ulli Muted), Cochineal, Indigo and Maize. Values SHALL be canonical in OKLCH. Every coloured element SHALL map to one of these roles.

#### Scenario: Tokens carry the real palette

- **WHEN** the token layer is inspected
- **THEN** it defines the five colour roles from `DESIGN.md` in OKLCH, and no provisional placeholder values remain

#### Scenario: Nothing is pure black or white

- **WHEN** any colour token is read
- **THEN** it is neither `#000` nor `#fff`, and every neutral carries a tint

### Requirement: No dark theme

The interface SHALL render in a single daylight theme. A `prefers-color-scheme: dark` block SHALL NOT ship, because the identity is dyed fiber in daylight and inverting it produces exactly the torchlight aesthetic the product rejects.

#### Scenario: Dark theme is absent

- **WHEN** the stylesheets are inspected
- **THEN** no `prefers-color-scheme: dark` rules are present

#### Scenario: Appearance does not change with system preference

- **WHEN** the operating system is set to dark mode
- **THEN** the game renders identically to light mode

### Requirement: Typography

The system SHALL load `Marcellus` for display and `Alegreya Sans` for body and labels, via `@fontsource`, with system faces carrying first paint. Sizes SHALL be fixed rem steps, never fluid `clamp()`. The throw result SHALL use tabular figures.

#### Scenario: Fonts are bundled, not fetched from a third party

- **WHEN** the page loads
- **THEN** both families are served from the site's own assets, with no request to an external font host

#### Scenario: Throw numerals do not shift width

- **WHEN** the throw result changes between a one-digit and a two-digit score
- **THEN** the numeral occupies a stable width, because tabular figures are used

#### Scenario: The serif stays ceremonial

- **WHEN** any single screen is inspected
- **THEN** the display serif appears at most twice

### Requirement: Contrast and greyscale floors

All text and interactive states SHALL meet WCAG AA contrast. Every state a player must read SHALL survive `grayscale(1)`. Maize SHALL NOT be used as a stroke, as text, or as a state carried alone, since it scores 1.35:1 against the mat.

#### Scenario: Live squares say it twice

- **WHEN** a square is shown as a legal destination
- **THEN** it carries a maize wash inside a rubber-line ring, so the ring carries the contrast and the dye carries the meaning

#### Scenario: State survives greyscale

- **WHEN** the interface is rendered through `grayscale(1)`
- **THEN** whose piece occupies a square, which pieces can move, and where the throw would send them all remain readable

### Requirement: Flat mat elevation

Nothing at rest SHALL cast a shadow. Depth SHALL come from tonal layering within the fiber and from line weight. The sole exception is a piece held in the grip, or a bean in flight, which SHALL take a single soft contact shadow that vanishes when it settles.

#### Scenario: Static surfaces are flat

- **WHEN** the board, ledger, buttons and turn indicator are at rest
- **THEN** none of them carries a `box-shadow`

#### Scenario: A held piece lifts

- **WHEN** a player picks up a piece
- **THEN** it takes the grip shadow, which is removed the instant the piece settles
