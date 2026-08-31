<script setup>
/**
 * The six glyphs the game used from Font Awesome 4, inlined as SVG.
 * FA4 was last released in 2016 and was the app's only webfont.
 */
defineProps({
  name: { type: String, required: true },
  spin: { type: Boolean, default: false }
})

const PATHS = {
  home: 'M12 3 2 12h3v8h5v-5h4v5h5v-8h3z',
  close: 'M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z',
  arrowRight: 'M4 11h11.2l-4.6-4.6L12 5l7 7-7 7-1.4-1.4 4.6-4.6H4z',
  check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
  refresh: 'M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z',
  trophy: 'M18 4V2H6v2H2v3a5 5 0 0 0 4.6 5A6 6 0 0 0 11 15.9V18H7v2h10v-2h-4v-2.1a6 6 0 0 0 4.4-3.9A5 5 0 0 0 22 7V4zM4 7V6h2v4a3 3 0 0 1-2-3m16 0a3 3 0 0 1-2 3V6h2z',
  undo: 'M12.5 8H8V3.5L2.8 8.7l5.2 5.2V9.4h4.5a4.6 4.6 0 0 1 0 9.2H6V20h6.5a6 6 0 0 0 0-12z',
  bulb: 'M9 21h6v-1H9zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2m0 2a5 5 0 0 1 2.9 9.1l-.9.6V16h-4v-2.3l-.9-.6A5 5 0 0 1 12 4',
  chart: 'M4 20h16v2H2V2h2zm4-2H6v-7h2zm4 0h-2V7h2zm4 0h-2v-4h2zm4 0h-2V9h2z'
}
</script>

<template>
  <svg
    class="app-icon"
    :class="{ spin }"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="PATHS[name]" />
  </svg>
</template>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: -0.125em;
}
.spin {
  animation: icon-spin 1s linear infinite;
}
@keyframes icon-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
