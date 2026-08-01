# Product

## Register

product

## Users

Two people sharing one device (a phone passed between hands, a tablet or laptop set between them) at home, in a cafe, or while travelling. Casual, spontaneous, no accounts and no network. A race game with real luck swings, so a round runs roughly 10 to 20 minutes.

Almost nobody arriving here has played Patolli, and the little they think they know is probably wrong: the popular 52-square version with captures is a different game from the one this implements. Three rules surprise every new player and all three must be learnable from the board itself, never from a rules modal:

- You can never land on an occupied square, yours or theirs. Nothing is ever captured.
- After your first piece is on the board, another only enters on a throw of 1.
- A piece leaves only by exact throw onto the last square. Overshooting is simply not a legal move.

## Product Purpose

A 2-player local-hotseat implementation of Patolli, the Mesoamerican cross-board race game: 60 squares in a saltire, six pieces a side, moves thrown with five marked beans, an agreed pot of counters riding on the result. Rules follow R. C. Bell's reconstruction exactly (see CLAUDE.md, which is the spec). Part of Aakkagam Games; deploys to games.aakkagam.com/patolli/.

Success looks like two people who have never heard of Patolli finishing a game without reading a word of rules text, groaning when a wedge square costs them double, and noticing on their own that the way to win is to close squares off rather than to race.

## Brand Personality

**Handmade, vivid, contested.**

The board is a painted artifact: a woven mat or stretched hide, its cross laid down in rubber line, coloured with cochineal red, maize yellow and indigo. Daylight, not torchlight. Something made by hand and played on the floor, worn by use rather than preserved behind glass.

Over that material sits a duel. Two players, no captures, and therefore no luck-driven blowouts to hide behind: every square you occupy is a square your opponent cannot use. The feeling to aim for is a slow tightening.

Voice in UI copy: brief, plain, faintly dry. Never lore-dumping, never corporate, never hyped. No em dashes.

## Anti-references

- **Casino and gambling UI.** No chips, felt green, jackpot glows, coin showers, or win jingles. The game has a real pot and must never feel like a betting app.
- **Generic SaaS and flat web.** No sterile flat cards, default blues, corporate minimalism, dashboard chrome.
- **Cheap mobile-game clutter.** No popups, neon gradients, fake-3D plastic buttons, reward animations, or currency badges.

## Design Principles

1. **The board is the app.** One screen carries the whole product. Turn state, the throw, and settings stay quiet and peripheral around the painted cross.
2. **Teach through the board, not text.** Legal targets highlight, illegal drops bounce back, and the rules that surprise people explain themselves at the moment they bite. No rules modal should be needed to finish a first game.
3. **Blocking is the game, so make the squeeze visible.** With no captures, the entire strategy is denying squares. If a player cannot see their options closing, the game reads as pure luck and the design has failed.
4. **The pot is a ledger, not a jackpot.** Stakes and penalties are tracked honestly and read at a glance. They are never celebrated, animated as winnings, or turned into spectacle.
5. **Made by hand, not minted.** Every surface should look drawn, dyed, or woven by a person. Nothing machined, glossy, or perfectly regular.

## Accessibility & Inclusion

- WCAG AA contrast for all text and interactive states.
- `prefers-reduced-motion`: spring motion and throw theatrics collapse to short fades or instant results.
- Player identity by **shape and colour together**, never colour alone.
- Touch targets at least 44px. Every drag interaction has a plain tap-tap fallback.
- The bean throw is always shown as a numeral, never left to be counted off the bean faces.
