<template>
<ul class="list-reset flex justify-between w-full items-center  mb-2">
            <li class="w-12">
                
                    
                     <router-link to="/login" class="inline-block text-black text-center bg-green-light px-2 py-2 m-2 ml-2 border-b-4 border-black rounded-b  no-underline w-10">
                    <template v-if="isAuthenticated" id="userIdentityName">          
                      {{abbreviations}}    
                    </template>
                    <template v-else>
                     
                      <i class="fa fa-user"></i>
                      
                        
                    </template>
                    </router-link>   
                
            </li>
            <!-- <li>{{user}}</li> -->
<li>
  
  <animated-integer :title="'Play'" v-bind:value="numberPlay"></animated-integer>
  
</li>
            <li class="flex-grow " id="logo">
               <img src="../assets/Logo_STB.png" style="max-height:30px;"> 
            </li>
<li>
  <animated-integer v-bind:title="'Points'" v-bind:value="pointsTotal"></animated-integer>
</li>
            <li class="w-12 mr-2">

              
                <a class="inline-block text-black text-center bg-blue-light px-2 py-2 m-2 mr-2 border-b-4 border-black rounded-b no-underline w-10"
                    href="#"
                    @click="restartGame"
                    >
                    <i class="fa fa-times"></i>
                </a>
            </li>
            
        </ul>
   
</template>
<script>
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import AnimatedInteger from "./AnimatedInteger";
export default {
  methods: {
    ...mapActions({
      login: "login",
      logout: "logout"
    }),
    restartGame(){
      this.$store.commit('SET_GAME_IS_VISIBLE', false);
      //this.modal.visible = false;
    }
  },
  computed: {
    ...mapGetters({
      isAuthenticated: "isAuthenticated",
      user: "user"
    }),
    pointsTotal() {
      return this.$store.getters.sumTilesTaken;
    },
    numberPlay() {
      return this.$store.getters.game.numberPlay;
    },
    abbreviations() {
      return this.$store.getters.user.displayName != null
        ? this.$store.getters.user.displayName.charAt(0).toUpperCase()
        : this.$store.getters.user.email.charAt(0).toUpperCase();
    }
  },
  components: {
    animatedInteger: AnimatedInteger
  }
};
</script>
<style scoped>
/* Portrait */
@media only screen   
  and (max-device-width: 330px)
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: portrait) {
    #logo {      
      display: none !important;
    }
}
</style>
