/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@fingerprintjs/fingerprintjs-pro/dist/fp.esm.min.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@fingerprintjs/fingerprintjs-pro/dist/fp.esm.min.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ERROR_API_KEY_EXPIRED: () => (/* binding */ A),
/* harmony export */   ERROR_API_KEY_INVALID: () => (/* binding */ w),
/* harmony export */   ERROR_API_KEY_MISSING: () => (/* binding */ m),
/* harmony export */   ERROR_BAD_REQUEST_FORMAT: () => (/* binding */ P),
/* harmony export */   ERROR_BAD_RESPONSE_FORMAT: () => (/* binding */ s),
/* harmony export */   ERROR_CLIENT_TIMEOUT: () => (/* binding */ R),
/* harmony export */   ERROR_CSP_BLOCK: () => (/* binding */ E),
/* harmony export */   ERROR_FORBIDDEN_ENDPOINT: () => (/* binding */ v),
/* harmony export */   ERROR_FORBIDDEN_HEADER: () => (/* binding */ L),
/* harmony export */   ERROR_FORBIDDEN_ORIGIN: () => (/* binding */ g),
/* harmony export */   ERROR_GENERAL_SERVER_FAILURE: () => (/* binding */ y),
/* harmony export */   ERROR_INSTALLATION_METHOD_RESTRICTED: () => (/* binding */ O),
/* harmony export */   ERROR_INTEGRATION_FAILURE: () => (/* binding */ I),
/* harmony export */   ERROR_INVALID_ENDPOINT: () => (/* binding */ l),
/* harmony export */   ERROR_INVALID_PROXY_INTEGRATION_HEADERS: () => (/* binding */ T),
/* harmony export */   ERROR_INVALID_PROXY_INTEGRATION_SECRET: () => (/* binding */ N),
/* harmony export */   ERROR_NETWORK_ABORT: () => (/* binding */ c),
/* harmony export */   ERROR_NETWORK_CONNECTION: () => (/* binding */ u),
/* harmony export */   ERROR_NETWORK_RESTRICTED: () => (/* binding */ h),
/* harmony export */   ERROR_RATE_LIMIT: () => (/* binding */ S),
/* harmony export */   ERROR_SCRIPT_LOAD_FAIL: () => (/* binding */ M),
/* harmony export */   ERROR_SERVER_TIMEOUT: () => (/* binding */ D),
/* harmony export */   ERROR_SUBSCRIPTION_NOT_ACTIVE: () => (/* binding */ _),
/* harmony export */   ERROR_TOKEN_EXPIRED: () => (/* binding */ b),
/* harmony export */   ERROR_TOKEN_INVALID: () => (/* binding */ C),
/* harmony export */   ERROR_TOKEN_MISSING: () => (/* binding */ U),
/* harmony export */   ERROR_UNSUPPORTED_VERSION: () => (/* binding */ p),
/* harmony export */   ERROR_WRONG_REGION: () => (/* binding */ d),
/* harmony export */   "default": () => (/* binding */ q),
/* harmony export */   defaultEndpoint: () => (/* binding */ i),
/* harmony export */   defaultScriptUrlPattern: () => (/* binding */ F),
/* harmony export */   defaultTlsEndpoint: () => (/* binding */ a),
/* harmony export */   load: () => (/* binding */ G)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.mjs");
/**
 * Fingerprint Pro v3.11.10 - Copyright (c) FingerprintJS, Inc, 2025 (https://fingerprint.com)
 */

