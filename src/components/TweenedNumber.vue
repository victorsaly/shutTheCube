<script setup>
import { ref, toRef } from 'vue'
import { useTweenedNumber } from '@/composables/useTweenedNumber'

const props = defineProps({
  value: { type: Number, required: true },
  title: { type: String, default: '' },
  /** The header has far less vertical room than the board footer. */
  compact: { type: Boolean, default: false }
})

const isFinished = ref(false)
const displayed = useTweenedNumber(toRef(props, 'value'), 500, () => {
  isFinished.value = true
})
</script>

<template>
  <div class="position" :class="{ explosion: isFinished, compact }">
    <div class="value">{{ displayed }}</div>
    <span>{{ title }}</span>
  </div>
</template>

<style scoped>
.value {
  padding-top: 31px;
  font-size: 31px;
}
span {
  color: #fefefe;
}
.position {
  width: 100px;
  height: 100px;
  position: relative;
  top: 0;
}
.compact {
  width: 84px;
  height: 58px;
}
.compact .value {
  padding-top: 6px;
  font-size: 22px;
}
.compact span {
  font-size: 11px;
}
.explosion {
  background: url('../assets/explosion.png') no-repeat;
  background-position: 0 0;
  animation: explosion-animation 1s steps(28);
}
@keyframes explosion-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -2800px 0;
  }
}
@media only screen and (min-device-width: 320px) and (max-device-width: 568px) and (-webkit-min-device-pixel-ratio: 2) {
  .value {
    padding-top: 27px;
    font-size: 25px;
  }
  .position {
    width: 100px;
    height: auto;
    top: -10px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .explosion {
    animation: none;
    background: none;
  }
}
</style>
