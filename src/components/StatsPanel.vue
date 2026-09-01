<script setup>
import { computed } from 'vue'
import { MODE_LIST } from '@/stores/modes'
import { useStatsStore } from '@/stores/stats'
import AppIcon from './AppIcon.vue'

const stats = useStatsStore()
/* Rendered inside ScoresPanel, the frame and title belong to the shell. */
defineProps({ embedded: { type: Boolean, default: false } })
const emit = defineEmits(['close'])
const anyPlayed = computed(() => MODE_LIST.some((m) => stats.hasPlayed(m.key)))
</script>

<template>
  <div class="panel" :class="{ 'panel-glass': !embedded, bare: embedded }">
    <h2 v-if="!embedded" class="display"><AppIcon name="chart" /> Your record</h2>

    <p v-if="!anyPlayed" class="empty">No games yet. Play one and your record shows up here.</p>

    <table v-else>
      <thead>
        <tr>
          <th scope="col">Mode</th>
          <th scope="col">Played</th>
          <th scope="col">Best</th>
          <th scope="col">Avg</th>
          <th scope="col">Won</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mode in MODE_LIST" :key="mode.key" :class="{ dim: !stats.hasPlayed(mode.key) }">
          <th scope="row">{{ mode.label }}</th>
          <td class="num">{{ stats.forMode(mode.key).played }}</td>
          <td class="best num">{{ stats.bestFor(mode.key) || '—' }}</td>
          <td class="num">{{ stats.averageFor(mode.key) || '—' }}</td>
          <td class="num">
            {{ stats.forMode(mode.key).wins }}
            <span v-if="stats.hasPlayed(mode.key)" class="rate">
              ({{ stats.winRateFor(mode.key) }}%)
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="anyPlayed" class="streaks">
      <template v-for="mode in MODE_LIST" :key="mode.key">
        <span v-if="stats.forMode(mode.key).bestStreak > 0">
          {{ mode.label }} best streak {{ stats.forMode(mode.key).bestStreak }}.
        </span>
      </template>
    </p>

    <div class="actions">
      <button v-if="!embedded" type="button" class="link" @click="emit('close')">Back</button>
      <button
        v-if="anyPlayed"
        type="button"
        class="link danger"
        @click="stats.reset()"
      >
        Reset record
      </button>
    </div>
  </div>
</template>

<style scoped>
.panel {
  text-align: left;
  width: min(420px, 100%);
  padding: 1.4rem 1.3rem 1.1rem;
}
h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--bone);
}
.empty {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0 0 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  color: var(--bone);
}
th,
td {
  padding: 0.32rem 0.25rem;
  text-align: right;
}
thead th {
  font-weight: 600;
  color: var(--muted);
  border-bottom: 1px solid var(--line);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
tbody th,
thead th:first-child {
  text-align: left;
  font-weight: 600;
}
tbody tr + tr {
  border-top: 1px solid rgb(234 243 238 / 8%);
}
.best {
  font-weight: 700;
  color: var(--bonus);
}
.rate {
  color: var(--muted);
}
.dim {
  opacity: 0.45;
}
.streaks {
  margin: 0.6rem 0 0;
  font-size: 0.75rem;
  color: var(--muted);
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
.link {
  background: none;
  border: 0;
  color: var(--bone);
  font: inherit;
  font-size: 0.82rem;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  padding: 0.2rem;
}
.danger {
  color: var(--bad);
}
</style>
