# Shut The Cube

A dice-and-tiles game based on the classic [Shut The Box](https://en.wikipedia.org/wiki/Shut_the_Box),
with a nine-layer "cube" variant where a matching column of tiles collapses together for a bonus.

**Play it:** https://shutthecube.com/

**Rules:** https://shutthecube.com/how-to-play.html

**About:** https://shutthecube.com/about.html

**Privacy:** https://shutthecube.com/privacy.html

## How to play

Roll two dice, then select tiles that add up to the roll. Tiles you cannot reach sit back and fade.
Match the roll exactly to bank those tiles and roll again; when no combination is left, the game
ends. Clear the whole board to Shut The Box.

On the nine-row boards, playing a tile also claims the same face in the rows directly above and
below it, as far as the run of matching faces continues. Those extra tiles score as **Bonus** and
are banked with the rest, but they do not count toward the current roll.

Any tile that would take a column with it carries a **badge with the number of tiles it claims**,
and hovering or focusing it previews the whole run — so the big moves are visible before you
commit to one rather than only after. Every tile of a claimed combination shares one colour,
because it was one move; the bonus tiles are marked with a small dot.

Once the whole board is worth **6 or less**, the second die is dropped automatically — two dice can
roll higher than anything left and end a game on nothing but bad luck.

### Modes

| Mode | Board | Rule of its own |
| --- | --- | --- |
| **Beginner** | 1 row | Classic Shut The Box, no surprises. Once nothing above a 6 is left you may choose to roll a single die. |
| **Medium** | 9 rows | Matching columns collapse together for a bonus, plus special tiles and between-turn events. |
| **Ninja** | 9 rows | The same, with 30 seconds a turn. Run out and the game ends. |

### Surprises

The nine-row modes seed a few **special tiles**. Neither changes how a game is scored — a tile is
always worth its face value when it is shut:

- **★ Wild** — counts as whatever you still need, so it can finish any roll on its own.
- **◆ Locked** — only plays alone, matching the entire roll.

Roughly one turn in six brings an **event**: a lucky third die, a reshuffle, or a tile turning wild.

Pulling off a run, playing a wild or unlocking a locked tile is called out on the board
("Triple — 3 tiles in one move"). When a roll can be matched more than one way, the board says how
many ways there are, and <kbd>H</kbd> cycles through them.

### Controls

<kbd>Space</kbd> rolls, from anywhere on the page. The roll button also sits in the middle of the
board rather than under it, so it is never a reach to the bottom of the screen.

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

## Analytics

Off by default: with no token configured the site contacts no third party and
sets no cookie, which a test asserts.

To turn on Cloudflare Web Analytics — cookieless and aggregate, so no consent
banner is needed:

1. In the Cloudflare dashboard, **Web Analytics → Add a site** for
   `shutthecube.com`. You do not need to move your DNS to Cloudflare.
2. Copy the beacon token. It is public by design — it ships in the page source
   of every site that uses it — so it belongs in a repository *variable*, not a
   secret.
3. Add it as repository variable `CF_BEACON_TOKEN`
   (*Settings → Secrets and variables → Actions → Variables*).
4. Update [`public/privacy.html`](public/privacy.html) in the same change: the
   policy currently states the game uses no analytics, and that must not become
   untrue before the code does.

## Deployment

Pushing to `master` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow runs the tests first
and will not deploy if they fail.

**One-time setup:** in the repository's *Settings → Pages*, set **Source** to **GitHub Actions**.
The site previously deployed from the `docs/` folder, which this rewrite removed.

### Custom domain

The deployed artifact contains `CNAME` with `shutthecube.com`, which tells GitHub Pages to serve
the site from that domain. In the domain registrar's DNS settings, point the apex domain to GitHub
Pages with these four `A` records:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Add a `CNAME` record for `www` pointing to `victorsaly.github.io`. Then, in GitHub repository
*Settings → Pages*, set the custom domain to `shutthecube.com`, wait for DNS verification, and
enable **Enforce HTTPS**. Configure the registrar to redirect `www.shutthecube.com` to the apex
domain so the canonical URL remains consistent.

The build uses a relative base path, so the same output works from the project page at
`/shutTheCube/` or from the custom domain at the root without a config change.

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

### Colour and layout

- **The board sits on a deep forest ground.** It used to be the brand's vivid green: 63% average
  saturation behind tiles averaging 77% lightness, so the ground was more colourful than the
  content, and the mint tile was ΔE 23.9 from it — close enough to visually merge. The dark ground
  takes worst-case separation to ΔE 64.1 while still reading as the same game.
- **The three tile states are distinct without relying on colour.** Playable is full colour, full
  size, raised; unplayable is drained of chroma (156 → 40), flat and set back; shut is a dark hole.
  On a dark ground a tile cannot both recede in brightness and keep a legible numeral — no
  combination satisfies both — so recession is carried by chroma and shape instead. Numeral
  contrast 7.42:1, tile edge against the ground 7.07:1.
- **Tile size comes from a container query**, not a hand-tuned reserve for the header and footer.
  The old constant guessed 30dvh where the real chrome is 283px, which pushed a 1280×720 window
  73px into a scrollbar. Nine viewport sizes across two modes now fit with no overflow.
- **A one-row board gets tall tiles.** Nine tiles always have to fit across the screen, so width
  caps them small and the height went to waste; standing them up echoes the flip-down levers of
  the physical game.
- **The restart control says "Restart".** It was an X, which reads as "close" sitting next to a
  home button that already goes back.
