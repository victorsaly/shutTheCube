import firebase from 'firebase'
import router from '../../router'
import * as cfg from '../../../cfg.json'
const config = cfg.firebaseCfg;

const state = {
    authenticated: false,
    user: null
};

const mutations = {
    'SET_AUTH'(state, status) {
        state.authenticated = status;
    },
    'LOGOUT'(state) {
        state.user = null;
        state.authenticated = false;
    },
    'SET_USER'(state, user) {
        state.user = user;
    }
};

const actions = {
    initFirebase: ({ commit }) => {
        firebase.initializeApp(config)
    },
    getFirebaseAuthToken:({ commit})=>{

        return new Promise((resolve, reject) => {
            var token = firebase.auth().firebaseAuthToken;
            //debugger;
            if (token != null) {
               
                resolve()
            } else {
                reject('Not authorized', null);
            }
        })

    },
    getCurrentUser: ({ commit }) => {
        //debugger
        return new Promise((resolve, reject) => {
            var currentUser = firebase.auth().currentUser;
            if (currentUser != null) {
                commit('SET_USER',Object.assign({}, currentUser));
                commit('SET_AUTH', true);
                resolve()
            } else {
                commit('SET_USER', null);
                commit('SET_AUTH', false);
                reject('Not authorized', null);
            }
        })
    },
    logout: ({ commit }) => {
        
        firebase.auth().signOut().then(() => {
            router.replace('login')
            commit('SET_USER', null)
            commit('SET_AUTH', false)
        });
    }
};

const getters = {
    isAuthenticated: state => {
        return state.authenticated;
    },
    user: state => {
        return state.user
    },
    authHeader: state => {
        return state.user != null ? state.user.firebaseAuthToken : null
    },
};

export default {
    state,
    mutations,
    actions,
    getters
};