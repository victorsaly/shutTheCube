# Shut The Cube

A dice-and-tiles game based on the classic [Shut The Box](https://en.wikipedia.org/wiki/Shut_the_Box),
with a nine-layer "cube" variant where a matching column of tiles collapses together for a bonus.

**Play it:** https://victorsaly.github.io/shutTheCube/

## How to play

Roll two dice, then select tiles that add up to the roll. Tiles you cannot reach are dimmed.
Match the roll exactly to bank those tiles and roll again; when no combination is left, the game
ends. Clear the whole board to Shut The Box.

In the nine-row Cube game, playing a tile also claims the same face in the rows directly above and
below it, as far as the run of matching faces continues. Those extra tiles score as **Bonus** and
are banked with the rest, but they do not count toward the current roll.

Best scores are kept per board size in your browser's local storage.

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
  stores/game.js             the board and the turn state machine (Pinia)
  stores/scores.js           personal bests, persisted to local storage
  components/                the board, tile rows, dice, header
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
