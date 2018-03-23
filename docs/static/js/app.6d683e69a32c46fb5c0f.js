webpackJsonp([1],{"2mV7":function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=i("gNcp"),s={};n.keys().forEach(function(t){"./index.js"!==t&&(s[t.replace(/(\.\/|\.js)/g,"")]=n(t).default)}),e.default=s},"5W1q":function(t,e){},"5pXf":function(t,e){},"D+VX":function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=i("woOf"),s=i.n(n),a=i("//Fk"),r=i.n(a),o=i("Sazm"),l=i.n(o),c=i("YaEn"),u=i("TxU5"),E=(i.n(u),u.firebaseCfg),d={initFirebase:function(t){t.commit;l.a.initializeApp(E)},getFirebaseAuthToken:function(t){t.commit;return new r.a(function(t,e){null!=l.a.auth().firebaseAuthToken?t():e("Not authorized",null)})},getCurrentUser:function(t){var e=t.commit;return new r.a(function(t,i){var n=l.a.auth().currentUser;null!=n?(e("SET_USER",s()({},n)),e("SET_AUTH",!0),t()):(e("SET_USER",null),e("SET_AUTH",!1),i("Not authorized",null))})},logout:function(t){var e=t.commit;l.a.auth().signOut().then(function(){c.a.replace("login"),e("SET_USER",null),e("SET_AUTH",!1)})}};e.default={state:{authenticated:!1,user:null},mutations:{SET_AUTH:function(t,e){t.authenticated=e},LOGOUT:function(t){t.user=null,t.authenticated=!1},SET_USER:function(t,e){t.user=e}},actions:d,getters:{isAuthenticated:function(t){return t.authenticated},user:function(t){return t.user},authHeader:function(t){return null!=t.user?t.user.firebaseAuthToken:null}}}},H6Rp:function(t,e){},IcnI:function(t,e,i){"use strict";var n=i("7+uW"),s=i("NYxO"),a=i("2mV7");n.a.use(s.a),e.a=new s.a.Store({modules:a.default,strict:!1})},MvYu:function(t,e){},NHnr:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=i("woOf"),s=i.n(n),a=i("7+uW"),r=i("Dd8w"),o=i.n(r),l=i("NYxO"),c=i("wTAR"),u={methods:o()({},Object(l.b)({login:"login",logout:"logout"}),{restartGame:function(){this.$store.commit("SET_GAME_IS_VISIBLE",!1)}}),computed:o()({},Object(l.c)({isAuthenticated:"isAuthenticated",user:"user"}),{pointsTotal:function(){return this.$store.getters.sumTilesTaken},numberPlay:function(){return this.$store.getters.game.numberPlay},abbreviations:function(){return null!=this.$store.getters.user.displayName?this.$store.getters.user.displayName.charAt(0).toUpperCase():this.$store.getters.user.email.charAt(0).toUpperCase()}}),components:{animatedInteger:c.a}},E={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",[e("ul",{staticClass:"list-reset flex justify-between w-full items-center  mb-2"},[e("li",{staticClass:"w-12"},[e("router-link",{staticClass:"inline-block text-black text-center bg-green-light px-2 py-2 m-2 ml-2 border-b-4 border-black rounded-b  no-underline w-10",attrs:{to:"/game"}},[e("i",{staticClass:"fa fa-home"})]),this._v(" "),e("router-link",{staticClass:"inline-block text-black text-center bg-green-light px-2 py-2 m-2 ml-2 border-b-4 border-black rounded-b  no-underline w-10",attrs:{to:"/login"}},[this.isAuthenticated?[this._v("          \r\n                      "+this._s(this.abbreviations)+"    \r\n                    ")]:[e("i",{staticClass:"fa fa-user"})]],2)],1),this._v(" "),e("li",[e("animated-integer",{attrs:{title:"Play",value:this.numberPlay}})],1),this._v(" "),this._m(0),this._v(" "),e("li",[e("animated-integer",{attrs:{isAudio:!0,title:"Points",value:this.pointsTotal}})],1),this._v(" "),e("li",{staticClass:"w-12 mr-2"},[e("a",{staticClass:"inline-block text-black text-center bg-blue-light px-2 py-2 m-2 mr-2 border-b-4 border-black rounded-b no-underline w-10",attrs:{href:"#"},on:{click:this.restartGame}},[e("i",{staticClass:"fa fa-times"})])])])])},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("li",{staticClass:"flex-grow ",attrs:{id:"logo"}},[e("img",{staticStyle:{"max-height":"30px"},attrs:{src:i("fvqo")}})])}]};var d=i("VU/8")(u,E,!1,function(t){i("mZjN")},"data-v-4f557564",null).exports,f=i("bOQy"),m={name:"app",data:function(){return{isMobile:!1}},computed:{gameIsVisible:function(){return this.$store.getters.gameIsVisible},tilesLength:function(){return null==this.$store.getters.tiles?0:this.$store.getters.tiles.length}},methods:{setGame:function(t){this.$store.dispatch("initGame"),this.$store.dispatch("initTiles",t),this.$store.commit("SET_GAME_IS_VISIBLE",!0)}},components:{appHeader:d},created:function(){this.$store.dispatch("initGame"),this.isMobile=f.a.isMobile()}},S={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"w-full h-screen bg-gradient-brand  mx-auto relative ",class:[{isMobile:t.isMobile&&t.tilesLength>1},{container:!t.isMobile}]},[t._m(0),t._v(" "),i("div",{attrs:{id:"app"}},[i("div",{staticClass:"header"},[t.gameIsVisible?i("app-header"):t._e()],1),t._v(" "),t.gameIsVisible?t._e():[i("div",{staticClass:"h-screen w-full absolute flex items-center justify-center bg-modal",staticStyle:{height:"calc(100% - 200px)"}},[i("div",{staticClass:"bg-white rounded shadow p-8 m-4 max-w-xs max-h-full text-center"},[t._m(1),t._v(" "),t._m(2),t._v(" "),i("div",{staticClass:"flex justify-center"},[i("button",{staticClass:"flex-no-shrink text-white py-2 px-4 rounded bg-teal hover:bg-teal-dark",on:{click:function(e){t.setGame(1)}}},[t._v("Shut The Box")]),t._v(" "),i("button",{staticClass:"flex-no-shrink text-white ml-2 py-2 px-4 rounded bg-teal hover:bg-teal-dark",on:{click:function(e){t.setGame(9)}}},[t._v("Shut The Cube")])])])])],t._v(" "),i("transition",{attrs:{name:"fade",mode:"out-in"}},[t.gameIsVisible?[i("router-view")]:t._e()],2)],2)])},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{attrs:{id:"warning-message"}},[e("div",{staticClass:"w-full h-screen  absolute flex items-center justify-center bg-modal bg-green-light"},[e("div",{staticClass:" text-center"},[e("div",{staticClass:"mb-4"},[e("img",{staticStyle:{"max-height":"30px"},attrs:{src:i("fvqo")}})]),this._v(" "),e("div",{staticClass:"mb-8"},[e("p",[this._v(" This App is only viewable in vertical mode.")])])])])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"mb-4"},[e("img",{staticStyle:{"max-height":"30px"},attrs:{src:i("fvqo")}})])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"mb-8"},[e("p",[this._v("Select the game you want to play.")])])}]};var h=i("VU/8")(m,S,!1,function(t){i("H6Rp")},null,null).exports,_=i("YaEn"),T=(i("M4fF"),i("Sazm")),g=i.n(T),p=i("IcnI"),v=(i("5W1q"),i("IZMb")),I=i.n(v),b=i("TxU5"),O=b.firebaseCfg;a.a.use(I.a,{theme:"primary",position:"bottom-center",duration:5e3,action:{text:"Close",onClick:function(t,e){e.goAway(0)}}}),a.a.config.productionTip=!1;var A=void 0;A||(A=new a.a({el:"#app",router:_.a,store:p.a,created:function(){var t=this;g.a.initializeApp(O),g.a.auth().onAuthStateChanged(function(e){e?(t.$store.commit("SET_AUTH",!0),t.$store.commit("SET_USER",s()({},e.toJSON()))):(t.$store.commit("SET_AUTH",!1),t.$store.commit("SET_USER",null))})},template:"<App/>",components:{App:h}}))},RYcG:function(t,e){t.exports={O_RDONLY:0,O_WRONLY:1,O_RDWR:2,S_IFMT:61440,S_IFREG:32768,S_IFDIR:16384,S_IFCHR:8192,S_IFBLK:24576,S_IFIFO:4096,S_IFLNK:40960,S_IFSOCK:49152,O_CREAT:512,O_EXCL:2048,O_NOCTTY:131072,O_TRUNC:1024,O_APPEND:8,O_DIRECTORY:1048576,O_NOFOLLOW:256,O_SYNC:128,O_SYMLINK:2097152,O_NONBLOCK:4,S_IRWXU:448,S_IRUSR:256,S_IWUSR:128,S_IXUSR:64,S_IRWXG:56,S_IRGRP:32,S_IWGRP:16,S_IXGRP:8,S_IRWXO:7,S_IROTH:4,S_IWOTH:2,S_IXOTH:1,E2BIG:7,EACCES:13,EADDRINUSE:48,EADDRNOTAVAIL:49,EAFNOSUPPORT:47,EAGAIN:35,EALREADY:37,EBADF:9,EBADMSG:94,EBUSY:16,ECANCELED:89,ECHILD:10,ECONNABORTED:53,ECONNREFUSED:61,ECONNRESET:54,EDEADLK:11,EDESTADDRREQ:39,EDOM:33,EDQUOT:69,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:65,EIDRM:90,EILSEQ:92,EINPROGRESS:36,EINTR:4,EINVAL:22,EIO:5,EISCONN:56,EISDIR:21,ELOOP:62,EMFILE:24,EMLINK:31,EMSGSIZE:40,EMULTIHOP:95,ENAMETOOLONG:63,ENETDOWN:50,ENETRESET:52,ENETUNREACH:51,ENFILE:23,ENOBUFS:55,ENODATA:96,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:77,ENOLINK:97,ENOMEM:12,ENOMSG:91,ENOPROTOOPT:42,ENOSPC:28,ENOSR:98,ENOSTR:99,ENOSYS:78,ENOTCONN:57,ENOTDIR:20,ENOTEMPTY:66,ENOTSOCK:38,ENOTSUP:45,ENOTTY:25,ENXIO:6,EOPNOTSUPP:102,EOVERFLOW:84,EPERM:1,EPIPE:32,EPROTO:100,EPROTONOSUPPORT:43,EPROTOTYPE:41,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:70,ETIME:101,ETIMEDOUT:60,ETXTBSY:26,EWOULDBLOCK:35,EXDEV:18,SIGHUP:1,SIGINT:2,SIGQUIT:3,SIGILL:4,SIGTRAP:5,SIGABRT:6,SIGIOT:6,SIGBUS:10,SIGFPE:8,SIGKILL:9,SIGUSR1:30,SIGSEGV:11,SIGUSR2:31,SIGPIPE:13,SIGALRM:14,SIGTERM:15,SIGCHLD:20,SIGCONT:19,SIGSTOP:17,SIGTSTP:18,SIGTTIN:21,SIGTTOU:22,SIGURG:16,SIGXCPU:24,SIGXFSZ:25,SIGVTALRM:26,SIGPROF:27,SIGWINCH:28,SIGIO:23,SIGSYS:12,SSL_OP_ALL:2147486719,SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION:262144,SSL_OP_CIPHER_SERVER_PREFERENCE:4194304,SSL_OP_CISCO_ANYCONNECT:32768,SSL_OP_COOKIE_EXCHANGE:8192,SSL_OP_CRYPTOPRO_TLSEXT_BUG:2147483648,SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS:2048,SSL_OP_EPHEMERAL_RSA:0,SSL_OP_LEGACY_SERVER_CONNECT:4,SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER:32,SSL_OP_MICROSOFT_SESS_ID_BUG:1,SSL_OP_MSIE_SSLV2_RSA_PADDING:0,SSL_OP_NETSCAPE_CA_DN_BUG:536870912,SSL_OP_NETSCAPE_CHALLENGE_BUG:2,SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG:1073741824,SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG:8,SSL_OP_NO_COMPRESSION:131072,SSL_OP_NO_QUERY_MTU:4096,SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION:65536,SSL_OP_NO_SSLv2:16777216,SSL_OP_NO_SSLv3:33554432,SSL_OP_NO_TICKET:16384,SSL_OP_NO_TLSv1:67108864,SSL_OP_NO_TLSv1_1:268435456,SSL_OP_NO_TLSv1_2:134217728,SSL_OP_PKCS1_CHECK_1:0,SSL_OP_PKCS1_CHECK_2:0,SSL_OP_SINGLE_DH_USE:1048576,SSL_OP_SINGLE_ECDH_USE:524288,SSL_OP_SSLEAY_080_CLIENT_DH_BUG:128,SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG:0,SSL_OP_TLS_BLOCK_PADDING_BUG:512,SSL_OP_TLS_D5_BUG:256,SSL_OP_TLS_ROLLBACK_BUG:8388608,ENGINE_METHOD_DSA:2,ENGINE_METHOD_DH:4,ENGINE_METHOD_RAND:8,ENGINE_METHOD_ECDH:16,ENGINE_METHOD_ECDSA:32,ENGINE_METHOD_CIPHERS:64,ENGINE_METHOD_DIGESTS:128,ENGINE_METHOD_STORE:256,ENGINE_METHOD_PKEY_METHS:512,ENGINE_METHOD_PKEY_ASN1_METHS:1024,ENGINE_METHOD_ALL:65535,ENGINE_METHOD_NONE:0,DH_CHECK_P_NOT_SAFE_PRIME:2,DH_CHECK_P_NOT_PRIME:1,DH_UNABLE_TO_CHECK_GENERATOR:4,DH_NOT_SUITABLE_GENERATOR:8,NPN_ENABLED:1,RSA_PKCS1_PADDING:1,RSA_SSLV23_PADDING:2,RSA_NO_PADDING:3,RSA_PKCS1_OAEP_PADDING:4,RSA_X931_PADDING:5,RSA_PKCS1_PSS_PADDING:6,POINT_CONVERSION_COMPRESSED:2,POINT_CONVERSION_UNCOMPRESSED:4,POINT_CONVERSION_HYBRID:6,F_OK:0,R_OK:4,W_OK:2,X_OK:1,UV_UDP_REUSEADDR:4}},TxU5:function(t,e){t.exports={firebaseCfg:{apiKey:"AIzaSyCAmuQyyUhGBA3Zyh2VXSHstZs0C-kHhyk",authDomain:"shutthebox-app.firebaseapp.com",databaseURL:"https://shutthebox-app.firebaseio.com",projectId:"shutthebox-app",storageBucket:"shutthebox-app.appspot.com",messagingSenderId:"872127545262"}}},YaEn:function(t,e,i){"use strict";var n=i("7+uW"),s=i("/ocq"),a=(i("IcnI"),i("Dd8w")),r=i.n(a),o=i("NYxO"),l=i("Xxa5"),c=i.n(l),u=i("woOf"),E=i.n(u),d=i("exGp"),f=i.n(d);Array.prototype.move=function(t,e){if(e>=this.length)for(var i=e-this.length;1+i--;)this.push(void 0);return this.splice(e,0,this.splice(t,1)[0]),this};var m={props:["tiles","index","allTiles"],computed:{diceSum:function(){return this.$store.getters.diceSum},sumTilesInUse:function(){return this.$store.getters.sumTilesInUse}},methods:{selectTile:function(t,e,i){if(t.isAvailable&&!t.isTaken&&this.sumTilesInUse+t.index<=this.diceSum){var n=new Audio;n.src=document.querySelector("#click").src,n.currentTime=0,n.play();var s=this.allTiles.length;this.index;if(this.index>1)for(var a=this.index-1;a>-1&&(this.allTiles[a][e].index==t.index&&!this.allTiles[a][e].isTaken);a--)this.setTile(this.allTiles[a][e],a);else 1==this.index&&(this.allTiles[0][e].index!=t.index||this.allTiles[0][e].isTaken||this.setTile(this.allTiles[0][e],0));for(a=this.index+1;a<s&&(this.allTiles[a][e].index==t.index&&!this.allTiles[a][e].isTaken);a++)this.setTile(this.allTiles[a][e],a);this.setTile(t,i)}},setTile:function(t,e){var i=this;return f()(c.a.mark(function n(){var s,a;return c.a.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return(s=E()({},t)).action="rotateIn",s.isExplosion=!0,s.isInUse=!0,s.isCollateral=e!=i.index,a=i,n.next=8,i.$store.dispatch("setTileByIndex",{tile:s,index:e}).then(function(){i.$store.dispatch("sumTilesInUse"),setTimeout(function(){var n=E()({},t);n.action="",n.isExplosion=!1,i.$store.dispatch("setTileByIndex",{tile:n,index:e}).then(function(){a.changeTile(e,t.id)})},500)});case 8:case"end":return n.stop()}},n,i)}))()},changeTile:function(t,e){var i=this;i.$store.commit("SET_IS_LOADING",!0),this.$store.dispatch("moveTiles",{tileIndex:t,id:e}).then(function(){i.$store.dispatch("setTiles",t==i.index).then(function(){i.$store.commit("SET_IS_LOADING",!1)})})}}},S={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("transition-group",{attrs:{duration:300,name:"flip-list",tag:"ul"}},t._l(t.tiles,function(e,n){return i("li",{key:e.id},[i("div",{staticStyle:{position:"relative"}},[i("div",{class:{explosion:e.isExplosion}}),t._v(" "),i("div",{staticClass:"\n      \n                  box\n                  active \n                  text-black \n                  text-center \n                  border-b-4 \n                  border-black \n                  rounded  \n                  no-underline \n                  animate \n                  action-button sm:text-sm md:text-lg lg:text-xl xl:text-2xl\n                  \n                  ",class:[e.cssClass,{isAvailable:e.isAvailable},{isNotAvailable:!e.isAvailable},{isTaken:e.isTaken},{isInUse:e.isInUse},"animated "+e.action],on:{click:function(i){t.selectTile(e,n,t.index)}}},[i("p",{staticClass:"number"},[t._v(t._s(e.index))])])])])}))},staticRenderFns:[]};var h=i("VU/8")(m,S,!1,function(t){i("MvYu")},"data-v-498f101c",null).exports,_={render:function(){var t=this.$createElement;return(this._self._c||t)("span",{domProps:{innerHTML:this._s(this.dice.html)}})},staticRenderFns:[]};var T=i("VU/8")({props:["dice"]},_,!1,function(t){i("5pXf")},"data-v-61b952e6",null).exports,g=i("wTAR"),p=new(i("kqA7"))({threshold:10,timeout:1e3}),v={name:"Game",data:function(){return{msg:"new message",diceObj:{}}},computed:{tilesObj:function(){return null==this.$store.getters.tiles?{}:this.$store.getters.tiles},game:function(){return this.$store.getters.game},gameIsLoading:function(){return this.$store.getters.gameIsLoading},pointsTotal:function(){return this.$store.getters.sumTilesTaken},buttonGameStateMessage:function(){switch(this.game.state){case"isNext":return"ROLL DICE";case"isOver":return"GAME OVER";case"isStart":return"START GAME";case"isWin":return"SHUT THE BOX"}},buttonGameStateColour:function(){switch(this.game.state){case"isNext":return"bg-green-light";case"isOver":return"bg-red-light";case"isStart":case"isWin":return"bg-green-light"}},buttonGameStateIcon:function(){if(this.gameIsLoading)return"fa fa-refresh fa-spin";switch(this.game.state){case"isNext":return"fa fa-arrow-right";case"isOver":return"fa fa-times";case"isStart":return"fa fa-arrow-right";case"isWin":return"fa fa-check"}}},methods:r()({},Object(o.b)({restartGame:"restartGame"}),{gameState:function(){this.$store.commit("SET_IS_LOADING",!0);var t=new Audio;switch(t.src=document.querySelector("#click2").src,t.currentTime=0,t.play(),this.game.state){case"isNext":this.initNextGame();break;case"isOver":this.restartGame();break;case"isStart":this.initStartGame();break;case"isWin":this.restartGame()}},initStartGame:function(){var t=this;t.$store.dispatch("startGame").then(function(){t.$store.dispatch("setTiles",!0).then(function(){t.$store.commit("SET_IS_LOADING",!1)})})},initNextGame:function(){var t=this;t.$store.dispatch("nextGame").then(function(){t.$store.dispatch("setTiles",!0).then(function(){t.$store.commit("SET_IS_LOADING",!1)})})}}),components:{appTiles:h,appDice:T,animatedInteger:g.a},destroy:function(){p.stop()},mounted:function(){var t=this;p.start(),window.addEventListener("shake",function(){t.gameState()},!1)}},I={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"Game"},[t._l(t.tilesObj,function(e,n){return i("app-tiles",{key:e.index,attrs:{index:n,allTiles:t.tilesObj,tiles:e}})}),t._v(" "),i("div",{class:[{blocked:t.game.diceInUse||"isStart"==!t.game.state&&"isNext"==t.game.state}],attrs:{id:"dice"}},t._l(t.game.dice,function(t){return i("app-dice",{key:t.id,attrs:{dice:t}})})),t._v(" "),i("transition",{attrs:{name:"fade",mode:"out-in"}},[t.buttonGameStateMessage?i("button",{key:t.game.state,staticClass:"no-outline list-reset flex mb-2 bg-yellow-light border-b-4 border-black rounded-b   action-button",staticStyle:{"max-width":"200px",margin:"0 auto"},on:{click:t.gameState}},[i("div",[i("div",{staticClass:"text-black text-center  px-2 pt-2 py-1  no-underline  "},[i("i",{class:t.buttonGameStateIcon})])]),t._v(" "),i("div",{staticClass:"flex-grow  "},[i("div",{staticClass:" text-black text-center bg-red-light px-2 pt-2 py-1  no-underline",class:t.buttonGameStateColour},[t._v("\n                  "+t._s(t.buttonGameStateMessage)+"\n              ")])])]):[i("div",{staticClass:"no-outline list-reset flex mb-2  animate  action-button",staticStyle:{margin:"0 auto"}},[i("div",{staticClass:"flex-grow  "},[i("div",{staticClass:" text-black text-center  px-2 pt-0 py-1  no-underline"},[i("div",{domProps:{innerHTML:t._s(t.game.note)}}),t._v("   \n              ")])])])]],2)],2)},staticRenderFns:[]};var b=i("VU/8")(v,I,!1,function(t){i("lfZM")},"data-v-d500c1fa",null).exports,O=i("Sazm"),A=i.n(O),N={name:"login",data:function(){return{email:"",password:""}},methods:{signIn:function(){var t=this;A.a.auth().signInWithEmailAndPassword(this.email,this.password).then(function(e){t.$toasted.success("Logged on as "+t.email),t.$router.replace("game")},function(e){t.$toasted.error(e.message)}).catch(function(e){t.$toasted.error(e.message)}).then(function(){})}},created:function(){}},C={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"login"},[i("div",{staticClass:"container mx-auto h-full flex justify-center items-center"},[i("div",[i("div",{staticClass:"border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg"},[i("div",{staticClass:"mb-4"},[i("label",{staticClass:"font-bold text-grey-darker block mb-2"},[t._v("Username or Email")]),t._v(" "),i("input",{directives:[{name:"model",rawName:"v-model",value:t.email,expression:"email"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{type:"email",required:"",placeholder:"Your Username"},domProps:{value:t.email},on:{input:function(e){e.target.composing||(t.email=e.target.value)}}})]),t._v(" "),i("div",{staticClass:"mb-4"},[i("label",{staticClass:"font-bold text-grey-darker block mb-2"},[t._v("Password")]),t._v(" "),i("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{type:"password",required:"",placeholder:"Your Password"},domProps:{value:t.password},on:{input:function(e){e.target.composing||(t.password=e.target.value)}}})]),t._v(" "),i("div",{staticClass:"flex items-center justify-between"},[i("button",{staticClass:"bg-teal-dark hover:bg-teal text-white font-bold py-2 px-4 rounded",on:{click:t.signIn}},[t._v("\n                      Login\n                  ")])])]),t._v(" "),i("div",{staticClass:"text-center"},[i("p",{staticClass:"text-grey-dark text-sm"},[t._v("Don't have an account? \n                 "),i("router-link",{staticClass:"no-underline text-blue font-bold",attrs:{to:"/sign-up"}},[t._v("Create an Account")])],1)])])])])},staticRenderFns:[]},x=i("VU/8")(N,C,!1,null,null,null).exports,L={name:"signUp",data:function(){return{email:"",password:""}},methods:{signUp:function(){var t=this;A.a.auth().createUserWithEmailAndPassword(this.email,this.password).then(function(e){t.$router.replace("game")},function(t){alert("Oops. "+t.message)})}}},R={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"sign-up"},[i("div",{staticClass:"container mx-auto h-full flex justify-center items-center"},[i("div",[i("div",{staticClass:"border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg"},[i("div",{staticClass:"mb-4"},[i("label",{staticClass:"font-bold text-grey-darker block mb-2"},[t._v("Username or Email")]),t._v(" "),i("input",{directives:[{name:"model",rawName:"v-model",value:t.email,expression:"email"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{autocomplete:"off",type:"text",placeholder:"Your Username"},domProps:{value:t.email},on:{input:function(e){e.target.composing||(t.email=e.target.value)}}})]),t._v(" "),i("div",{staticClass:"mb-4"},[i("label",{staticClass:"font-bold text-grey-darker block mb-2"},[t._v("Password")]),t._v(" "),i("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:"block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow",attrs:{autocomplete:"off",type:"password",placeholder:"Your Password"},domProps:{value:t.password},on:{input:function(e){e.target.composing||(t.password=e.target.value)}}})]),t._v(" "),i("div",{staticClass:"flex items-center justify-between"},[i("button",{staticClass:"bg-teal-dark hover:bg-teal text-white font-bold py-2 px-4 rounded",on:{click:t.signUp}},[t._v("\n                      Sign Up\n                  ")])])]),t._v(" "),i("div",{staticClass:"text-center"},[i("p",{staticClass:"text-grey-dark text-sm"},[i("router-link",{staticClass:"no-underline text-blue font-bold",attrs:{to:"/login"}},[t._v("Go back to Login")])],1)])])])])},staticRenderFns:[]},G=i("VU/8")(L,R,!1,null,null,null).exports;n.a.use(s.a);var U=new s.a({linkExactActiveClass:"active",base:"/shutTheCube/",routes:[{path:"*",redirect:"/game"},{path:"/game",name:"Game",component:b},{path:"/login",name:"Login",component:x},{path:"/sign-up",name:"SignUp",component:G}]});U.beforeEach(function(t,e,i){i()});e.a=U},bOQy:function(t,e,i){"use strict";var n=i("woOf"),s=i.n(n),a=i("M4fF"),r=i("CX9+"),o={isAvailable:!1,isInUse:!1,isTaken:!1,isCollateral:!1,isExplosion:!1,action:"",cssClass:"bg-blue-light"};e.a={shuffle:function(t){return a.isObject(t)?a.shuffle(t):t},shuffleTiles:function(t){return a.map(t,this.shuffle)},createTiles:function(t,e){for(var i=[],n=0;n<t;n++)i.push(a.extend({index:n+1,id:this.createGuid()},o));i=a.map(i,this.cssClassColour);var r=[];for(n=0;n<e;n++)r.push(this.shuffle(i));var l=[];for(n=0;n<r.length;n++){for(var c=[],u=0;u<r[n].length;u++){var E=s()({},r[n][u]);E.id=this.createGuid(),E.isTaken=a.sample([!0,!1]),c.push(E)}l.push(c)}return l},createGuid:function(){return this.guidByteGenerator()+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+"-"+this.guidByteGenerator()+this.guidByteGenerator()+this.guidByteGenerator()},guidByteGenerator:function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)},strConbinations:function(t){return function t(e,i,n){if(e||i)return i?(t(e+i[0],i.slice(1),n),t(e,i.slice(1),n)):n.push(e),n}("",t,[])},strSumConbinations:function(t,e){var i=this;return function t(n,s,a){if(n||s)return s?(t(n+s[0],s.slice(1),a),t(n,s.slice(1),a)):i.sumString(n)==e&&a.push(n),a}("",t,[])},cssClassColour:function(t){switch(t.index){case 1:t.cssClass="bg-green-lighter";break;case 2:t.cssClass=" bg-purple-dark";break;case 3:t.cssClass="bg-blue-light";break;case 4:t.cssClass="bg-purple-light";break;case 5:t.cssClass="bg-yellow-dark";break;case 6:t.cssClass="bg-indigo-dark";break;case 7:t.cssClass="bg-red-light";break;case 8:t.cssClass="bg-red-dark";break;case 9:t.cssClass="bg-yellow-light"}return t},moveTile:function(t,e){return a.sortBy(t,function(t){return t.id===e||t.isTaken?1:0})},isMobile:function(){return!!(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i))},sumString:function(t){return void 0!=t?a.sumBy(t.split(""),function(t){return parseFloat(t)}):0},getTilesCombinations:function(t,e){var i=a.sortBy(a.filter(a.map(a.flatMapDeep(t,function(t){return a.flatMapDeep(t,function(t){return!t.isInUse&&!t.isTaken&&t.index<=e&&t.index})}),function(t,e){return t}),function(t){return t}),function(t){return t}),n=a.groupBy(i,Math.floor),s=[];a.each(n,function(t,i){var n=[],r=0;a.each(t,function(t){(r+=t)<=e&&n.push(t)}),n.length>1&&s.push(n)});var o=a.without(a.uniq(a.flatMapDeep(t,function(t){return a.flatMapDeep(t,function(t){if(!t.isInUse&&!t.isTaken)return t.index})})),void 0),l=a.uniqWith(r.power(a.flatMapDeep(s)).lazyFilter(function(t){return a.toSafeInteger(a.sum(t))==e}).toArray(),a.isEqual),c=a.uniqWith(r.power(a.flatMapDeep(o)).lazyFilter(function(t){return a.toSafeInteger(a.sum(t))==e}).toArray(),a.isEqual);return a.concat(c,l)}}},fvqo:function(t,e){t.exports="data:image/png;base64,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"},gNcp:function(t,e,i){var n={"./auth.js":"D+VX","./game.js":"yI0o","./index.js":"2mV7","./tiles.js":"kYWG"};function s(t){return i(a(t))}function a(t){var e=n[t];if(!(e+1))throw new Error("Cannot find module '"+t+"'.");return e}s.keys=function(){return Object.keys(n)},s.resolve=a,t.exports=s,s.id="gNcp"},kYWG:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=i("//Fk"),s=i.n(n),a=i("woOf"),r=i.n(a),o=i("bOQy"),l=i("M4fF"),c=i.n(l),u=i("eTMF"),E=(i.n(u),i("RYcG")),d=(i.n(E),{SET_TILES:function(t,e){t.tiles=e},RESTART_TILES:function(t){t.tiles.forEach(function(t){t.forEach(function(t){t.isAvailable=!0,t.isInUse=!1,t.isTaken=!1})})},RESET_IN_USE_TILES:function(t){t.tiles.forEach(function(t){t.forEach(function(t){t.isInUse&&(t.isInUse=!1)})})},RESET_NOT_TAKEN_TILES:function(t){t.tiles.forEach(function(t){t.forEach(function(t){t.isTaken||(t.isAvailable=!0,t.isInUse=!1)})})},RESET_AVAILABLE_TILES:function(t){t.tiles.forEach(function(t){t.forEach(function(t){t.isTaken||t.isInUse||(t.isAvailable=!0)})})},SET_AVAILABLE_TILES:function(t,e){t.tiles.forEach(function(t){t.forEach(function(t){c.a.findLast(e,function(e){t.id,e.id})?t.isAvailable=!0:t.isAvailable=!1})})},SET_INUSE_TILES:function(t,e){t.tiles.forEach(function(t){t.forEach(function(t){t.isInUse&&(t.isTaken=!0,t.isInUse=!1),t.isAvailable=!1})})},SELECT_TILE:function(t,e){if(e){var i=t.tiles.tiles,n=c.a.findLast(i,function(t){return t.id==e});n&&(!n.isAvailable||n.isInUse||n.isTaken||(n.isAvailable=!1,n.isInUse=!0))}},SET_TILE_BY_INDEX:function(t,e){if(e&&e.index>=0){var i=c.a.findIndex(t.tiles[e.index],function(t){return t.id==e.tile.id});i>=0&&r()(t.tiles[e.index][i],e.tile)}},SET_TILES_BY_INDEX:function(t,e){e&&r()(t.tiles[e.index],e.tiles)},SET_TILE:function(t,e){e&&t.tiles.forEach(function(i,n){var s=c.a.findIndex(i,function(t){return t.id==e.id});s>=0&&r()(t.tiles[n][s],e)})},SET_SUM_TILES_IN_USE:function(t,e){t.sumTilesInUse=e},SET_SUM_TILES_TAKEN:function(t,e){t.sumTilesTaken=e}}),f={initTiles:function(t,e){(0,t.commit)("SET_TILES",o.a.createTiles(9,e||9))},shuffleTiles:function(t){var e=t.commit,i=[];t.state.tiles.forEach(function(t){i.push(o.a.shuffle(r()({},t)))}),e("SET_TILES",i)},moveTiles:function(t,e){var i=t.commit,n=t.state;return new s.a(function(t,s){if(n.tiles.length>1){var a=o.a.moveTile(r()({},n.tiles[e.tileIndex]),e.id);i("SET_TILES_BY_INDEX",{tiles:a,index:e.tileIndex})}t()})},selectTile:function(t,e){var i=t.commit,n=t.rootState;return new s.a(function(t,s){n.game.game.isOver||n.game.game.isWin||!n.game.game.diceInUse?s("did not pass criteria",n.game.game):(i("SELECT_TILE",e),t())})},setTile:function(t,e){var i=t.commit;t.state;i("SET_TILE",e)},setTileByIndex:function(t,e){var i=t.commit;t.state;return new s.a(function(t,n){i("SET_TILE_BY_INDEX",e),t()})},setIsTaken:function(t){var e=t.commit,i=t.state;t.rootState,t.dispatch;return new s.a(function(t,n){i.tiles.forEach(function(t){t.forEach(function(t){if(t.isInUse){var i=r()({},t);i.isInUse=!1,i.isTaken=!0,i.isCollateral=!1,e("SET_TILE",i)}})}),t()})},sumTilesInUse:function(t){var e=t.commit,i=t.state;return new s.a(function(t,n){var s=0;i.tiles.forEach(function(t){s+=c.a.sum(c.a.filter(t,function(t){return 1==t.isInUse&&0==t.isCollateral}).map(function(t){return t.index}))}),e("SET_SUM_TILES_IN_USE",s),t(s)})},sumTilesTaken:function(t){var e=t.commit,i=t.state;return new s.a(function(t,n){var s=0;i.tiles.forEach(function(t){s+=c.a.sum(c.a.filter(t,function(t){return 1==t.isTaken}).map(function(t){return t.index}))}),e("SET_SUM_TILES_TAKEN",s),t(s)})},setTiles:function(t,e){var i=t.commit,n=t.state,a=t.rootState,r=t.dispatch;return new s.a(function(t,s){var l=a.game.game;i("RESET_AVAILABLE_TILES");var u=c.a.sum(c.a.filter(l.dice,function(t){return 1==t.isAvailable}).map(function(t){return t.number})),E=u-n.sumTilesInUse,d=o.a.getTilesCombinations(n.tiles,E),f=c.a.flatMap(d);f.length,i("SET_GAME_NOTE",""),n.tiles.forEach(function(t){c.a.filter(t,function(t){return 0==t.isTaken&&0==t.isInUse}).forEach(function(t){var e={isAvailable:c.a.findIndex(f,function(e){return e==t.index})>=0,isInUse:t.isInUse,isTaken:t.isTaken,cssClass:t.cssClass,index:t.index,id:t.id},n=c.a.omitBy(e,function(e,i){return t[i]===e});c.a.isEmpty(n)||i("SET_TILE",e)})}),e&&(n.sumTilesInUse==u?r("setIsTaken").then(function(){r("sumTilesInUse").then(function(){r("sumTilesTaken").then(function(){i("SET_GAME_NOTE","Roll the dice"),i("SET_GAME_ISNEXT",!0),i("SET_DICE_IN_USE",!1)})})}):f.length<=0&&i("GAME_OVER",!0)),t()})}};e.default={state:{tiles:{},sumTilesInUse:0,sumTilesTaken:0},mutations:d,actions:f,getters:{tiles:function(t){return t.tiles},sumTilesInUse:function(t){return t.sumTilesInUse},sumTilesTaken:function(t){return t.sumTilesTaken}}}},lfZM:function(t,e){},mZjN:function(t,e){},"tVN/":function(t,e){},wTAR:function(t,e,i){"use strict";var n=i("Hcub"),s=i.n(n),a={props:{isAudio:{type:Boolean,required:!1},value:{type:Number,required:!0},title:{type:String,required:!1}},data:function(){return{tweeningValue:0,isFinished:!1}},watch:{value:function(t,e){this.tween(e,t)}},mounted:function(){this.tween(0,this.value)},methods:{tween:function(t,e){var i=this;this.isFinished=!1;var n=new s.a.Tween({tweeningValue:t}).to({tweeningValue:e},500).onUpdate(function(){i.tweeningValue=this.tweeningValue.toFixed(0)}).start();!function t(){s.a.update()&&requestAnimationFrame(t)}();var a=this;if(a.isAudio){var r=new Audio;r.src=document.querySelector("#tada").src,r.currentTime=0,r.play()}n.onComplete(function(){a.isFinished=!0})}}},r={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"position",class:{explosion:this.isFinished}},[e("div",{staticClass:"value"},[this._v(this._s(this.tweeningValue))]),this._v(" "),e("span",[this._v(this._s(this.title))])])},staticRenderFns:[]};var o=i("VU/8")(a,r,!1,function(t){i("tVN/")},"data-v-f82edc12",null);e.a=o.exports},yI0o:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=i("//Fk"),s=i.n(n),a={points:0,isLoading:!1,state:"isStart",dice:[{id:1,number:0,html:"&#x2680",isAvailable:!0},{id:2,number:0,html:"&#x2680",isAvailable:!0}],numberPlay:0,diceInUse:!1,note:"Start Game"},r=i("M4fF"),o=i.n(r),l={SET_GAME:function(t,e){t.game=e},SET_GAME_IS_VISIBLE:function(t,e){t.gameIsVisible=e},SET_IS_LOADING:function(t,e){t.game.isLoading=e},SET_GAME_ISNEXT:function(t,e){t.game.state=e?"isNext":""},START_GAME:function(t){t.game.numberPlay=0,t.game.state="",t.game.timeleft=60},SET_GAME_NOTE:function(t,e){t.game.note=e},SET_DICE_IN_USE:function(t,e){t.game.diceInUse=e},GAME_OVER:function(t){t.game.timeleft=0,t.game.note="Game Over",t.game.state="isOver",t.game.diceInUse=!1},RESTART_GAME:function(t){t.game.numberPlay=0,t.game.timeleft=60,t.game.state="isStart",t.game.note="Restart Game",t.game.diceInUse=!1},ROLL_DICE:function(t){t.game.dice.forEach(function(t){t.number=Math.floor(6*Math.random()+1),t.html="&#x268"+(t.number-1)}),t.game.diceInUse=!0,t.game.numberPlay++}},c={initGame:function(t,e){var i=t.commit;i("SET_SUM_TILES_TAKEN",0),i("SET_SUM_TILES_IN_USE",0),i("SET_GAME",null==e?a:e)},startGame:function(t){var e=t.commit,i=t.dispatch;return new s.a(function(t,n){i("shuffleTiles"),e("START_GAME"),e("ROLL_DICE"),t()})},nextGame:function(t){var e=t.commit;return new s.a(function(t,i){e("RESET_NOT_TAKEN_TILES"),e("SET_GAME_ISNEXT",!1),e("ROLL_DICE"),t()})},nextPlay:function(t){var e=t.commit;return new s.a(function(t,i){e("RESET_IN_USE_TILES"),e("SET_GAME_ISNEXT",!1),e("ROLL_DICE"),t()})},restartGame:function(t){var e=t.commit,i=t.dispatch;e("RESTART_TILES"),i("shuffleTiles"),e("RESTART_GAME")}},u={game:function(t){return t.game},diceSum:function(t){return o.a.sum(o.a.filter(a.dice,function(t){return 1==t.isAvailable}).map(function(t){return t.number}))},gameIsVisible:function(t){return t.gameIsVisible},gameIsLoading:function(t){return t.game.isLoading}};e.default={state:{game:[],gameIsVisible:!1},mutations:l,actions:c,getters:u}}},["NHnr"]);
//# sourceMappingURL=app.6d683e69a32c46fb5c0f.js.map