let _ = require('lodash');
/* Models */
var tileModel = {
    isAvailable: false,
    isInUse: false,
    isTaken: false,
    isCollateral: false,
    isExplosion: false,
    action: '',
    cssClass: 'bg-blue-light'
}



export default {
    /* move items from an array randomly */
    shuffle: function (obj) {
        if (!_.isObject(obj)) {
            return obj;
        } else {
            return _.shuffle(obj);
        }
    },
    shuffleTiles: function (tiles) {
        return _.map(tiles, this.shuffle);
    },
    /* create initial tiles */
    createTiles: function (numberTiles, columns) {
        var tile = [];
        for (var i = 0; i < numberTiles; i++) {
            tile.push(_.extend({ index: i + 1, id: this.createGuid() }, tileModel));
        }
        tile = _.map(tile, this.cssClassColour);
        var tiles = [];
        for (var i = 0; i < columns; i++) {

            tiles.push(this.shuffle(tile));
        }

        var _tiles = [];
        for (var i = 0; i < tiles.length; i++) {
            var _tile = [];
            for (var x = 0; x < tiles[i].length; x++) {
                var copy = Object.assign({}, tiles[i][x]);
                copy.id = this.createGuid();
                _tile.push(copy);
            }
            _tiles.push(_tile);
        }
        return _tiles;
    },
    /* create guid */
    createGuid: function () {
        return this.guidByteGenerator() + this.guidByteGenerator() + '-' + this.guidByteGenerator() + '-' + this.guidByteGenerator() + '-' +
            this.guidByteGenerator() + '-' + this.guidByteGenerator() + this.guidByteGenerator() + this.guidByteGenerator();
    },
    guidByteGenerator: function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    },
    /* str combination for tile algoritm */
    strConbinations: function (str) {
        var fn = function (active, rest, a) {
            if (!active && !rest)
                return;
            if (!rest) {
                a.push(active);
            }
            else {
                fn(active + rest[0], rest.slice(1), a);
                fn(active, rest.slice(1), a);
            }
            return a;
        };
        return fn("", str, []);
    },
    /* assigned colours */
    cssClassColour: function (tile) {
        switch (tile.index) {
            case 1:
                tile.cssClass = 'bg-green-lighter';
                break;
            case 2:
                tile.cssClass = ' bg-purple-dark';
                break;
            case 3:
                tile.cssClass = 'bg-blue-light';
                break;
            case 4:
                tile.cssClass = 'bg-purple-light';
                break;
            case 5:
                tile.cssClass = 'bg-yellow-dark';
                break;
            case 6:
                tile.cssClass = 'bg-indigo-dark';
                break;
            case 7:
                tile.cssClass = 'bg-red-light';
                break;
            case 8:
                tile.cssClass = 'bg-red-dark';
                break;
            case 9:
                tile.cssClass = 'bg-yellow-light';
                break;
            // bg-green-light

        }

        return tile;

    },
    moveTile: function (tiles, id) {
        return _.sortBy(tiles, function (item) {
            return (item.id === id || item.isTaken) ? 1 : 0;
        });
    },
    isMobile: function () {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        ) {
            return true;
        }
        else {
            return false;
        }
    }
};

