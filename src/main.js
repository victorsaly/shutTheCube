// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import lodash from 'lodash'
import firebase from 'firebase'
import store from './store'
//Font Awesome
import fa from 'font-awesome/css/font-awesome.css'
// register the plugin on vue
import Toasted from 'vue-toasted';
import * as cfg from '../cfg.json'
const config = cfg.firebaseCfg;


Vue.use(Toasted, { 
  theme: "primary", 
  position: "bottom-center", 
  duration : 5000,
  action: {
    text: "Close",
    onClick: (e, toastObject) => {
      toastObject.goAway(0);
    }
  }
});

Vue.config.productionTip = false
//store.dispatch('initFirebase')
let app;
//firebase.auth().onAuthStateChanged(function(user) {
  //console.log(user);
  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      store,
      created(){
        firebase.initializeApp(config);
        firebase.auth().onAuthStateChanged((user) => {
          if(user) {
            this.$store.commit('SET_AUTH', true)
            this.$store.commit('SET_USER',Object.assign({}, user.toJSON()));            
          } else {
            this.$store.commit('SET_AUTH', false);
            this.$store.commit('SET_USER',null);
          }
         });
      },
      template: '<App/>',
      components: { App }
    })
  }
//});