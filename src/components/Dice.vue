<template>
    <span v-html="dice.html"></span>
</template>

<script>
    export default {
        props: ['dice']
    }
</script>

<style scoped>
span {
    font-size: 100px;
}
</style>