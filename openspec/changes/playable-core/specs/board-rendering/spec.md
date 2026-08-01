## ADDED Requirements

### Requirement: Board geometry

The board SHALL be drawn as an axis-aligned cross: four arms of 2 files by 7 ranks around a central 2x2, 60 cells in all. Positions SHALL be computed in `src/lib/geometry.ts` in abstract viewBox units, never pixels, and SHALL map from the engine's cyclic track index rather than duplicating the track's construction.

#### Scenario: Every track index has exactly one cell

- **WHEN** the geometry is asked for the position of each of the 60 track indices
- **THEN** it returns 60 distinct positions, one per index, with no gaps or duplicates

#### Scenario: Adjacent track indices are adjacent on screen

- **WHEN** two indices are consecutive on the cycle
- **THEN** their cells share an edge, including across the U-turn at an arm tip and across a central square

#### Scenario: Geometry is expressed in viewBox units

- **WHEN** the geometry module is inspected
- **THEN** no position is expressed in pixels, and the board scales by viewBox alone

### Requirement: The mat is the page

The Mat SHALL fill the viewport, with the board drawn as a deeper region of the same fiber (Mat Woven). The board SHALL NOT be placed inside a card, panel, container or frame, and SHALL have no border, radius or shadow separating it from the ground.

#### Scenario: No frame around the board

- **WHEN** the board is rendered
- **THEN** it has no container element with a border, background box, radius or shadow distinguishing it from the mat

#### Scenario: Chrome sits on the fiber

- **WHEN** the turn indicator, throw result and pot ledger are rendered
- **THEN** each sits directly on the mat rather than inside a panel

### Requirement: Hand-drawn line

Every line SHALL be drawn in Ulli at a hairline weight with slight path irregularity, so no two strokes are identical and the interface reads as made by one hand with one pot of rubber.

#### Scenario: Strokes are not machine-uniform

- **WHEN** the board's lines are inspected
- **THEN** they carry sub-pixel path variation rather than a single uniform stroke

### Requirement: Special squares are structural

The eight rounded end squares SHALL be marked by curving the cell's own outline. The eight wedge squares SHALL be marked by a wedge biting into the penalised square only, never straddling the boundary between two squares. The four entry squares and four central squares SHALL be drawn so a player can trace their own loop.

#### Scenario: Rounded squares curve their own outline

- **WHEN** a rounded end square is rendered
- **THEN** its own outline is curved, rather than an overlay badge being placed on top of it

#### Scenario: The wedge points at the square that charges

- **WHEN** a wedge square is rendered
- **THEN** the wedge lies within that square alone, so the art does not imply its neighbour also costs double

#### Scenario: The entry pinwheel is legible

- **WHEN** the centre of the board is rendered
- **THEN** the entry square of each arm is distinguishable, so a player can follow their own circuit by eye

### Requirement: Responsive board

The board SHALL remain fully visible and playable on a phone in portrait, a tablet, and a laptop, without horizontal scrolling and without any cell falling below the touch-target floor.

#### Scenario: Portrait phone

- **WHEN** the game is viewed on a 360px-wide viewport
- **THEN** the whole board is visible without horizontal scrolling and every cell remains tappable

#### Scenario: Large viewport

- **WHEN** the game is viewed on a laptop
- **THEN** the mat still fills the viewport and the board scales with it rather than sitting in a fixed-width column
