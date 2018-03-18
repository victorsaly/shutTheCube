<template>
 <div 
 :class="[{isMobile : isMobile && tilesLength > 1},  {'container' : !isMobile}]"
 class="w-full h-screen bg-gradient-brand  mx-auto relative ">  
  <div id="warning-message">

     <div class="w-full h-screen  absolute flex items-center justify-center bg-modal bg-green-light" 
     >
      <!-- @click.self="modal.visible = false" -->
        <div class=" text-center">
           <!-- overflow-y-scroll -->
           <div class="mb-4">
                 <img src="./assets/Logo_STB.png" style="max-height:30px;"> 
            </div>
            <div class="mb-8">
                <p> This App is only viewable in vertical mode.</p>
            </div>
          
        </div>
    </div>
  </div>
  <div id="app">
  <!-- <transition name="fade" :duration="{ enter: 1000, leave: 1000 }" mode="in-out"> -->
  <div style="height:70px;">
   <app-header  v-if="gameIsVisible"></app-header>
  </div>
  
  <!-- </transition> -->
  <transition name="fade" mode="out-in">
    <template v-if="!gameIsVisible">
      <div class="h-screen w-full absolute flex items-center justify-center bg-modal" 
      style="height: calc(100% - 200px);">
      <!-- @click.self="modal.visible = false" -->
        <div class="bg-white rounded shadow p-8 m-4 max-w-xs max-h-full text-center">
           <!-- overflow-y-scroll -->
            <div class="mb-4">
                 <img src="./assets/Logo_STB.png" style="max-height:30px;"> 
            </div>
            <div class="mb-8">
                <p>Select the game you want to play.</p>
            </div>
            <div class="flex justify-center">
                <button class="flex-no-shrink text-white py-2 px-4 rounded bg-teal hover:bg-teal-dark"
                @click="setGame(1)"
                >Shut The Box</button>
                <button class="flex-no-shrink text-white ml-2 py-2 px-4 rounded bg-teal hover:bg-teal-dark"
                @click="setGame(9)"
                >Shut The Cube</button>
            </div>
        </div>
      </div>
    </template>
    <template v-else>
           <router-view/>
    </template>
 </transition>

      </div>
 </div>
</template>

<script>
import Header from './components/Header';
import $ from './services/gameServices'

export default {

  name: 'app',
  data: function() {
    return {
      isMobile:false
    };
  },
   computed: {
    gameIsVisible() {
      return this.$store.getters.gameIsVisible;
    },
    tilesLength(){
      return this.$store.getters.tiles == null ? 0 : this.$store.getters.tiles.length;
    }
  },
  methods:{
    setGame(size){
      this.$store.dispatch("initTiles", size);
      this.$store.commit('SET_GAME_IS_VISIBLE', true);
    }
  },
  components: {
     appHeader: Header
  },
  created(){
    this.$store.dispatch('initGame');
    this.isMobile = $.isMobile();
  }
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
  background: #dedede; 
}
a{
  color: #222;
}
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .25s;
}
.fade-leave-active {
  /* transition-property: opacity; */
  transition-duration: 0;
  transition-delay: 0;
}
.fade-enter-active {
  transition-delay: .25s;
}

.fade-enter, .fade-leave-active {
  opacity: 0
}
#warning-message { display: none; }
@media only screen and (orientation:landscape) and (max-width: 1024px){
    .isMobile #app { display:none; }
    .isMobile #warning-message { display:block; }
}
@media only screen and (orientation:portrait){
    .isMobile #warning-message { display:none; }
}
</style>
