<script setup>
import { computed, toRef } from 'vue'
import { useTweenedNumber } from '@/composables/useTweenedNumber'

const props = defineProps({
  value: { type: Number, required: true }
})

// Tweening through the faces makes the die look like it is tumbling.
const displayed = useTweenedNumber(toRef(props, 'value'), 300)
const face = computed(() =>
  String.fromCodePoint(0x2680 + Math.min(Math.max(Math.abs(displayed.value - 1), 0), 5))
)
const label = computed(() => (props.value > 0 ? `Dice showing ${props.value}` : 'Dice'))
</script>

<template>
  <span :aria-label="label" role="img">{{ face }}</span>
</template>

<style scoped>
span {
  font-size: 100px;
  line-height: 1;
}
@media only screen and (min-device-width: 320px) and (max-device-width: 568px) and (-webkit-min-device-pixel-ratio: 2) {
  span {
    font-size: 50px;
  }
  .shutTheBox span {
    font-size: 70px;
  }
}
</style>
