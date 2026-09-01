<script setup>
import { useGameStore } from '@/stores/game'
import { SPECIALS } from '@/stores/modes'

const props = defineProps({
  tiles: { type: Array, required: true },
  rowIndex: { type: Number, required: true },
  /** [row, col] of the roving-tabindex cursor, so the grid has one tab stop. */
  cursor: { type: Array, default: () => [0, 0] },
  playClick: { type: Function, default: () => {} }
})

const game = useGameStore()

const selectTile = (position) => {
  const claimed = game.playTile(props.rowIndex, position)
  if (claimed.length === 0) return

  // The tile's face rides along so the board can answer with its note.
  props.playClick(props.tiles[position].index)
  setTimeout(() => {
    claimed.forEach(({ rowIndex, tile }) => {
      game.settleTile(rowIndex, tile.id)
      game.compactRow(rowIndex, tile.id)
    })
    game.refreshAvailability(true)
  }, 500)
}

const runSize = (t) => game.runSizes[t.id] ?? 0
const special = (t) => SPECIALS[t.kind] ?? null

const stateOf = (t) => {
  if (t.isTaken) return 'Shut'
  if (t.isInUse) return t.isCollateral ? 'Selected as bonus' : 'Selected'
  if (game.state !== '') return 'Waiting for the roll'
  const mark = special(t) ? `${special(t).name}. ${special(t).hint} ` : ''
  if (!t.isAvailable) return `${mark}Not playable`
  const run = runSize(t)
  return run > 1 ? `${mark}Playable, takes ${run} tiles together` : `${mark}Playable`
}
</script>

<template>
  <TransitionGroup name="flip-list" tag="ul" role="row">
    <li v-for="(t, position) in tiles" :key="t.id" role="gridcell">
      <div class="cell">
        <div v-if="t.isExplosion" class="explosion" aria-hidden="true" />
        <button
          type="button"
          class="box animated"
          :class="[
            t.cssClass,
            t.action,
            {
              isAvailable: t.isAvailable && !t.isTaken && !t.isInUse,
              isNotAvailable:
                game.state === '' && !t.isAvailable && !t.isTaken && !t.isInUse,
              isTaken: t.isTaken,
              isCollateral: t.isCollateral,
              isInUse: t.isInUse,
              isHinted: game.hintedIds.includes(t.id),
              isPreview: game.previewIds.includes(t.id),
              hasRun: runSize(t) > 1,
              isWild: t.kind === 'wild',
              isLocked: t.kind === 'locked'
            }
          ]"
          :data-cell="`${rowIndex}-${position}`"
          :tabindex="cursor[0] === rowIndex && cursor[1] === position ? 0 : -1"
          :disabled="t.isTaken"
          :aria-label="`Tile ${t.index}. ${stateOf(t)}`"
          :aria-pressed="t.isInUse"
          @click="selectTile(position)"
          @pointerenter="game.previewRun(rowIndex, position)"
          @pointerleave="game.clearPreview()"
          @focus="game.previewRun(rowIndex, position)"
          @blur="game.clearPreview()"
        >
          <span class="number">{{ t.index }}</span>
          <span v-if="special(t)" class="special-mark" aria-hidden="true">
            {{ special(t).mark }}
          </span>
          <!-- How many tiles this one click would take, when it is more than one. -->
          <span v-if="runSize(t) > 1" class="run-badge" aria-hidden="true">
            {{ runSize(t) }}
          </span>
        </button>
        <!-- The mark's meaning on hover, so the rule is not a trip to the legend. -->
        <span
          v-if="special(t) && !t.isTaken"
          class="tip"
          :class="{ below: rowIndex === 0 && game.rows > 1 }"
          aria-hidden="true"
        >
          <b>{{ special(t).mark }} {{ special(t).name }}</b>
          {{ special(t).hint }}
        </span>
      </div>
    </li>
  </TransitionGroup>
</template>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--gap);
  display: flex;
  justify-content: center;
  gap: var(--gap);
}
li {
  display: block;
}
.cell {
  position: relative;
}
/* Lift the whole cell so its tooltip clears the tiles to its right. */
.cell:hover,
.cell:has(.box:focus-visible) {
  z-index: 5;
}

