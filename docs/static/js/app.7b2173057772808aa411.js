webpackJsonp([1],{"2OGs":function(e,t){},"2mV7":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("gNcp"),s={};i.keys().forEach(function(e){"./index.js"!==e&&(s[e.replace(/(\.\/|\.js)/g,"")]=i(e).default)}),t.default=s},"5W1q":function(e,t){},D2MB:function(e,t){},FKDi:function(e,t){},JC1s:function(e,t){},NHnr:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("7+uW"),s=n("Hcub"),a=n.n(s),r={props:{value:{type:Number,required:!0},title:{type:String,required:!1}},data:function(){return{tweeningValue:0,isFinished:!1}},watch:{value:function(e,t){this.tween(t,e)}},mounted:function(){this.tween(0,this.value)},methods:{tween:function(e,t){var n=this;this.isFinished=!1;var i=new a.a.Tween({tweeningValue:e}).to({tweeningValue:t},500).onUpdate(function(){n.tweeningValue=this.tweeningValue.toFixed(0)}).start();!function e(){a.a.update()&&requestAnimationFrame(e)}();var s=this;i.onComplete(function(){console.log("done!"),s.isFinished=!0})}}},o={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"position",class:{explosion:e.isFinished}},[n("div",{staticClass:"value"},[e._v(e._s(e.tweeningValue))]),e._v(" "),n("span",[e._v(e._s(e.title))])])},staticRenderFns:[]};var l=n("VU/8")(r,o,!1,function(e){n("D2MB")},"data-v-413dcba4",null).exports,c={name:"app",created:function(){this.$store.dispatch("initTiles"),this.$store.dispatch("initGame")},components:{animatedInteger:l},computed:{pointsTotal:function(){return this.$store.getters.sumTilesTaken},numberPlay:function(){return this.$store.getters.game.numberPlay}}},u={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"w-full h-screen bg-gradient-brand  mx-auto relative container"},[n("ul",{staticClass:"list-reset flex justify-between w-full items-center  mb-2"},[e._m(0),e._v(" "),n("li",[n("animated-integer",{attrs:{title:"Play",value:e.numberPlay}})],1),e._v(" "),e._m(1),e._v(" "),n("li",[n("animated-integer",{attrs:{title:"Points",value:e.pointsTotal}})],1),e._v(" "),e._m(2)]),e._v(" "),n("div",{attrs:{id:"app"}},[n("router-view")],1)])},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("li",{staticClass:"w-12"},[t("a",{staticClass:"inline-block text-black text-center bg-green-light px-2 py-2 m-2 ml-0 border-b-4 border-black rounded-b  no-underline w-10",attrs:{href:"#"}},[this._v("VS")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("li",{staticClass:"flex-grow "},[t("img",{staticStyle:{"max-height":"30px"},attrs:{src:n("fvqo")}})])},function(){var e=this.$createElement,t=this._self._c||e;return t("li",{staticClass:"w-12"},[t("a",{staticClass:"inline-block text-black text-center bg-blue-light px-2 py-2 m-2 mr-0 border-b-4 border-black rounded-b no-underline w-10",attrs:{href:"#"}},[t("i",{staticClass:"fa fa-list"})])])}]};var E=n("VU/8")(c,u,!1,function(e){n("FKDi")},null,null).exports,S=n("/ocq"),f=n("Dd8w"),T=n.n(f),_=n("NYxO"),d=n("Xxa5"),m=n.n(d),I=n("woOf"),O=n.n(I),h=n("exGp"),A=n.n(h);Array.prototype.move=function(e,t){if(t>=this.length)for(var n=t-this.length;1+n--;)this.push(void 0);return this.splice(t,0,this.splice(e,1)[0]),this};var N={props:["tiles","index","allTiles"],computed:{diceSum:function(){return this.$store.getters.diceSum},sumTilesInUse:function(){return this.$store.getters.sumTilesInUse}},methods:{selectTile:function(e,t,n){if(e.isAvailable&&!e.isTaken&&this.sumTilesInUse+e.index<=this.diceSum){var i=this.allTiles.length;this.index;if(this.index>1)for(var s=this.index-1;s>-1&&(this.allTiles[s][t].index==e.index&&!this.allTiles[s][t].isTaken);s--)this.setTile(this.allTiles[s][t],s);else 1==this.index&&(this.allTiles[0][t].index!=e.index||this.allTiles[0][t].isTaken||this.setTile(this.allTiles[0][t],0));for(s=this.index+1;s<i&&(this.allTiles[s][t].index==e.index&&!this.allTiles[s][t].isTaken);s++)this.setTile(this.allTiles[s][t],s);this.setTile(e,n)}},setTile:function(e,t){var n=this;return A()(m.a.mark(function i(){var s,a;return m.a.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return(s=O()({},e)).action="rotateIn",s.isExplosion=!0,s.isInUse=!0,s.isCollateral=t!=n.index,a=n,i.next=8,n.$store.dispatch("setTileByIndex",{tile:s,index:t}).then(function(){n.$store.dispatch("sumTilesInUse"),setTimeout(function(){var i=O()({},e);i.action="",i.isExplosion=!1,n.$store.dispatch("setTileByIndex",{tile:i,index:t}).then(function(){a.changeTile(t,e.id)})},500)});case 8:case"end":return i.stop()}},i,n)}))()},changeTile:function(e,t){var n=this;this.$store.dispatch("moveTiles",{tileIndex:e,id:t}).then(function(){n.$store.dispatch("setTiles",e==n.index)})}}},g={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("transition-group",{attrs:{duration:300,name:"flip-list",tag:"ul"}},e._l(e.tiles,function(t,i){return n("li",{key:t.id},[n("div",{staticStyle:{position:"relative"}},[n("div",{class:{explosion:t.isExplosion}}),e._v(" "),n("div",{staticClass:"\n      \n                  box\n                  active \n                  text-black \n                  text-center \n                  border-b-4 \n                  border-black \n                  rounded  \n                  no-underline \n                  animate \n                  action-button sm:text-sm md:text-lg lg:text-xl xl:text-2xl\n                  \n                  ",class:[t.cssClass,{isAvailable:t.isAvailable},{isNotAvailable:!t.isAvailable},{isTaken:t.isTaken},{isInUse:t.isInUse},"animated "+t.action],on:{click:function(n){e.selectTile(t,i,e.index)}}},[n("p",{staticClass:"number"},[e._v(e._s(t.index))])])])])}))},staticRenderFns:[]};var v=n("VU/8")(N,g,!1,function(e){n("2OGs")},"data-v-3082d6b2",null).exports,b={render:function(){var e=this.$createElement;return(this._self._c||e)("span",{domProps:{innerHTML:this._s(this.dice.html)}})},staticRenderFns:[]};var R=n("VU/8")({props:["dice"]},b,!1,function(e){n("Ve8H")},"data-v-789dbd71",null).exports,L={name:"Game",data:function(){return{msg:"Welcome to Your Vue.js App",diceObj:{}}},computed:{tilesObj:function(){return this.$store.getters.tiles},game:function(){return this.$store.getters.game},pointsTotal:function(){return this.$store.getters.sumTilesTaken},buttonGameStateMessage:function(){switch(this.game.state){case"isNext":return"ROLL DICE";case"isOver":return"GAME OVER";case"isStart":return"START GAME";case"isWin":return"SHUT THE BOX"}},buttonGameStateColour:function(){switch(this.game.state){case"isNext":return"bg-green-light";case"isOver":return"bg-red-light";case"isStart":case"isWin":return"bg-green-light"}},buttonGameStateIcon:function(){switch(this.game.state){case"isNext":return"fa fa-arrow-right";case"isOver":return"fa fa-times";case"isStart":return"fa fa-arrow-right";case"isWin":return"fa fa-check"}}},methods:T()({},Object(_.b)({restartGame:"restartGame"}),{gameState:function(){switch(this.game.state){case"isNext":this.initNextGame();break;case"isOver":this.restartGame();break;case"isStart":this.initStartGame();break;case"isWin":this.restartGame()}},initStartGame:function(){var e=this;this.$store.dispatch("startGame").then(function(){e.$store.dispatch("setTiles",!0)})},initNextGame:function(){var e=this;this.$store.dispatch("nextGame").then(function(){e.$store.dispatch("setTiles",!0)})}}),components:{appTiles:v,appDice:R,animatedInteger:l},created:function(){}},C={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"Game"},[e._l(e.tilesObj,function(t,i){return n("app-tiles",{key:t.index,attrs:{index:i,allTiles:e.tilesObj,tiles:t}})}),e._v(" "),n("div",{class:{blocked:e.game.diceInUse||"isStart"==!e.game.state&&"isNext"==e.game.state},attrs:{id:"dice"}},e._l(e.game.dice,function(e){return n("app-dice",{key:e.id,attrs:{dice:e}})})),e._v(" "),n("transition",{attrs:{name:"fade",mode:"out-in"}},[e.buttonGameStateMessage?n("button",{key:e.game.state,staticClass:"no-outline list-reset flex mb-2 bg-yellow-light border-b-4 border-black rounded-b animate  action-button",staticStyle:{"max-width":"200px",margin:"0 auto"},on:{click:e.gameState}},[n("div",[n("div",{staticClass:"text-black text-center  px-2 pt-2 py-1  no-underline  ",attrs:{href:"#"}},[n("i",{class:e.buttonGameStateIcon})])]),e._v(" "),n("div",{staticClass:"flex-grow  "},[n("div",{staticClass:" text-black text-center bg-red-light px-2 pt-2 py-1  no-underline",class:e.buttonGameStateColour,attrs:{id:"testReorder",href:"#"}},[e._v("\n                  "+e._s(e.buttonGameStateMessage)+"\n              ")])])]):e._e()]),e._v(" "),n("div",{staticClass:"flex pin-b pin-l  absolute   mb-6  justify-between bg-yellow-light border-b-4 border-black rounded-b w-full"},[e._m(0),e._v(" "),n("div",{staticClass:"w-12 flex-grow  text-center py-2 text-base"},[e._v("\n\n\n              "+e._s(e.game.note)+"   ")])])],2)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"w-12  text-center bg-blue-light py-2 text-base"},[t("i",{staticClass:"fa fa-commenting-o"})])}]};var G=n("VU/8")(L,C,!1,function(e){n("JC1s")},"data-v-5bb09856",null).exports;i.a.use(S.a);var p=new S.a({routes:[{path:"/",name:"Game",component:G}]}),P=n("2mV7");i.a.use(_.a);var U=new _.a.Store({modules:P.default,strict:!1});n("M4fF"),n("5W1q");i.a.config.productionTip=!1,new i.a({el:"#app",router:p,store:U,template:"<App/>",components:{App:E}})},RYcG:function(e,t){e.exports={O_RDONLY:0,O_WRONLY:1,O_RDWR:2,S_IFMT:61440,S_IFREG:32768,S_IFDIR:16384,S_IFCHR:8192,S_IFBLK:24576,S_IFIFO:4096,S_IFLNK:40960,S_IFSOCK:49152,O_CREAT:512,O_EXCL:2048,O_NOCTTY:131072,O_TRUNC:1024,O_APPEND:8,O_DIRECTORY:1048576,O_NOFOLLOW:256,O_SYNC:128,O_SYMLINK:2097152,O_NONBLOCK:4,S_IRWXU:448,S_IRUSR:256,S_IWUSR:128,S_IXUSR:64,S_IRWXG:56,S_IRGRP:32,S_IWGRP:16,S_IXGRP:8,S_IRWXO:7,S_IROTH:4,S_IWOTH:2,S_IXOTH:1,E2BIG:7,EACCES:13,EADDRINUSE:48,EADDRNOTAVAIL:49,EAFNOSUPPORT:47,EAGAIN:35,EALREADY:37,EBADF:9,EBADMSG:94,EBUSY:16,ECANCELED:89,ECHILD:10,ECONNABORTED:53,ECONNREFUSED:61,ECONNRESET:54,EDEADLK:11,EDESTADDRREQ:39,EDOM:33,EDQUOT:69,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:65,EIDRM:90,EILSEQ:92,EINPROGRESS:36,EINTR:4,EINVAL:22,EIO:5,EISCONN:56,EISDIR:21,ELOOP:62,EMFILE:24,EMLINK:31,EMSGSIZE:40,EMULTIHOP:95,ENAMETOOLONG:63,ENETDOWN:50,ENETRESET:52,ENETUNREACH:51,ENFILE:23,ENOBUFS:55,ENODATA:96,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:77,ENOLINK:97,ENOMEM:12,ENOMSG:91,ENOPROTOOPT:42,ENOSPC:28,ENOSR:98,ENOSTR:99,ENOSYS:78,ENOTCONN:57,ENOTDIR:20,ENOTEMPTY:66,ENOTSOCK:38,ENOTSUP:45,ENOTTY:25,ENXIO:6,EOPNOTSUPP:102,EOVERFLOW:84,EPERM:1,EPIPE:32,EPROTO:100,EPROTONOSUPPORT:43,EPROTOTYPE:41,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:70,ETIME:101,ETIMEDOUT:60,ETXTBSY:26,EWOULDBLOCK:35,EXDEV:18,SIGHUP:1,SIGINT:2,SIGQUIT:3,SIGILL:4,SIGTRAP:5,SIGABRT:6,SIGIOT:6,SIGBUS:10,SIGFPE:8,SIGKILL:9,SIGUSR1:30,SIGSEGV:11,SIGUSR2:31,SIGPIPE:13,SIGALRM:14,SIGTERM:15,SIGCHLD:20,SIGCONT:19,SIGSTOP:17,SIGTSTP:18,SIGTTIN:21,SIGTTOU:22,SIGURG:16,SIGXCPU:24,SIGXFSZ:25,SIGVTALRM:26,SIGPROF:27,SIGWINCH:28,SIGIO:23,SIGSYS:12,SSL_OP_ALL:2147486719,SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION:262144,SSL_OP_CIPHER_SERVER_PREFERENCE:4194304,SSL_OP_CISCO_ANYCONNECT:32768,SSL_OP_COOKIE_EXCHANGE:8192,SSL_OP_CRYPTOPRO_TLSEXT_BUG:2147483648,SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS:2048,SSL_OP_EPHEMERAL_RSA:0,SSL_OP_LEGACY_SERVER_CONNECT:4,SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER:32,SSL_OP_MICROSOFT_SESS_ID_BUG:1,SSL_OP_MSIE_SSLV2_RSA_PADDING:0,SSL_OP_NETSCAPE_CA_DN_BUG:536870912,SSL_OP_NETSCAPE_CHALLENGE_BUG:2,SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG:1073741824,SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG:8,SSL_OP_NO_COMPRESSION:131072,SSL_OP_NO_QUERY_MTU:4096,SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION:65536,SSL_OP_NO_SSLv2:16777216,SSL_OP_NO_SSLv3:33554432,SSL_OP_NO_TICKET:16384,SSL_OP_NO_TLSv1:67108864,SSL_OP_NO_TLSv1_1:268435456,SSL_OP_NO_TLSv1_2:134217728,SSL_OP_PKCS1_CHECK_1:0,SSL_OP_PKCS1_CHECK_2:0,SSL_OP_SINGLE_DH_USE:1048576,SSL_OP_SINGLE_ECDH_USE:524288,SSL_OP_SSLEAY_080_CLIENT_DH_BUG:128,SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG:0,SSL_OP_TLS_BLOCK_PADDING_BUG:512,SSL_OP_TLS_D5_BUG:256,SSL_OP_TLS_ROLLBACK_BUG:8388608,ENGINE_METHOD_DSA:2,ENGINE_METHOD_DH:4,ENGINE_METHOD_RAND:8,ENGINE_METHOD_ECDH:16,ENGINE_METHOD_ECDSA:32,ENGINE_METHOD_CIPHERS:64,ENGINE_METHOD_DIGESTS:128,ENGINE_METHOD_STORE:256,ENGINE_METHOD_PKEY_METHS:512,ENGINE_METHOD_PKEY_ASN1_METHS:1024,ENGINE_METHOD_ALL:65535,ENGINE_METHOD_NONE:0,DH_CHECK_P_NOT_SAFE_PRIME:2,DH_CHECK_P_NOT_PRIME:1,DH_UNABLE_TO_CHECK_GENERATOR:4,DH_NOT_SUITABLE_GENERATOR:8,NPN_ENABLED:1,RSA_PKCS1_PADDING:1,RSA_SSLV23_PADDING:2,RSA_NO_PADDING:3,RSA_PKCS1_OAEP_PADDING:4,RSA_X931_PADDING:5,RSA_PKCS1_PSS_PADDING:6,POINT_CONVERSION_COMPRESSED:2,POINT_CONVERSION_UNCOMPRESSED:4,POINT_CONVERSION_HYBRID:6,F_OK:0,R_OK:4,W_OK:2,X_OK:1,UV_UDP_REUSEADDR:4}},Ve8H:function(e,t){},fvqo:function(e,t){e.exports="data:image/png;base64,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"},gNcp:function(e,t,n){var i={"./game.js":"yI0o","./index.js":"2mV7","./tiles.js":"kYWG"};function s(e){return n(a(e))}function a(e){var t=i[e];if(!(t+1))throw new Error("Cannot find module '"+e+"'.");return t}s.keys=function(){return Object.keys(i)},s.resolve=a,e.exports=s,s.id="gNcp"},kYWG:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("//Fk"),s=n.n(i),a=n("woOf"),r=n.n(a),o=n("M4fF"),l={isAvailable:!1,isInUse:!1,isTaken:!1,isCollateral:!1,isExplosion:!1,action:"",cssClass:"bg-blue-light"},c={shuffle:function(e){return o.isObject(e)?o.shuffle(e):e},shuffleTiles:function(e){return o.map(e,this.shuffle)},createTiles:function(e,t){for(var n=[],i=0;i<e;i++)n.push(o.extend({index:i+1,id:this.createGuid()},l));n=o.map(n,this.cssClassColour);var s=[];for(i=0;i<t;i++)s.push(this.shuffle(n));var a=[];for(i=0;i<s.length;i++){for(var c=[],u=0;u<s[i].length;u++){var E=r()({},s[i][u]);E.id=this.createGuid(),c.push(E)}a.push(c)}return a},createGuid:function(){return this.guidByteGenerator()+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+this.guidByteGenerator()+this.guidByteGenerator()},guidByteGenerator:function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)},strConbinations:function(e){return function e(t,n,i){if(t||n)return n?(e(t+n[0],n.slice(1),i),e(t,n.slice(1),i)):i.push(t),i}("",e,[])},cssClassColour:function(e){switch(e.index){case 1:e.cssClass="bg-green-lighter";break;case 2:e.cssClass=" bg-purple-dark";break;case 3:e.cssClass="bg-blue-light";break;case 4:e.cssClass="bg-purple-light";break;case 5:e.cssClass="bg-yellow-dark";break;case 6:e.cssClass="bg-indigo-dark";break;case 7:e.cssClass="bg-red-light";break;case 8:e.cssClass="bg-red-dark";break;case 9:e.cssClass="bg-yellow-light"}return e},moveTile:function(e,t){return o.sortBy(e,function(e){return e.id===t||e.isTaken?1:0})}},u=n("M4fF"),E=n.n(u),S=(n("eTMF"),n("RYcG"),{SET_TILES:function(e,t){e.tiles=t},RESTART_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isAvailable=!0,e.isInUse=!1,e.isTaken=!1})})},RESET_IN_USE_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isInUse&&(e.isInUse=!1)})})},RESET_NOT_TAKEN_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isTaken||(e.isAvailable=!0,e.isInUse=!1)})})},RESET_AVAILABLE_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isTaken||e.isInUse||(e.isAvailable=!0)})})},SET_AVAILABLE_TILES:function(e,t){e.tiles.forEach(function(e){e.forEach(function(e){E.a.findLast(t,function(t){e.id,t.id})?e.isAvailable=!0:e.isAvailable=!1})})},SET_INUSE_TILES:function(e,t){e.tiles.forEach(function(e){e.forEach(function(e){e.isInUse&&(e.isTaken=!0,e.isInUse=!1),e.isAvailable=!1})})},SELECT_TILE:function(e,t){if(t){var n=e.tiles.tiles,i=E.a.findLast(n,function(e){return e.id==t});i&&(!i.isAvailable||i.isInUse||i.isTaken||(i.isAvailable=!1,i.isInUse=!0))}},SET_TILE_BY_INDEX:function(e,t){if(t&&t.index>=0){var n=E.a.findIndex(e.tiles[t.index],function(e){return e.id==t.tile.id});n>=0&&r()(e.tiles[t.index][n],t.tile)}},SET_TILES_BY_INDEX:function(e,t){t&&r()(e.tiles[t.index],t.tiles)},SET_TILE:function(e,t){t&&e.tiles.forEach(function(n,i){var s=E.a.findIndex(n,function(e){return e.id==t.id});s>=0&&r()(e.tiles[i][s],t)})},SET_SUM_TILES_IN_USE:function(e,t){e.sumTilesInUse=t},SET_SUM_TILES_TAKEN:function(e,t){e.sumTilesTaken=t}}),f={initTiles:function(e){(0,e.commit)("SET_TILES",c.createTiles(9,9))},shuffleTiles:function(e){var t=e.commit,n=[];e.state.tiles.forEach(function(e){n.push(c.shuffle(r()({},e)))}),t("SET_TILES",n)},moveTiles:function(e,t){var n=e.commit,i=e.state;return new s.a(function(e,s){var a=c.moveTile(r()({},i.tiles[t.tileIndex]),t.id);n("SET_TILES_BY_INDEX",{tiles:a,index:t.tileIndex}),e()})},selectTile:function(e,t){var n=e.commit,i=e.rootState;return new s.a(function(e,s){i.game.game.isOver||i.game.game.isWin||!i.game.game.diceInUse?s("did not pass criteria",i.game.game):(n("SELECT_TILE",t),e())})},setTile:function(e,t){var n=e.commit;e.state;n("SET_TILE",t)},setTileByIndex:function(e,t){var n=e.commit;e.state;return new s.a(function(e,i){n("SET_TILE_BY_INDEX",t),e()})},setIsTaken:function(e){var t=e.commit,n=e.state;e.rootState,e.dispatch;return new s.a(function(e,i){n.tiles.forEach(function(e){e.forEach(function(e){if(e.isInUse){var n=r()({},e);n.isInUse=!1,n.isTaken=!0,n.isCollateral=!1,t("SET_TILE",n)}})}),e()})},sumTilesInUse:function(e){var t=e.commit,n=e.state;return new s.a(function(e,i){var s=0;n.tiles.forEach(function(e){s+=E.a.sum(E.a.filter(e,function(e){return 1==e.isInUse&&0==e.isCollateral}).map(function(e){return e.index}))}),t("SET_SUM_TILES_IN_USE",s),e(s)})},sumTilesTaken:function(e){var t=e.commit,n=e.state;return new s.a(function(e,i){var s=0;n.tiles.forEach(function(e){s+=E.a.sum(E.a.filter(e,function(e){return 1==e.isTaken}).map(function(e){return e.index}))}),t("SET_SUM_TILES_TAKEN",s),e(s)})},setTiles:function(e,t){var n=e.commit,i=e.state,a=e.rootState,r=e.dispatch;return new s.a(function(e,s){var o=a.game.game;n("RESET_AVAILABLE_TILES");var l=E.a.map(E.a.uniq(E.a.flatMapDeep(i.tiles,function(e){return E.a.flatMapDeep(e,function(e){if(!e.isInUse&&!e.isTaken)return e.index})})),function(e,t){return[e]});l.join("");console.log("Tiles Playable                ",l);var u=c.strConbinations(l.join(""));null!=u&&void 0!=u||(u=[]);var S=E.a.sum(E.a.filter(o.dice,function(e){return 1==e.isAvailable}).map(function(e){return e.number})),f=S-i.sumTilesInUse;console.log("sumIsInUse:                   "+i.sumTilesInUse),console.log("diceSum:                      "+S);var T=u.length>0?E.a.filter(u,function(e){return f==e.split("").reduce(function(e,t){return e+parseInt(t)},0)}):[];console.log("Tiles Set Combinations Available  "+T);var _=[];T.forEach(function(e){1==e.length?_.push(E.a.toSafeInteger(e)):e.split("").forEach(function(e){_.push(E.a.toSafeInteger(e))})});var d=E.a.uniq(_.join("").split(""));console.log("Tiles Combinations available  "+_),console.log("Tile Playable available       "+d),console.log("-------------------------"),T.length>0?n("SET_GAME_NOTE","Combinations available  "+T):n("SET_GAME_NOTE",""),i.tiles.forEach(function(e){E.a.filter(e,function(e){return 0==e.isTaken&&0==e.isInUse}).forEach(function(e){var t={isAvailable:E.a.findIndex(d,function(t){return t==e.index.toString()})>=0,isInUse:e.isInUse,isTaken:e.isTaken,cssClass:e.cssClass,index:e.index,id:e.id},i=E.a.omitBy(t,function(t,n){return e[n]===t});E.a.isEmpty(i)||n("SET_TILE",t)})}),t&&(i.sumTilesInUse==S?r("setIsTaken").then(function(){r("sumTilesInUse").then(function(){r("sumTilesTaken").then(function(){n("SET_GAME_NOTE","Roll the dice"),n("SET_GAME_ISNEXT",!0),n("SET_DICE_IN_USE",!1)})})}):_.length<=0&&n("GAME_OVER",!0)),e()})}};t.default={state:{tiles:[],sumTilesInUse:0,sumTilesTaken:0},mutations:S,actions:f,getters:{tiles:function(e){return e.tiles},sumTilesInUse:function(e){return e.sumTilesInUse},sumTilesTaken:function(e){return e.sumTilesTaken}}}},yI0o:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("//Fk"),s=n.n(i),a={points:0,state:"isStart",dice:[{id:1,number:0,html:"&#x2680",isAvailable:!0},{id:2,number:0,html:"&#x2680",isAvailable:!0}],numberPlay:1,diceInUse:!1,note:"Start Game"},r=n("M4fF"),o=n.n(r),l={SET_GAME:function(e,t){e.game=t},SET_GAME_ISNEXT:function(e,t){e.game.state=t?"isNext":""},START_GAME:function(e){e.game.numberPlay=0,e.game.state="",e.game.timeleft=60},SET_GAME_NOTE:function(e,t){e.game.note=t},SET_DICE_IN_USE:function(e,t){e.game.diceInUse=t},GAME_OVER:function(e){e.game.timeleft=0,e.game.note="Game Over",e.game.state="isOver",e.game.diceInUse=!1},RESTART_GAME:function(e){e.game.numberPlay=0,e.game.timeleft=60,e.game.state="isStart",e.game.note="Restart Game",e.game.diceInUse=!1},ROLL_DICE:function(e){e.game.dice.forEach(function(e){e.number=Math.floor(6*Math.random()+1),e.html="&#x268"+(e.number-1)}),e.game.diceInUse=!0,e.game.numberPlay++}},c={initGame:function(e){var t=e.commit,n=e.payload;t("SET_GAME",null==n?a:n)},startGame:function(e){var t=e.commit,n=e.dispatch;return new s.a(function(e,i){t("RESTART_TILES"),n("shuffleTiles"),t("START_GAME"),t("ROLL_DICE"),e()})},nextGame:function(e){var t=e.commit;return new s.a(function(e,n){t("RESET_NOT_TAKEN_TILES"),t("SET_GAME_ISNEXT",!1),t("ROLL_DICE"),e()})},nextPlay:function(e){var t=e.commit;return new s.a(function(e,n){t("RESET_IN_USE_TILES"),t("SET_GAME_ISNEXT",!1),t("ROLL_DICE"),e()})},restartGame:function(e){var t=e.commit,n=e.dispatch;t("RESTART_TILES"),n("shuffleTiles"),t("RESTART_GAME")}},u={game:function(e){return e.game},diceSum:function(e){return o.a.sum(o.a.filter(a.dice,function(e){return 1==e.isAvailable}).map(function(e){return e.number}))}};t.default={state:{game:[]},mutations:l,actions:c,getters:u}}},["NHnr"]);
//# sourceMappingURL=app.7b2173057772808aa411.js.map