## Context

The game is deployed and playable, verified end to end on production. What is missing is everything around it: nothing links to it, and the assets it advertises are the placeholders written during scaffolding.

The two halves of this change are unlike each other. Asset generation is ordinary work inside a repo with lint, types, tests and CI. Landing-page integration is five edits in `aakkagam.github.io`, a **separate git repository with no CI at all**, which deploys straight from its branch. Nothing there is checked before it is live, so the care has to come from the change itself rather than from a pipeline.

The three sibling games have already been through this, so the pattern to follow exists and is visible in that repo. Deviating from it would be the mistake.

## Goals / Non-Goals

**Goals:**

- Patolli reachable from the domain root, from the sitemap, from `llms.txt` and from the installed app's shortcuts.
- A social card and icon generated from the real board, with a repeatable command to remake them.
- The launch path verified as a visitor experiences it, including offline and a shared link.

**Non-Goals:**

- Teaching. The blocking-squeeze legibility work and the three surprising rules are the next change and are deliberately untouched here.
- Any change to gameplay, rules or the store.
- Redesigning the landing page. Patolli takes its place among the existing cards without altering them.
- Announcement anywhere outside the site.

## Decisions

### Generate the assets from the board rather than drawing them

Both assets are produced by a script that imports `geometry.ts` and walks the same 60 cells the game renders, filling from the same design tokens.

The alternative, hand-drawn artwork, buys more compositional control and costs a second source of truth: an artifact that looks like the board today and silently stops looking like it after any geometry or palette change. Since the board is already a pure function of code, deriving the picture from it makes drift structurally impossible rather than a thing to remember.

It also means the card can never contradict the game the way the placeholder did, where the OG alt text and the image disagreed about whether the board was a cross or a saltire.

*Trade-off accepted:* a rendered board is a less considered image than something composed by hand. The mitigation is that composition is still a choice within the script — which counters to place, how much of the board to show, how much margin — so this is not simply a screenshot.

### The icon is not the card at a smaller size

Sixty squares at 32×32 is roughly five pixels per square: the board turns to grey mush and the tab shows a smudge. The icon therefore simplifies to the cross itself, keeping the silhouette and dropping the grid, while the card keeps the full board.

This is a deliberate divergence between the two assets and is specced as such, because "generate both from the board" would otherwise be read as "render the same thing twice".

### Commit a script, not just its output

Binary assets committed without provenance are the kind of thing nobody dares regenerate later because it is unclear how they were made. The script goes in `scripts/`, and the assets are its committed output.

The script writes deterministic output so rerunning it on an unchanged tree produces no diff. That makes it safe to run speculatively, which is what stops it rotting.

### The landing repo is the risky half, so verify against the deployed site

`aakkagam.github.io` has no build, no tests and no CI. Its `index.html` carries inline JSON-LD that a typo turns into invalid structured data, and `manifest.webmanifest` is JSON that a trailing comma breaks for every installed user.

So both files are parsed as JSON after editing rather than eyeballed, and the acceptance checks run against the deployed URLs rather than the working copy. The specs are written as end-to-end scenarios for exactly this reason.

### Leave the service worker alone

Adding a game does not require touching `sw.js`. Navigations are network-first, `/assets/*` is cache-first and content-hashed, and everything else is stale-while-revalidate, so a new game's files are covered by the existing strategies. The `VERSION` constant exists to discard caches when their *layout* changes, which this does not.

Recorded because bumping it looks like diligence and would in fact throw away every visitor's cache for no benefit.

## Risks / Trade-offs

- **An edit to the landing repo is live the moment it is pushed, with nothing to catch a mistake** → Parse both JSON payloads locally before pushing, and verify against the deployed URLs afterwards rather than trusting the diff.
- **A malformed `manifest.webmanifest` breaks the installed PWA for every existing user, not just Patolli** → It is the highest-blast-radius file in the change; validate it as JSON and check the other three games' shortcuts still parse.
- **The rendered card may be illegible at the size social platforms actually show it** → Check it scaled down, not just at 1200×630, and prefer fewer, larger counters over a faithful full board.
- **The generated icon may vanish against dark browser chrome**, since the mat colour is light and the icon has no background of its own → Check against both light and dark tab bars, and give the icon its own ground if it needs one.
- **Regenerating assets after a later palette change is a step someone must remember** → The deterministic script makes it a one-command check that produces no diff when nothing has changed, so it can be run without thinking about it.
- **Two repos must agree about the game's name, URL and image** → The structured-data scenario compares the landing node against the game's own node rather than checking each in isolation.

## Migration Plan

Additive in both repos, and independently revertable. The asset change is a normal commit through CI. The landing change is four file edits that can be reverted by a single revert commit if anything is wrong; because that repo deploys from the branch, the revert is also the rollback.

Order matters slightly: ship the assets first, so that by the time the landing page links to Patolli the OG image it points at is already the real one.

## Open Questions

- Whether the card should show a board mid-game, with counters spread as if play were underway, or a near-empty board that reads more cleanly at small sizes.
- Whether `llms.txt` should describe the ruleset difference (60 squares, no capture) at length or in a single clause, given its other entries are brief.
