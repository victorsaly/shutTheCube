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
                    t.isAvailable = true;
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
    setTiles: ({ commit, state, rootState, dispatch }, payload) => {

        return new Promise((resolve, reject) => {
            var game = rootState.game.game;

            commit('RESET_AVAILABLE_TILES');

            var tiles = [];

            
            var diceSum = _.sum(_.filter(game.dice, function (t) {
                return (t.isAvailable == true)
            }).map(function (t) { return t.number }));


            var sum = diceSum - state.sumTilesInUse;

            let tilesCombinations = $.getTilesCombinations(state.tiles, sum);
            const titleCombinationFlatten = _.flatMap(tilesCombinations);
            // var tilesPlayable = _.map(
            //     //_.omitBy(
            //     _.uniq(_.flatMapDeep(state.tiles,
            //         function (n) {

            //             return _.flatMapDeep(n, function (i) {
            //                 if (!i.isInUse && !i.isTaken)
            //                     return i.index
            //             })
            //         }))
            //     //, _.isUndefined)
            //     , function (value, index) {
            //         return [value];
            //     });
           

            //console.log('Tiles Playable                ', tilesPlayable);
            //debugger;
            //     /* Get all possible combinations for the available tiles */
            // var combinations = $.strConbinations(tilesPlayable.join(''));
            

            // if (combinations == null || combinations == undefined) {
            //     combinations = [];
            // }


            //console.log('sumIsInUse:                   ' + state.sumTilesInUse);
            //console.log('diceSum:                      ' + diceSum);
            //     /* Get filtered tiles that the sum of the combiantion match the tiles available */
            // var combinations_available = combinations.length > 0 ? _.filter(combinations, function (t) {
            //     return sum == t.split('').reduce(function (a, b) {
            //         return a + parseInt(b);
            //     }, 0);
            // }) : [];
            // //console.log('Tiles Set Combinations Available  ' + combinations_available);

            // var _combinations_available = [];
            // combinations_available.forEach((t) => {
            //     if (t.length == 1) {
            //         _combinations_available.push(_.toSafeInteger(t))
            //     } else {
            //         t.split('').forEach((x) => {
            //             _combinations_available.push(_.toSafeInteger(x))
            //         })
            //     }
            // })

            // var _tiles_playable = _.uniq(_combinations_available.join('').split(''));
            //console.log('Tiles Combinations available  ' + _combinations_available);
            //console.log('Tile Playable available       ' + _tiles_playable);
            //console.log('-------------------------')
            if (titleCombinationFlatten.length > 0) {
                //commit('SET_GAME_NOTE', 'Combinations</br>' + titleCombinationFlatten)
               commit('SET_GAME_NOTE', '')
            } else {
                commit('SET_GAME_NOTE', '')
            }

            state.tiles.forEach(function (vm) {

                //set tiles available for playing
                _.filter(vm, function (t) {
                    return (t.isTaken == false
                        && t.isInUse == false)
                }).forEach(function (t) {
                    var newTile = {
                        //isAvailable: _.has(_tiles_playable, t.index.toString()),
                        //isAvailable: _.findIndex(_tiles_playable, function (x) { return x == (t.index.toString()) }) >= 0,
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
                if (state.sumTilesInUse == diceSum) {
                    dispatch('setIsTaken').then(() => {
                        dispatch('sumTilesInUse').then(() => {
                            dispatch('sumTilesTaken').then(() => {
                                commit('SET_GAME_NOTE', 'Roll the dice');
                                commit('SET_GAME_ISNEXT', true);
                                commit('SET_DICE_IN_USE', false);
                            });
                        });
                    });
                } else if (titleCombinationFlatten.length <= 0

                ) {

                    commit('GAME_OVER', true);
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