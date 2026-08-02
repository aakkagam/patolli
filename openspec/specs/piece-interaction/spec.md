# piece-interaction Specification

## Purpose
TBD - created by archiving change playable-core. Update Purpose after archive.
## Requirements
### Requirement: Piece identity by shape

Player one's pieces SHALL be Cochineal discs and player two's SHALL be Indigo tiles, so identity is carried by shape first and colour second.

#### Scenario: Identity survives greyscale

- **WHEN** the board is rendered through `grayscale(1)`
- **THEN** the two players' pieces remain distinguishable by shape alone

#### Scenario: Identity survives small sizes

- **WHEN** a piece is rendered at the smallest board scale
- **THEN** disc and tile are still tellable apart

### Requirement: Moving a piece

A player SHALL be able to move a piece either by dragging it or by tapping the piece and then tapping a destination. Every drag interaction SHALL have an equivalent tap-tap path, and touch targets SHALL be at least 44px.

#### Scenario: Drag to move

- **WHEN** a player drags a movable piece onto a legal destination and releases
- **THEN** the move is played

#### Scenario: Tap-tap to move

- **WHEN** a player taps a movable piece and then taps a legal destination
- **THEN** the same move is played

#### Scenario: Held pieces follow the hand

- **WHEN** a piece is held mid-drag
- **THEN** it takes the grip shadow and trails the pointer on a spring, settling flat when released

### Requirement: Legal destinations are shown

When a throw makes moves available, every legal destination SHALL be marked with a maize wash inside a rubber-line ring, plus a ghost of the moving piece's own silhouette. Pieces that can move SHALL be distinguishable from pieces that cannot.

#### Scenario: Targets appear with the throw

- **WHEN** a throw resolves to a score with at least one legal move
- **THEN** each legal destination is marked, and each movable piece is marked as grabbable

#### Scenario: A piece with no move is not offered

- **WHEN** a piece has no legal destination for the current throw
- **THEN** it is not marked grabbable and cannot be picked up

### Requirement: Illegal drops bounce back

Attempting to move a piece to a square that is not a legal destination SHALL return the piece to its origin. No capture affordance SHALL ever be drawn: no red cross, strike-through, or "no entry" glyph.

#### Scenario: Occupied square rejects the piece

- **WHEN** a player drops a piece on a square occupied by any piece
- **THEN** the piece springs back to where it started and no state changes

#### Scenario: Nothing suggests capture

- **WHEN** a piece is dragged over an occupied square
- **THEN** no capture, strike-through or rejection glyph is drawn on the occupant

### Requirement: Direction chosen through the board

On a player's first entry, both possible landing squares SHALL be offered as legal destinations. Choosing one SHALL fix that player's direction of travel for the rest of the game. The choice SHALL be made by acting on the board, not by answering a worded prompt.

#### Scenario: Both directions offered once

- **WHEN** a player enters their first piece
- **THEN** two legal destinations are shown, one for each direction of travel

#### Scenario: The choice fixes the direction

- **WHEN** the player takes one of those two destinations
- **THEN** every later move by that player travels in the chosen direction, and only one destination per piece is offered thereafter

#### Scenario: The two players may differ

- **WHEN** each player has entered their first piece
- **THEN** they may be travelling in the same or opposite directions, according to what each chose

### Requirement: Keyboard and reduced motion

Motion SHALL be spring-based and SHALL degrade under `prefers-reduced-motion` to short fades or instant results. Interactive elements SHALL show a visible focus indicator.

#### Scenario: Reduced motion collapses the springs

- **WHEN** the user prefers reduced motion
- **THEN** piece movement and the bean tumble resolve immediately or with a short fade, and no spring animation runs

#### Scenario: Focus is visible

- **WHEN** an interactive element receives keyboard focus
- **THEN** a visible focus indicator is drawn

