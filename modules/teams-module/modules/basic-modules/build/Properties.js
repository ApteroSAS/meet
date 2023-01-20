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
!function webpackUniversalModuleDefinition(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("axolotis-module-basic",[],t):"object"==typeof exports?exports["axolotis-module-basic"]=t():e["axolotis-module-basic"]=t()}(self,(()=>(()=>{"use strict";var e={d:(t,o)=>{for(var r in o)e.o(o,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:o[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};function _defineProperties(e,t){for(var o=0;o<t.length;o++){var r=t[o];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}e.r(t),e.d(t,{Properties:()=>o});var o=function(){function Properties(){!function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,Properties)}return function _createClass(e,t,o){return t&&_defineProperties(e.prototype,t),o&&_defineProperties(e,o),Object.defineProperty(e,"prototype",{writable:!1}),e}(Properties,[{key:"getType",value:function getType(){return Properties.name}},{key:"getGlobalProperties",value:function getGlobalProperties(){return"undefined"!=typeof window&&window.APP_PROPS||{}}},{key:"get",value:function get(e){return this.getGlobalProperties()[e]}}]),Properties}();return t})()));
//# sourceMappingURL=Properties.js.map