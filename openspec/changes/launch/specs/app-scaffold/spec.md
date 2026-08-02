## MODIFIED Requirements

### Requirement: Hand-authored SEO document

`index.html` SHALL be hand-authored and SHALL carry its own title, meta description, canonical link, hreflang alternates, OG and Twitter tags, a `VideoGame` JSON-LD block, and crawlable prose describing the game below the app mount point. It SHALL also include the service-worker registration block copied from the sibling repos, registering `/sw.js` at scope `/`.

The OG and icon assets it references by absolute URL SHALL resolve at those URLs and SHALL be the game's own artwork, not placeholders left from scaffolding. An absolute URL that 404s is invisible in local development, because nothing on the page loads it, and only shows up when the page is shared.

#### Scenario: Document carries its own metadata

- **WHEN** the built `index.html` is inspected
- **THEN** it contains the title, canonical URL `https://games.aakkagam.com/patolli/`, OG and Twitter tags, and the `VideoGame` JSON-LD

#### Scenario: Crawlable prose survives the build

- **WHEN** the production build runs
- **THEN** the descriptive prose below the mount point is present in the emitted HTML

#### Scenario: Service worker registration is present and fails safe

- **WHEN** the page loads in an environment with no `/sw.js`, such as the dev server
- **THEN** registration is attempted, rejects harmlessly, and the page continues to work

#### Scenario: Referenced assets resolve

- **WHEN** every absolute asset URL declared in the head is requested against the deployed site
- **THEN** each returns the asset rather than a 404