function r(e,t){return function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}(e,t)?e[t]:void 0}function o(e,t,n,r){var o,i=document,a="securitypolicyviolation",R=function(t){var n=new URL(e,location.href),r=t.blockedURI;r!==n.href&&r!==n.protocol.slice(0,-1)&&r!==n.origin||(o=t,u())};i.addEventListener(a,R);var u=function(){return i.removeEventListener(a,R)};return null==r||r.then(u,u),Promise.resolve().then(t).then((function(e){return u(),e}),(function(e){return new Promise((function(e){var t=new MessageChannel;t.port1.onmessage=function(){return e()},t.port2.postMessage(null)})).then((function(){if(u(),o)return n(o);throw e}))}))}var i={default:"endpoint"},a={default:"tlsEndpoint"},R="Client timeout",u="Network connection error",c="Network request aborted",s="Response cannot be parsed",E="Blocked by CSP",l="The endpoint parameter is not a valid URL";function f(e){for(var t="",n=0;n<e.length;++n)if(n>0){var r=e[n].toLowerCase();r!==e[n]?t+=" ".concat(r):t+=e[n]}else t+=e[n].toUpperCase();return t}var d=/*#__PURE__*/f("WrongRegion"),_=/*#__PURE__*/f("SubscriptionNotActive"),p=/*#__PURE__*/f("UnsupportedVersion"),O=/*#__PURE__*/f("InstallationMethodRestricted"),v=/*#__PURE__*/f("HostnameRestricted"),I=/*#__PURE__*/f("IntegrationFailed"),h=/*#__PURE__*/f("NetworkRestricted"),N=/*#__PURE__*/f("InvalidProxyIntegrationSecret"),T=/*#__PURE__*/f("InvalidProxyIntegrationHeaders"),m="API key required",w="API key not found",A="API key expired",P="Request cannot be parsed",y="Request failed",D="Request failed to process",S="Too many requests, rate limit exceeded",g="Not available for this origin",L="Not available with restricted header",U=m,C=w,b=A,K="3.11.10",M="Failed to load the JS script of the agent",V="9319";function k(t,n){var r,o,i,a,R,u,c,s=[],f=(r=function(t){var n=(0,tslib__WEBPACK_IMPORTED_MODULE_0__.__spreadArray)([],t,!0);return{current:function(){return n[0]},postpone:function(){var e=n.shift();void 0!==e&&n.push(e)},exclude:function(){n.shift()}}}(t),a=100,R=3e3,u=0,o=function(){return Math.random()*Math.min(R,a*Math.pow(2,u++))},i=new Set,[r.current(),function(e,t){var n,a=t instanceof Error?t.message:"";if(a===E||a===l)r.exclude(),n=0;else if(a===V)r.exclude();else if(a===M){var R=Date.now()-e.getTime()<50,u=r.current();u&&R&&!i.has(u)&&(i.add(u),n=0),r.postpone()}else r.postpone();var c=r.current();return void 0===c?void 0:[c,null!=n?n:e.getTime()+o()-Date.now()]}]),d=f[0],_=f[1];if(void 0===d)return Promise.reject(new TypeError("The list of script URL patterns is empty"));var p=function(e){var t=new Date,r=function(n){return s.push({url:e,startedAt:t,finishedAt:new Date,error:n})},o=n(e);return o.then((function(){return r()}),r),o.catch((function(e){if(null!=c||(c=e),s.length>=5)throw c;var n=_(t,e);if(!n)throw c;var r,o=n[0],i=n[1];return(r=i,new Promise((function(e){return setTimeout(e,r)}))).then((function(){return p(o)}))}))};return p(d).then((function(e){return[e,s]}))}var B="https://fpnpmcdn.net/v<version>/<apiKey>/loader_v<loaderVersion>.js",F=B;function G(e){var o;e.scriptUrlPattern;var i=e.token,a=e.apiKey,R=void 0===a?i:a,u=(0,tslib__WEBPACK_IMPORTED_MODULE_0__.__rest)(e,["scriptUrlPattern","token","apiKey"]),c=null!==(o=r(e,"scriptUrlPattern"))&&void 0!==o?o:B,s=function(){var e=[],t=function(){e.push({time:new Date,state:document.visibilityState})},n=function(e,t,n,r){return e.addEventListener(t,n,r),function(){return e.removeEventListener(t,n,r)}}(document,"visibilitychange",t);return t(),[e,n]}(),E=s[0],l=s[1];return Promise.resolve().then((function(){if(!R||"string"!=typeof R)throw new Error(m);var e=function(e,t){return(Array.isArray(e)?e:[e]).map((function(e){return function(e,t){var n=encodeURIComponent;return e.replace(/<[^<>]+>/g,(function(e){return"<version>"===e?"3":"<apiKey>"===e?n(t):"<loaderVersion>"===e?n(K):e}))}(String(e),t)}))}(c,R);return k(e,x)})).catch((function(e){throw l(),function(e){if(e instanceof Error&&e.message===V)return new Error(M);return e}(e)})).then((function(e){var t=e[0],r=e[1];return l(),t.load((0,tslib__WEBPACK_IMPORTED_MODULE_0__.__assign)((0,tslib__WEBPACK_IMPORTED_MODULE_0__.__assign)({},u),{ldi:{attempts:r,visibilityStates:E}}))}))}function x(e){return o(e,(function(){return function(e){return new Promise((function(t,n){if(function(e){if(URL.prototype)try{return new URL(e,location.href),!1}catch(t){if(t instanceof Error&&"TypeError"===t.name)return!0;throw t}}(e))throw new Error(l);var r=document.createElement("script"),o=function(){var e;return null===(e=r.parentNode)||void 0===e?void 0:e.removeChild(r)},i=document.head||document.getElementsByTagName("head")[0];r.onload=function(){o(),t()},r.onerror=function(){o(),n(new Error(M))},r.async=!0,r.src=e,i.appendChild(r)}))}(e)}),(function(){throw new Error(E)})).then(j)}function j(){var e=window,t="__fpjs_p_l_b",n=e[t];if(function(e,t){var n,r=null===(n=Object.getOwnPropertyDescriptor)||void 0===n?void 0:n.call(Object,e,t);(null==r?void 0:r.configurable)?delete e[t]:r&&!r.writable||(e[t]=void 0)}(e,t),"function"!=typeof(null==n?void 0:n.load))throw new Error(V);return n}var q={load:G,defaultScriptUrlPattern:F,ERROR_SCRIPT_LOAD_FAIL:M,ERROR_API_KEY_EXPIRED:A,ERROR_API_KEY_INVALID:w,ERROR_API_KEY_MISSING:m,ERROR_BAD_REQUEST_FORMAT:P,ERROR_BAD_RESPONSE_FORMAT:s,ERROR_CLIENT_TIMEOUT:R,ERROR_CSP_BLOCK:E,ERROR_FORBIDDEN_ENDPOINT:v,ERROR_FORBIDDEN_HEADER:L,ERROR_FORBIDDEN_ORIGIN:g,ERROR_GENERAL_SERVER_FAILURE:y,ERROR_INSTALLATION_METHOD_RESTRICTED:O,ERROR_INTEGRATION_FAILURE:I,ERROR_INVALID_ENDPOINT:l,ERROR_INVALID_PROXY_INTEGRATION_HEADERS:T,ERROR_INVALID_PROXY_INTEGRATION_SECRET:N,ERROR_NETWORK_ABORT:c,ERROR_NETWORK_CONNECTION:u,ERROR_NETWORK_RESTRICTED:h,ERROR_RATE_LIMIT:S,ERROR_SERVER_TIMEOUT:D,ERROR_SUBSCRIPTION_NOT_ACTIVE:_,ERROR_TOKEN_EXPIRED:b,ERROR_TOKEN_INVALID:C,ERROR_TOKEN_MISSING:U,ERROR_UNSUPPORTED_VERSION:p,ERROR_WRONG_REGION:d,defaultEndpoint:i,defaultTlsEndpoint:a};


