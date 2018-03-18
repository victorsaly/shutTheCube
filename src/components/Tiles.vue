<template>
    <transition-group :duration="300" name="flip-list" tag="ul">
        <li v-for="(t, p) in tiles" v-bind:key="t.id">
          <div style="position:relative">
          <div  :class="{explosion : t.isExplosion}"></div>
          <div @click="selectTile(t, p, index)" 
          :class="[t.cssClass, 
          {isAvailable : t.isAvailable}, 
          {isNotAvailable: !t.isAvailable}, 
          {isTaken : t.isTaken}, 
          {isInUse: t.isInUse}, 'animated ' + t.action]"  
                  
          class="
          
                      box
                      active 
                      text-black 
                      text-center 
                      border-b-4 
                      border-black 
                      rounded  
                      no-underline 
                      animate 
                      action-button sm:text-sm md:text-lg lg:text-xl xl:text-2xl
                      
                      ">
                    <p class="number">{{ t.index }}</p>
                </div>
         </div>
        </li>

      </transition-group>
</template>

<script>
Array.prototype.move = function(old_index, new_index) {
  if (new_index >= this.length) {
    var k = new_index - this.length;
    while (k-- + 1) {
      this.push(undefined);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this; // for testing purposes
};
//import delay from 'delay'

export default {
  
  props: ["tiles", "index", "allTiles"],
  computed: {
    diceSum() {
      return this.$store.getters.diceSum;
    },
    sumTilesInUse(){
      return this.$store.getters.sumTilesInUse
    }
  },
  methods: {
    selectTile: function(tile, position, index) {
      if (tile.isAvailable && !tile.isTaken && (this.sumTilesInUse + tile.index <= this.diceSum)) {
        //get number of rows
        var numberOfRows = this.allTiles.length;
        var forIndexTop = numberOfRows - this.index;
        // debugger;

        if (this.index > 1) {
          //find similar numbers to the top array level
          for (var i = this.index - 1; i > -1; i--) {
            // where i is my new index;
            //console.log(i);
            if (this.allTiles[i][position].index == tile.index && !this.allTiles[i][position].isTaken) {
              //console.log("Tile from top array" + i + " is the same");
              this.setTile(this.allTiles[i][position], i);
            } else {
              break;
            }
          }
        } else if (this.index == 1) {
          if (this.allTiles[0][position].index == tile.index && !this.allTiles[0][position].isTaken) {
            //console.log("Tile from first level array 0 is the same");
            this.setTile(this.allTiles[0][position], 0);
          }
        }

        //find similar numbers from the lower array level
        for (var i = this.index + 1; i < numberOfRows; i++) {
          if (this.allTiles[i][position].index == tile.index && !this.allTiles[i][position].isTaken) {
            //console.log("Tile from bottom array " + (i + 1) + " is the same");
            this.setTile(this.allTiles[i][position], i);
          } else {
            break;
          }
        }

        this.setTile(tile, index);
      }else{
        //alert('unavailable')
        //Make an animation that it's not available pending....
        
      }
    },

    async setTile(tile, index) {
     
      // small hack to reset it by removing it before changing the target
      var _tile = Object.assign({}, tile);
      _tile.action = "rotateIn";
      _tile.isExplosion = true;
      _tile.isInUse = true;
      _tile.isCollateral = index != this.index;
      var self = this;
      await this.$store
        .dispatch("setTileByIndex", { tile: _tile, index: index })
        .then(() => {
          this.$store.dispatch("sumTilesInUse");
          setTimeout(() => {
            var _tile = Object.assign({}, tile);
            _tile.action = "";
            _tile.isExplosion = false;
            this.$store
              .dispatch("setTileByIndex", { tile: _tile, index: index })
              .then(() => {
                self.changeTile(index, tile.id);                
              });
          }, 500);
        });

      // await this.$nextTick().then(() => {
      //   console.log('next tick')

      // });
    },
    //     setTile:function(tile, index){
    //         var _tile = Object.assign({}, tile);
    //         _tile.action = "rotateIn";
    //         _tile.isInUse = true;
    //         this.$store.dispatch("setTileByIndex", { tile: _tile, index: index }).then(delay(1)).then(()=>{
    // this.changeTile(index, tile.id);
    //         });

    //     },
    changeTile: function(tileIndex, id) {
      var self = this;
      this.$store
        .dispatch("moveTiles", { tileIndex: tileIndex, id: id })
        .then(() => {
          self.$store.dispatch("setTiles", tileIndex == self.index);
        });
      // this.tiles.move(
      //   _.findIndex(this.tiles, ["index", index]),
      //   this.tiles.length - 1
      // );
    }
  }
};
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 5px 0 0;
}
a {
  color: #42b983;
}

.rotateIn {
  -webkit-animation: rotateIn 0.5s; /* Safari 4+ */
  -moz-animation: rotateIn 0.5s; /* Fx 5+ */
  -o-animation: rotateIn 0.5s; /* Opera 12+ */
  animation: rotateIn 0.5s; /* IE 10+, Fx 29+ */
}

/* BOXES */

.box {
  height: 45px;
  width: 45px;
  line-height: 180%;
  cursor: pointer;
  float: left;
  border-bottom: 4px solid #444;
}

.blocked span {
  opacity: 0.3;
}

.box:focus,
.box:hover {
  color: #333;
}
.isTaken {
  color: gray;
  cursor: not-allowed;
  opacity: 0.3 !important;
  background: gray;
}


.isInUse {
    color: yellow !important;
    cursor: not-allowed;
    background: gray;
    opacity: 0.3;
}

.isAvailable {
  color: #000;
   -webkit-transition: background 0.2s linear;
    -moz-transition: background 0.2s linear;
    -o-transition: background 0.2s linear;
    transition: background 0.2s linear;
}

.isNotAvailable {
    color: #444 !important;
    opacity: 0.5;
    cursor: not-allowed;
    background: cadetblue;
     -webkit-transition: background 0.3s linear;
    -moz-transition: background 0.3s linear;
    -o-transition: background 0.3s linear;
    transition: background 0.3s linear;
}


.explosion {
  width: 100px;
  height: 100px;
   position: absolute; 
  top: -25px;
  background: url('../assets/explosion.png') no-repeat;
  background-position: 0 0;
  animation: explosion-animation 1s steps(28);
      margin-left: -29px;
}
.explosion:hover {
  background-position: -2800px 0;
  transition: background 1s steps(28);
}
@keyframes explosion-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -2800px 0;
  }
}


/* Portrait */
@media only screen 
  and (max-device-width: 320px) 
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: portrait) {
    .box {      
      width: 30px !important;
      height: 28px !important;   
      line-height: 160% !important;   
    }
}

/* Portrait and Landscape */
@media only screen 
  and (min-device-width: 320px) 
  and (max-device-width: 568px)
  and (-webkit-min-device-pixel-ratio: 2) {
    .box {
  height: 36px;
  width: 35px;
  line-height: 200%;
  cursor: pointer;
  float: left;
  border-bottom: 4px solid #444;
}

}

</style>