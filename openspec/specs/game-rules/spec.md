# Spec: game-rules

## Purpose

The pure, framework-free Patolli rule engine — track construction, beans, entry, direction, movement and blocking, forced moves, wedge and rounded squares, bearing off, the pot and penalties, win.

## Requirements

### Requirement: Track construction

The system SHALL model the board as a single cyclic track of 60 squares, indexed 0..59, derived from the saltire geometry: four arms of 2 files × 7 ranks (14 squares each) plus a shared central 2×2 (4 squares). Traversal of one quadrant SHALL run from that arm's entry square outward along one file to the rounded tip, across to the other file, back inward, then through exactly one central square into the next arm — 15 squares per quadrant.

#### Scenario: Track is a complete cycle

- **WHEN** the track is constructed
- **THEN** it contains exactly 60 distinct squares, each visited exactly once per circuit, and index 59 is adjacent to index 0

#### Scenario: Quadrant structure holds

- **WHEN** the track is walked from any arm's entry square
- **THEN** the next 14 squares lie in that arm and the 15th is a central square, and each of the 4 central squares is used exactly once per circuit

#### Scenario: Opposed players start half a circuit apart

- **WHEN** two players take arms opposite each other
- **THEN** their entry squares are exactly 30 indices apart on the cycle

### Requirement: Bean throws

The system SHALL score a throw of five two-sided beans as one point per marked face showing, except that five marked faces score 10 and zero marked faces score nothing. Scoring SHALL be a pure function of the bean faces supplied to it, with no internal randomness.

#### Scenario: Ordinary scores

- **WHEN** 1, 2, 3, or 4 marked faces show
- **THEN** the score is that number of points

#### Scenario: All five marked

- **WHEN** all five beans show their marked face
- **THEN** the score is 10

#### Scenario: No marked face ends the turn

- **WHEN** no bean shows its marked face
- **THEN** the score is zero and the turn ends immediately without a move

#### Scenario: Throw distribution matches the source

- **WHEN** all 32 equally likely bean combinations are enumerated
- **THEN** scores of 2 and 3 each occur 10 times, 1 and 4 each occur 5 times, and 10 and the no-score each occur once

### Requirement: Opening throw

The system SHALL determine the starting player by having both players throw, with the highest score starting. The starting player SHALL then throw again to begin their first turn.

#### Scenario: Highest throw starts

- **WHEN** both players have thrown and the scores differ
- **THEN** the player with the higher score takes the first turn

#### Scenario: Tied opening throws

- **WHEN** both players throw the same score
- **THEN** the opening throw is repeated until the scores differ

### Requirement: Piece entry

Each player SHALL begin with six pieces in hand and an empty board. A player's first piece SHALL enter from that player's own entry square, treated as track index 0, and land at the index equal to the throw. Once a player has any piece on the board, further pieces SHALL enter only on a throw of 1, and such a throw SHALL NOT compel entry — the player may instead move a piece already in play.

#### Scenario: First entry uses the throw

- **WHEN** a player with no pieces on the board throws 3
- **THEN** a piece enters and comes to rest 3 squares along the track from that player's entry square

#### Scenario: Later entries require a 1

- **WHEN** a player with at least one piece on the board throws a score other than 1
- **THEN** no piece may enter from hand on that turn

#### Scenario: Entry on a 1 is optional

- **WHEN** a player with at least one piece on the board and at least one piece in hand throws 1
- **THEN** entering a new piece and moving a piece already in play are both legal choices

### Requirement: Direction of travel

Each player SHALL choose clockwise or anticlockwise travel at their first entry and SHALL keep that direction for the whole game. The choice SHALL be per player, so the two players may travel in the same or opposite directions.

#### Scenario: Direction is fixed at first entry

- **WHEN** a player has chosen a direction and later moves any piece
- **THEN** that piece advances along the track in the player's chosen direction

#### Scenario: Players may oppose each other

- **WHEN** one player chooses clockwise and the other anticlockwise
- **THEN** both choices are legal and each player's pieces travel in their own direction

### Requirement: Movement and blocking

The system SHALL move exactly one piece per throw, by the number of squares scored, in that piece's owner's direction. A piece SHALL NOT land on an occupied square, whether the occupant belongs to the opponent or to the mover. There SHALL be no capture: an occupied square is simply not a legal destination.

