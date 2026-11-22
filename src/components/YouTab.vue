<script setup>
import { computed, ref } from 'vue'
import { useStatsStore } from '@/stores/stats'
import { useArcadeStore } from '@/stores/arcade'
import { isMuted, setMuted } from '@/services/sound'
import { hapticsAvailable, hapticsOn, setHapticsOn, buzz } from '@/services/haptics'
import { reminderAvailable } from '@/services/reminder'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import ReminderSwitch from './ReminderSwitch.vue'
import StatsPanel from './StatsPanel.vue'

defineEmits(['scores'])

const stats = useStatsStore()
const arcade = useArcadeStore()
const { canInstall, prompt } = useInstallPrompt()
const version = __APP_VERSION__

const soundOn = ref(!isMuted())
const toggleSound = () => {
  soundOn.value = !soundOn.value
  setMuted(!soundOn.value)
}
const vibrate = ref(hapticsOn())
const toggleVibrate = () => {
  vibrate.value = !vibrate.value
  setHapticsOn(vibrate.value)
  // Turning it on answers with the thing itself.
  if (vibrate.value) buzz('roll')
}
const streak = computed(() => stats.dayStreak())
</script>

<template>
  <div class="you">
    <h1 class="display">You</h1>

    <section class="card-surface block" aria-labelledby="record-h">
      <div class="row-head">
        <h2 id="record-h">Your record</h2>
        <p>Kept on this device</p>
      </div>
      <p v-if="streak > 0" class="streak">
        <b class="num">{{ streak }}</b> {{ streak === 1 ? 'day' : 'days' }} in a row
      </p>
      <StatsPanel embedded />
    </section>

    <section class="card-surface list" aria-label="Settings">
      <div class="setting">
        <span id="set-sound">Sound</span>
        <button
          type="button"
          role="switch"
          class="switch"
          :aria-checked="soundOn"
          aria-labelledby="set-sound"
          @click="toggleSound"
        >
          <span />
        </button>
      </div>
      <div v-if="hapticsAvailable" class="setting">
        <span id="set-vibrate">Vibration</span>
        <button
          type="button"
          role="switch"
          class="switch"
          :aria-checked="vibrate"
          aria-labelledby="set-vibrate"
          @click="toggleVibrate"
        >
          <span />
        </button>
      </div>
      <ReminderSwitch v-if="reminderAvailable" class="setting-row" />
      <div class="setting">
        <span>
          Your name on the daily board
          <small>{{ arcade.signedIn ? `Posting as ${arcade.name}` : 'Not signed in' }}</small>
        </span>
        <button type="button" class="btn-quiet small" @click="$emit('scores')">Manage</button>
      </div>
      <div v-if="canInstall" class="setting">
        <span>Add to your home screen</span>
        <button type="button" class="btn-quiet small" @click="prompt">Add</button>
      </div>
    </section>

    <nav class="links" aria-label="Game information">
      <a href="../how-to-play.html">How to play</a>
      <a href="../about.html">About</a>
      <a href="../privacy.html">Privacy</a>
    </nav>
    <p class="version">Shut The Cube v{{ version }}</p>
  </div>
</template>

<style scoped>
.you {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
h1 {
  margin: 0;
  font-weight: 700;
  font-size: 2.125rem;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.block {
  padding: 1rem;
}
.row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.row-head h2 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}
.row-head p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--muted);
}
.streak {
  margin: 0.5rem 0 0;
  font-size: 0.9375rem;
  color: var(--muted);
}
.streak b {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink);
}

.list {
  padding: 0 1rem;
}
.setting {
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
.setting + .setting,
.setting + .setting-row,
.setting-row + .setting {
  border-top: 1px solid var(--line);
}
.setting small {
  display: block;
  font-size: 0.8125rem;
  color: var(--muted);
}
.small {
  min-height: 2.75rem;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.5rem;
}
.links a {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  font-size: 0.9375rem;
  font-weight: 600;
}
.version {
  margin: 0;
  font-size: 0.75rem;
  color: var(--muted);
}

</style>
