import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import Game from '@/components/Game'
import Login from '@/components/auth/Login'
import SignUp from '@/components/auth/signup'
import firebase from 'firebase'
Vue.use(Router)

let router = new Router({
  //mode: 'history', 
  base: process.env.NODE_ENV === 'production' ? '/shutTheCube/' : '/',
  routes: [
    {
      path: '*',
      redirect: '/game'
    },
    {
      path: '/game',
      name: 'Game',
      component: Game
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/sign-up',
      name: 'SignUp',
      component: SignUp
    },
  ]
})

router.beforeEach((to, from, next) => {
  
  //let requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  next();

  // store.dispatch('getCurrentUser')
  //   .then((user) => {
  //     next();
  //   })
  //   .catch(() => { 
  //     if (requiresAuth){
  //     next('login')
  //     }else{
  //       next();
  //     }
  //   });

  // if (requiresAuth){
  //   store.dispatch('getCurrentUser')
  //   .then((user) => {
  //     next();
  //   })
  //   .catch(() => { 
  //     next('login')
  //   });
  // }
  // else {
  //   next()
  // }
})

export default router