<template>
  <div class="Game">
   <app-tiles v-for="(tiles, index) in tilesObj" :index="index" :allTiles="tilesObj" :tiles="tiles" :key="tiles.index"></app-tiles>
        
   <div id="dice" :class="[{blocked: game.diceInUse || (!game.state == 'isStart' && game.state == 'isNext')}]">
        <app-dice v-for="dice in game.dice" :dice="dice" :key="dice.id"></app-dice>
    </div>
    <transition name="fade" mode="out-in">
      <button v-bind:key="game.state" v-if="buttonGameStateMessage"
      @click="gameState" 
      class="no-outline list-reset flex mb-2 bg-yellow-light border-b-4 border-black rounded-b animate  action-button" style="max-width:200px; margin:0 auto;">
        
         <div>
                <div class="text-black text-center  px-2 pt-2 py-1  no-underline  ">
                    <i :class="buttonGameStateIcon"></i>
                </div>
            </div>

            <div class="flex-grow  ">
                <div
                :class="buttonGameStateColour"
                 class=" text-black text-center bg-red-light px-2 pt-2 py-1  no-underline">
                    {{ buttonGameStateMessage }}
                </div>
            </div>
      </button>
      <template v-else>


         <div  class="no-outline list-reset flex mb-2  animate  action-button" style="margin:0 auto;">
        

            <div class="flex-grow  ">
                <div
                
                 class=" text-black text-center  px-2 pt-0 py-1  no-underline">
                      <div v-html="game.note"></div> &nbsp; 
                </div>
            </div>
      </div>

      </template>
    </transition>

  </div>

</template>

<script>
import { mapActions } from "vuex";
import Tiles from "./Tiles";
import Dice from "./Dice";
import AnimatedInteger from "./AnimatedInteger";
export default {
  name: "Game",
  data() {
    return {      
      diceObj: {}
    };
  },
  computed: {
    tilesObj() {
      return this.$store.getters.tiles;
    },
    game() {
      return this.$store.getters.game;
    },
    pointsTotal() {
      return this.$store.getters.sumTilesTaken;
    },
    buttonGameStateMessage() {
      switch (this.game.state) {
        case "isNext":
          return "ROLL DICE";
        case "isOver":
          return "GAME OVER";
        case "isStart":
          return "START GAME";
        case "isWin":
          return "SHUT THE BOX";
      }
    },
    buttonGameStateColour() {
      switch (this.game.state) {
        case "isNext":
          return "bg-green-light";
        case "isOver":
          return "bg-red-light";
        case "isStart":
          return "bg-green-light";
        case "isWin":
          return "bg-green-light";
      }
    },
    buttonGameStateIcon() {
      switch (this.game.state) {
        case "isNext":
          return "fa fa-arrow-right";
        case "isOver":
          return "fa fa-times";
        case "isStart":
          return "fa fa-arrow-right";
        case "isWin":
          return "fa fa-check";
      }
    }
  },
  methods: {
    ...mapActions({
      restartGame: "restartGame"
    }),
    gameState() {
      switch (this.game.state) {
        case "isNext":
          this.initNextGame();
          break;
        case "isOver":
          this.restartGame();
          break;
        case "isStart":
          this.initStartGame();
          break;
        case "isWin":
          this.restartGame();
          break;
      }
    },
    // shuffleTiles: function() {
    //   this.$store.dispatch("shuffleTiles");
    // },
    initStartGame() {
      this.$store.dispatch("startGame").then(() => {
        this.$store.dispatch("setTiles", true);
      });
    },
    initNextGame() {
      this.$store.dispatch("nextGame").then(() => {
        this.$store.dispatch("setTiles", true);
      });
    }
  },
  components: {
    appTiles: Tiles,
    appDice: Dice,
    animatedInteger: AnimatedInteger
  },
  created() {}
};
</script>
<style scoped>
.height45{
  height: 35px;
}

.side-background {
  fill: transparent;
}

.side-number {
  fill: #3a424a;
}
.blocked {
  opacity: 0.2;
}
.btn {
  color: #222;
  border: #222 solid 1px;
  padding: 10px;
  font-size: 16px;
}

.animate {
  transition: all 0.8s;
  -webkit-transition: all 0.8s;
}
div:focus {
  outline: blue solid 2px;
}
.action-button:active:not(.tileSelected) {
  transform: translate(0px, 4px);
  -webkit-transform: translate(0px, 4px);
  border-bottom: 1px solid;
}
.no-outline:focus {
  outline: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>