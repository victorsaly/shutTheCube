<script setup>
/**
 * The logo, drawn. A die face of five, built out of the board's own tiles:
 * four faces in the tile pastels and the centre pip already shut — the whole
 * game in one mark. Replaces the 2018 PNG wordmark, so it is crisp at any
 * size and its centre can breathe.
 */
defineProps({
  /** Rendered size in px; the drawing scales losslessly. */
  size: { type: Number, default: 56 }
})
</script>

<template>
  <svg
    class="mark"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="3" y="3" width="58" height="58" rx="15" class="frame" />
    <rect x="11" y="11" width="15" height="15" rx="4.5" fill="#a2f5bf" />
    <rect x="38" y="11" width="15" height="15" rx="4.5" fill="#6cb2eb" />
    <rect x="11" y="38" width="15" height="15" rx="4.5" fill="#d6bbfc" />
    <rect x="38" y="38" width="15" height="15" rx="4.5" fill="#fff382" />
    <rect x="24.5" y="24.5" width="15" height="15" rx="4.5" class="shut" />
  </svg>
</template>

<style scoped>
.mark {
  display: block;
  
}
.frame {
  fill: #ffffff;
  stroke: var(--ink);
  stroke-width: 3;
}
/* The centre tile is already shut — and it breathes, like the box waiting. */
.shut {
  fill: var(--sunk);
  stroke: none;
  stroke-width: 1.5;
  transform-origin: 32px 32px;
  animation: shut-breathe 3.6s ease-in-out infinite alternate;
}
@keyframes shut-breathe {
  from {
    transform: scale(0.94);
  }
  to {
    transform: scale(1.04);
  }
}
@media (prefers-reduced-motion: reduce) {
  .shut {
    animation: none;
  }
}
</style>
