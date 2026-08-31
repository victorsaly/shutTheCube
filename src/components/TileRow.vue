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
              isAvailable: t.isAvailable,
              isNotAvailable: !t.isAvailable && !t.isTaken && !t.isInUse,
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
  height: var(--tile);
  font-family: inherit;
  font-size: var(--tile-font);
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  color: #22292f;
  border: 0;
  border-bottom: max(2px, calc(var(--tile) * 0.09)) solid #3d4852;
  border-radius: max(3px, calc(var(--tile) * 0.14));
  transition:
    transform 0.12s ease,
    filter 0.2s linear,
    background 0.2s linear;
}
.box:focus-visible {
  outline: 3px solid #1a3d2b;
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

.isTaken {
  color: #f5f7f6 !important;
  cursor: not-allowed;
  background: #1f2a24 !important;
  border-bottom-color: #16201a;
  opacity: 0.55;
}
.isInUse {
  color: #22292f !important;
  cursor: not-allowed;
  background: #fff382 !important;
  box-shadow: inset 0 0 0 max(2px, calc(var(--tile) * 0.07)) #22292f;
}
.isCollateral {
  color: #22292f !important;
  background: #a2f5bf !important;
  box-shadow: inset 0 0 0 max(2px, calc(var(--tile) * 0.07)) #1a8b4b;
}
/*
 * The unavailable state used to be #444 on cadetblue at 50% opacity — 3.19:1,
 * below the 4.5:1 WCAG AA needs, and it was the state most tiles were in most
 * of the time. A white veil over the tile's own colour fades it while moving it
 * toward white, so the dark number can only get more readable whatever the hue
 * underneath. Worst case across the nine colours is 8.49:1.
 *
 * A `filter` would have been the obvious tool but it applies to the text too,
 * and darkening the red tile took it to 2.6:1 — worse than the bug being fixed.
 */
.isNotAvailable {
  color: #22292f !important;
  cursor: not-allowed;
  background-image: linear-gradient(rgb(255 255 255 / 55%), rgb(255 255 255 / 55%));
  /*
   * The veil alone reads as too similar to a playable tile at a glance, so the
   * unplayable ones also sit back and lose their raised edge. Shape and size
   * carry the signal, which keeps it legible for colour-blind players and
   * leaves the contrast ratio untouched.
   */
  transform: scale(0.88);
  border-bottom-color: transparent;
  box-shadow: inset 0 0 0 1px rgb(34 41 47 / 12%);
}
.isHinted {
  animation: hint-pulse 1s ease-in-out 3;
  box-shadow: 0 0 0 max(2px, calc(var(--tile) * 0.07)) #22292f;
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
  .isNotAvailable {
    transform: none;
    opacity: 0.85;
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
