## ADDED Requirements

### Requirement: Throwing the beans

The player to act SHALL throw five beans. The beans SHALL tumble and settle, and the result SHALL always resolve to a large tabular numeral, shown as the beans land rather than withheld until the animation finishes. The score SHALL never have to be counted off the bean faces.

#### Scenario: The numeral is the fact

- **WHEN** a throw resolves
- **THEN** the score is shown as a numeral, regardless of whether the tumble animation has finished

#### Scenario: Ten is two digits

- **WHEN** all five marked faces show
- **THEN** the numeral reads 10 without shifting the layout, because tabular figures are used

#### Scenario: Reduced motion skips the tumble

- **WHEN** the user prefers reduced motion
- **THEN** the numeral appears at once with a short fade and no tumble

### Requirement: Turn outcomes are shown

The interface SHALL make each turn outcome visible: an extra turn from a rounded square, a turn ending on a no-score throw, and the pot penalty paid when no piece can move. Copy SHALL name what the player may do now rather than narrating what happened.

#### Scenario: Extra turn

- **WHEN** a piece lands on a rounded end square
- **THEN** the interface shows that the same player throws again

#### Scenario: No score ends the turn

- **WHEN** a throw shows no marked face
- **THEN** the score reads zero and the turn passes, with no failure sound, shake or red

#### Scenario: No legal move pays the pot

- **WHEN** a throw leaves the player with no legal move
- **THEN** the interface shows the penalty going into the pot and the turn passing

### Requirement: Turn indicator

A turn indicator SHALL name whose move it is, prefixed by that player's own piece silhouette at text size, so it reads by shape and colour together rather than by a coloured dot alone.

#### Scenario: The active player is identified by shape

- **WHEN** it is a player's turn
- **THEN** the indicator carries that player's disc or tile silhouette alongside the text

#### Scenario: It says what to do next

- **WHEN** a player must throw to continue
- **THEN** the indicator names that action rather than describing the previous turn

### Requirement: Pot ledger

The pot, each player's counters, and the agreed penalty SHALL be readable at a glance without a tap, rendered as ruled account-book lines in Ulli with tabular numerals. Values SHALL change by direct replacement, never by count-up animation, and SHALL never be drawn as chips, coins, badges or currency.

#### Scenario: The ledger is always readable

- **WHEN** the game is in play
- **THEN** both players' counters, the pot and the penalty are visible without opening anything

#### Scenario: A payment is recorded, not celebrated

- **WHEN** a wedge square charges a double penalty
- **THEN** the ledger values change directly, with no animation, glow or coin

#### Scenario: The ledger has no container

- **WHEN** the ledger is rendered
- **THEN** it is ruled onto the mat with no panel, card or background box

### Requirement: Stake and penalty setup

Before play, the players SHALL agree a stake and a penalty amount through a stepper control. The stepper SHALL clamp to its bounds rather than accept free text, so there is no invalid state to validate.

#### Scenario: Stake is chosen before play

- **WHEN** a new game is started
- **THEN** the stake and penalty can be set, and both players' counters and the pot reflect them once play begins

#### Scenario: The stepper clamps

- **WHEN** a player tries to step beyond a bound
- **THEN** the value holds at the bound and the control shows it is disabled there

### Requirement: Winning and starting again

When a player bears off their sixth piece, the interface SHALL announce the win and show the pot transferring to them, and SHALL offer a new game. After a win, no further throw or move SHALL be accepted.

#### Scenario: The win is announced

- **WHEN** a player bears off their last piece
- **THEN** a win banner names the winner and the pot is shown as theirs

#### Scenario: The board freezes

- **WHEN** the game has been won
- **THEN** throwing and moving are no longer possible

#### Scenario: A new game can be started

- **WHEN** the win banner is shown
- **THEN** a new game can be started, which clears the saved game and returns to stake setup

### Requirement: Resuming an unfinished game

An unfinished game SHALL resume from its saved state when the page is reloaded, restoring positions, turn, directions, counters and pot. A finished game SHALL NOT resume.

#### Scenario: Refresh mid-game

- **WHEN** the page is reloaded during a game
- **THEN** play resumes at exactly the saved position, turn and counters

#### Scenario: Refresh after a win

- **WHEN** the page is reloaded after a game has been won
- **THEN** the app does not resume that decided game
