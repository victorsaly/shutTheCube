<template>
 <div class="w-full h-screen bg-gradient-brand  mx-auto relative container">

   

<ul class="list-reset flex justify-between w-full items-center  mb-2">
            <li class="w-12"
            >
                <a class="inline-block text-black text-center bg-green-light px-2 py-2 m-2 ml-0 border-b-4 border-black rounded-b  no-underline w-10"
                    href="#">VS</a>
            </li>
<li>
  
  <animated-integer :title="'Play'" v-bind:value="numberPlay"></animated-integer>
  
</li>
            <li class="flex-grow ">
                <img src="./assets/Logo_STB.png" style="max-height:30px;">
            </li>
<li>
  <animated-integer v-bind:title="'Points'" v-bind:value="pointsTotal"></animated-integer>
</li>
            <li class="w-12">
                <a class="inline-block text-black text-center bg-blue-light px-2 py-2 m-2 mr-0 border-b-4 border-black rounded-b no-underline w-10"
                    href="#">
                    <i class="fa fa-list"></i>
                </a>
            </li>
        </ul>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <router-view/>
  </div>
  
 </div>
</template>

<script>
import AnimatedInteger from "./components/AnimatedInteger";

export default {
  
  name: 'app',
  created(){
    this.$store.dispatch("initTiles");    
    this.$store.dispatch('initGame');
  },
  components: {
    animatedInteger: AnimatedInteger
  },
  computed: {
    pointsTotal() {
      return this.$store.getters.sumTilesTaken;
    },
    numberPlay() {
      return this.$store.getters.game.numberPlay;
    }
  },
}
</script>

<style>
@import url('https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css');
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.css');
#app, body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color:#222;
   -moz-user-focus: ignore;
  -moz-user-select: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -o-user-select: none;
  user-select: none;
   /* margin-top: 20px; */
  /* background: black; */
}
a{
  color: #222;
}
</style>
