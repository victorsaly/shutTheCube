<template>

<div class="position" :class="{explosion : isFinished}">
<div class="value">{{ tweeningValue }}</div> 
<span>{{title}}</span>

</div>
</template>
<script>
import TWEEN from "tween";
// var audioTada;
export default {
  props: {
    isAudio:{
      type: Boolean,
      required:false
    },
    
    value: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: false
    }
  },
  data: function() {
    return {
      tweeningValue: 0,
      isFinished: false
    };
  },
  watch: {
    value: function(newValue, oldValue) {
      this.tween(oldValue, newValue);
    }
  },
  mounted: function() {
    this.tween(0, this.value);
  },
  methods: {
    tween: function(startValue, endValue) {
      var vm = this;
      this.isFinished = false;
      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }
      let t = new TWEEN.Tween({
        tweeningValue: startValue
      })
        .to(
          {
            tweeningValue: endValue
          },
          500
        )
        .onUpdate(function() {
          vm.tweeningValue = this.tweeningValue.toFixed(0);
        })
        .start();
      animate();
      let self = this;
     
      if (self.isAudio) {     
          var audio = new Audio();
          audio.src = document.querySelector('#tada').src;
          audio.currentTime = 0;
          audio.play();   
      }

      t.onComplete(function() {
        self.isFinished = true;      
      });
    }
  }
};
</script>
<style scoped>
.value {
  padding-top: 31px;
  font-size: 31px;
}
.position {
  width: 100px;
  height: 100px;

  position: relative;
  /* left: 0; */
  top: 0;
}
.explosion {
  /* transform: translate(-50%, -50%);  */
  background: url("../assets/explosion.png") no-repeat;
  background-position: 0 0;
  animation: explosion-animation 1s steps(28);
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
/* Portrait and Landscape */
@media only screen and (min-device-width: 320px) and (max-device-width: 568px) and (-webkit-min-device-pixel-ratio: 2) {
  .value {
    padding-top: 27px;
    font-size: 25px;
  }
  .position {
    width: 100px;
    height: auto;
    top: -10px;
  }
}
</style>
