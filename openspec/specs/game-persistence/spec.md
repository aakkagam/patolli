# Spec: game-persistence

## Purpose

Serialization and restore of a full in-progress game to localStorage, surviving page refresh.

## Requirements

### Requirement: Serializable game state

`GameState` SHALL be plain, JSON-serializable data containing everything needed to resume a game: piece positions and pieces in hand, borne-off counts, whose turn it is, each player's chosen direction, the pending throw if any, counter balances, the pot, the agreed stake and penalty, and the win state. It SHALL contain no functions, class instances, or framework objects.

#### Scenario: State round-trips through JSON

- **WHEN** any reachable game state is serialized to JSON and parsed back
- **THEN** the result is deeply equal to the original state

#### Scenario: State carries the whole game

- **WHEN** a state is restored mid-game
- **THEN** piece positions, pieces in hand, borne-off counts, turn, directions, counters, pot, stake, and penalty are all recovered

### Requirement: Persist to localStorage

The system SHALL write the current game state to localStorage under a versioned key as the game progresses, so an in-progress game survives a page refresh or a closed tab.

#### Scenario: Progress is saved

- **WHEN** a move completes and the state changes
- **THEN** the new state is written to localStorage

#### Scenario: Storage failures never break play

- **WHEN** localStorage is unavailable or a write throws, as in private browsing
- **THEN** the failure is swallowed and play continues without persistence

### Requirement: Restore on load

The system SHALL restore a saved in-progress game on load. A saved state that is absent, unparseable, or written under a different schema version SHALL be discarded in favour of a fresh game rather than partially applied.

#### Scenario: Unfinished game resumes

- **WHEN** the page is reloaded with a saved unfinished game
- **THEN** play resumes from exactly the saved position, turn, and counters

#### Scenario: Corrupt saved state is discarded

- **WHEN** the stored value is missing, malformed, or fails validation
- **THEN** it is discarded and a fresh game begins

#### Scenario: Version mismatch is discarded

- **WHEN** the stored state carries a schema version the current build does not accept
- **THEN** it is discarded and a fresh game begins

#### Scenario: Impossible board positions are discarded

Validation SHALL be strict enough that anything it accepts can be drawn and
played. Type tags alone are insufficient, since a non-integer or out-of-range
position is valid JSON.

- **WHEN** a stored piece carries a position that is not a whole number, or lies outside the playable range, or two pieces occupy the same board square, or a piece is on the track while its owner has no direction
- **THEN** the state is discarded and a fresh game begins

### Requirement: Clear on completion

A completed game SHALL NOT be restored as if it were in progress. Once a game is won, the saved in-progress state SHALL be cleared or marked finished so that a reload does not resume a decided game.

#### Scenario: Finished game does not resume

- **WHEN** a game has been won and the page is reloaded
- **THEN** the app does not resume mid-play from that finished game
