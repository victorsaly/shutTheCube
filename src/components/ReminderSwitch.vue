<script setup>
import { useStatsStore } from '@/stores/stats'
import { MODE_LIST } from '@/stores/modes'
import {
  REMINDER_TIME,
  reminderBlocked,
  reminderOn,
  setReminder
} from '@/services/reminder'

/**
 * The daily reminder's switch. Shown on the You tab and after a finished
 * daily, which is the moment someone is most likely to want it.
 */
const stats = useStatsStore()
const playedToday = () => MODE_LIST.some((m) => stats.dailyResult(m.key))
const toggle = () => setReminder(!reminderOn.value, { playedToday: playedToday() })
</script>

<template>
  <div class="reminder">
    <span id="reminder-label">
      Daily reminder
      <small v-if="reminderBlocked">
        Notifications are turned off for this app. Allow them in the phone’s Settings, then try
        again.
      </small>
      <small v-else>{{ REMINDER_TIME }}, only if you have not played. Off until you turn it on.</small>
    </span>
    <button
      type="button"
      role="switch"
      class="switch"
      :aria-checked="reminderOn"
      aria-labelledby="reminder-label"
      @click="toggle"
    >
      <span />
    </button>
  </div>
</template>

<style scoped>
.reminder {
  min-height: 3.5rem;
  padding: 0.5rem 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 1rem;
  line-height: 1.3;
}
small {
  display: block;
  font-size: 0.8125rem;
  color: var(--muted);
}
</style>
