import $ from '../../services/gameServices'
import _ from 'lodash'
import delay from 'delay'
import { EAFNOSUPPORT } from 'constants';

const state = {
    tiles: {},
    sumTilesInUse: 0,
    sumTilesTaken: 0
};

const mutations = {
    'SET_TILES'(state, tiles) {
        state.tiles = tiles;
    },
    'RESTART_TILES'(state) {
        state.tiles
            .forEach(function (tile) {
                tile.forEach(function (t) {
                    t.isAvailable = false;
                    t.isInUse = false;
                    t.isTaken = false;
                })
            });
    },
    'RESET_IN_USE_TILES'(state) {
        state.tiles.forEach(function (tile) {
            tile.forEach(function (t) {
                if (t.isInUse) {
                    t.isInUse = false;
                }
            })
        });
    },
    'RESET_NOT_TAKEN_TILES'(state) {
        state.tiles.forEach(function (tile) {
            tile.forEach(function (t) {
                if (!t.isTaken) {
                    t.isAvailable = true;
                    t.isInUse = false;
                }
            })
        });
    },
    'RESET_AVAILABLE_TILES'(state) {
        state.tiles.forEach(function (tile) {
            tile.forEach(function (t) {
                if (!t.isTaken && !t.isInUse) {
                    t.isAvailable = true;
                }
            });
        })
    },
    'SET_AVAILABLE_TILES'(state, tiles) {
        /* maybe a where clause for tiles that doenst need to be updated as they has been taken */
        state.tiles.forEach(function (tile) {
            tile.forEach(function (t) {
                // if (tiles.contains(t.id.toString())) {
                if (_.findLast(tiles, function (c) { t.id === c.id })) {
                    t.isAvailable = true;
                } else {
                    t.isAvailable = false;
                }
            })
        });
    },
    'SET_INUSE_TILES'(state, tiles) {
        state.tiles.forEach(function (tile) {
            tile.forEach(function (t) {
                if (t.isInUse) {
                    t.isTaken = true;
                    t.isInUse = false;
                }
                t.isAvailable = false;
            });
        })
    },
    'SELECT_TILE'(state, id) {
        if (id) {
            var _tiles = state.tiles.tiles;
            //   var tile = state.tiles.tiles.where(function(t) {
            //     return t.id == (id)
            //   }).first();
            var tile = _.findLast(_tiles, function (t) { return t.id == (id) });
            if (tile) {
                if (tile.isAvailable && !tile.isInUse && !tile.isTaken) {
                    tile.isAvailable = false;
                    tile.isInUse = true;
                };
            }
        }
    },
    'SET_TILE_BY_INDEX'(state, payload) {
        if (payload) {
            if (payload.index >= 0) {
                var index = _.findIndex(state.tiles[payload.index], function (t) { return t.id == (payload.tile.id) });
                if (index >= 0) {
                    //debugger;
                    Object.assign(state.tiles[payload.index][index], payload.tile)
                }
            }
        }
    },
    'SET_TILES_BY_INDEX'(state, payload) {
        if (payload) {
            Object.assign(state.tiles[payload.index], payload.tiles);
        }
    },
    'SET_TILE'(state, tile) {
        if (tile) {
            state.tiles.forEach(function (tiles, i) {
                var index = _.findIndex(tiles, function (t) { return t.id == (tile.id) });
                if (index >= 0) {
                    Object.assign(state.tiles[i][index], tile)
                }
            });
        }
    },
    'SET_SUM_TILES_IN_USE'(state, sum) {
        state.sumTilesInUse = sum
    },
    'SET_SUM_TILES_TAKEN'(state, sum) {
        state.sumTilesTaken = sum
    },

}

