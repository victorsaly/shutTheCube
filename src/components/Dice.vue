<template>
    <span  v-html="dice.html"></span>
</template>

<script>
export default {
  data() {
    return {
      animation: ""
    };
  },
  props: ["dice"]
};
</script>

<style scoped>


span {
  font-size: 100px;
}

/* Portrait and Landscape */
@media only screen and (min-device-width: 320px) and (max-device-width: 568px) and (-webkit-min-device-pixel-ratio: 2) {
  span {
    font-size: 50px;
  }
}
</style>