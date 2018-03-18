<template>
  <div class="spinner">
    <img src="../../assets/images/loading.svg" alt="loading"/>
  </div>
</template>
<script>
import {mapGetters} from 'vuex';
import {mapActions} from 'vuex';
export default {
  methods:{
    ...mapActions({
      signInRedirect:'signinRedirectCallback'
    })
  },
    mounted () {
      this.signInRedirect()
    }
}
</script>
<style>
  .spinner {
    position: absolute;
    display: flex;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background-color: white;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>