## 1. Asset generation

- [x] 1.1 Add `scripts/render-assets.mjs` that imports `src/lib/geometry.ts` and the design tokens, so the assets derive from the board rather than reproducing its layout
- [x] 1.2 Render the social card: the cross on the mat, rubber line, wedge marks, entry pinwheel, and counters of both players so disc and tile both read
- [x] 1.3 Write it to `public/og.png` at exactly 1200×630, matching the `og:image:width` and `og:image:height` already declared in `index.html`
- [x] 1.4 Render `public/icon.svg` as the simplified cross, not the full sixty-square board, which turns to mush at favicon size
- [x] 1.5 Confirm the script is deterministic: run it twice on an unchanged tree and verify no diff
- [x] 1.6 Add an npm script so regenerating is a command rather than a remembered incantation, and note it in `CLAUDE.md`

## 2. Asset verification

- [x] 2.1 Check the card scaled down to roughly the size a social preview shows, not only at full resolution; prefer fewer, larger counters if it muddies
- [x] 2.2 Render the icon at 32×32 and confirm the cross still reads
- [x] 2.3 Check the icon against both a light and a dark browser tab bar, and give it its own ground if it disappears against one
- [x] 2.4 Confirm every colour used is one of the five dye roles from `DESIGN.md`, with none invented for the assets
- [x] 2.5 Run `npm run lint`, `npm run check` and `npm test`; the existing 83 tests must pass untouched

## 3. Ship the assets first

- [ ] 3.1 Build, push, and confirm the deploy succeeds
- [ ] 3.2 Verify `https://games.aakkagam.com/patolli/og.png` and `/patolli/icon.svg` both resolve, so the landing page links to a game whose card is already real

## 4. Landing repo: the game card

- [ ] 4.1 Read the three existing game cards in `../aakkagam.github.io/index.html` and follow their structure and classes exactly, adding nothing bespoke
- [ ] 4.2 Add the Patolli card linking to `https://games.aakkagam.com/patolli/`, describing the 60-square no-capture game rather than the popular 52-square variant

## 5. Landing repo: structured data and indexes

- [ ] 5.1 Add the `VideoGame` node to the inline JSON-LD `@graph`, matching the name, URL and image in the game's own `index.html` so the two do not describe it differently
- [ ] 5.2 Extract and parse the JSON-LD block as JSON to prove it is still valid; that repo has no CI to catch a typo
- [ ] 5.3 Add the `<url>` entry to `sitemap.xml` in the same form as the other games
- [ ] 5.4 Add the Patolli bullet to `llms.txt`
- [ ] 5.5 Add the shortcut to the `shortcuts` array in `manifest.webmanifest`, then parse the whole file as JSON — a trailing comma here breaks the installed app for every existing user, not just this game
- [ ] 5.6 Confirm the other three games' shortcuts still parse and are unchanged

## 6. Landing repo: publish

- [ ] 6.1 Do not touch `sw.js`: the existing caching strategies already cover a new game, and `VERSION` only exists to discard caches when their layout changes
- [ ] 6.2 Commit and push the landing repo, which deploys straight from the branch with nothing checking it first

## 7. End-to-end verification

- [ ] 7.1 Load `https://games.aakkagam.com/` and confirm the Patolli card is present and links correctly
- [ ] 7.2 Follow the card and confirm the game loads and is playable
- [ ] 7.3 Fetch the deployed `sitemap.xml`, `llms.txt` and `manifest.webmanifest` and confirm each carries the new entry
- [ ] 7.4 Parse the deployed landing page's JSON-LD and confirm the Patolli node is present and agrees with the game's own node
- [ ] 7.5 Fetch the OG image at the absolute URL declared in the game's head and confirm it resolves
- [ ] 7.6 Load the game once, then go offline and reload, confirming the shared service worker still serves it
