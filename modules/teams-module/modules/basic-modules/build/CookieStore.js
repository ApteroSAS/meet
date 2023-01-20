/*!
 * 
 *   @aptero/axolotis-module-basic v1.0.0
 *
 *   Copyright (c) Aptero  and project contributors.
 *
 *   This source code is licensed under the undefined license found in the
 *   LICENSE file in the root directory of this source tree.
 *
 */
!function webpackUniversalModuleDefinition(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define("axolotis-module-basic",[],o):"object"==typeof exports?exports["axolotis-module-basic"]=o():e["axolotis-module-basic"]=o()}(self,(()=>(()=>{"use strict";var e={d:(o,t)=>{for(var r in t)e.o(t,r)&&!e.o(o,r)&&Object.defineProperty(o,r,{enumerable:!0,get:t[r]})},o:(e,o)=>Object.prototype.hasOwnProperty.call(e,o),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},o={};function _defineProperties(e,o){for(var t=0;t<o.length;t++){var r=o[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.r(o),e.d(o,{CookieStore:()=>t});var t=function(){function CookieStore(){!function _classCallCheck(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}(this,CookieStore)}return function _createClass(e,o,t){return o&&_defineProperties(e.prototype,o),t&&_defineProperties(e,t),Object.defineProperty(e,"prototype",{writable:!1}),e}(CookieStore,[{key:"getType",value:function getType(){return CookieStore.name}},{key:"get",value:function get(e){return localStorage.getItem(e)}},{key:"set",value:function set(e,o){localStorage.setItem(e,o)}},{key:"remove",value:function remove(e){return localStorage.removeItem(e)}}]),CookieStore}();return o})()));
//# sourceMappingURL=CookieStore.js.map