## ADDED Requirements

### Requirement: Assets are generated from the board

The social card and icon SHALL be generated from the same geometry the game renders, reusing `src/lib/geometry.ts` rather than reproducing the board's layout independently. Generation SHALL be a repeatable command, and the command SHALL be recorded so regenerating after a visual change does not depend on anyone remembering how the files were made.

#### Scenario: Regeneration is repeatable

- **WHEN** the generation command is run twice without any source change
- **THEN** it produces byte-identical output both times

#### Scenario: Assets follow the board

- **WHEN** the board's geometry changes
- **THEN** regenerating produces assets that match the new geometry, with no hand-editing step

#### Scenario: Colours come from the design tokens

- **WHEN** the generated assets are inspected
- **THEN** every colour used is one of the five dye roles defined in `DESIGN.md`, and none is invented for the assets

### Requirement: Social card

`public/og.png` SHALL be a 1200×630 image depicting the game: the cross of sixty squares on the mat, drawn in the rubber line, carrying its wedge marks and entry pinwheel, with counters of both players present so the two shapes read. It SHALL NOT be a placeholder.

#### Scenario: Dimensions match the declared metadata

- **WHEN** the file is inspected
- **THEN** it is exactly 1200×630, matching the `og:image:width` and `og:image:height` already declared in `index.html`

#### Scenario: Both players are represented

- **WHEN** the card is viewed
- **THEN** at least one disc and one tile are visible, so player identity reads by shape

#### Scenario: The card resolves where it is claimed

- **WHEN** the absolute URL declared in the OG and Twitter tags is requested
- **THEN** it returns the image rather than a 404

### Requirement: Icon

`public/icon.svg` SHALL depict the cross and SHALL remain legible at favicon size, where sixty individually drawn squares would collapse into an unreadable smudge. The icon SHALL therefore simplify its composition rather than render the whole board.

#### Scenario: Legible at 32px

- **WHEN** the icon is rendered at 32×32
- **THEN** the cross is still recognisable as a cross, with no detail so fine it disappears

#### Scenario: Reads on both light and dark browser chrome

- **WHEN** the icon is shown against a light tab bar and against a dark one
- **THEN** it remains visible in both, rather than relying on the page's own mat colour behind it

#### Scenario: Not a placeholder

- **WHEN** the icon is inspected
- **THEN** it depicts the game rather than a generic mark left over from scaffolding
