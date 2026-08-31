<script setup>
import { useGameStore } from '@/stores/game'

const props = defineProps({
  tiles: { type: Array, required: true },
  rowIndex: { type: Number, required: true },
  allTiles: { type: Array, required: true },
  playClick: { type: Function, default: () => {} }
})

const game = useGameStore()

/** Settle the animation, slide the tile away, then re-evaluate the board. */
const playTile = (rowIndex, tile) => {
  game.useTile(rowIndex, tile.id, rowIndex !== props.rowIndex)
  setTimeout(() => {
    game.settleTile(rowIndex, tile.id)
    game.isLoading = true
    game.compactRow(rowIndex, tile.id)
    // Only the row that was actually clicked resolves the turn; the matching
    // tiles it pulls in from other rows must not resolve it a second time.
    game.refreshAvailability(rowIndex === props.rowIndex)
    game.isLoading = false
  }, 500)
}

/**
 * Playing a tile also claims the same face in adjacent rows at the same
 * position, running outward until the run breaks. That is the cube mechanic:
 * a column of matching faces collapses together, and the extra tiles score as
 * a bonus rather than counting toward the roll.
 */
const claimMatchingRuns = (position, face) => {
  const matches = (i) =>
    props.allTiles[i]?.[position]?.index === face && !props.allTiles[i][position].isTaken

  for (let i = props.rowIndex - 1; i >= 0 && matches(i); i--) {
    playTile(i, props.allTiles[i][position])
  }
  for (let i = props.rowIndex + 1; i < props.allTiles.length && matches(i); i++) {
    playTile(i, props.allTiles[i][position])
  }
}

const selectTile = (tile, position) => {
  const isLegal =
    tile.isAvailable && !tile.isTaken && game.sumTilesInUse + tile.index <= game.diceSum

  if (!isLegal) {
    game.rejectTile(props.rowIndex, tile.id, false)
    return
  }

  props.playClick()
  claimMatchingRuns(position, tile.index)
  playTile(props.rowIndex, tile)
}
</script>

<template>
  <TransitionGroup name="flip-list" tag="ul">
    <li v-for="(t, position) in tiles" :key="t.id">
      <div style="position: relative">
        <div :class="{ explosion: t.isExplosion }" />
        <button
          type="button"
          class="box text-black text-center border-b-4 border-black rounded no-underline animated"
          :class="[
            t.cssClass,
            t.action,
            {
              isAvailable: t.isAvailable,
              isNotAvailable: !t.isAvailable,
              isTaken: t.isTaken,
              isCollateral: t.isCollateral,
              isInUse: t.isInUse
            }
          ]"
          :disabled="t.isTaken"
          :aria-label="`Tile ${t.index}`"
          :aria-pressed="t.isInUse"
          @click="selectTile(t, position)"
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
  list-style-type: none;
  padding: 0;
  margin: 0;
}
li {
  display: inline-block;
  margin: 0 5px 0 0;
}

.box {
  height: 45px;
  width: 45px;
  line-height: 180%;
  cursor: pointer;
  float: left;
  border-bottom: 4px solid #444;
  font: inherit;
  font-size: 1rem;
  padding: 0;
}
.box:focus-visible {
  outline: 2px solid #2779bd;
  outline-offset: 2px;
}

.isTaken {
  color: white !important;
  cursor: not-allowed;
  opacity: 0.3 !important;
  background: #222;
}
.isInUse {
  color: yellow !important;
  cursor: not-allowed;
  background: gray;
  opacity: 0.7;
}
.isCollateral {
  color: greenyellow !important;
  cursor: not-allowed;
  background: gray;
}
.isAvailable {
  color: #000;
  transition: background 0.2s linear;
}
.isNotAvailable {
  color: #444 !important;
  opacity: 0.5;
  cursor: not-allowed;
  background: cadetblue;
  transition: background 0.3s linear;
}

.explosion {
  width: 100px;
  height: 100px;
  position: absolute;
  top: -25px;
  background: url('../assets/explosion.png') no-repeat;
  background-position: 0 0;
  animation: explosion-animation 1s steps(28);
  margin-left: -29px;
  pointer-events: none;
}
@keyframes explosion-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -2800px 0;
  }
}

@media only screen and (max-device-width: 320px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait) {
  .box {
    width: 30px !important;
    height: 28px !important;
    line-height: 160% !important;
  }
}

@media only screen and (min-device-width: 320px) and (max-device-width: 568px) and (-webkit-min-device-pixel-ratio: 2) {
  .box {
    height: 36px;
    width: 35px;
    line-height: 200%;
  }
  .shutTheBox .box {
    width: 70px !important;
    height: 68px !important;
    font-size: 40px;
    line-height: 160% !important;
  }
  .shutTheBox li {
    margin: 10px 15px 0 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flip-list-move {
    transition: none;
  }
  .explosion {
    animation: none;
    background: none;
  }
}
</style>
