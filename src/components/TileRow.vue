<script setup>
import { useGameStore } from '@/stores/game'

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

  props.playClick()
  setTimeout(() => {
    claimed.forEach(({ rowIndex, tile }) => {
      game.settleTile(rowIndex, tile.id)
      game.compactRow(rowIndex, tile.id)
    })
    game.refreshAvailability(true)
  }, 500)
}

const stateOf = (t) => {
  if (t.isTaken) return 'Shut'
  if (t.isInUse) return t.isCollateral ? 'Selected as bonus' : 'Selected'
  if (game.state !== '') return 'Waiting for the roll'
  return t.isAvailable ? 'Playable' : 'Not playable'
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
              isHinted: game.hintedIds.includes(t.id)
            }
          ]"
          :data-cell="`${rowIndex}-${position}`"
          :tabindex="cursor[0] === rowIndex && cursor[1] === position ? 0 : -1"
          :disabled="t.isTaken"
          :aria-label="`Tile ${t.index}. ${stateOf(t)}`"
          :aria-pressed="t.isInUse"
          @click="selectTile(position)"
        >
          <span class="number">{{ t.index }}</span>
        </button>
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

.box {
  width: var(--tile);
  height: var(--tile-h, var(--tile));
  font-family: inherit;
  font-size: var(--tile-font);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: #22292f;
  border: 0;
  border-bottom: max(2px, calc(var(--tile) * 0.09)) solid rgb(0 0 0 / 45%);
  border-radius: max(3px, calc(var(--tile) * 0.14));
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
.isAvailable {
  box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
}
.isAvailable:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
}
.box:active:not(:disabled) {
  transform: translateY(1px);
  border-bottom-width: 2px;
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
  background: #0a1f17 !important;
  background-image: none !important;
  border-bottom-color: #0a1f17;
  box-shadow: inset 0 2px 5px rgb(0 0 0 / 55%);
  transform: scale(0.9);
}
.isInUse {
  color: #22292f !important;
  cursor: not-allowed;
  background: var(--accent) !important;
  background-image: none !important;
  box-shadow:
    inset 0 0 0 max(2px, calc(var(--tile) * 0.08)) #22292f,
    0 0 0 2px rgb(255 227 107 / 45%);
}
.isCollateral {
  color: #12351f !important;
  background: var(--accent-bonus) !important;
  background-image: none !important;
  box-shadow: inset 0 0 0 max(2px, calc(var(--tile) * 0.08)) #12351f;
}
.isAvailable {
  color: var(--tile-ink);
  box-shadow: 0 2px 0 rgb(0 0 0 / 30%);
}
.isAvailable:hover {
  transform: translateY(-2px);
  filter: brightness(1.07);
}
.isNotAvailable {
  color: var(--tile-ink) !important;
  cursor: not-allowed;
  background-image: linear-gradient(rgb(188 200 194 / 72%), rgb(188 200 194 / 72%));
  transform: scale(0.86);
  border-bottom-color: transparent;
  box-shadow: inset 0 0 0 1px rgb(22 36 29 / 14%);
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
  .explosion,
  .isHinted {
    animation: none;
  }
  .isHinted {
    outline: 3px dashed #22292f;
    outline-offset: 2px;
  }
}
</style>