const actions = {
    initTiles: ({ commit }, size) => {
        commit('SET_TILES', $.createTiles(9, size || 9));
    },
    shuffleTiles: ({ commit, state }) => {
        var _vm = [];
        state.tiles.forEach(function (vm) {
            _vm.push($.shuffle(Object.assign({}, vm)));
        });
        commit('SET_TILES', _vm);
    },
    moveTiles: ({ commit, state }, payload) => {
        return new Promise((resolve, reject) => {
            if(state.tiles.length > 1){
                var tiles = $.moveTile((Object.assign({}, state.tiles[payload.tileIndex])), payload.id);
                commit('SET_TILES_BY_INDEX', { tiles: tiles, index: payload.tileIndex });
            }
            resolve()
        })

    },
    selectTile: ({ commit, rootState }, id) => {
        return new Promise((resolve, reject) => {
            if (!rootState.game.game.isOver && !rootState.game.game.isWin && rootState.game.game.diceInUse) {
                commit('SELECT_TILE', id);
                resolve()
            } else {
                reject('did not pass criteria', rootState.game.game);
            }
        })
    },
    setTile: ({ commit, state }, tile) => {
        commit('SET_TILE', tile);
    },
    setTileByIndex: ({ commit, state }, payload) => {
        return new Promise((resolve, reject) => {
            commit('SET_TILE_BY_INDEX', payload);
            resolve()
        })
    },
    setIsTaken: ({ commit, state, rootState, dispatch }) => {
        return new Promise((resolve, reject) => {
            state.tiles.forEach(function (vm) {
                vm.forEach(function (t) {
                    if (t.isInUse) {
                        var _t = Object.assign({}, t);
                        _t.isInUse = false;
                        _t.isTaken = true;
                        _t.isCollateral = false;
                        commit('SET_TILE', _t);
                    }
                })

            });
            resolve()
        })
    },
    sumTilesInUse: ({ commit, state }) => {
        return new Promise((resolve, reject) => {
            var sumIsInUse = 0;
            state.tiles.forEach(function (vm) {
                sumIsInUse += _.sum(_.filter(vm, function (t) {
                    return (t.isInUse == true && t.isCollateral == false)
                }).map(function (t) { return t.index }));
            });
            commit('SET_SUM_TILES_IN_USE', sumIsInUse);
            resolve(sumIsInUse);
        });
    },
    sumTilesTaken: ({ commit, state }) => {
        return new Promise((resolve, reject) => {
            var sumTaken = 0;
            state.tiles.forEach(function (vm) {
                sumTaken += _.sum(_.filter(vm, function (t) {
                    return (t.isTaken == true)
                }).map(function (t) { return t.index }));
            });
            commit('SET_SUM_TILES_TAKEN', sumTaken);
            resolve(sumTaken);
        });
    },
    setGamePoints: ({ commit, state }) => {
        return new Promise((resolve, reject) => {
            var gamePoints = 0;
            state.tiles.forEach(function (vm) {
                gamePoints += _.sum(_.filter(vm, function (t) {
                    return (t.isInUse == true && t.isCollateral == false)
                }).map(function (t) { return t.index }));
            });
            commit('SET_GAME_POINTS', gamePoints);
            resolve(gamePoints);
        });
    },
    setGameBonus: ({ commit, state }) => {
        return new Promise((resolve, reject) => {
            var gameBonus = 0;
            state.tiles.forEach(function (vm) {
                gameBonus += _.sum(_.filter(vm, function (t) {
                    return (t.isInUse == true && t.isCollateral == true)
                }).map(function (t) { return t.index }));
            });
            commit('SET_GAME_BONUS', gameBonus);
            resolve(gameBonus);
        });
    },
    setTiles: ({ commit, state, rootState, dispatch }, payload) => {

        return new Promise((resolve, reject) => {
            var game = rootState.game.game;

            commit('RESET_AVAILABLE_TILES');

            var tiles = [];

            
            var diceSum = _.sum(_.filter(game.dice, function (t) {
                return (t.isAvailable == true)
            }).map(function (t) { return t.number }));
            var sum = diceSum - state.sumTilesInUse;
            const titleCombinationFlatten =  $.getTilesIndexCombinations(state.tiles, sum);
            
            commit('SET_GAME_NOTE', '')

            state.tiles.forEach(function (vm) {
                //set tiles available for playing
                _.filter(vm, function (t) {
                    return (t.isTaken == false
                        && t.isInUse == false)
                }).forEach(function (t) {
                    var newTile = {
                        isAvailable : _.findIndex(titleCombinationFlatten, function (x) { return x == t.index }) >= 0,
                        isInUse: t.isInUse,
                        isTaken: t.isTaken,
                        cssClass: t.cssClass,
                        index: t.index,
                        id: t.id
                    }

                    var diff = _.omitBy(newTile, function (v, k) {
                        //console.log('k,v,t[k] = ' + k + ',' + v + ',' + t[k]);
                        return t[k] === v;
                    });
                    //compare if obj are different
                    if (!_.isEmpty(diff)) {
                        //console.log('diff=                          ' + JSON.stringify(diff));
                        commit('SET_TILE', newTile);
                    };

                })




            })


            if (payload) {
                dispatch('setGamePoints')
                dispatch('setGameBonus')
                if (state.sumTilesInUse == diceSum) {
                    dispatch('setIsTaken').then(() => {
                        dispatch('sumTilesInUse').then(() => {
                            dispatch('sumTilesTaken').then(() => {
                                if (state.sumTilesTaken == state.tiles.length * 45){
                                    commit('SHUT_THE_BOX');
                                }else{
                                    commit('SET_GAME_NOTE', 'Roll the dice');
                                    commit('SET_GAME_ISNEXT', true);
                                }                                
                                commit('SET_DICE_IN_USE', false);
                            });
                        });
                    });
                } else if (titleCombinationFlatten.length <= 0) {
                    dispatch('sumTilesTaken').then(() => {
                        if (state.sumTilesTaken == state.tiles.length * 45){
                            commit('SHUT_THE_BOX');
                        }else{
                            commit('GAME_OVER', true);
                        }
                    })
                    
                }
            }
            resolve()
        });

    }
}

const getters = {
    tiles: state => {
        return state.tiles;
    },
    sumTilesInUse: state => {
        return state.sumTilesInUse;
    },
    sumTilesTaken: state => {
        return state.sumTilesTaken;
    },
};


export default {
    state,
    mutations,
    actions,
    getters
};