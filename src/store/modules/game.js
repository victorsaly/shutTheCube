
import game from '../../data/game';
import _ from 'lodash'

const state = {
    game : [],
    gameIsVisible: false,
};


const mutations = {
    'SET_GAME' (state, game){
        state.game = game;
    },
    'SET_GAME_IS_VISIBLE' (state, bool){
        state.gameIsVisible = bool;
    },
    'SET_IS_LOADING' (state, bool){
        state.game.isLoading = bool;
    },
    'SET_GAME_BONUS'(state, bonus){
        state.game.gameBonus= bonus;
    },
    'SET_GAME_POINTS'(state, points){
        state.game.gamePoints= points;
    },
    'SET_GAME_STATE'(state, status){
        // state.game.isNext = status;
        state.game.state= status;
    },
    'SET_GAME_ISNEXT'(state, status){
        // state.game.isNext = status;
        state.game.state= status ? 'isNext' : '';
    },
    'START_GAME'(state){
        state.game.numberPlay = 0;
        // state.game.isStart = false;
        state.game.state = '';
        state.game.timeleft = 60;
    },
    'SET_GAME_NOTE'(state, note){
        state.game.note = note;
    },
    'SET_DICE_IN_USE'(state, bool){
        state.game.diceInUse = bool;
    },
    'GAME_OVER'(state){
        //state.game.numberPlay = 0;
        state.game.timeleft = 0;    
        state.game.note='Game Over';
        state.game.state='isOver'
        state.game.diceInUse=false;

    },
    'SHUT_THE_BOX'(state){                
        state.game.note='Shut The Box';
        state.game.state='isWin'
        state.game.diceInUse=false;
        state.game.timeleft = 0;    
    },
    'RESTART_GAME'(state){

        state.game.numberPlay = 0;
        state.game.timeleft = 60;
        state.game.state='isStart';     
        state.game.note='Restart Game';
        state.game.diceInUse=false;

    },
    'ROLL_DICE'(state){
        state.game.dice
        .forEach(function(d){
            d.number = Math.floor((Math.random() * 6) + 1);
            d.html = '&#x268' + (d.number - 1);
        });
        state.game.diceInUse = true;
       // debugger;
        state.game.numberPlay++;
    }
};

const actions = {
    initGame: ({commit}, payload) => {
        commit('SET_SUM_TILES_TAKEN', 0);
        commit('SET_SUM_TILES_IN_USE', 0);
        if (payload==null){
            commit('SET_GAME', game);
            commit('SET_GAME_STATE', 'isStart')
        }else {
            commit('SET_GAME', payload);
        }
    },
    startGame:({commit, dispatch}) => {
        return new Promise((resolve, reject) => {
            //commit('RESTART_TILES');
            dispatch('shuffleTiles');
            commit('START_GAME');
            commit('ROLL_DICE');
            resolve()
          })
    },
    nextGame:({commit}) => {
        return new Promise((resolve, reject) => {
            commit('RESET_NOT_TAKEN_TILES');
            commit('SET_GAME_ISNEXT', false);
            commit('ROLL_DICE');
            resolve()
          })
    },
    nextPlay:({commit}) => {
        return new Promise((resolve, reject) => {
            commit('RESET_IN_USE_TILES');
            commit('SET_GAME_ISNEXT', false);
            commit('ROLL_DICE');
            resolve()
          })
    },
    restartGame:({commit, dispatch}) => {
        commit('RESTART_TILES');
        //dispatch('shuffleTiles');
        commit('RESTART_GAME');
        commit('SET_SUM_TILES_TAKEN', 0);
        commit('SET_SUM_TILES_IN_USE', 0);
        commit("SET_IS_LOADING", false);
    },
};

const getters = {
    game: state => {
        return state.game;
    },
    diceSum: state =>{
        return _.sum(_.filter(game.dice, function (t) {
            return (t.isAvailable == true)
        }).map(function (t) { return t.number }));
    },
    gameIsVisible: state => {
        return state.gameIsVisible;
    },
    gameIsLoading: state => {
        return state.game.isLoading;
    },
    gamePoints: state => {
        return state.game.gamePoints;
    },
    gameBonus: state => {
        return state.game.gameBonus;
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};