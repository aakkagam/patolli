## ADDED Requirements

### Requirement: The landing page links to the game

The Aakkagam Games landing page SHALL carry a card for Patolli alongside the other games, following the pattern the existing cards establish rather than introducing a new treatment.

#### Scenario: A visitor can reach the game from the domain root

- **WHEN** a visitor loads `https://games.aakkagam.com/`
- **THEN** a Patolli card is present and links to `https://games.aakkagam.com/patolli/`

#### Scenario: The card matches its siblings

- **WHEN** the landing page markup is inspected
- **THEN** the Patolli card uses the same structure and classes as the existing game cards, with no bespoke styling added for it

### Requirement: Structured data

The landing page's inline JSON-LD `@graph` SHALL include a `VideoGame` node for Patolli, consistent with the nodes already present for the other games and with the node the game's own page declares.

#### Scenario: The graph parses

- **WHEN** the landing page's JSON-LD block is parsed
- **THEN** it is valid JSON and contains a `VideoGame` node whose URL is the game's own

#### Scenario: It agrees with the game's own page

- **WHEN** the landing node and the node in the game's `index.html` are compared
- **THEN** the name, URL and image agree, so the two do not describe the same game differently

### Requirement: Crawler and agent indexes

Patolli SHALL be listed in `sitemap.xml` and in `llms.txt`, so both search crawlers and agent readers find it through the site's own indexes rather than only by following links.

#### Scenario: Sitemap entry

- **WHEN** `sitemap.xml` is fetched
- **THEN** it contains a `<url>` entry for the game, in the same form as the entries for the other games

#### Scenario: Agent index entry

- **WHEN** `llms.txt` is fetched
- **THEN** it describes Patolli alongside the other games, naming the 60-square no-capture ruleset rather than the popular 52-square variant

### Requirement: Installable shortcut

The site manifest SHALL offer Patolli as a shortcut, so the installed progressive web app can launch straight into it as it can for the other games.

#### Scenario: Manifest lists the game

- **WHEN** `manifest.webmanifest` is parsed
- **THEN** it is valid JSON and its `shortcuts` array contains an entry for Patolli pointing at the game's URL

### Requirement: The launch path works end to end

Publishing SHALL be verified along the path a real visitor takes, not only by inspecting the files changed.

#### Scenario: Landing to game

- **WHEN** a visitor follows the Patolli card from the landing page
- **THEN** the game loads and is playable

#### Scenario: Offline after a first visit

- **WHEN** a visitor has loaded the game once and then goes offline
- **THEN** the game still loads, served by the shared service worker at the origin root

#### Scenario: Shared card resolves

- **WHEN** the game's URL is shared and its OG image is fetched at the absolute URL declared
- **THEN** the image resolves and is the game's own card