/*
 * The legend under the board names the marks; this gives the rule at the tile
 * itself. Hover only — a tap on a phone plays the tile, so touch keeps the
 * legend, and the same words reach screen readers through the tile's label.
 */
.tip {
  /* No box at all on a thumb, rather than a hidden one hanging off-screen. */
  display: none;
  position: absolute;
  bottom: calc(100% + 0.4rem);
  left: 50%;
  translate: -50% 0;
  z-index: 1;
  width: max-content;
  max-width: min(13rem, 60vw);
  padding: 0.4rem 0.55rem;
  border-radius: 0.4rem;
  background: var(--ground-3);
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 400;
  line-height: 1.35;
  text-align: left;
  box-shadow: 0 6px 18px rgb(0 0 0 / 45%);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.12s linear;
  pointer-events: none;
}
.tip b {
  display: block;
  color: var(--bone);
}
/* The top row has nothing above it but the header, so its tip hangs down. */
.tip.below {
  bottom: auto;
  top: calc(100% + 0.4rem);
}
/* The end columns would overflow the board, so they hang from their own edge. */
li:first-child .tip {
  left: 0;
  translate: 0;
}
li:last-child .tip {
  left: auto;
  right: 0;
  translate: 0;
}
@media (hover: hover) and (pointer: fine) {
  .tip {
    display: block;
  }
  .cell:hover .tip,
  .cell:has(.box:focus-visible) .tip {
    opacity: 1;
    visibility: visible;
  }
}

.box {
  position: relative;
  width: var(--tile);
  height: var(--tile-h, var(--tile));
  font-family: var(--font-display);
  font-size: var(--tile-font);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: #22292f;
  border: 0;
  --edge: max(2px, calc(var(--tile) * 0.09));
  --corner: max(3px, calc(var(--tile) * 0.14));
  border-bottom: var(--edge) solid rgb(0 0 0 / 45%);
  border-radius: var(--corner);
  transition:
    transform 0.12s ease,
    filter 0.2s linear,
    background 0.2s linear;
}
.box:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
  z-index: 2;
}
.box:active:not(:disabled) {
  --edge: 2px;
  transform: translateY(1px);
}

/*
 * Three states that must never be confused, each carried by more than colour:
 *
 *   playable    full colour, full size, raised edge
 *   unplayable  colour drained, flat, set back
 *   shut        a dark hole in the board
 *
 * On this dark ground a tile cannot both recede in brightness and keep a
 * legible numeral — there is no combination that satisfies both — so the
 * unplayable state recedes by losing chroma (156 -> 40) while staying light.
 * Numeral 7.42:1, edge against the ground 7.07:1.
 */
.isTaken {
  color: #7d9188 !important;
  cursor: default;
  background: var(--hole) !important;
  background-image: none !important;
  border-bottom-color: var(--hole);
  box-shadow: inset 0 2px 5px rgb(0 0 0 / 55%);
  transform: scale(0.9);
}
.isInUse {
  color: #22292f !important;
  cursor: not-allowed;
  background: var(--sel) !important;
  background-image: none !important;
  box-shadow:
    inset 0 0 0 max(2px, calc(var(--tile) * 0.08)) #22292f,
    0 0 0 2px rgb(255 227 107 / 45%);
}
/*
 * A claimed combination is one move, so it reads as one colour. The bonus
 * tiles it pulled in are marked by a corner notch rather than a second hue.
 */
.isCollateral::after {
  content: '';
  position: absolute;
  right: 8%;
  top: 8%;
  width: 22%;
  height: 22%;
  max-width: 9px;
  max-height: 9px;
  border-radius: 50%;
  background: #22292f;
  opacity: 0.5;
}
/*
 * On the nine-row boards most tiles are unplayable most turns, so the two
 * states are pushed apart from both ends: a playable tile wears a light rim
 * and a soft halo on top of its raised edge, an unplayable one is drained
 * harder and its numeral recedes with it (75% ink on the light veil is still
 * ~5.5:1 — comfortably past the 3:1 large-text floor for numerals this big).
 */
