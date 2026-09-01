<script setup>
import { toRef } from 'vue'
import { useTweenedNumber } from '@/composables/useTweenedNumber'

const props = defineProps({
  value: { type: Number, required: true },
  title: { type: String, default: '' },
  /** The header has far less vertical room than the board footer. */
  compact: { type: Boolean, default: false }
})

const displayed = useTweenedNumber(toRef(props, 'value'), 500)
</script>

<template>
  <div class="position" :class="{ compact }">
    <div class="value">{{ displayed }}</div>
    <span class="label">{{ title }}</span>
  </div>
</template>

<style scoped>
/*
 * Scoreboard treatment: the value carries the weight, the label recedes.
 * Tabular figures stop the number jittering as it counts up, and the slab of
 * numerals reads as a readout rather than as body text.
 */
.position {
  display: grid;
  gap: 0.1rem;
  justify-items: center;
  line-height: 1;
}
.value {
  font-family: var(--font-num);
  font-size: clamp(1.5rem, 5.2vmin, 2.4rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1, 'lnum' 1;
  color: var(--readout, var(--bone));
  text-shadow: 0 2px 6px rgb(0 0 0 / 45%);
}
.label {
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.compact .value {
  font-size: clamp(1.15rem, 3.6vmin, 1.6rem);
}
.compact .label {
  font-size: 0.56rem;
  letter-spacing: 0.1em;
}
</style>
