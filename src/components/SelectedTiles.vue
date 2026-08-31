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
        <div class="box animated flip" :class="t.cssClass">
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
  list-style: none;
  padding: 0;
  margin: 0 0 0.25rem;
  display: flex;
  gap: 5px;
  justify-content: center;
  flex-wrap: wrap;
}
li {
  display: block;
}
.box {
  width: clamp(26px, calc(var(--tile, 40px) * 0.66), 44px);
  height: clamp(26px, calc(var(--tile, 40px) * 0.66), 44px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22292f;
  font-weight: 600;
  font-size: clamp(12px, calc(var(--tile, 40px) * 0.3), 20px);
  border-bottom: 3px solid #22292f;
  border-radius: 4px;
}
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
</style>
