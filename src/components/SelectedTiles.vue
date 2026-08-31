<script setup>
import { computed } from 'vue'
import { sum } from 'lodash-es'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const tileSum = computed(() => sum(game.selectedTiles.map((t) => t.index)))
const remaining = computed(() => game.diceSum - tileSum.value)
</script>

<template>
  <div>
    <ul>
      <li v-for="t in game.selectedTiles" :key="t.id">
        <div class="box text-black text-center border-b-4 border-black rounded animated flip" :class="t.cssClass">
          <span class="number">{{ t.index }}</span>
        </div>
      </li>
    </ul>
    <p aria-live="polite">
      <template v-if="game.selectedTiles.length > 0 && game.diceSum > 0">
        <template v-if="game.selectedTiles.length > 1">
          Selected tiles sum up <b>{{ tileSum }}</b
          ><template v-if="remaining > 0">,</template>
        </template>
        <template v-if="remaining > 0">
          <span v-if="game.selectedTiles.length > 1">with</span>
          <b>{{ remaining }}</b> point<span v-if="remaining > 1">s</span> left to match the dice sum
          of <b>{{ game.diceSum }}</b
          >.
        </template>
      </template>
      <template v-else-if="game.diceSum - game.gamePoints > 0 && game.diceSum > 0">
        Select tiles that match <b>{{ game.diceSum - game.gamePoints }}</b>
      </template>
    </p>
  </div>
</template>

<style scoped>
p {
  color: #fff;
  margin: 0;
  min-height: 1.2em;
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
  line-height: 190%;
  float: left;
  color: #222;
  border-bottom: 4px solid #222;
  font-size: 18px;
}
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
@media only screen and (max-device-width: 320px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait) {
  .box {
    width: 25px !important;
    height: 23px !important;
    font-size: 12px;
    line-height: 160% !important;
  }
}
@media only screen and (min-device-width: 320px) and (max-device-width: 568px) and (-webkit-min-device-pixel-ratio: 2) {
  .box {
    height: 36px;
    width: 35px;
    line-height: 200%;
  }
  p {
    font-size: 14px;
  }
}
</style>