#### Scenario: Occupied destination is illegal

- **WHEN** a move by the thrown score would land a piece on a square holding any piece
- **THEN** that move is illegal and the piece must remain where it is

#### Scenario: Pieces are never captured

- **WHEN** any legal move is played
- **THEN** no piece is removed from the board, sent back to hand, or displaced

#### Scenario: Passing over occupied squares is allowed

- **WHEN** a piece's path crosses occupied squares but its destination square is empty
- **THEN** the move is legal

### Requirement: Forced moves

If any legal move exists, the player SHALL take one, even when every available move is disadvantageous. If no piece can be moved by the throw, the player SHALL pay the agreed penalty into the pot and the turn SHALL end.

#### Scenario: A legal move must be played

- **WHEN** at least one legal move exists for the thrown score
- **THEN** the turn cannot be passed and one of those moves must be played

#### Scenario: No legal move pays into the pot

- **WHEN** no piece can legally move by the thrown score
- **THEN** the player pays the agreed penalty into the pot and the turn ends

### Requirement: Wedge squares

The system SHALL mark eight squares as wedge-reduced: the 3rd rank from the tip in each file of each arm, one per file per arm. A piece landing on such a square SHALL cause its owner to pay double the agreed penalty to the opponent.

#### Scenario: Landing on a wedge square costs double

- **WHEN** a piece comes to rest on a wedge-reduced square
- **THEN** its owner pays twice the agreed penalty to the opponent

#### Scenario: Wedge squares are eight in number

- **WHEN** the board is constructed
- **THEN** exactly 8 squares are wedge-reduced, two in each of the four arms

#### Scenario: Passing over a wedge square is free

- **WHEN** a piece's path crosses a wedge-reduced square without stopping on it
- **THEN** no penalty is paid

### Requirement: Rounded squares

The system SHALL mark eight squares as rounded: the outermost rank of each arm, both files. A piece landing on such a square SHALL grant its owner another turn.

#### Scenario: Landing on a rounded square grants another turn

- **WHEN** a piece comes to rest on a rounded square
- **THEN** the same player throws again

#### Scenario: Rounded squares are eight in number

- **WHEN** the board is constructed
- **THEN** exactly 8 squares are rounded, two at the tip of each of the four arms

### Requirement: Bearing off

After a complete circuit, a piece SHALL bear off by landing exactly on the last square — index 59 measured from its owner's entry square, in its owner's direction. A move that would carry a piece past that square SHALL be illegal. Bearing a piece off SHALL collect the agreed penalty from the opponent.

#### Scenario: Exact throw bears a piece off

- **WHEN** a piece stands at index 55 and its owner throws 4
- **THEN** the piece bears off and its owner collects the agreed penalty from the opponent

#### Scenario: Overshooting is illegal

- **WHEN** a piece stands at index 57 and its owner throws 4
- **THEN** that move is illegal, because it would carry the piece past index 59

#### Scenario: Borne-off pieces leave play

- **WHEN** a piece has borne off
- **THEN** it occupies no square, cannot be moved again, and does not block any square

### Requirement: Pot and penalties

Each player SHALL stake an agreed number of counters into the pot at the start, with an agreed penalty amount fixed at the same time. Penalties SHALL be paid only up to the counters a player actually holds: a balance SHALL never fall below zero, and any shortfall SHALL be forgiven rather than carried as debt.

#### Scenario: Stakes open the pot

- **WHEN** a game begins with an agreed stake
- **THEN** each player's counters are reduced by that stake and the pot holds the sum of both stakes

#### Scenario: Penalty is capped at the payer's holdings

- **WHEN** a player holding 1 counter owes a double penalty of 4
- **THEN** the player pays 1 counter, their balance becomes 0, and the remaining 3 are forgiven

#### Scenario: A player with nothing pays nothing

- **WHEN** a player holding 0 counters owes any penalty
- **THEN** no counters move and play continues

### Requirement: Winning

The first player to bear off all six of their pieces SHALL win the game and take the contents of the pot.

#### Scenario: Bearing off the last piece wins

- **WHEN** a player bears off their sixth piece
- **THEN** that player is the winner, the pot is transferred to them, and the game is over

#### Scenario: No moves are legal after a win

- **WHEN** the game has been won
- **THEN** no further throw or move is accepted
