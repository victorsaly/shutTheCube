<template>
<div>
 <ul>
       
                     <li v-for="t in tiles" :key="t.index"> 
                       
        
          <div 
          
          :class="[t.cssClass]"  
                  
          class="
          
                      box
                      active 
                      text-black 
                      text-center 
                      border-b-4 
                      border-black 
                      rounded  
                      no-underline 
                      sm:text-sm md:text-lg lg:text-xl xl:text-2xl
                      animated flip
                      ">
                    <p class="number">{{ t.index }}</p>
                </div>
        
       
                  </li>
                  

      </ul>
 <span v-if="tiles.length > 0 && diceSum > 0">
   <template v-if="tiles.lenght > 1">
      Selected tile(s)<span v-if="tiles.lenght>1">s</span> sum up <b>{{ tileSum }}</b>
   </template>

   <template v-if="(diceSum - tileSum) > 0">
      <span v-if="tiles.lenght > 1">with</span> <b>{{diceSum - tileSum}}</b> point<span v-if="diceSum - tileSum > 1">s</span> left to match the dice sum of <b>{{ diceSum }}</b>.
   </template>
   </span>
 <span v-else>
   <template v-if="(diceSum - gamePoints) > 0 && diceSum > 0">
   Select tiles that match <b>{{ diceSum - gamePoints }}</b>
   </template>
  </span>
 </div>
</template>

<script>


export default {
  props: ["tiles", "index", "game", "gamePoints"],
  computed:{
    diceSum(){
      return _.sum(_.filter(this.game.dice, function (t) {
                return (t.isAvailable == true)
            }).map(function (t) { return t.number }))
    },
    tileSum(){
      return _.sum(this.tiles.map(function (t) { return t.index }))
    }
  }
};
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

span{
  color:#fff;
}

ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 5px 0 0;
}

/* BOXES */

.box {
  height: 45px;
  width: 45px;
  line-height: 190%;
  float: left;
  color: #222;
  border-bottom: 4px solid #222;
  font-size: 18px;
}

.animated {
   -webkit-animation-duration: 0.3s;
   animation-duration: 0.3s;
   -webkit-animation-fill-mode: both;
   animation-fill-mode: both;
}


/* Portrait */
@media only screen 
  and (max-device-width: 320px) 
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: portrait) {
    .box {      
      width: 25px !important;
      height: 23px !important;  
      font-size: 12px; 
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
}

 span{
      font-size: 14px;
    }
}

</style>