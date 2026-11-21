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
 * The line under the board names the marks; this gives the rule at the tile
 * itself. Hover only: a tap on a phone plays the tile, so touch keeps the
 * line, and the same words reach screen readers through the tile's label.
 */
.tip {
  display: none;
  position: absolute;
  bottom: calc(100% + 0.4rem);
  left: 50%;
  translate: -50% 0;
  z-index: 1;
  width: max-content;
  max-width: min(13rem, 60vw);
  padding: 0.45rem 0.6rem;
  border-radius: 0.6rem;
  background: var(--ink);
  color: #dfe6e1;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.35;
  text-align: left;
  box-shadow: 0 6px 18px rgb(21 35 28 / 30%);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.12s linear;
  pointer-events: none;
}
.tip b {
  display: block;
  color: #ffffff;
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

/*
 * A tile is a raised key: its face colour, an edge in a darker shade of the
 * same hue, and a light line along the top. Three states that must never be
 * confused, each carried by more than colour:
 *
 *   playable    full colour, raised edge
 *   unplayable  faded and flat
 *   shut        an empty, sunk slot
 */
.box {
  --edge: max(3px, calc(var(--tile-h, var(--tile)) * 0.09));
  --corner: max(5px, calc(var(--tile) * 0.24));
  position: relative;
  width: var(--tile);
  height: var(--tile-h, var(--tile));
  font-family: var(--font-display);
  font-size: var(--tile-font);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  display: grid;
  place-items: center;
  padding: 0 0 var(--edge);
  cursor: pointer;
  color: var(--tile-ink);
  border: 0;
  border-radius: var(--corner);
  box-shadow:
    inset 0 calc(-1 * var(--edge)) 0 var(--edge-c, rgb(21 35 28 / 22%)),
    inset 0 1px 0 rgb(255 255 255 / 55%);
  transition:
    transform 0.12s ease,
    opacity 0.2s linear,
    box-shadow 0.12s ease;
}
.box:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  z-index: 2;
}
.box:active:not(:disabled) {
  transform: translateY(1px);
}

.isTaken {
  color: transparent !important;
  cursor: default;
  background: var(--sunk) !important;
  background-image: none !important;
  box-shadow: inset 0 2px 3px rgb(21 35 28 / 12%);
}
.isTaken .special-mark {
  display: none;
}
.isInUse {
  cursor: not-allowed;
  z-index: 1;
  transform: translateY(-2px);
  box-shadow:
    inset 0 0 0 max(2.5px, calc(var(--tile) * 0.08)) var(--ink),
    0 4px 10px rgb(21 35 28 / 25%);
}
/*
 * A claimed combination is one move. The bonus tiles it pulled in are marked
 * by a corner dot rather than a second treatment.
 */
.isCollateral::after {
  content: '';
  position: absolute;
  right: 12%;
  top: 12%;
  width: 20%;
  max-width: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--ink);
}
@media (hover: hover) and (pointer: fine) {
  .isAvailable:hover {
    transform: translateY(-2px);
    filter: brightness(1.04);
  }
}
.isNotAvailable {
  opacity: 0.35;
  cursor: not-allowed;
  padding-bottom: 0;
  box-shadow: none;
}

/* Special tiles wear their mark; the colour stays the face's own. */
.special-mark {
  position: absolute;
  bottom: calc(var(--edge) + 4%);
  left: 8%;
  font-size: max(8px, calc(var(--tile) * 0.26));
  line-height: 1;
  pointer-events: none;
}
.isWild,
.isLocked {
  --mark-ring: #6f3aa6;
}
.isLocked {
  --mark-ring: #1d5fa3;
}
.isWild::before,
.isLocked::before {
  content: '';
  position: absolute;
  inset: 0;
  border: max(2px, calc(var(--tile) * 0.06)) solid var(--mark-ring);
  border-radius: var(--corner);
  pointer-events: none;
}
/* Shut and picked are states, and a state outranks a kind. */
.isTaken::before,
.isInUse::before {
  display: none;
}

/* A tile that would take a whole column with it. */
.run-badge {
  position: absolute;
  top: -12%;
  right: -10%;
  min-width: 44%;
  max-width: 22px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  font-family: var(--font-body);
  font-size: max(9px, calc(var(--tile) * 0.28));
  font-weight: 700;
  line-height: 1;
  color: var(--on-accent);
  background: var(--accent);
  border: 1.5px solid var(--surface);
  border-radius: 999px;
  pointer-events: none;
}
.isTaken .run-badge,
.isNotAvailable .run-badge {
  display: none;
}
.isPreview {
  outline: 3px solid var(--accent);
  outline-offset: 1px;
  z-index: 3;
}

.isHinted {
  animation: hint-pulse 1s ease-in-out 3;
  outline: 3px solid var(--ink);
  outline-offset: 1px;
  z-index: 2;
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
  .isInUse {
    transform: none;
  }
  .explosion {
    animation: none;
  }
  .isHinted {
    animation: none;
  }
}
</style>
