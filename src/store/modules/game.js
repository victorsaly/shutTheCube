
import game from '../../data/game';
import _ from 'lodash'

const state = {
    game : [],
    gameIsVisible: false
};


const mutations = {
    'SET_GAME' (state, game){
        state.game = game;
    },
    'SET_GAME_IS_VISIBLE' (state, bool){
        state.gameIsVisible = bool;
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
        state.game.numberPlay++;
    }
};

const actions = {
    initGame: ({commit, payload}) => {
        if (payload==null){
            commit('SET_GAME', game);
        }else {
            commit('SET_GAME', payload);
        }
    },
    startGame:({commit, dispatch}) => {
        return new Promise((resolve, reject) => {
            commit('RESTART_TILES');
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
        dispatch('shuffleTiles');
        commit('RESTART_GAME');
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
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};