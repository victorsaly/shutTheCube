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
  <button type="button" class="share btn-primary" aria-live="polite" @click="onShare">
    <AppIcon :name="state === 'idle' ? 'share' : 'check'" />
    {{ state === 'shared' ? 'Shared' : state === 'copied' ? 'Copied' : 'Share result' }}
  </button>
</template>

<style scoped>
.share {
  width: 100%;
}
</style>
