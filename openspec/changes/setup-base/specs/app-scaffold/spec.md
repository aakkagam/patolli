## ADDED Requirements

### Requirement: Build and development toolchain

The project SHALL build with Vite and Svelte 5 in TypeScript, using the current dependency line rather than the pins carried by the sibling repos: Svelte `^5.56`, Vite `^8.1`, `@sveltejs/vite-plugin-svelte` `^7.2`, and Vitest `^4.1`. Source SHALL be organised in three strictly ordered layers: pure framework-free logic in `src/lib/game/`, a runes-based singleton store in `src/lib/store.svelte.ts`, and components in `src/lib/components/`.

#### Scenario: Development server runs

- **WHEN** `npm run dev` is run in a fresh clone after `npm install`
- **THEN** Vite serves the app and the placeholder shell renders

#### Scenario: Production build succeeds

- **WHEN** `npm run build -- --base=/patolli/` is run
- **THEN** a production bundle is written to `dist/` with every asset path rooted at `/patolli/`

#### Scenario: Dependency set is compatible

- **WHEN** dependencies are installed
- **THEN** installation completes with no peer-dependency conflicts, in particular `@sveltejs/vite-plugin-svelte` v7 paired with Vite 8

### Requirement: Linting and formatting

The project SHALL lint with ESLint flat config in `eslint.config.js`, composing `@eslint/js` recommended, `typescript-eslint` recommended, and `eslint-plugin-svelte`'s recommended set, with the Prettier compatibility configs applied last so formatting rules never conflict. Prettier SHALL run with `prettier-plugin-svelte`. `dist/` SHALL be ignored by both.

#### Scenario: Lint command checks code and formatting

- **WHEN** `npm run lint` is run
- **THEN** ESLint checks all source files and Prettier verifies formatting, and the command exits non-zero if either fails

#### Scenario: Svelte files with TypeScript are parsed

- **WHEN** a `.svelte` file using `<script lang="ts">` is linted
- **THEN** it parses without error and Svelte-specific rules are applied to it

#### Scenario: Formatting can be applied

- **WHEN** `npm run format` is run
- **THEN** Prettier rewrites source files to the project's formatting

### Requirement: Type and Svelte diagnostics

The project SHALL provide `npm run check` running `svelte-check` against the project `tsconfig.json`, with TypeScript in strict mode. This SHALL be treated as complementary to linting, not a substitute for it.

#### Scenario: Check passes on a clean tree

- **WHEN** `npm run check` is run against the committed source
- **THEN** it reports no errors

#### Scenario: Type errors are surfaced

- **WHEN** source contains a type error or an invalid Svelte prop usage
- **THEN** `npm run check` reports it and exits non-zero

### Requirement: Test runner

The project SHALL run unit tests with Vitest over the pure logic layer, with a single-run command for CI and a watch command for development. Rules SHALL be testable deterministically, with bean faces injected rather than generated inside the logic layer.

#### Scenario: Tests run once for CI

- **WHEN** `npm test` is run
- **THEN** Vitest executes all test files once and exits with a status reflecting the result

#### Scenario: A single test file can be run

- **WHEN** `npx vitest run src/lib/game/rules.test.ts` is run
- **THEN** only that file's tests execute

### Requirement: Deploy pipeline

The repository SHALL deploy to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`, running `npm ci`, then `npm run lint`, `npm run check`, `npm test`, then `npm run build -- --base=/patolli/`, then publishing `dist/`. A failure at any gate SHALL fail the deploy.

#### Scenario: A lint failure blocks deployment

- **WHEN** a push to `main` contains a lint error
- **THEN** the workflow fails before building and nothing is published

#### Scenario: A passing push deploys

- **WHEN** a push to `main` passes lint, check, and tests
- **THEN** the built site is published to GitHub Pages at base `/patolli/`

### Requirement: Hand-authored SEO document

`index.html` SHALL be hand-authored and SHALL carry its own title, meta description, canonical link, hreflang alternates, OG and Twitter tags, a `VideoGame` JSON-LD block, and crawlable prose describing the game below the app mount point. It SHALL also include the service-worker registration block copied from the sibling repos, registering `/sw.js` at scope `/`.

#### Scenario: Document carries its own metadata

- **WHEN** the built `index.html` is inspected
- **THEN** it contains the title, canonical URL `https://games.aakkagam.com/patolli/`, OG and Twitter tags, and the `VideoGame` JSON-LD

#### Scenario: Crawlable prose survives the build

- **WHEN** the production build runs
- **THEN** the descriptive prose below the mount point is present in the emitted HTML

#### Scenario: Service worker registration is present and fails safe

- **WHEN** the page loads in an environment with no `/sw.js`, such as the dev server
- **THEN** registration is attempted, rejects harmlessly, and the page continues to work

### Requirement: Placeholder application shell

The app SHALL mount a placeholder shell that loads the styles foundation and confirms the build works end to end. It SHALL NOT present a playable board; the playable game is a later change.

#### Scenario: Shell mounts

- **WHEN** the app loads
- **THEN** a placeholder shell renders in the mount point without console errors

#### Scenario: No playable board is present

- **WHEN** the placeholder shell is displayed
- **THEN** no board, pieces, or throw controls are rendered

### Requirement: Styles foundation

The project SHALL split styles into a design-token layer and a base layer under `src/styles/`. Because no `DESIGN.md` exists yet, token values SHALL be neutral placeholders, explicitly marked as provisional, so that no visual identity is invented in this change.

#### Scenario: Token layer exists and is provisional

- **WHEN** the styles foundation is inspected
- **THEN** tokens are defined as CSS custom properties and marked as placeholders pending the identity change

#### Scenario: Styles load in the shell

- **WHEN** the placeholder shell renders
- **THEN** the token and base stylesheets are applied
