<template>
  <div class="Game">
     
    <div class="tile-position">
   <app-tiles v-for="(tiles, index) in tilesObj" :clickAudio="clickAudio" :index="index" :allTiles="tilesObj" :tiles="tiles" :key="tiles.index"></app-tiles>
    </div>

        <ul
        
         class="list-position list-reset flex justify-between w-full items-center  mb-2">
            <li class="w-12">
                 
                
            </li>
<li style="color:greenyellow">
  
  <animated-integer v-if="tilesObj.length > 2" :title="'Bonus'" v-bind:value="gameBonus"></animated-integer>
  
</li>
            <li class="flex-grow " >
               <div id="dice" unselectable="on" class="unselectable" :class="[{blocked: game.diceInUse || (!game.state == 'isStart' && game.state == 'isNext')}]">
      
        <app-dice v-for="dice in game.dice"  :value="dice.number" :key="dice.id"></app-dice>
     
    </div>
            </li>
<li style="color:yellow">
  <animated-integer v-if="tilesObj.length > 2" :isAudio="true" v-bind:title="'Points'" v-bind:value="gamePoints"></animated-integer>
</li>
            <li class="w-12 mr-2">

            </li>
            
        </ul>

   
    <transition name="fade" mode="out-in">
      <button  unselectable="on" v-bind:key="game.state" v-if="buttonGameStateMessage && !gameIsLoading"
      @click.prevent.stop.once="gameState" 
      v-touch="gameTouchState"
      :class="{'shakeIt': game.state =='isOver'}"
      class="unselectable no-outline list-reset flex mb-2 bg-yellow-light border-b-4 border-black rounded-b 
        action-button animated " style="max-width:200px; margin:0 auto;">
        
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


       
                <div class="game">
                      <!-- <div v-html="game.note"></div> &nbsp;  -->
                      <app-tiles-selected :tiles="tilesSelectedObj" :game="game" :gamePoints="gamePoints"></app-tiles-selected>
                    
                </div>
     

      </template>
    </transition>

  </div>

</template>

<script>
import { mapActions } from "vuex";
import Tiles from "./Tiles";
import TilesSelected from "./TilesSelected";
import Dice from "./AnimatedDice";
import AnimatedInteger from "./AnimatedInteger";
import $ from "../services/gameServices";
var Shake = require("shake.js");
let shakeEvent = new Shake({
  threshold: navigator.userAgent.match(/Android/i) ? 4 : 8, // optional shake strength threshold
  timeout: 1000 // optional, determines the frequency of event generation
});
export default {
  name: "Game",
  data() {
    return {
      msg: "new message",
      diceObj: {}
    };
  },
  computed: {
    tilesObj() {
      return this.$store.getters.tiles == null ? {} : this.$store.getters.tiles;
    },
    tilesSelectedObj() {
      var tiles = _.filter(_.flatten(this.$store.getters.tiles), function(t) {
        return t.isInUse == true && t.isCollateral == false;
      });
      return tiles;
    },
    game() {
      return this.$store.getters.game;
    },
    gameIsLoading() {
      return this.$store.getters.gameIsLoading;
    },
    gameBonus() {
      return this.$store.getters.gameBonus;
    },
    gamePoints() {
      return this.$store.getters.gamePoints;
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
      if (this.gameIsLoading) {
        return "fa fa-refresh fa-spin";
      } else {
        switch (this.game.state) {
          //
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
    }
  },
  methods: {
    ...mapActions({
      restartGame: "restartGame"
    }),
    gameTouchState() {
      if (!this.gameIsLoading && $.isMobile()) {
        this.gameAction();
      }
    },
    gameState() {
      if (!this.gameIsLoading && !$.isMobile()) {
        this.gameAction();
      }
    },
    gameAction() {
      this.$store.commit("SET_IS_LOADING", true);

      // const audio = new Audio();
      // audio.src = document.querySelector("#click2").src;
      // audio.play().then(() => {
        //new Audio(require('../../static/click2.mp3')).play();
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
      // });
    },
    // shuffleTiles: function() {
    //   this.$store.dispatch("shuffleTiles");
    // },
    initStartGame() {
      let self = this;

      self.$store.dispatch("startGame").then(() => {
        self.$store.dispatch("setTiles", true).then(() => {
          self.$store.commit("SET_IS_LOADING", false);
        });
      });
    },
    initNextGame() {
      let self = this;

      self.$store.dispatch("nextGame").then(() => {
        self.$store.dispatch("setTiles", true).then(() => {
          self.$store.commit("SET_IS_LOADING", false);
        });
      });
    }
  },
  components: {
    appTiles: Tiles,
    appTilesSelected: TilesSelected,
    appDice: Dice,
    animatedInteger: AnimatedInteger
  },
  created(){
     this.clickAudio  = new Audio(document.querySelector('#click').src);
  },
  destroy() {
    shakeEvent.stop();
  },
  mounted() {
    let self = this;

    if ($.isMobile()) {
      self.$toasted.success("Shake it to roll the dice", {
        position: "top-center",
        duration: 2000
      });
      shakeEvent.start();
      window.addEventListener(
        "shake",
        function() {
          //alert("shake");
          self.gameTouchState();
        },
        false
      );
    }
  }
};
</script>
<style scoped>
*.unselectable {
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;

  /*
     Introduced in IE 10.
     See http://ie.microsoft.com/testdrive/HTML5/msUserSelect/
   */
  -ms-user-select: none;
  user-select: none;
}

.tile-position {
  z-index: 20;
  position: relative;
}

.list-position {
  z-index: 0;
  position: relative;
}
.height45 {
  height: 35px;
}

.side-background {
  fill: transparent;
}

.side-number {
  fill: #3a424a;
}
.blocked {
  opacity: 0.5;
}
#dice {
  color: #222;
}
.btn {
  color: #222;
  border: #222 solid 1px;
  padding: 10px;
  font-size: 16px;
}

.animate {
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
}
div:focus {
  outline: blue solid 2px;
}
.action-button:active:not(.tileSelected) {
  transform: translate(0px, 1px);
  -webkit-transform: translate(0px,1px);
  border-bottom: 1px solid;
}
.no-outline:focus {
  outline: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}



.shakeIt {
  -webkit-animation: shake 0.5s; /* Safari 4+ */
  -moz-animation: shake 0.5s; /* Fx 5+ */
  -o-animation: shake 0.5s; /* Opera 12+ */
  animation: shake 0.5s; /* IE 10+, Fx 29+ */
}


/* Portrait */
@media only screen and (max-device-width: 320px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait) {
  .list-position {
    max-height: 45px;
  }

  .shutTheBox .list-position{
    max-height: 70px;
  }
}

.toasted-container {
    width: 80% !important;
  }
</style>