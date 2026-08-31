<script setup>
import { computed } from 'vue'
import { MODE_LIST } from '@/stores/modes'
import { useStatsStore } from '@/stores/stats'
import AppIcon from './AppIcon.vue'

const stats = useStatsStore()
const emit = defineEmits(['close'])
const anyPlayed = computed(() => MODE_LIST.some((m) => stats.hasPlayed(m.key)))
</script>

<template>
  <div class="panel">
    <h2><AppIcon name="chart" /> Your record</h2>

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
          <td>{{ stats.forMode(mode.key).played }}</td>
          <td class="best">{{ stats.bestFor(mode.key) || '—' }}</td>
          <td>{{ stats.averageFor(mode.key) || '—' }}</td>
          <td>
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
      <button type="button" class="link" @click="emit('close')">Back</button>
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
}
h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #22292f;
}
.empty {
  color: #606f7b;
  font-size: 0.85rem;
  margin: 0 0 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
th,
td {
  padding: 0.32rem 0.25rem;
  text-align: right;
}
thead th {
  font-weight: 600;
  color: #8795a1;
  border-bottom: 1px solid #dae1e7;
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
  border-top: 1px solid #eef1f3;
}
.best {
  font-weight: 700;
  color: #1a8b4b;
}
.rate {
  color: #8795a1;
}
.dim {
  opacity: 0.45;
}
.streaks {
  margin: 0.6rem 0 0;
  font-size: 0.75rem;
  color: #606f7b;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
.link {
  background: none;
  border: 0;
  color: #2779bd;
  font: inherit;
  font-size: 0.82rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.2rem;
}
.danger {
  color: #ef5753;
}
.link:focus-visible {
  outline: 2px solid #2779bd;
  outline-offset: 2px;
}
</style>
