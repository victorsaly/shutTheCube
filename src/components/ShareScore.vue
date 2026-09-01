<script setup>
import { onUnmounted, ref } from 'vue'
import { shareScore } from '@/services/share'
import AppIcon from './AppIcon.vue'

/**
 * One button on every results screen. The device's own share sheet already
 * lists WhatsApp and everything else, so there is nothing per-app here.
 */
const props = defineProps({
  /** { modeLabel, modeKey, score, max, rolls, won } */
  result: { type: Object, required: true }
})

const state = ref('idle')
let timer = 0

const flash = (next) => {
  state.value = next
  clearTimeout(timer)
  timer = setTimeout(() => (state.value = 'idle'), 1800)
}
onUnmounted(() => clearTimeout(timer))

const onShare = async () => {
  const outcome = await shareScore(props.result)
  if (outcome !== 'cancelled') flash(outcome)
}
</script>

<template>
  <button type="button" class="share" aria-live="polite" @click="onShare">
    <AppIcon :name="state === 'idle' ? 'share' : 'check'" />
    {{ state === 'shared' ? 'Shared' : state === 'copied' ? 'Copied' : 'Share your score' }}
  </button>
</template>

<style scoped>
.share {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.6rem;
  padding: 0.55rem 1.1rem;
  font: inherit;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bone);
  background: none;
  border: 1px solid rgb(234 243 238 / 32%);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.1s;
}
.share:hover {
  border-color: color-mix(in srgb, var(--accent) 75%, transparent);
}
</style>
