# Shut The Cube

A dice-and-tiles game based on the classic [Shut The Box](https://en.wikipedia.org/wiki/Shut_the_Box),
with a nine-layer "cube" variant where a matching column of tiles collapses together for a bonus.

**Play it:** https://victorsaly.github.io/shutTheCube/

## How to play

Roll two dice, then select tiles that add up to the roll. Tiles you cannot reach sit back and fade.
Match the roll exactly to bank those tiles and roll again; when no combination is left, the game
ends. Clear the whole board to Shut The Box.

On the nine-row boards, playing a tile also claims the same face in the rows directly above and
below it, as far as the run of matching faces continues. Those extra tiles score as **Bonus** and
are banked with the rest, but they do not count toward the current roll.

### Modes

| Mode | Board | Rule of its own |
| --- | --- | --- |
| **Beginner** | 1 row | Classic Shut The Box. Once nothing above a 6 is left you may roll a single die. |
| **Medium** | 9 rows | Matching columns collapse together for a bonus. |
| **Ninja** | 9 rows | The same, with 30 seconds a turn. Run out and the game ends. |

### Controls

Fully playable from the keyboard: <kbd>Tab</kbd> to the board, arrow keys to move, <kbd>Enter</kbd>
to play a tile, <kbd>U</kbd> to undo the last selection and <kbd>H</kbd> for a hint. On a phone,
shake to roll.

Games played, best score, average and win rate are kept per mode in your browser's local storage.
Nothing leaves the device and there is no account.

## Development

Requires Node 20.19+.

```bash
npm install
npm run dev       # dev server with hot reload
npm test          # unit and component tests
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Deployment

Pushing to `master` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow runs the tests first
and will not deploy if they fail.

**One-time setup:** in the repository's *Settings → Pages*, set **Source** to **GitHub Actions**.
The site previously deployed from the `docs/` folder, which this rewrite removed.

The build uses a relative base path, so the same output works from the project page at
`/shutTheCube/` or from a custom domain at the root without a config change.

## Structure

```
src/
  services/gameServices.js   board creation and the subset-sum that decides legal moves
  stores/modes.js            the three difficulty modes and what makes each different
  stores/game.js             the board, turn state machine, timer, undo and hints
  stores/stats.js            per-mode records, persisted to local storage
  components/                the board, tile rows, dice, header, stats panel
  composables/               number tweening, shake-to-roll, install prompt
test/                        unit, store-integration and component tests
public/static/               icons, splash screens, sounds
```

### Notes on the 2026 rewrite

The original 2018 build (Vue 2, webpack 3, Babel 6) could no longer be installed: `firebase@4`
pulled in `grpc`, a native module that no longer compiles on current toolchains. It also loaded
Tailwind from an **unversioned** CDN URL, so when jsDelivr moved that tag to Tailwind 2 the tile
colours — which used the Tailwind 0.x `*-light` / `*-lighter` scale — silently stopped existing and
the live game lost its styling.

This rewrite therefore:

- pins every dependency in the repo and loads **nothing** from a CDN at runtime;
- reproduces the Tailwind 0.x palette as theme tokens in [`src/styles/main.css`](src/styles/main.css),
  so the original colours are preserved but can never drift again;
- drops the Firebase sign-in, which was wired up but unreachable — its router guards were commented
  out and it never read or wrote any data;
- replaces `tween`, `shake.js`, `add-to-homescreen`, `font-awesome`, `vue-toasted`,
  `vue2-touch-events` and `js-combinatorics` with small local equivalents.

Shake-to-roll now asks for the motion permission that iOS 13+ requires, which the old `shake.js`
predated — so it had stopped working on modern iPhones.

Runtime dependencies went from 25 to 3.

### What changed after that

- **The board is fluid.** Tile size is derived from whichever axis runs out first, so the board
  fills the screen. The old layout hard-coded 35px and 45px tiles behind `@media (device-width: …)`
  queries, which are deprecated and never respond to the window: the board stayed the same size
  from a phone to a 27" display and used 40% of the width. It now uses 99% of the height with no
  overflow at any size tested.
- **Unplayable tiles are readable.** They were `#444` on cadetblue at 50% opacity — a 3.19:1
  contrast ratio, below the 4.5:1 WCAG AA needs, and the state most tiles were in most of the time.
  A white veil over each tile's own colour puts the worst case at 8.49:1, and unplayable tiles also
  sit back and lose their raised edge so the cue does not rely on colour alone.
- **The board is one tab stop.** It was 83, so reaching the last tile took 80 key presses. It is now
  a `role="grid"` with a roving tabindex, arrow-key movement and a live region that announces the
  roll, each selection and the result.
- **The dice are drawn.** They were the unicode dice glyphs, which render as thin outlines on some
  platforms and solid on others.
- **It works offline** and installs as a PWA, precaching 34 files.
