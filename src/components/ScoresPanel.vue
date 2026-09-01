<script setup>
import { ref } from 'vue'
import StatsPanel from './StatsPanel.vue'
import Leaderboard from './Leaderboard.vue'
import AppIcon from './AppIcon.vue'

/*
 * "Your record" and "Leaderboard" were two entries on the menu for what a
 * player thinks of as one thing: how am I doing. They are the same question
 * asked privately and publicly, so they belong behind one door with a switch,
 * not two doors that have to be told apart before you open either.
 */
const props = defineProps({
  /** Which side to open on. The result card sends people straight to the board. */
  start: { type: String, default: 'you' }
})
defineEmits(['close'])

const tab = ref(props.start === 'board' ? 'board' : 'you')
</script>

<template>
  <section class="scores panel-glass" aria-labelledby="scores-title">
    <header class="head">
      <h2 id="scores-title" class="display"><AppIcon name="trophy" /> Scores</h2>
      <button type="button" class="close" aria-label="Back to the menu" @click="$emit('close')">
        <AppIcon name="close" />
      </button>
    </header>

    <div class="switch" role="tablist" aria-label="Whose scores">
      <button
        type="button"
        role="tab"
        class="side"
        :aria-selected="tab === 'you'"
        @click="tab = 'you'"
      >
        Your record
      </button>
      <button
        type="button"
        role="tab"
        class="side"
        :aria-selected="tab === 'board'"
        @click="tab = 'board'"
      >
        Daily board
      </button>
    </div>

    <StatsPanel v-if="tab === 'you'" embedded @close="$emit('close')" />
    <Leaderboard v-else embedded />
  </section>
</template>

<style scoped>
.scores {
  width: min(100%, 30rem);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: clamp(16px, 3vw, 22px);
  border-radius: 16px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.head h2 {
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.close {
  background: none;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
}
.close:hover {
  color: var(--bone);
}

.switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 11px;
  background: rgb(0 0 0 / 22%);
}
.side {
  flex: 1;
  padding: 8px 6px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
}
.side[aria-selected='true'] {
  background: var(--ink-2);
  color: var(--bone);
  font-weight: 600;
}
</style>
