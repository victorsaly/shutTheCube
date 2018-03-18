<template>
  <div class="login">

     <div class="container mx-auto h-full flex justify-center items-center">
        <div >
            <!-- <h1 class="font-hairline mb-6 text-center">Login</h1> -->
            <div class="border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg">
                <div class="mb-4">
                    <label class="font-bold text-grey-darker block mb-2">Username or Email</label>
                    <input type="text"  v-model="email"  class="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow" placeholder="Your Username">
                </div>

                <div class="mb-4">
                    <label class="font-bold text-grey-darker block mb-2">Password</label>
                    <input type="password" v-model="password" class="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow" placeholder="Your Password">
                </div>

                <div class="flex items-center justify-between">
                    <button v-on:click="signIn" class="bg-teal-dark hover:bg-teal text-white font-bold py-2 px-4 rounded">
                        Login
                    </button>

                    <!-- <a class="no-underline inline-block align-baseline font-bold text-sm text-blue hover:text-blue-dark float-right" href="#">
                        Forgot Password?
                    </a> -->
                </div>
                
            </div>
            <div class="text-center">
                <p class="text-grey-dark text-sm">Don't have an account? 
                   <router-link class="no-underline text-blue font-bold" to="/sign-up">Create an Account</router-link>
                  </p>
            </div>
        </div>
    </div>

   
  </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "login",
  data: function() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    signIn: function() {
     // debugger;
      let self = this;
     
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(
          user => {
             self.$toasted.success('Logged on as ' + self.email);                
             self.$router.replace("game");
          },
          err => {
            self.$toasted.error(err.message);
          }
        )
        .catch(
          err => {
          self.$toasted.error(err.message);
        })
        .then(() => {
          //NProgress.done();
        });
    }
  }, created(){
    //NProgress.start();
    //this.$nprogress.start();
  }
};
</script>
