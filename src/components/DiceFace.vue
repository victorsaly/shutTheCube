<script setup>
import { computed, toRef, watch, ref } from 'vue'
import { useTweenedNumber } from '@/composables/useTweenedNumber'

const props = defineProps({
  value: { type: Number, required: true },
  /** A die the current turn is not using (the classic single-die rule). */
  inactive: { type: Boolean, default: false }
})

// Tweening through the faces makes the die look like it is tumbling. The old
// build used the unicode dice glyphs, which render inconsistently across
// platforms — thin outlines on some, solid on others — so these are drawn.
const displayed = useTweenedNumber(toRef(props, 'value'), 300)
const face = computed(() => Math.min(Math.max(Math.round(displayed.value), 1), 6))

const PIPS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]]
}

const rolling = ref(false)
watch(
  () => props.value,
  (to, from) => {
    if (to === from || props.inactive) return
    rolling.value = true
    setTimeout(() => (rolling.value = false), 320)
  }
)
</script>

<template>
  <svg
    class="die"
    :class="{ rolling, inactive }"
    viewBox="0 0 100 100"
    role="img"
    :aria-label="inactive ? 'Die not in play' : `Die showing ${value}`"
  >
    <rect x="4" y="4" width="92" height="92" rx="18" class="body" />
    <circle v-for="([cx, cy], i) in PIPS[face]" :key="i" :cx="cx" :cy="cy" r="9" class="pip" />
  </svg>
</template>

<style scoped>
.die {
  width: clamp(38px, 11vmin, 74px);
  height: clamp(38px, 11vmin, 74px);
  display: inline-block;
  filter: drop-shadow(0 2px 3px rgb(0 0 0 / 25%));
}
.body {
  fill: #fdfdfb;
  stroke: #22292f;
  stroke-width: 5;
}
.pip {
  fill: #22292f;
}
.inactive {
  opacity: 0.35;
}
.inactive .body {
  fill: #cfd8d3;
}
.rolling {
  animation: tumble 0.32s ease-out;
}
@keyframes tumble {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.14);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .rolling {
    animation: none;
  }
}
</style>
