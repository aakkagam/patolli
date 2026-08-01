## ADDED Requirements

### Requirement: Application shell

The app SHALL mount the playable game: the board, pieces, bean throw, turn flow and pot ledger, wired to the pure rules engine through the store. The hand-authored SEO head and the crawlable prose below the mount point SHALL be preserved unchanged.

#### Scenario: The game mounts

- **WHEN** the app loads
- **THEN** the playable board renders in the mount point without console errors

#### Scenario: A game can be played to a win

- **WHEN** two players throw and move through a full game
- **THEN** the game can be completed, a winner declared, and a new game started

#### Scenario: Indexed content is preserved

- **WHEN** the built page is inspected
- **THEN** the title, canonical link, OG and Twitter tags, `VideoGame` JSON-LD, service-worker registration and crawlable prose are all still present

## MODIFIED Requirements

### Requirement: Styles foundation

The project SHALL split styles into a design-token layer and a base layer under `src/styles/`. Token values SHALL be the real palette and type scale defined in `DESIGN.md`, expressed as CSS custom properties. No provisional placeholder values SHALL remain, and no dark theme SHALL ship.

#### Scenario: Tokens carry the real identity

- **WHEN** the styles foundation is inspected
- **THEN** the token layer defines the colours and type scale from `DESIGN.md`, with no value marked provisional

#### Scenario: Styles load in the game

- **WHEN** the game renders
- **THEN** the token and base stylesheets are applied

#### Scenario: No dark theme ships

- **WHEN** the stylesheets are inspected
- **THEN** they contain no `prefers-color-scheme: dark` block

## REMOVED Requirements

### Requirement: Placeholder application shell

**Reason**: The placeholder existed only to prove the build worked end to end before there was a game. It required that no board, pieces or throw controls be rendered, which is precisely what this change adds, so the requirement cannot be modified into the new one — it is superseded.

**Migration**: Replaced by the "Application shell" requirement added in this change, which mounts the playable game while preserving the SEO head and crawlable prose the placeholder also carried.
