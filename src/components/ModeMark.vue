<script setup>
/**
 * One drawing per mode, in a shared 200x72 box — the menu card's art. The
 * part that carries the mode's identity is `currentColor`, so the card's
 * accent decides it; the supporting tiles stay bone.
 *
 *   beginner  one classic row, two tiles already shut
 *   medium    the nine-row field with a whole column collapsing at once
 *   ninja     the same field, against a clock that is mostly run out
 *
 * Hovering the card the mark sits in makes each one do its thing: the
 * beginner tile hops, the medium column drops, the ninja clock sweeps.
 * Those hover rules live in the unscoped block below, because the trigger
 * (.card:hover) belongs to the parent.
 */
defineProps({
  mode: { type: String, required: true }
})

const COLS = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const ROWS = [0, 1, 2]
</script>

<template>
  <svg viewBox="0 0 200 72" class="mode-mark" aria-hidden="true" focusable="false">
    <template v-if="mode === 'beginner'">
      <rect
        v-for="i in COLS.filter((c) => c !== 4)"
        :key="i"
        :x="4 + i * 22"
        y="21"
        width="18"
        height="30"
        rx="5"
        :class="i === 2 || i === 6 ? 'hole' : 'tile'"
      />
      <rect x="92" y="21" width="18" height="30" rx="5" class="hot mm-hop" />
    </template>

    <template v-else-if="mode === 'medium'">
      <template v-for="r in ROWS" :key="r">
        <rect
          v-for="i in COLS.filter((c) => c !== 5)"
          :key="`${r}-${i}`"
          :x="4 + i * 22"
          :y="6 + r * 22"
          width="18"
          height="18"
          rx="4"
          class="tile"
          :opacity="0.55 - r * 0.12"
        />
      </template>
      <g class="mm-col">
        <rect v-for="r in ROWS" :key="r" x="114" :y="3 + r * 22" width="18" height="18" rx="4" class="hot" />
        <circle cx="132" cy="6" r="7" class="badge" />
        <text x="132" y="9" class="badge-num">3</text>
      </g>
    </template>

    <template v-else>
      <template v-for="r in ROWS" :key="r">
        <rect
          v-for="i in [0, 1, 2, 3, 4, 5]"
          :key="`${r}-${i}`"
          :x="4 + i * 22"
          :y="6 + r * 22"
          width="18"
          height="18"
          rx="4"
          class="tile"
          :opacity="0.5 - r * 0.12"
        />
      </template>
      <circle cx="166" cy="36" r="26" class="clock-face" />
      <path d="M166 10 A26 26 0 1 1 143.5 23" fill="none" class="clock-run" />
      <g class="mm-hand">
        <path d="M166 36 L166 16" class="clock-hand" />
        <circle cx="166" cy="36" r="3.5" class="clock-pin" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
.mode-mark {
  display: block;
  width: 100%;
  height: 100%;
}
.tile {
  fill: rgb(234 243 238 / 80%);
}
.hole {
  fill: var(--hole);
  stroke: rgb(234 243 238 / 30%);
  stroke-width: 1.5;
}
.hot {
  fill: currentColor;
}
.badge {
  fill: currentColor;
  stroke: rgb(9 29 22 / 70%);
  stroke-width: 1.5;
}
.badge-num {
  font: 700 9px var(--font-num);
  fill: #10291d;
  text-anchor: middle;
}
.clock-face {
  fill: rgb(9 29 22 / 55%);
  stroke: rgb(234 243 238 / 30%);
  stroke-width: 2;
}
.clock-run {
  stroke: currentColor;
  stroke-width: 4;
  stroke-linecap: round;
}
.clock-hand {
  stroke: var(--bone);
  stroke-width: 2.5;
  stroke-linecap: round;
}
.clock-pin {
  fill: var(--bone);
}
</style>

<style>
/* Hover life for the marks — unscoped because the trigger is the parent card. */
.card .mm-hop,
.card .mm-col,
.card .mm-hand {
  transform-box: view-box;
}
.card:hover .mm-hop,
.card:focus-visible .mm-hop {
  animation: mm-hop 0.55s cubic-bezier(0.3, 1.4, 0.4, 1) infinite;
  transform-origin: 101px 51px;
}
@keyframes mm-hop {
  0%,
  100% {
    transform: translateY(0) scale(1, 1);
  }
  35% {
    transform: translateY(-5px) scale(0.96, 1.05);
  }
  70% {
    transform: translateY(0) scale(1.04, 0.94);
  }
}
.card:hover .mm-col,
.card:focus-visible .mm-col {
  animation: mm-drop 0.9s ease-in-out infinite;
}
@keyframes mm-drop {
  0%,
  100% {
    transform: translateY(0);
  }
  45% {
    transform: translateY(4px);
  }
  60% {
    transform: translateY(3px);
  }
}
.card:hover .mm-hand,
.card:focus-visible .mm-hand {
  animation: mm-sweep 1.4s linear infinite;
  transform-origin: 166px 36px;
}
@keyframes mm-sweep {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .card:hover .mm-hop,
  .card:hover .mm-col,
  .card:hover .mm-hand,
  .card:focus-visible .mm-hop,
  .card:focus-visible .mm-col,
  .card:focus-visible .mm-hand {
    animation: none;
  }
}
</style>
