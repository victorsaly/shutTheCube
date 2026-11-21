<script setup>
import { ref } from 'vue'
import { useStatsStore } from '@/stores/stats'
import { MODE_LIST } from '@/stores/modes'

const emit = defineEmits(['start'])
const stats = useStatsStore()

/** 1 = solo, 2 = pass and play on this device. */
const players = ref(1)

/* Short enough for a card; each card is the whole pitch for its mode. */
const SUBS = {
  beginner: 'One row. The classic pub game.',
  medium: 'Nine rows. Matching columns collapse for a bonus.',
  ninja: 'Nine rows against the clock. 30 seconds a turn.'
}
/* One tile colour per mode, so a mode has a face without a second palette. */
const SWATCH = {
  beginner: 'bg-green-lighter',
  medium: 'bg-blue-light',
  ninja: 'bg-red-light'
}
</script>

<template>
  <div class="play">
    <h1 class="display">Play</h1>

    <div class="seg" role="group" aria-label="Players">
      <button type="button" :aria-pressed="players === 1" @click="players = 1">Solo</button>
      <button type="button" :aria-pressed="players === 2" @click="players = 2">
        Pass &amp; play
      </button>
    </div>
    <p class="lede">
      {{
        players === 1
          ? 'A random board. Free play is for practice and is not ranked.'
          : 'Two players, one phone, the identical board. Higher total wins.'
      }}
    </p>

    <ul class="modes">
      <li v-for="(m, i) in MODE_LIST" :key="m.key">
        <button type="button" class="mode card-surface" @click="emit('start', m.key, { players })">
          <span class="swatch" :class="SWATCH[m.key]" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <template v-if="m.key === 'beginner'">
                <rect x="2" y="9" width="5" height="6" rx="1.5" />
                <rect x="9.5" y="9" width="5" height="6" rx="1.5" />
                <rect x="17" y="9" width="5" height="6" rx="1.5" />
              </template>
              <template v-else-if="m.key === 'medium'">
                <rect v-for="n in 9" :key="n" :x="2 + ((n - 1) % 3) * 7.5" :y="2 + Math.floor((n - 1) / 3) * 7.5" width="5" height="5" rx="1.5" />
              </template>
              <template v-else>
                <circle cx="12" cy="13" r="8" class="line" />
                <path d="M12 9v4l2.5 2M9 2h6" class="line" />
              </template>
            </svg>
          </span>
          <span class="copy">
            <b class="display">{{ m.label }}</b>
            <span>{{ SUBS[m.key] }}</span>
          </span>
          <span class="meta">
            <span v-if="players === 1 && stats.hasPlayed(m.key)" class="best">
              Best <b class="num">{{ stats.bestFor(m.key) }}</b>
            </span>
            <kbd>{{ i + 1 }}</kbd>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.play {
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
.lede {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--muted);
}
.modes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.mode {
  width: 100%;
  min-height: 5.25rem;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-align: left;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.1s;
}
.mode:hover {
  border-color: var(--line-strong);
}
.swatch {
  flex: none;
  width: 3rem;
  height: 3.25rem;
  display: grid;
  place-items: center;
  padding-bottom: 4px;
  box-sizing: border-box;
  border-radius: 0.75rem;
  box-shadow:
    inset 0 -5px 0 var(--edge-c),
    inset 0 1px 0 rgb(255 255 255 / 55%);
  color: var(--tile-ink);
}
.swatch svg {
  fill: currentcolor;
}
.swatch .line {
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.4;
  stroke-linecap: round;
}
.copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.copy b {
  font-weight: 600;
  font-size: 1.25rem;
}
.copy span {
  font-size: 0.875rem;
  line-height: 1.35;
  color: var(--muted);
}
.meta {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: var(--muted);
}
.best b {
  color: var(--ink);
  font-size: 1rem;
}
</style>