.isAvailable {
  color: var(--tile-ink);
  box-shadow:
    0 2px 0 rgb(0 0 0 / 30%),
    0 0 0 1px rgb(255 255 255 / 45%),
    0 0 14px rgb(234 243 238 / 24%);
}
.isAvailable:hover {
  transform: translateY(-2px);
  filter: brightness(1.07);
  box-shadow:
    0 4px 2px rgb(0 0 0 / 30%),
    0 0 0 1px rgb(255 255 255 / 65%),
    0 0 18px rgb(234 243 238 / 38%);
}
.isNotAvailable {
  color: rgb(22 36 29 / 75%) !important;
  cursor: not-allowed;
  background-image: linear-gradient(rgb(188 200 194 / 82%), rgb(188 200 194 / 82%));
  transform: scale(0.86);
  border-bottom-color: transparent;
  box-shadow: inset 0 0 0 1px rgb(22 36 29 / 14%);
}

/* Special tiles wear their mark; the colour stays the face's own. */
.special-mark {
  position: absolute;
  bottom: 2%;
  left: 6%;
  font-size: max(8px, calc(var(--tile) * 0.28));
  line-height: 1;
  opacity: 0.8;
  pointer-events: none;
}
/*
 * An inset shadow is clipped to the padding box, so it stopped short of the
 * raised bottom edge and the ring read as three-sided. A pseudo element
 * stretched past that edge carries it all the way round.
 */
.isWild,
.isLocked {
  --mark-ring: #b06bd8;
}
.isLocked {
  --mark-ring: #2779bd;
}
.isWild::before,
.isLocked::before {
  content: '';
  position: absolute;
  /*
   * The border box, not the padding box: the face paints under the raised
   * edge, and paints through it outright when the flat state clears its
   * colour, so anything short of this leaves the ring sitting high.
   */
  inset: 0 0 calc(-1 * var(--edge)) 0;
  border: max(2px, calc(var(--tile) * 0.07)) solid var(--mark-ring);
  border-radius: var(--corner);
  pointer-events: none;
}
/*
 * Shut and selected are states, and a state outranks a kind: they take the
 * whole tile back so their own ring reads. The corner glyph still says which
 * kind of tile it was.
 */
.isTaken::before,
.isInUse::before {
  display: none;
}

/* A tile that would take a whole column with it. */
.run-badge {
  position: absolute;
  top: -4%;
  right: -4%;
  min-width: 42%;
  max-width: 22px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  font-size: max(9px, calc(var(--tile) * 0.3));
  font-weight: 700;
  line-height: 1;
  color: #10291d;
  background: var(--bonus);
  border: 1.5px solid #10291d;
  border-radius: 999px;
  pointer-events: none;
}
.hasRun {
  box-shadow:
    0 2px 0 rgb(0 0 0 / 30%),
    0 0 0 2px rgb(127 240 174 / 55%),
    0 0 14px rgb(127 240 174 / 25%);
}
.isPreview {
  outline: 3px solid var(--bonus);
  outline-offset: 2px;
  z-index: 3;
  filter: brightness(1.1);
}

.isHinted {
  animation: hint-pulse 1s ease-in-out 3;
  box-shadow: 0 0 0 max(2px, calc(var(--tile) * 0.08)) #22292f;
}
@keyframes hint-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.09);
  }
}

.explosion {
  position: absolute;
  inset: 50% auto auto 50%;
  width: calc(var(--tile) * 2.2);
  height: calc(var(--tile) * 2.2);
  translate: -50% -50%;
  background: url('../assets/explosion.png') no-repeat;
  background-size: calc(var(--tile) * 61.6) calc(var(--tile) * 2.2);
  animation: explosion-animation 0.9s steps(28);
  pointer-events: none;
  z-index: 3;
}
@keyframes explosion-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: calc(var(--tile) * -61.6) 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flip-list-move,
  .box {
    transition: none;
  }
  .isNotAvailable,
  .isTaken {
    transform: none;
  }
  .explosion {
    animation: none;
  }
  .isHinted {
    animation: none;
    outline: 3px dashed #22292f;
    outline-offset: 2px;
  }
}
</style>
