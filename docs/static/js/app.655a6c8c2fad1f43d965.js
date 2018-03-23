webpackJsonp([1],{"2mV7":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("gNcp"),s={};i.keys().forEach(function(e){"./index.js"!==e&&(s[e.replace(/(\.\/|\.js)/g,"")]=i(e).default)}),t.default=s},"5W1q":function(e,t){},"5pXf":function(e,t){},"6hdv":function(e,t){},"D+VX":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("woOf"),s=n.n(i),a=n("//Fk"),r=n.n(a),o=n("Sazm"),l=n.n(o),u=n("YaEn"),c=n("TxU5"),d=(n.n(c),c.firebaseCfg),f={initFirebase:function(e){e.commit;l.a.initializeApp(d)},getFirebaseAuthToken:function(e){e.commit;return new r.a(function(e,t){null!=l.a.auth().firebaseAuthToken?e():t("Not authorized",null)})},getCurrentUser:function(e){var t=e.commit;return new r.a(function(e,n){var i=l.a.auth().currentUser;null!=i?(t("SET_USER",s()({},i)),t("SET_AUTH",!0),e()):(t("SET_USER",null),t("SET_AUTH",!1),n("Not authorized",null))})},logout:function(e){var t=e.commit;l.a.auth().signOut().then(function(){u.a.replace("login"),t("SET_USER",null),t("SET_AUTH",!1)})}};t.default={state:{authenticated:!1,user:null},mutations:{SET_AUTH:function(e,t){e.authenticated=t},LOGOUT:function(e){e.user=null,e.authenticated=!1},SET_USER:function(e,t){e.user=t}},actions:f,getters:{isAuthenticated:function(e){return e.authenticated},user:function(e){return e.user},authHeader:function(e){return null!=e.user?e.user.firebaseAuthToken:null}}}},H6Rp:function(e,t){},IcnI:function(e,t,n){"use strict";var i=n("7+uW"),s=n("NYxO"),a=n("2mV7");i.a.use(s.a),t.a=new s.a.Store({modules:a.default,strict:!1})},LKT2:function(e,t){},NHnr:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("woOf"),s=n.n(i),a=n("7+uW"),r=n("Dd8w"),o=n.n(r),l=n("NYxO"),u=n("wTAR"),c={methods:o()({},Object(l.b)({login:"login",logout:"logout"}),{restartGame:function(){this.$store.commit("SET_GAME_IS_VISIBLE",!1)}}),computed:o()({},Object(l.c)({isAuthenticated:"isAuthenticated",user:"user"}),{pointsTotal:function(){return this.$store.getters.sumTilesTaken},numberPlay:function(){return this.$store.getters.game.numberPlay},abbreviations:function(){return null!=this.$store.getters.user.displayName?this.$store.getters.user.displayName.charAt(0).toUpperCase():this.$store.getters.user.email.charAt(0).toUpperCase()}}),components:{animatedInteger:u.a}},d={render:function(){var e=this.$createElement,t=this._self._c||e;return t("div",[t("ul",{staticClass:"list-reset flex justify-between w-full items-center  mb-2"},[t("li",{staticClass:"w-12"},[t("router-link",{staticClass:"inline-block text-black text-center bg-green-light px-2 py-2 m-2 ml-2 border-b-4 border-black rounded-b  no-underline w-10",attrs:{to:"/game"}},[t("i",{staticClass:"fa fa-home"})]),this._v(" "),t("router-link",{staticClass:"inline-block text-black text-center bg-green-light px-2 py-2 m-2 ml-2 border-b-4 border-black rounded-b  no-underline w-10",attrs:{to:"/login"}},[this.isAuthenticated?[this._v("          \r\n                      "+this._s(this.abbreviations)+"    \r\n                    ")]:[t("i",{staticClass:"fa fa-user"})]],2)],1),this._v(" "),t("li",[t("animated-integer",{attrs:{title:"Play",value:this.numberPlay}})],1),this._v(" "),this._m(0),this._v(" "),t("li",[t("animated-integer",{attrs:{isAudio:!0,title:"Points",value:this.pointsTotal}})],1),this._v(" "),t("li",{staticClass:"w-12 mr-2"},[t("a",{staticClass:"inline-block text-black text-center bg-blue-light px-2 py-2 m-2 mr-2 border-b-4 border-black rounded-b no-underline w-10",attrs:{href:"#"},on:{click:this.restartGame}},[t("i",{staticClass:"fa fa-times"})])])])])},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("li",{staticClass:"flex-grow ",attrs:{id:"logo"}},[t("img",{staticStyle:{"max-height":"30px"},attrs:{src:n("fvqo")}})])}]};var f=n("VU/8")(c,d,!1,function(e){n("mZjN")},"data-v-4f557564",null).exports,E=n("bOQy"),m={name:"app",data:function(){return{isMobile:!1}},computed:{gameIsVisible:function(){return this.$store.getters.gameIsVisible},tilesLength:function(){return null==this.$store.getters.tiles?0:this.$store.getters.tiles.length}},methods:{setGame:function(e){this.$store.dispatch("initGame"),this.$store.dispatch("initTiles",e),this.$store.commit("SET_GAME_IS_VISIBLE",!0)}},components:{appHeader:f},created:function(){this.$store.dispatch("initGame"),this.isMobile=E.a.isMobile()}},S={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"w-full h-screen bg-gradient-brand  mx-auto relative ",class:[{isMobile:e.isMobile&&e.tilesLength>1},{container:!e.isMobile}]},[e._m(0),e._v(" "),n("div",{attrs:{id:"app"}},[n("div",{staticClass:"header"},[e.gameIsVisible?n("app-header"):e._e()],1),e._v(" "),e.gameIsVisible?e._e():[n("div",{staticClass:"h-screen w-full absolute flex items-center justify-center bg-modal",staticStyle:{height:"calc(100% - 200px)"}},[n("div",{staticClass:"bg-white rounded shadow p-8 m-4 max-w-xs max-h-full text-center"},[e._m(1),e._v(" "),e._m(2),e._v(" "),n("div",{staticClass:"flex justify-center"},[n("button",{staticClass:"flex-no-shrink text-white py-2 px-4 rounded bg-teal hover:bg-teal-dark",on:{click:function(t){e.setGame(1)}}},[e._v("Shut The Box")]),e._v(" "),n("button",{staticClass:"flex-no-shrink text-white ml-2 py-2 px-4 rounded bg-teal hover:bg-teal-dark",on:{click:function(t){e.setGame(9)}}},[e._v("Shut The Cube")])])])])],e._v(" "),n("transition",{attrs:{name:"fade",mode:"out-in"}},[e.gameIsVisible?[n("router-view")]:e._e()],2)],2)])},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{attrs:{id:"warning-message"}},[t("div",{staticClass:"w-full h-screen  absolute flex items-center justify-center bg-modal bg-green-light"},[t("div",{staticClass:" text-center"},[t("div",{staticClass:"mb-4"},[t("img",{staticStyle:{"max-height":"30px"},attrs:{src:n("fvqo")}})]),this._v(" "),t("div",{staticClass:"mb-8"},[t("p",[this._v(" This App is only viewable in vertical mode.")])])])])])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"mb-4"},[t("img",{staticStyle:{"max-height":"30px"},attrs:{src:n("fvqo")}})])},function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"mb-8"},[t("p",[this._v("Select the game you want to play.")])])}]};var h=n("VU/8")(m,S,!1,function(e){n("H6Rp")},null,null).exports,_=n("YaEn"),T=(n("M4fF"),n("Sazm")),g=n.n(T),p=n("IcnI"),v=(n("5W1q"),n("IZMb")),I=n.n(v),b=n("TxU5"),O=b.firebaseCfg;a.a.use(I.a,{theme:"primary",position:"bottom-center",duration:5e3,action:{text:"Close",onClick:function(e,t){t.goAway(0)}}}),a.a.config.productionTip=!1;var A=void 0;A||(A=new a.a({el:"#app",router:_.a,store:p.a,created:function(){var e=this;g.a.initializeApp(O),g.a.auth().onAuthStateChanged(function(t){t?(e.$store.commit("SET_AUTH",!0),e.$store.commit("SET_USER",s()({},t.toJSON()))):(e.$store.commit("SET_AUTH",!1),e.$store.commit("SET_USER",null))})},template:"<App/>",components:{App:h}}))},RYcG:function(e,t){e.exports={O_RDONLY:0,O_WRONLY:1,O_RDWR:2,S_IFMT:61440,S_IFREG:32768,S_IFDIR:16384,S_IFCHR:8192,S_IFBLK:24576,S_IFIFO:4096,S_IFLNK:40960,S_IFSOCK:49152,O_CREAT:512,O_EXCL:2048,O_NOCTTY:131072,O_TRUNC:1024,O_APPEND:8,O_DIRECTORY:1048576,O_NOFOLLOW:256,O_SYNC:128,O_SYMLINK:2097152,O_NONBLOCK:4,S_IRWXU:448,S_IRUSR:256,S_IWUSR:128,S_IXUSR:64,S_IRWXG:56,S_IRGRP:32,S_IWGRP:16,S_IXGRP:8,S_IRWXO:7,S_IROTH:4,S_IWOTH:2,S_IXOTH:1,E2BIG:7,EACCES:13,EADDRINUSE:48,EADDRNOTAVAIL:49,EAFNOSUPPORT:47,EAGAIN:35,EALREADY:37,EBADF:9,EBADMSG:94,EBUSY:16,ECANCELED:89,ECHILD:10,ECONNABORTED:53,ECONNREFUSED:61,ECONNRESET:54,EDEADLK:11,EDESTADDRREQ:39,EDOM:33,EDQUOT:69,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:65,EIDRM:90,EILSEQ:92,EINPROGRESS:36,EINTR:4,EINVAL:22,EIO:5,EISCONN:56,EISDIR:21,ELOOP:62,EMFILE:24,EMLINK:31,EMSGSIZE:40,EMULTIHOP:95,ENAMETOOLONG:63,ENETDOWN:50,ENETRESET:52,ENETUNREACH:51,ENFILE:23,ENOBUFS:55,ENODATA:96,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:77,ENOLINK:97,ENOMEM:12,ENOMSG:91,ENOPROTOOPT:42,ENOSPC:28,ENOSR:98,ENOSTR:99,ENOSYS:78,ENOTCONN:57,ENOTDIR:20,ENOTEMPTY:66,ENOTSOCK:38,ENOTSUP:45,ENOTTY:25,ENXIO:6,EOPNOTSUPP:102,EOVERFLOW:84,EPERM:1,EPIPE:32,EPROTO:100,EPROTONOSUPPORT:43,EPROTOTYPE:41,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:70,ETIME:101,ETIMEDOUT:60,ETXTBSY:26,EWOULDBLOCK:35,EXDEV:18,SIGHUP:1,SIGINT:2,SIGQUIT:3,SIGILL:4,SIGTRAP:5,SIGABRT:6,SIGIOT:6,SIGBUS:10,SIGFPE:8,SIGKILL:9,SIGUSR1:30,SIGSEGV:11,SIGUSR2:31,SIGPIPE:13,SIGALRM:14,SIGTERM:15,SIGCHLD:20,SIGCONT:19,SIGSTOP:17,SIGTSTP:18,SIGTTIN:21,SIGTTOU:22,SIGURG:16,SIGXCPU:24,SIGXFSZ:25,SIGVTALRM:26,SIGPROF:27,SIGWINCH:28,SIGIO:23,SIGSYS:12,SSL_OP_ALL:2147486719,SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION:262144,SSL_OP_CIPHER_SERVER_PREFERENCE:4194304,SSL_OP_CISCO_ANYCONNECT:32768,SSL_OP_COOKIE_EXCHANGE:8192,SSL_OP_CRYPTOPRO_TLSEXT_BUG:2147483648,SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS:2048,SSL_OP_EPHEMERAL_RSA:0,SSL_OP_LEGACY_SERVER_CONNECT:4,SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER:32,SSL_OP_MICROSOFT_SESS_ID_BUG:1,SSL_OP_MSIE_SSLV2_RSA_PADDING:0,SSL_OP_NETSCAPE_CA_DN_BUG:536870912,SSL_OP_NETSCAPE_CHALLENGE_BUG:2,SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG:1073741824,SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG:8,SSL_OP_NO_COMPRESSION:131072,SSL_OP_NO_QUERY_MTU:4096,SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION:65536,SSL_OP_NO_SSLv2:16777216,SSL_OP_NO_SSLv3:33554432,SSL_OP_NO_TICKET:16384,SSL_OP_NO_TLSv1:67108864,SSL_OP_NO_TLSv1_1:268435456,SSL_OP_NO_TLSv1_2:134217728,SSL_OP_PKCS1_CHECK_1:0,SSL_OP_PKCS1_CHECK_2:0,SSL_OP_SINGLE_DH_USE:1048576,SSL_OP_SINGLE_ECDH_USE:524288,SSL_OP_SSLEAY_080_CLIENT_DH_BUG:128,SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG:0,SSL_OP_TLS_BLOCK_PADDING_BUG:512,SSL_OP_TLS_D5_BUG:256,SSL_OP_TLS_ROLLBACK_BUG:8388608,ENGINE_METHOD_DSA:2,ENGINE_METHOD_DH:4,ENGINE_METHOD_RAND:8,ENGINE_METHOD_ECDH:16,ENGINE_METHOD_ECDSA:32,ENGINE_METHOD_CIPHERS:64,ENGINE_METHOD_DIGESTS:128,ENGINE_METHOD_STORE:256,ENGINE_METHOD_PKEY_METHS:512,ENGINE_METHOD_PKEY_ASN1_METHS:1024,ENGINE_METHOD_ALL:65535,ENGINE_METHOD_NONE:0,DH_CHECK_P_NOT_SAFE_PRIME:2,DH_CHECK_P_NOT_PRIME:1,DH_UNABLE_TO_CHECK_GENERATOR:4,DH_NOT_SUITABLE_GENERATOR:8,NPN_ENABLED:1,RSA_PKCS1_PADDING:1,RSA_SSLV23_PADDING:2,RSA_NO_PADDING:3,RSA_PKCS1_OAEP_PADDING:4,RSA_X931_PADDING:5,RSA_PKCS1_PSS_PADDING:6,POINT_CONVERSION_COMPRESSED:2,POINT_CONVERSION_UNCOMPRESSED:4,POINT_CONVERSION_HYBRID:6,F_OK:0,R_OK:4,W_OK:2,X_OK:1,UV_UDP_REUSEADDR:4}},TxU5:function(e,t){e.exports={firebaseCfg:{apiKey:"AIzaSyCAmuQyyUhGBA3Zyh2VXSHstZs0C-kHhyk",authDomain:"test-app.firebaseapp.com",databaseURL:"https://test-app.firebaseio.com",projectId:"test-app",storageBucket:"test-app.appspot.com",messagingSenderId:"872127545262"}}},YaEn:function(e,t,n){"use strict";var i=n("7+uW"),s=n("/ocq"),a=(n("IcnI"),n("Dd8w")),r=n.n(a),o=n("NYxO"),l=n("Xxa5"),u=n.n(l),c=n("woOf"),d=n.n(c),f=n("exGp"),E=n.n(f);Array.prototype.move=function(e,t){if(t>=this.length)for(var n=t-this.length;1+n--;)this.push(void 0);return this.splice(t,0,this.splice(e,1)[0]),this};var m={props:["tiles","index","allTiles"],computed:{diceSum:function(){return this.$store.getters.diceSum},sumTilesInUse:function(){return this.$store.getters.sumTilesInUse}},methods:{selectTile:function(e,t,n){if(e.isAvailable&&!e.isTaken&&this.sumTilesInUse+e.index<=this.diceSum){var i=new Audio;i.src=document.querySelector("#click").src,i.currentTime=0,i.play();var s=this.allTiles.length;this.index;if(this.index>1)for(var a=this.index-1;a>-1&&(this.allTiles[a][t].index==e.index&&!this.allTiles[a][t].isTaken);a--)this.setTile(this.allTiles[a][t],a);else 1==this.index&&(this.allTiles[0][t].index!=e.index||this.allTiles[0][t].isTaken||this.setTile(this.allTiles[0][t],0));for(a=this.index+1;a<s&&(this.allTiles[a][t].index==e.index&&!this.allTiles[a][t].isTaken);a++)this.setTile(this.allTiles[a][t],a);this.setTile(e,n)}else this.setTileShake(e,n)},setTileShake:function(e,t){var n=this;return E()(u.a.mark(function i(){var s;return u.a.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return(s=d()({},e)).action="shake",s.isCollateral=t!=n.index,n,i.next=6,n.$store.dispatch("setTileByIndex",{tile:s,index:t}).then(function(){setTimeout(function(){var i=d()({},e);i.action="",n.$store.dispatch("setTileByIndex",{tile:i,index:t})},500)});case 6:case"end":return i.stop()}},i,n)}))()},setTile:function(e,t){var n=this;return E()(u.a.mark(function i(){var s,a;return u.a.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return(s=d()({},e)).action="rotateIn",s.isExplosion=!0,s.isInUse=!0,s.isCollateral=t!=n.index,a=n,i.next=8,n.$store.dispatch("setTileByIndex",{tile:s,index:t}).then(function(){n.$store.dispatch("sumTilesInUse"),setTimeout(function(){var i=d()({},e);i.action="",i.isExplosion=!1,n.$store.dispatch("setTileByIndex",{tile:i,index:t}).then(function(){a.changeTile(t,e.id)})},500)});case 8:case"end":return i.stop()}},i,n)}))()},changeTile:function(e,t){var n=this;n.$store.commit("SET_IS_LOADING",!0),this.$store.dispatch("moveTiles",{tileIndex:e,id:t}).then(function(){n.$store.dispatch("setTiles",e==n.index).then(function(){n.$store.commit("SET_IS_LOADING",!1)})})}}},S={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("transition-group",{attrs:{duration:300,name:"flip-list",tag:"ul"}},e._l(e.tiles,function(t,i){return n("li",{key:t.id},[n("div",{staticStyle:{position:"relative"}},[n("div",{class:{explosion:t.isExplosion}}),e._v(" "),n("div",{staticClass:"\n      \n                  box\n                  active \n                  text-black \n                  text-center \n                  border-b-4 \n                  border-black \n                  rounded  \n                  no-underline \n                  animate \n                  action-button sm:text-sm md:text-lg lg:text-xl xl:text-2xl\n                  \n                  ",class:[t.cssClass,{isAvailable:t.isAvailable},{isNotAvailable:!t.isAvailable},{isTaken:t.isTaken},{isInUse:t.isInUse},"animated "+t.action],on:{click:function(n){e.selectTile(t,i,e.index)}}},[n("p",{staticClass:"number"},[e._v(e._s(t.index))])])])])}))},staticRenderFns:[]};var h=n("VU/8")(m,S,!1,function(e){n("6hdv")},"data-v-497dac5b",null).exports,_={render:function(){var e=this.$createElement;return(this._self._c||e)("span",{domProps:{innerHTML:this._s(this.dice.html)}})},staticRenderFns:[]};var T=n("VU/8")({props:["dice"]},_,!1,function(e){n("5pXf")},"data-v-61b952e6",null).exports,g=n("wTAR"),p=n("bOQy"),v=new(n("kqA7"))({threshold:navigator.userAgent.match(/Android/i)?4:8,timeout:1e3}),I={name:"Game",data:function(){return{msg:"new message",diceObj:{}}},computed:{tilesObj:function(){return null==this.$store.getters.tiles?{}:this.$store.getters.tiles},game:function(){return this.$store.getters.game},gameIsLoading:function(){return this.$store.getters.gameIsLoading},pointsTotal:function(){return this.$store.getters.sumTilesTaken},buttonGameStateMessage:function(){switch(this.game.state){case"isNext":return"ROLL DICE";case"isOver":return"GAME OVER";case"isStart":return"START GAME";case"isWin":return"SHUT THE BOX"}},buttonGameStateColour:function(){switch(this.game.state){case"isNext":return"bg-green-light";case"isOver":return"bg-red-light";case"isStart":case"isWin":return"bg-green-light"}},buttonGameStateIcon:function(){if(this.gameIsLoading)return"fa fa-refresh fa-spin";switch(this.game.state){case"isNext":return"fa fa-arrow-right";case"isOver":return"fa fa-times";case"isStart":return"fa fa-arrow-right";case"isWin":return"fa fa-check"}}},methods:r()({},Object(o.b)({restartGame:"restartGame"}),{gameState:function(){switch(this.$store.commit("SET_IS_LOADING",!0),this.game.state){case"isNext":this.initNextGame();break;case"isOver":this.restartGame();break;case"isStart":this.initStartGame();break;case"isWin":this.restartGame()}var e=new Audio;e.src=document.querySelector("#click2").src,e.currentTime=20,e.play()},initStartGame:function(){var e=this;e.$store.dispatch("startGame").then(function(){e.$store.dispatch("setTiles",!0).then(function(){e.$store.commit("SET_IS_LOADING",!1)})})},initNextGame:function(){var e=this;e.$store.dispatch("nextGame").then(function(){e.$store.dispatch("setTiles",!0).then(function(){e.$store.commit("SET_IS_LOADING",!1)})})}}),components:{appTiles:h,appDice:T,animatedInteger:g.a},destroy:function(){v.stop()},mounted:function(){var e=this;p.a.isMobile()&&(v.start(),window.addEventListener("shake",function(){e.gameState()},!1))}},b={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"Game"},[e._l(e.tilesObj,function(t,i){return n("app-tiles",{key:t.index,attrs:{index:i,allTiles:e.tilesObj,tiles:t}})}),e._v(" "),n("div",{class:[{blocked:e.game.diceInUse||"isStart"==!e.game.state&&"isNext"==e.game.state}],attrs:{id:"dice"}},e._l(e.game.dice,function(e){return n("app-dice",{key:e.id,attrs:{dice:e}})})),e._v(" "),n("transition",{attrs:{name:"fade",mode:"out-in"}},[e.buttonGameStateMessage?n("button",{key:e.game.state,staticClass:"no-outline list-reset flex mb-2 bg-yellow-light border-b-4 border-black rounded-b   action-button",staticStyle:{"max-width":"200px",margin:"0 auto"},nativeOn:{click:function(t){t.preventDefault(),e.gameState(t)}}},[n("div",[n("div",{staticClass:"text-black text-center  px-2 pt-2 py-1  no-underline  "},[n("i",{class:e.buttonGameStateIcon})])]),e._v(" "),n("div",{staticClass:"flex-grow  "},[n("div",{staticClass:" text-black text-center bg-red-light px-2 pt-2 py-1  no-underline",class:e.buttonGameStateColour},[e._v("\n                  "+e._s(e.buttonGameStateMessage)+"\n              ")])])]):[n("div",{staticClass:"no-outline list-reset flex mb-2  animate  action-button",staticStyle:{margin:"0 auto"}},[n("div",{staticClass:"flex-grow  "},[n("div",{staticClass:" text-black text-center  px-2 pt-0 py-1  no-underline"},[n("div",{domProps:{innerHTML:e._s(e.game.note)}}),e._v("   \n              ")])])])]],2)],2)},staticRenderFns:[]};var O=n("VU/8")(I,b,!1,function(e){n("LKT2")},"data-v-15bf5181",null).exports,A=n("Sazm"),N=n.n(A),C={name:"login",data:function(){return{email:"",password:""}},methods:{signIn:function(){var e=this;N.a.auth().signInWithEmailAndPassword(this.email,this.password).then(function(t){e.$toasted.success("Logged on as "+e.email),e.$router.replace("game")},function(t){e.$toasted.error(t.message)}).catch(function(t){e.$toasted.error(t.message)}).then(function(){})}},created:function(){}},x={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"login"},[n("div",{staticClass:"container mx-auto h-full flex justify-center items-center"},[n("div",[n("div",{staticClass:"border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg"},[n("div",{staticClass:"mb-4"},[n("label",{staticClass:"font-bold text-grey-darker block mb-2"},[e._v("Username or Email")]),e._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.email,expression:"email"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{type:"email",required:"",placeholder:"Your Username"},domProps:{value:e.email},on:{input:function(t){t.target.composing||(e.email=t.target.value)}}})]),e._v(" "),n("div",{staticClass:"mb-4"},[n("label",{staticClass:"font-bold text-grey-darker block mb-2"},[e._v("Password")]),e._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{type:"password",required:"",placeholder:"Your Password"},domProps:{value:e.password},on:{input:function(t){t.target.composing||(e.password=t.target.value)}}})]),e._v(" "),n("div",{staticClass:"flex items-center justify-between"},[n("button",{staticClass:"bg-teal-dark hover:bg-teal text-white font-bold py-2 px-4 rounded",on:{click:e.signIn}},[e._v("\n                      Login\n                  ")])])]),e._v(" "),n("div",{staticClass:"text-center"},[n("p",{staticClass:"text-grey-dark text-sm"},[e._v("Don't have an account? \n                 "),n("router-link",{staticClass:"no-underline text-blue font-bold",attrs:{to:"/sign-up"}},[e._v("Create an Account")])],1)])])])])},staticRenderFns:[]},L=n("VU/8")(C,x,!1,null,null,null).exports,R={name:"signUp",data:function(){return{email:"",password:""}},methods:{signUp:function(){var e=this;N.a.auth().createUserWithEmailAndPassword(this.email,this.password).then(function(t){e.$router.replace("game")},function(e){alert("Oops. "+e.message)})}}},G={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"sign-up"},[n("div",{staticClass:"container mx-auto h-full flex justify-center items-center"},[n("div",[n("div",{staticClass:"border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg"},[n("div",{staticClass:"mb-4"},[n("label",{staticClass:"font-bold text-grey-darker block mb-2"},[e._v("Username or Email")]),e._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.email,expression:"email"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{autocomplete:"off",type:"text",placeholder:"Your Username"},domProps:{value:e.email},on:{input:function(t){t.target.composing||(e.email=t.target.value)}}})]),e._v(" "),n("div",{staticClass:"mb-4"},[n("label",{staticClass:"font-bold text-grey-darker block mb-2"},[e._v("Password")]),e._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{autocomplete:"off",type:"password",placeholder:"Your Password"},domProps:{value:e.password},on:{input:function(t){t.target.composing||(e.password=t.target.value)}}})]),e._v(" "),n("div",{staticClass:"flex items-center justify-between"},[n("button",{staticClass:"bg-teal-dark hover:bg-teal text-white font-bold py-2 px-4 rounded",on:{click:e.signUp}},[e._v("\n                      Sign Up\n                  ")])])]),e._v(" "),n("div",{staticClass:"text-center"},[n("p",{staticClass:"text-grey-dark text-sm"},[n("router-link",{staticClass:"no-underline text-blue font-bold",attrs:{to:"/login"}},[e._v("Go back to Login")])],1)])])])])},staticRenderFns:[]},U=n("VU/8")(R,G,!1,null,null,null).exports;i.a.use(s.a);var w=new s.a({linkExactActiveClass:"active",base:"/shutTheCube/",routes:[{path:"*",redirect:"/game"},{path:"/game",name:"Game",component:O},{path:"/login",name:"Login",component:L},{path:"/sign-up",name:"SignUp",component:U}]});w.beforeEach(function(e,t,n){n()});t.a=w},bOQy:function(e,t,n){"use strict";var i=n("woOf"),s=n.n(i),a=n("M4fF"),r=n("CX9+"),o={isAvailable:!1,isInUse:!1,isTaken:!1,isCollateral:!1,isExplosion:!1,action:"",cssClass:"bg-blue-light"};t.a={shuffle:function(e){return a.isObject(e)?a.shuffle(e):e},shuffleTiles:function(e){return a.map(e,this.shuffle)},createTiles:function(e,t){for(var n=[],i=0;i<e;i++)n.push(a.extend({index:i+1,id:this.createGuid()},o));n=a.map(n,this.cssClassColour);var r=[];for(i=0;i<t;i++)r.push(this.shuffle(n));var l=[];for(i=0;i<r.length;i++){for(var u=[],c=0;c<r[i].length;c++){var d=s()({},r[i][c]);d.id=this.createGuid(),d.isTaken=!1,u.push(d)}l.push(u)}return l},createGuid:function(){return this.guidByteGenerator()+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+this.guidByteGenerator()+this.guidByteGenerator()},guidByteGenerator:function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)},strConbinations:function(e){return function e(t,n,i){if(t||n)return n?(e(t+n[0],n.slice(1),i),e(t,n.slice(1),i)):i.push(t),i}("",e,[])},strSumConbinations:function(e,t){var n=this;return function e(i,s,a){if(i||s)return s?(e(i+s[0],s.slice(1),a),e(i,s.slice(1),a)):n.sumString(i)==t&&a.push(i),a}("",e,[])},cssClassColour:function(e){switch(e.index){case 1:e.cssClass="bg-green-lighter";break;case 2:e.cssClass=" bg-purple-dark";break;case 3:e.cssClass="bg-blue-light";break;case 4:e.cssClass="bg-purple-light";break;case 5:e.cssClass="bg-yellow-dark";break;case 6:e.cssClass="bg-indigo-dark";break;case 7:e.cssClass="bg-red-light";break;case 8:e.cssClass="bg-red-dark";break;case 9:e.cssClass="bg-yellow-light"}return e},moveTile:function(e,t){return a.sortBy(e,function(e){return e.id===t||e.isTaken?1:0})},isMobile:function(){return!!(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i))},sumString:function(e){return void 0!=e?a.sumBy(e.split(""),function(e){return parseFloat(e)}):0},getTilesCombinations:function(e,t){var n=a.sortBy(a.filter(a.map(a.flatMapDeep(e,function(e){return a.flatMapDeep(e,function(e){return!e.isInUse&&!e.isTaken&&e.index<=t&&e.index})}),function(e,t){return e}),function(e){return e}),function(e){return e}),i=a.groupBy(n,Math.floor),s=[];a.each(i,function(e,n){var i=[],r=0;a.each(e,function(e){(r+=e)<=t&&i.push(e)}),i.length>1&&s.push(i)});var o=a.without(a.uniq(a.flatMapDeep(e,function(e){return a.flatMapDeep(e,function(e){if(!e.isInUse&&!e.isTaken)return e.index})})),void 0),l=a.uniqWith(r.power(a.flatMapDeep(s)).lazyFilter(function(e){return a.toSafeInteger(a.sum(e))==t}).toArray(),a.isEqual),u=a.uniqWith(r.power(a.flatMapDeep(o)).lazyFilter(function(e){return a.toSafeInteger(a.sum(e))==t}).toArray(),a.isEqual);return a.concat(u,l)},getTilesIndexCombinations:function(e,t){var n=a.without(a.uniq(a.flatMapDeep(e,function(e){return a.flatMapDeep(e,function(e){if(!e.isInUse&&!e.isTaken)return e.index})})),void 0),i=a.sortBy(a.filter(a.map(a.flatMapDeep(e,function(e){return a.flatMapDeep(e,function(e){return!e.isInUse&&!e.isTaken&&e.index<=t&&e.index})}),function(e,t){return e}),function(e){return e}),function(e){return e}),s=a.uniqWith(r.power(a.flatMapDeep(n)).lazyFilter(function(e){return a.toSafeInteger(a.sum(e))==t}).toArray(),a.isEqual),o=a.groupBy(i,Math.floor),l=[];a.each(o,function(e,n){var i=[],r=0;a.each(e,function(e){(r+=e)<=t&&i.push(e)}),i.length>1&&0==a.intersection(a.flatMap(s),i).length&&l.push(i)}),console.log(l);var u=a.uniqWith(r.power(a.flatMapDeep(l)).lazyFilter(function(e){return a.toSafeInteger(a.sum(e))==t}).toArray(),a.isEqual);return a.uniq(a.flatMapDeep(a.concat(s,u)))}}},fvqo:function(e,t){e.exports="data:image/png;base64,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"},gNcp:function(e,t,n){var i={"./auth.js":"D+VX","./game.js":"yI0o","./index.js":"2mV7","./tiles.js":"kYWG"};function s(e){return n(a(e))}function a(e){var t=i[e];if(!(t+1))throw new Error("Cannot find module '"+e+"'.");return t}s.keys=function(){return Object.keys(i)},s.resolve=a,e.exports=s,s.id="gNcp"},kYWG:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("//Fk"),s=n.n(i),a=n("woOf"),r=n.n(a),o=n("bOQy"),l=n("M4fF"),u=n.n(l),c=n("eTMF"),d=(n.n(c),n("RYcG")),f=(n.n(d),{SET_TILES:function(e,t){e.tiles=t},RESTART_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isAvailable=!0,e.isInUse=!1,e.isTaken=!1})})},RESET_IN_USE_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isInUse&&(e.isInUse=!1)})})},RESET_NOT_TAKEN_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isTaken||(e.isAvailable=!0,e.isInUse=!1)})})},RESET_AVAILABLE_TILES:function(e){e.tiles.forEach(function(e){e.forEach(function(e){e.isTaken||e.isInUse||(e.isAvailable=!0)})})},SET_AVAILABLE_TILES:function(e,t){e.tiles.forEach(function(e){e.forEach(function(e){u.a.findLast(t,function(t){e.id,t.id})?e.isAvailable=!0:e.isAvailable=!1})})},SET_INUSE_TILES:function(e,t){e.tiles.forEach(function(e){e.forEach(function(e){e.isInUse&&(e.isTaken=!0,e.isInUse=!1),e.isAvailable=!1})})},SELECT_TILE:function(e,t){if(t){var n=e.tiles.tiles,i=u.a.findLast(n,function(e){return e.id==t});i&&(!i.isAvailable||i.isInUse||i.isTaken||(i.isAvailable=!1,i.isInUse=!0))}},SET_TILE_BY_INDEX:function(e,t){if(t&&t.index>=0){var n=u.a.findIndex(e.tiles[t.index],function(e){return e.id==t.tile.id});n>=0&&r()(e.tiles[t.index][n],t.tile)}},SET_TILES_BY_INDEX:function(e,t){t&&r()(e.tiles[t.index],t.tiles)},SET_TILE:function(e,t){t&&e.tiles.forEach(function(n,i){var s=u.a.findIndex(n,function(e){return e.id==t.id});s>=0&&r()(e.tiles[i][s],t)})},SET_SUM_TILES_IN_USE:function(e,t){e.sumTilesInUse=t},SET_SUM_TILES_TAKEN:function(e,t){e.sumTilesTaken=t}}),E={initTiles:function(e,t){(0,e.commit)("SET_TILES",o.a.createTiles(9,t||9))},shuffleTiles:function(e){var t=e.commit,n=[];e.state.tiles.forEach(function(e){n.push(o.a.shuffle(r()({},e)))}),t("SET_TILES",n)},moveTiles:function(e,t){var n=e.commit,i=e.state;return new s.a(function(e,s){if(i.tiles.length>1){var a=o.a.moveTile(r()({},i.tiles[t.tileIndex]),t.id);n("SET_TILES_BY_INDEX",{tiles:a,index:t.tileIndex})}e()})},selectTile:function(e,t){var n=e.commit,i=e.rootState;return new s.a(function(e,s){i.game.game.isOver||i.game.game.isWin||!i.game.game.diceInUse?s("did not pass criteria",i.game.game):(n("SELECT_TILE",t),e())})},setTile:function(e,t){var n=e.commit;e.state;n("SET_TILE",t)},setTileByIndex:function(e,t){var n=e.commit;e.state;return new s.a(function(e,i){n("SET_TILE_BY_INDEX",t),e()})},setIsTaken:function(e){var t=e.commit,n=e.state;e.rootState,e.dispatch;return new s.a(function(e,i){n.tiles.forEach(function(e){e.forEach(function(e){if(e.isInUse){var n=r()({},e);n.isInUse=!1,n.isTaken=!0,n.isCollateral=!1,t("SET_TILE",n)}})}),e()})},sumTilesInUse:function(e){var t=e.commit,n=e.state;return new s.a(function(e,i){var s=0;n.tiles.forEach(function(e){s+=u.a.sum(u.a.filter(e,function(e){return 1==e.isInUse&&0==e.isCollateral}).map(function(e){return e.index}))}),t("SET_SUM_TILES_IN_USE",s),e(s)})},sumTilesTaken:function(e){var t=e.commit,n=e.state;return new s.a(function(e,i){var s=0;n.tiles.forEach(function(e){s+=u.a.sum(u.a.filter(e,function(e){return 1==e.isTaken}).map(function(e){return e.index}))}),t("SET_SUM_TILES_TAKEN",s),e(s)})},setTiles:function(e,t){var n=e.commit,i=e.state,a=e.rootState,r=e.dispatch;return new s.a(function(e,s){var l=a.game.game;n("RESET_AVAILABLE_TILES");var c=u.a.sum(u.a.filter(l.dice,function(e){return 1==e.isAvailable}).map(function(e){return e.number})),d=c-i.sumTilesInUse,f=o.a.getTilesIndexCombinations(i.tiles,d);n("SET_GAME_NOTE",""),i.tiles.forEach(function(e){u.a.filter(e,function(e){return 0==e.isTaken&&0==e.isInUse}).forEach(function(e){var t={isAvailable:u.a.findIndex(f,function(t){return t==e.index})>=0,isInUse:e.isInUse,isTaken:e.isTaken,cssClass:e.cssClass,index:e.index,id:e.id},i=u.a.omitBy(t,function(t,n){return e[n]===t});u.a.isEmpty(i)||n("SET_TILE",t)})}),t&&(i.sumTilesInUse==c?r("setIsTaken").then(function(){r("sumTilesInUse").then(function(){r("sumTilesTaken").then(function(){n("SET_GAME_NOTE","Roll the dice"),n("SET_GAME_ISNEXT",!0),n("SET_DICE_IN_USE",!1)})})}):f.length<=0&&n("GAME_OVER",!0)),e()})}};t.default={state:{tiles:{},sumTilesInUse:0,sumTilesTaken:0},mutations:f,actions:E,getters:{tiles:function(e){return e.tiles},sumTilesInUse:function(e){return e.sumTilesInUse},sumTilesTaken:function(e){return e.sumTilesTaken}}}},mZjN:function(e,t){},"tVN/":function(e,t){},wTAR:function(e,t,n){"use strict";var i=n("Hcub"),s=n.n(i),a={props:{isAudio:{type:Boolean,required:!1},value:{type:Number,required:!0},title:{type:String,required:!1}},data:function(){return{tweeningValue:0,isFinished:!1}},watch:{value:function(e,t){this.tween(t,e)}},mounted:function(){this.tween(0,this.value)},methods:{tween:function(e,t){var n=this;this.isFinished=!1;var i=new s.a.Tween({tweeningValue:e}).to({tweeningValue:t},500).onUpdate(function(){n.tweeningValue=this.tweeningValue.toFixed(0)}).start();!function e(){s.a.update()&&requestAnimationFrame(e)}();var a=this;if(a.isAudio){var r=new Audio;r.src=document.querySelector("#tada").src,r.currentTime=0,r.play()}i.onComplete(function(){a.isFinished=!0})}}},r={render:function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"position",class:{explosion:this.isFinished}},[t("div",{staticClass:"value"},[this._v(this._s(this.tweeningValue))]),this._v(" "),t("span",[this._v(this._s(this.title))])])},staticRenderFns:[]};var o=n("VU/8")(a,r,!1,function(e){n("tVN/")},"data-v-f82edc12",null);t.a=o.exports},yI0o:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n("//Fk"),s=n.n(i),a={points:0,isLoading:!1,state:"isStart",dice:[{id:1,number:0,html:"&#x2680",isAvailable:!0},{id:2,number:0,html:"&#x2680",isAvailable:!0}],numberPlay:0,diceInUse:!1,note:"Start Game"},r=n("M4fF"),o=n.n(r),l={SET_GAME:function(e,t){e.game=t},SET_GAME_IS_VISIBLE:function(e,t){e.gameIsVisible=t},SET_IS_LOADING:function(e,t){e.game.isLoading=t},SET_GAME_ISNEXT:function(e,t){e.game.state=t?"isNext":""},START_GAME:function(e){e.game.numberPlay=0,e.game.state="",e.game.timeleft=60},SET_GAME_NOTE:function(e,t){e.game.note=t},SET_DICE_IN_USE:function(e,t){e.game.diceInUse=t},GAME_OVER:function(e){e.game.timeleft=0,e.game.note="Game Over",e.game.state="isOver",e.game.diceInUse=!1},RESTART_GAME:function(e){e.game.numberPlay=0,e.game.timeleft=60,e.game.state="isStart",e.game.note="Restart Game",e.game.diceInUse=!1},ROLL_DICE:function(e){e.game.dice.forEach(function(e){e.number=Math.floor(6*Math.random()+1),e.html="&#x268"+(e.number-1)}),e.game.diceInUse=!0,e.game.numberPlay++}},u={initGame:function(e,t){var n=e.commit;n("SET_SUM_TILES_TAKEN",0),n("SET_SUM_TILES_IN_USE",0),n("SET_GAME",null==t?a:t)},startGame:function(e){var t=e.commit,n=e.dispatch;return new s.a(function(e,i){t("RESTART_TILES"),n("shuffleTiles"),t("START_GAME"),t("ROLL_DICE"),e()})},nextGame:function(e){var t=e.commit;return new s.a(function(e,n){t("RESET_NOT_TAKEN_TILES"),t("SET_GAME_ISNEXT",!1),t("ROLL_DICE"),e()})},nextPlay:function(e){var t=e.commit;return new s.a(function(e,n){t("RESET_IN_USE_TILES"),t("SET_GAME_ISNEXT",!1),t("ROLL_DICE"),e()})},restartGame:function(e){var t=e.commit,n=e.dispatch;t("RESTART_TILES"),n("shuffleTiles"),t("RESTART_GAME"),t("SET_IS_LOADING",!1)}},c={game:function(e){return e.game},diceSum:function(e){return o.a.sum(o.a.filter(a.dice,function(e){return 1==e.isAvailable}).map(function(e){return e.number}))},gameIsVisible:function(e){return e.gameIsVisible},gameIsLoading:function(e){return e.game.isLoading}};t.default={state:{game:[],gameIsVisible:!1},mutations:l,actions:u,getters:c}}},["NHnr"]);
//# sourceMappingURL=app.655a6c8c2fad1f43d965.js.map