<template>
  <div class="sign-up">

    <div class="container mx-auto h-full flex justify-center items-center">
        <div >
            <!-- <h1 class="font-hairline mb-6 text-center">Login</h1> -->
            <div class="border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg">
                <div class="mb-4">
                    <label class="font-bold text-grey-darker block mb-2">Username or Email</label>
                    <input autocomplete="off" type="text"  v-model="email"  class="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow" placeholder="Your Username">
                </div>

                <div class="mb-4">
                    <label class="font-bold text-grey-darker block mb-2">Password</label>
                    <input autocomplete="off" type="password" v-model="password" class="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow" placeholder="Your Password">
                </div>

                <div class="flex items-center justify-between">
                    <button v-on:click="signUp" class="bg-teal-dark hover:bg-teal text-white font-bold py-2 px-4 rounded">
                        Sign Up
                    </button>

                    <!-- <a class="no-underline inline-block align-baseline font-bold text-sm text-blue hover:text-blue-dark float-right" href="#">
                        Forgot Password?
                    </a> -->
                </div>
                
            </div>
            <div class="text-center">
                <p class="text-grey-dark text-sm">
                   <router-link class="no-underline text-blue font-bold" to="/login">Go back to Login</router-link>
                  </p>
            </div>
        </div>
    </div>
   
  </div>
</template>

<script>
  import firebase from 'firebase'

  export default {
    name: 'signUp',
    data: function() {
      return {
        email: '',
        password: ''
      }
    },
    methods: {
      signUp: function() {
        firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(
          (user) => {
            this.$router.replace('game')
          },
          (err) => {
            alert('Oops. ' + err.message)
          }
        );
      }
    }
  }
</script>