/***/ }),

/***/ "./node_modules/tslib/tslib.es6.mjs":
/*!******************************************!*\
  !*** ./node_modules/tslib/tslib.es6.mjs ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __addDisposableResource: () => (/* binding */ __addDisposableResource),
/* harmony export */   __assign: () => (/* binding */ __assign),
/* harmony export */   __asyncDelegator: () => (/* binding */ __asyncDelegator),
/* harmony export */   __asyncGenerator: () => (/* binding */ __asyncGenerator),
/* harmony export */   __asyncValues: () => (/* binding */ __asyncValues),
/* harmony export */   __await: () => (/* binding */ __await),
/* harmony export */   __awaiter: () => (/* binding */ __awaiter),
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldIn: () => (/* binding */ __classPrivateFieldIn),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   __createBinding: () => (/* binding */ __createBinding),
/* harmony export */   __decorate: () => (/* binding */ __decorate),
/* harmony export */   __disposeResources: () => (/* binding */ __disposeResources),
/* harmony export */   __esDecorate: () => (/* binding */ __esDecorate),
/* harmony export */   __exportStar: () => (/* binding */ __exportStar),
/* harmony export */   __extends: () => (/* binding */ __extends),
/* harmony export */   __generator: () => (/* binding */ __generator),
/* harmony export */   __importDefault: () => (/* binding */ __importDefault),
/* harmony export */   __importStar: () => (/* binding */ __importStar),
/* harmony export */   __makeTemplateObject: () => (/* binding */ __makeTemplateObject),
/* harmony export */   __metadata: () => (/* binding */ __metadata),
/* harmony export */   __param: () => (/* binding */ __param),
/* harmony export */   __propKey: () => (/* binding */ __propKey),
/* harmony export */   __read: () => (/* binding */ __read),
/* harmony export */   __rest: () => (/* binding */ __rest),
/* harmony export */   __rewriteRelativeImportExtension: () => (/* binding */ __rewriteRelativeImportExtension),
/* harmony export */   __runInitializers: () => (/* binding */ __runInitializers),
/* harmony export */   __setFunctionName: () => (/* binding */ __setFunctionName),
/* harmony export */   __spread: () => (/* binding */ __spread),
/* harmony export */   __spreadArray: () => (/* binding */ __spreadArray),
/* harmony export */   __spreadArrays: () => (/* binding */ __spreadArrays),
/* harmony export */   __values: () => (/* binding */ __values),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

var ownKeys = function(o) {
  ownKeys = Object.getOwnPropertyNames || function (o) {
    var ar = [];
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
    return ar;
  };
  return ownKeys(o);
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        else s |= 1;
      }
      catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}

function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
      });
  }
  return path;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  __rewriteRelativeImportExtension,
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!****************************************!*\
  !*** ./src/utils/fingerprint-agent.ts ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _fingerprintjs_fingerprintjs_pro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @fingerprintjs/fingerprintjs-pro */ "./node_modules/@fingerprintjs/fingerprintjs-pro/dist/fp.esm.min.js");

window.FingerprintJS = _fingerprintjs_fingerprintjs_pro__WEBPACK_IMPORTED_MODULE_0__["default"];

})();

/******/ })()
;
//# sourceMappingURL=fingerprint-agent.js.map