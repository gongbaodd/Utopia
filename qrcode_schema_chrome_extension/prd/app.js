/******/ (function(modules) { // webpackBootstrap
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(callback) { // eslint-disable-line no-unused-vars
/******/ 		if(typeof XMLHttpRequest === "undefined")
/******/ 			return callback(new Error("No browser support"));
/******/ 		try {
/******/ 			var request = new XMLHttpRequest();
/******/ 			var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 			request.open("GET", requestPath, true);
/******/ 			request.timeout = 10000;
/******/ 			request.send(null);
/******/ 		} catch(err) {
/******/ 			return callback(err);
/******/ 		}
/******/ 		request.onreadystatechange = function() {
/******/ 			if(request.readyState !== 4) return;
/******/ 			if(request.status === 0) {
/******/ 				// timeout
/******/ 				callback(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 			} else if(request.status === 404) {
/******/ 				// no update available
/******/ 				callback();
/******/ 			} else if(request.status !== 200 && request.status !== 304) {
/******/ 				// other failure
/******/ 				callback(new Error("Manifest request to " + requestPath + " failed."));
/******/ 			} else {
/******/ 				// success
/******/ 				try {
/******/ 					var update = JSON.parse(request.responseText);
/******/ 				} catch(e) {
/******/ 					callback(e);
/******/ 					return;
/******/ 				}
/******/ 				callback(null, update);
/******/ 			}
/******/ 		};
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "e5896b305ed6aee74633"; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					if(me.children.indexOf(request) < 0)
/******/ 						me.children.push(request);
/******/ 				} else hotCurrentParents = [moduleId];
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/ 				fn[name] = __webpack_require__[name];
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId, callback) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			__webpack_require__.e(chunkId, function() {
/******/ 				try {
/******/ 					callback.call(null, fn);
/******/ 				} finally {
/******/ 					finishChunkLoading();
/******/ 				}
/******/ 	
/******/ 				function finishChunkLoading() {
/******/ 					hotChunksLoading--;
/******/ 					if(hotStatus === "prepare") {
/******/ 						if(!hotWaitingFilesMap[chunkId]) {
/******/ 							hotEnsureUpdateChunk(chunkId);
/******/ 						}
/******/ 						if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 							hotUpdateDownloaded();
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback;
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback;
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 				else
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailibleFilesMap = {};
/******/ 	var hotCallback;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply, callback) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		if(typeof apply === "function") {
/******/ 			hotApplyOnUpdate = false;
/******/ 			callback = apply;
/******/ 		} else {
/******/ 			hotApplyOnUpdate = apply;
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 		hotSetStatus("check");
/******/ 		hotDownloadManifest(function(err, update) {
/******/ 			if(err) return callback(err);
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				callback(null, null);
/******/ 				return;
/******/ 			}
/******/ 	
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotAvailibleFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			for(var i = 0; i < update.c.length; i++)
/******/ 				hotAvailibleFilesMap[update.c[i]] = true;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			hotCallback = callback;
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 0;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailibleFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var callback = hotCallback;
/******/ 		hotCallback = null;
/******/ 		if(!callback) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate, callback);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			callback(null, outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options, callback) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		if(typeof options === "function") {
/******/ 			callback = options;
/******/ 			options = {};
/******/ 		} else if(options && typeof options === "object") {
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		} else {
/******/ 			options = {};
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function getAffectedStuff(module) {
/******/ 			var outdatedModules = [module];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice();
/******/ 			while(queue.length > 0) {
/******/ 				var moduleId = queue.pop();
/******/ 				var module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return new Error("Aborted because of self decline: " + moduleId);
/******/ 				}
/******/ 				if(moduleId === 0) {
/******/ 					return;
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push(parentId);
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return [outdatedModules, outdatedDependencies];
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				var moduleId = toModuleId(id);
/******/ 				var result = getAffectedStuff(moduleId);
/******/ 				if(!result) {
/******/ 					if(options.ignoreUnaccepted)
/******/ 						continue;
/******/ 					hotSetStatus("abort");
/******/ 					return callback(new Error("Aborted because " + moduleId + " is not accepted"));
/******/ 				}
/******/ 				if(result instanceof Error) {
/******/ 					hotSetStatus("abort");
/******/ 					return callback(result);
/******/ 				}
/******/ 				appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 				addAllToSet(outdatedModules, result[0]);
/******/ 				for(var moduleId in result[1]) {
/******/ 					if(Object.prototype.hasOwnProperty.call(result[1], moduleId)) {
/******/ 						if(!outdatedDependencies[moduleId])
/******/ 							outdatedDependencies[moduleId] = [];
/******/ 						addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(var i = 0; i < outdatedModules.length; i++) {
/******/ 			var moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			var moduleId = queue.pop();
/******/ 			var module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(var j = 0; j < disposeHandlers.length; j++) {
/******/ 				var cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(var j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				var idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				for(var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 					var dependency = moduleOutdatedDependencies[j];
/******/ 					var idx = module.children.indexOf(dependency);
/******/ 					if(idx >= 0) module.children.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(var moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(var i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					var dependency = moduleOutdatedDependencies[i];
/******/ 					var cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(var i = 0; i < callbacks.length; i++) {
/******/ 					var cb = callbacks[i];
/******/ 					try {
/******/ 						cb(outdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(var i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			var moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else if(!error)
/******/ 					error = err;
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return callback(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		callback(null, outdatedModules);
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: hotCurrentParents,
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _riot = __webpack_require__(/*! riot */ 1);
	
	var _riot2 = _interopRequireDefault(_riot);
	
	__webpack_require__(/*! ./app.tag */ 2);
	
	__webpack_require__(/*! ./router.js */ 29);
	
	__webpack_require__(/*! ./style/global.scss */ 30);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	document.body.innerHTML += '<app></app>';
	window.__APP__ = _riot2.default.mount('app')[0];

/***/ },
/* 1 */
/*!************************!*\
  !*** ./~/riot/riot.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* Riot v2.3.11, @license MIT, (c) 2015 Muut Inc. + contributors */
	
	;(function(window, undefined) {
	  'use strict';
	var riot = { version: 'v2.3.11', settings: {} },
	  // be aware, internal usage
	  // ATTENTION: prefix the global dynamic variables with `__`
	
	  // counter to give a unique id to all the Tag instances
	  __uid = 0,
	  // tags instances cache
	  __virtualDom = [],
	  // tags implementation cache
	  __tagImpl = {},
	
	  /**
	   * Const
	   */
	  // riot specific prefixes
	  RIOT_PREFIX = 'riot-',
	  RIOT_TAG = RIOT_PREFIX + 'tag',
	
	  // for typeof == '' comparisons
	  T_STRING = 'string',
	  T_OBJECT = 'object',
	  T_UNDEF  = 'undefined',
	  T_FUNCTION = 'function',
	  // special native tags that cannot be treated like the others
	  SPECIAL_TAGS_REGEX = /^(?:opt(ion|group)|tbody|col|t[rhd])$/,
	  RESERVED_WORDS_BLACKLIST = ['_item', '_id', '_parent', 'update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one'],
	
	  // version# for IE 8-11, 0 for others
	  IE_VERSION = (window && window.document || {}).documentMode | 0
	/* istanbul ignore next */
	riot.observable = function(el) {
	
	  /**
	   * Extend the original object or create a new empty one
	   * @type { Object }
	   */
	
	  el = el || {}
	
	  /**
	   * Private variables and methods
	   */
	
	  var callbacks = {},
	    onEachEvent = function(e, fn) { e.replace(/\S+/g, fn) },
	    defineProperty = function (key, value) {
	      Object.defineProperty(el, key, {
	        value: value,
	        enumerable: false,
	        writable: false,
	        configurable: false
	      })
	    }
	
	  /**
	   * Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.
	   * @param  { String } events - events ids
	   * @param  { Function } fn - callback function
	   * @returns { Object } el
	   */
	
	  defineProperty('on', function(events, fn) {
	    if (typeof fn != 'function')  return el
	
	    onEachEvent(events, function(name, pos) {
	      (callbacks[name] = callbacks[name] || []).push(fn)
	      fn.typed = pos > 0
	    })
	
	    return el
	  })
	
	  /**
	   * Removes the given space separated list of `events` listeners
	   * @param   { String } events - events ids
	   * @param   { Function } fn - callback function
	   * @returns { Object } el
	   */
	
	  defineProperty('off', function(events, fn) {
	    if (events == '*') callbacks = {}
	    else {
	      onEachEvent(events, function(name) {
	        if (fn) {
	          var arr = callbacks[name]
	          for (var i = 0, cb; cb = arr && arr[i]; ++i) {
	            if (cb == fn) arr.splice(i--, 1)
	          }
	        } else delete callbacks[name]
	      })
	    }
	    return el
	  })
	
	  /**
	   * Listen to the given space separated list of `events` and execute the `callback` at most once
	   * @param   { String } events - events ids
	   * @param   { Function } fn - callback function
	   * @returns { Object } el
	   */
	
	  defineProperty('one', function(events, fn) {
	    function on() {
	      el.off(events, on)
	      fn.apply(el, arguments)
	    }
	    return el.on(events, on)
	  })
	
	  /**
	   * Execute all callback functions that listen to the given space separated list of `events`
	   * @param   { String } events - events ids
	   * @returns { Object } el
	   */
	
	  defineProperty('trigger', function(events) {
	
	    // getting the arguments
	    // skipping the first one
	    var arglen = arguments.length - 1,
	      args = new Array(arglen)
	    for (var i = 0; i < arglen; i++) {
	      args[i] = arguments[i + 1]
	    }
	
	    onEachEvent(events, function(name) {
	
	      var fns = (callbacks[name] || []).slice(0)
	
	      for (var i = 0, fn; fn = fns[i]; ++i) {
	        if (fn.busy) return
	        fn.busy = 1
	
	        try {
	          fn.apply(el, fn.typed ? [name].concat(args) : args)
	        } catch (e) { el.trigger('error', e) }
	        if (fns[i] !== fn) { i-- }
	        fn.busy = 0
	      }
	
	      if (callbacks.all && name != 'all')
	        el.trigger.apply(el, ['all', name].concat(args))
	
	    })
	
	    return el
	  })
	
	  return el
	
	}
	/* istanbul ignore next */
	;(function(riot) { if (!window) return;
	
	/**
	 * Simple client-side router
	 * @module riot-route
	 */
	
	
	var RE_ORIGIN = /^.+?\/+[^\/]+/,
	  EVENT_LISTENER = 'EventListener',
	  REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER,
	  ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER,
	  HAS_ATTRIBUTE = 'hasAttribute',
	  REPLACE = 'replace',
	  POPSTATE = 'popstate',
	  TRIGGER = 'trigger',
	  MAX_EMIT_STACK_LEVEL = 3,
	  win = window,
	  doc = document,
	  loc = win.history.location || win.location, // see html5-history-api
	  prot = Router.prototype, // to minify more
	  clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
	  started = false,
	  central = riot.observable(),
	  routeFound = false,
	  base, current, parser, secondParser, emitStack = [], emitStackLevel = 0
	
	/**
	 * Default parser. You can replace it via router.parser method.
	 * @param {string} path - current path (normalized)
	 * @returns {array} array
	 */
	function DEFAULT_PARSER(path) {
	  return path.split(/[/?#]/)
	}
	
	/**
	 * Default parser (second). You can replace it via router.parser method.
	 * @param {string} path - current path (normalized)
	 * @param {string} filter - filter string (normalized)
	 * @returns {array} array
	 */
	function DEFAULT_SECOND_PARSER(path, filter) {
	  var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
	    args = path.match(re)
	
	  if (args) return args.slice(1)
	}
	
	/**
	 * Router class
	 */
	function Router() {
	  this.$ = []
	  riot.observable(this) // make it observable
	  central.on('stop', this.s.bind(this))
	  central.on('emit', this.e.bind(this))
	}
	
	function normalize(path) {
	  return path[REPLACE](/^\/|\/$/, '')
	}
	
	function isString(str) {
	  return typeof str == 'string'
	}
	
	/**
	 * Get the part after domain name
	 * @param {string} href - fullpath
	 * @returns {string} path from root
	 */
	function getPathFromRoot(href) {
	  return (href || loc.href)[REPLACE](RE_ORIGIN, '')
	}
	
	/**
	 * Get the part after base
	 * @param {string} href - fullpath
	 * @returns {string} path from base
	 */
	function getPathFromBase(href) {
	  return base[0] == '#'
	    ? (href || loc.href).split(base)[1] || ''
	    : getPathFromRoot(href)[REPLACE](base, '')
	}
	
	function emit(force) {
	  // the stack is needed for redirections
	  var isRoot = emitStackLevel == 0
	  if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return
	
	  emitStackLevel++
	  emitStack.push(function() {
	    var path = getPathFromBase()
	    if (force || path != current) {
	      central[TRIGGER]('emit', path)
	      current = path
	    }
	  })
	  if (isRoot) {
	    while (emitStack.length) {
	      emitStack[0]()
	      emitStack.shift()
	    }
	    emitStackLevel = 0
	  }
	}
	
	function click(e) {
	  if (
	    e.which != 1 // not left click
	    || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
	    || e.defaultPrevented // or default prevented
	  ) return
	
	  var el = e.target
	  while (el && el.nodeName != 'A') el = el.parentNode
	  if (
	    !el || el.nodeName != 'A' // not A tag
	    || el[HAS_ATTRIBUTE]('download') // has download attr
	    || !el[HAS_ATTRIBUTE]('href') // has no href attr
	    || el.target && el.target != '_self' // another window or frame
	    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
	  ) return
	
	  if (el.href != loc.href) {
	    if (
	      el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
	      || base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
	      || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
	    ) return
	  }
	
	  e.preventDefault()
	}
	
	/**
	 * Go to the path
	 * @param {string} path - destination path
	 * @param {string} title - page title
	 */
	function go(path, title) {
	  title = title || doc.title
	  // browsers ignores the second parameter `title`
	  history.pushState(null, title, base + normalize(path))
	  // so we need to set it manually
	  doc.title = title
	  routeFound = false
	  emit()
	  return routeFound
	}
	
	/**
	 * Go to path or set action
	 * a single string:                go there
	 * two strings:                    go there with setting a title
	 * a single function:              set an action on the default route
	 * a string/RegExp and a function: set an action on the route
	 * @param {(string|function)} first - path / action / filter
	 * @param {(string|RegExp|function)} second - title / action
	 */
	prot.m = function(first, second) {
	  if (isString(first) && (!second || isString(second))) go(first, second)
	  else if (second) this.r(first, second)
	  else this.r('@', first)
	}
	
	/**
	 * Stop routing
	 */
	prot.s = function() {
	  this.off('*')
	  this.$ = []
	}
	
	/**
	 * Emit
	 * @param {string} path - path
	 */
	prot.e = function(path) {
	  this.$.concat('@').some(function(filter) {
	    var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter))
	    if (args) {
	      this[TRIGGER].apply(null, [filter].concat(args))
	      return routeFound = true // exit from loop
	    }
	  }, this)
	}
	
	/**
	 * Register route
	 * @param {string} filter - filter for matching to url
	 * @param {function} action - action to register
	 */
	prot.r = function(filter, action) {
	  if (filter != '@') {
	    filter = '/' + normalize(filter)
	    this.$.push(filter)
	  }
	  this.on(filter, action)
	}
	
	var mainRouter = new Router()
	var route = mainRouter.m.bind(mainRouter)
	
	/**
	 * Create a sub router
	 * @returns {function} the method of a new Router object
	 */
	route.create = function() {
	  var newSubRouter = new Router()
	  // stop only this sub-router
	  newSubRouter.m.stop = newSubRouter.s.bind(newSubRouter)
	  // return sub-router's main method
	  return newSubRouter.m.bind(newSubRouter)
	}
	
	/**
	 * Set the base of url
	 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
	 */
	route.base = function(arg) {
	  base = arg || '#'
	  current = getPathFromBase() // recalculate current path
	}
	
	/** Exec routing right now **/
	route.exec = function() {
	  emit(true)
	}
	
	/**
	 * Replace the default router to yours
	 * @param {function} fn - your parser function
	 * @param {function} fn2 - your secondParser function
	 */
	route.parser = function(fn, fn2) {
	  if (!fn && !fn2) {
	    // reset parser for testing...
	    parser = DEFAULT_PARSER
	    secondParser = DEFAULT_SECOND_PARSER
	  }
	  if (fn) parser = fn
	  if (fn2) secondParser = fn2
	}
	
	/**
	 * Helper function to get url query as an object
	 * @returns {object} parsed query
	 */
	route.query = function() {
	  var q = {}
	  loc.href[REPLACE](/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v })
	  return q
	}
	
	/** Stop routing **/
	route.stop = function () {
	  if (started) {
	    win[REMOVE_EVENT_LISTENER](POPSTATE, emit)
	    doc[REMOVE_EVENT_LISTENER](clickEvent, click)
	    central[TRIGGER]('stop')
	    started = false
	  }
	}
	
	/**
	 * Start routing
	 * @param {boolean} autoExec - automatically exec after starting if true
	 */
	route.start = function (autoExec) {
	  if (!started) {
	    win[ADD_EVENT_LISTENER](POPSTATE, emit)
	    doc[ADD_EVENT_LISTENER](clickEvent, click)
	    started = true
	  }
	  if (autoExec) emit(true)
	}
	
	/** Prepare the router **/
	route.base()
	route.parser()
	
	riot.route = route
	})(riot)
	/* istanbul ignore next */
	
	/**
	 * The riot template engine
	 * @version v2.3.12
	 */
	
	/**
	 * @module brackets
	 *
	 * `brackets         ` Returns a string or regex based on its parameter
	 * `brackets.settings` Mirrors the `riot.settings` object
	 * `brackets.set     ` The recommended option to change the current tiot brackets
	 */
	
	var brackets = (function (UNDEF) {
	
	  var
	    REGLOB  = 'g',
	
	    MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,
	    STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,
	
	    S_QBSRC = STRINGS.source + '|' +
	      /(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/])/.source + '|' +
	      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,
	
	    DEFAULT = '{ }',
	
	    FINDBRACES = {
	      '(': _regExp('([()])|'   + S_QBSRC, REGLOB),
	      '[': _regExp('([[\\]])|' + S_QBSRC, REGLOB),
	      '{': _regExp('([{}])|'   + S_QBSRC, REGLOB)
	    }
	
	  var
	    cachedBrackets = UNDEF,
	    _regex,
	    _pairs = []
	
	  function _regExp(source, flags) { return new RegExp(source, flags) }
	
	  function _loopback(re) { return re }
	
	  function _rewrite(re) {
	    return new RegExp(
	      re.source.replace(/{/g, _pairs[2]).replace(/}/g, _pairs[3]), re.global ? REGLOB : ''
	    )
	  }
	
	  function _reset(pair) {
	    pair = pair || DEFAULT
	
	    if (pair !== _pairs[8]) {
	      var bp = pair.split(' ')
	
	      if (pair === DEFAULT) {
	        _pairs = bp.concat(bp)
	        _regex = _loopback
	      }
	      else {
	        if (bp.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) {
	          throw new Error('Unsupported brackets "' + pair + '"')
	        }
	        _pairs = bp.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '))
	        _regex = _rewrite
	      }
	      _pairs[4] = _regex(_pairs[1].length > 1 ? /(?:^|[^\\]){[\S\s]*?}/ : /(?:^|[^\\]){[^}]*}/)
	      _pairs[5] = _regex(/\\({|})/g)
	      _pairs[6] = _regex(/(\\?)({)/g)
	      _pairs[7] = _regExp('(\\\\?)(?:([[({])|(' + _pairs[3] + '))|' + S_QBSRC, REGLOB)
	      _pairs[9] = _regex(/^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S+)\s*}/)
	      _pairs[8] = pair
	    }
	    _brackets.settings.brackets = cachedBrackets = pair
	  }
	
	  function _brackets(reOrIdx) {
	    _reset(_brackets.settings.brackets)
	    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _pairs[reOrIdx]
	  }
	
	  _brackets.split = function split(str, tmpl) {
	
	    var
	      parts = [],
	      match,
	      isexpr,
	      start,
	      pos,
	      re = _brackets(6)
	
	    isexpr = start = re.lastIndex = 0
	
	    while (match = re.exec(str)) {
	
	      pos = match.index
	
	      if (isexpr) {
	
	        if (match[2]) {
	          re.lastIndex = skipBraces(match[2], re.lastIndex)
	          continue
	        }
	
	        if (!match[3])
	          continue
	      }
	
	      if (!match[1]) {
	        unescapeStr(str.slice(start, pos))
	        start = re.lastIndex
	        re = _pairs[6 + (isexpr ^= 1)]
	        re.lastIndex = start
	      }
	    }
	
	    if (str && start < str.length) {
	      unescapeStr(str.slice(start))
	    }
	
	    return parts
	
	    function unescapeStr(str) {
	      if (tmpl || isexpr)
	        parts.push(str && str.replace(_pairs[5], '$1'))
	      else
	        parts.push(str)
	    }
	
	    function skipBraces(ch, pos) {
	      var
	        match,
	        recch = FINDBRACES[ch],
	        level = 1
	      recch.lastIndex = pos
	
	      while (match = recch.exec(str)) {
	        if (match[1] &&
	          !(match[1] === ch ? ++level : --level)) break
	      }
	      return match ? recch.lastIndex : str.length
	    }
	  }
	
	  _brackets.hasExpr = function hasExpr(str) {
	    return _brackets(4).test(str)
	  }
	
	  _brackets.loopKeys = function loopKeys(expr) {
	    var m = expr.match(_brackets(9))
	    return m ?
	      { key: m[1], pos: m[2], val: _pairs[0] + m[3] + _pairs[1] } : { val: expr.trim() }
	  }
	
	  _brackets.array = function array(pair) {
	    _reset(pair || _brackets.settings.brackets)
	    return _pairs
	  }
	
	  /* istanbul ignore next: in the node version riot is not in the scope */
	  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {}
	  _brackets.set = _reset
	
	  _brackets.R_STRINGS = STRINGS
	  _brackets.R_MLCOMMS = MLCOMMS
	  _brackets.S_QBLOCKS = S_QBSRC
	
	  _reset(_brackets.settings.brackets)
	
	  return _brackets
	
	})()
	
	/**
	 * @module tmpl
	 *
	 * tmpl          - Root function, returns the template value, render with data
	 * tmpl.hasExpr  - Test the existence of a expression inside a string
	 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
	 */
	
	var tmpl = (function () {
	
	  var
	    FALSE  = !1,
	    _cache = {}
	
	  function _tmpl(str, data) {
	    if (!str) return str
	
	    return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
	  }
	
	  _tmpl.hasExpr = brackets.hasExpr
	
	  _tmpl.loopKeys = brackets.loopKeys
	
	  _tmpl.errorHandler = FALSE
	
	  function _logErr(err, ctx) {
	
	    if (_tmpl.errorHandler) {
	
	      err.riotData = {
	        tagName: ctx && ctx.root && ctx.root.tagName,
	        _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
	      }
	      _tmpl.errorHandler(err)
	    }
	  }
	
	  function _create(str) {
	
	    var expr = _getTmpl(str)
	    if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr
	
	    return new Function('E', expr + ';')  // eslint-disable-line indent
	  }
	
	  var
	    RE_QBLOCK = new RegExp(brackets.S_QBLOCKS, 'g'),
	    RE_QBMARK = /\x01(\d+)~/g
	
	  function _getTmpl(str) {
	    var
	      qstr = [],
	      expr,
	      parts = brackets.split(str, 1)
	
	    if (parts.length > 2 || parts[0]) {
	      var i, j, list = []
	
	      for (i = j = 0; i < parts.length; ++i) {
	
	        expr = parts[i]
	
	        if (expr && (expr = i & 1 ?
	
	              _parseExpr(expr, 1, qstr) :
	
	              '"' + expr
	                .replace(/\\/g, '\\\\')
	                .replace(/\r\n?|\n/g, '\\n')
	                .replace(/"/g, '\\"') +
	              '"'
	
	          )) list[j++] = expr
	
	      }
	
	      expr = j < 2 ? list[0] :
	             '[' + list.join(',') + '].join("")'
	    }
	    else {
	
	      expr = _parseExpr(parts[1], 0, qstr)
	    }
	
	    if (qstr[0])
	      expr = expr.replace(RE_QBMARK, function (_, pos) {
	        return qstr[pos]
	          .replace(/\r/g, '\\r')
	          .replace(/\n/g, '\\n')
	      })
	
	    return expr
	  }
	
	  var
	    CS_IDENT = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/,
	    RE_BRACE = /,|([[{(])|$/g
	
	  function _parseExpr(expr, asText, qstr) {
	
	    expr = expr
	          .replace(RE_QBLOCK, function (s, div) {
	            return s.length > 2 && !div ? '\x01' + (qstr.push(s) - 1) + '~' : s
	          })
	          .replace(/\s+/g, ' ').trim()
	          .replace(/\ ?([[\({},?\.:])\ ?/g, '$1')
	
	    if (expr) {
	      var
	        list = [],
	        cnt = 0,
	        match
	
	      while (expr &&
	            (match = expr.match(CS_IDENT)) &&
	            !match.index
	        ) {
	        var
	          key,
	          jsb,
	          re = /,|([[{(])|$/g
	
	        expr = RegExp.rightContext
	        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1]
	
	        while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re)
	
	        jsb  = expr.slice(0, match.index)
	        expr = RegExp.rightContext
	
	        list[cnt++] = _wrapExpr(jsb, 1, key)
	      }
	
	      expr = !cnt ? _wrapExpr(expr, asText) :
	          cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0]
	    }
	    return expr
	
	    function skipBraces(jsb, re) {
	      var
	        match,
	        lv = 1,
	        ir = jsb === '(' ? /[()]/g : jsb === '[' ? /[[\]]/g : /[{}]/g
	
	      ir.lastIndex = re.lastIndex
	      while (match = ir.exec(expr)) {
	        if (match[0] === jsb) ++lv
	        else if (!--lv) break
	      }
	      re.lastIndex = lv ? expr.length : ir.lastIndex
	    }
	  }
	
	  // istanbul ignore next: not both
	  var JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').'
	  var JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g
	
	  function _wrapExpr(expr, asText, key) {
	    var tb = FALSE
	
	    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
	      if (mvar) {
	        pos = tb ? 0 : pos + match.length
	
	        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
	          match = p + '("' + mvar + JS_CONTEXT + mvar
	          if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '['
	        }
	        else if (pos)
	          tb = !/^(?=(\.[$\w]+))\1(?:[^.[(]|$)/.test(s.slice(pos))
	      }
	      return match
	    })
	
	    if (tb) {
	      expr = 'try{return ' + expr + '}catch(e){E(e,this)}'
	    }
	
	    if (key) {
	
	      expr = (tb ?
	          'function(){' + expr + '}.call(this)' : '(' + expr + ')'
	        ) + '?"' + key + '":""'
	    }
	    else if (asText) {
	
	      expr = 'function(v){' + (tb ?
	          expr.replace('return ', 'v=') : 'v=(' + expr + ')'
	        ) + ';return v||v===0?v:""}.call(this)'
	    }
	
	    return expr
	  }
	
	  // istanbul ignore next: compatibility fix for beta versions
	  _tmpl.parse = function (s) { return s }
	
	  return _tmpl
	
	})()
	
	
	/*
	  lib/browser/tag/mkdom.js
	
	  Includes hacks needed for the Internet Explorer version 9 and bellow
	
	*/
	// http://kangax.github.io/compat-table/es5/#ie8
	// http://codeplanet.io/dropping-ie8/
	
	var mkdom = (function (checkIE) {
	
	  var rootEls = {
	      'tr': 'tbody',
	      'th': 'tr',
	      'td': 'tr',
	      'tbody': 'table',
	      'col': 'colgroup'
	    },
	    GENERIC = 'div'
	
	  checkIE = checkIE && checkIE < 10
	
	  // creates any dom element in a div, table, or colgroup container
	  function _mkdom(html) {
	
	    var match = html && html.match(/^\s*<([-\w]+)/),
	      tagName = match && match[1].toLowerCase(),
	      rootTag = rootEls[tagName] || GENERIC,
	      el = mkEl(rootTag)
	
	    el.stub = true
	
	    /* istanbul ignore next */
	    if (checkIE && tagName && (match = tagName.match(SPECIAL_TAGS_REGEX)))
	      ie9elem(el, html, tagName, !!match[1])
	    else
	      el.innerHTML = html
	
	    return el
	  }
	
	  // creates tr, th, td, option, optgroup element for IE8-9
	  /* istanbul ignore next */
	  function ie9elem(el, html, tagName, select) {
	
	    var div = mkEl(GENERIC),
	      tag = select ? 'select>' : 'table>',
	      child
	
	    div.innerHTML = '<' + tag + html + '</' + tag
	
	    child = $(tagName, div)
	    if (child)
	      el.appendChild(child)
	
	  }
	  // end ie9elem()
	
	  return _mkdom
	
	})(IE_VERSION)
	
	/**
	 * Convert the item looped into an object used to extend the child tag properties
	 * @param   { Object } expr - object containing the keys used to extend the children tags
	 * @param   { * } key - value to assign to the new object returned
	 * @param   { * } val - value containing the position of the item in the array
	 * @returns { Object } - new object containing the values of the original item
	 *
	 * The variables 'key' and 'val' are arbitrary.
	 * They depend on the collection type looped (Array, Object)
	 * and on the expression used on the each tag
	 *
	 */
	function mkitem(expr, key, val) {
	  var item = {}
	  item[expr.key] = key
	  if (expr.pos) item[expr.pos] = val
	  return item
	}
	
	/**
	 * Unmount the redundant tags
	 * @param   { Array } items - array containing the current items to loop
	 * @param   { Array } tags - array containing all the children tags
	 */
	function unmountRedundant(items, tags) {
	
	  var i = tags.length,
	    j = items.length
	
	  while (i > j) {
	    var t = tags[--i]
	    tags.splice(i, 1)
	    t.unmount()
	  }
	}
	
	/**
	 * Move the nested custom tags in non custom loop tags
	 * @param   { Object } child - non custom loop tag
	 * @param   { Number } i - current position of the loop tag
	 */
	function moveNestedTags(child, i) {
	  Object.keys(child.tags).forEach(function(tagName) {
	    var tag = child.tags[tagName]
	    if (isArray(tag))
	      each(tag, function (t) {
	        moveChildTag(t, tagName, i)
	      })
	    else
	      moveChildTag(tag, tagName, i)
	  })
	}
	
	/**
	 * Adds the elements for a virtual tag
	 * @param { Tag } tag - the tag whose root's children will be inserted or appended
	 * @param { Node } src - the node that will do the inserting or appending
	 * @param { Tag } target - only if inserting, insert before this tag's first child
	 */
	function addVirtual(tag, src, target) {
	  var el = tag._root
	  tag._virts = []
	  while (el) {
	    var sib = el.nextSibling
	    if (target)
	      src.insertBefore(el, target._root)
	    else
	      src.appendChild(el)
	
	    tag._virts.push(el) // hold for unmounting
	    el = sib
	  }
	}
	
	/**
	 * Move virtual tag and all child nodes
	 * @param { Tag } tag - first child reference used to start move
	 * @param { Node } src  - the node that will do the inserting
	 * @param { Tag } target - insert before this tag's first child
	 * @param { Number } len - how many child nodes to move
	 */
	function moveVirtual(tag, src, target, len) {
	  var el = tag._root
	  for (var i = 0; i < len; i++) {
	    var sib = el.nextSibling
	    src.insertBefore(el, target._root)
	    el = sib
	  }
	}
	
	
	/**
	 * Manage tags having the 'each'
	 * @param   { Object } dom - DOM node we need to loop
	 * @param   { Tag } parent - parent tag instance where the dom node is contained
	 * @param   { String } expr - string contained in the 'each' attribute
	 */
	function _each(dom, parent, expr) {
	
	  // remove the each property from the original tag
	  remAttr(dom, 'each')
	
	  var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'),
	    tagName = getTagName(dom),
	    impl = __tagImpl[tagName] || { tmpl: dom.outerHTML },
	    useRoot = SPECIAL_TAGS_REGEX.test(tagName),
	    root = dom.parentNode,
	    ref = document.createTextNode(''),
	    child = getTag(dom),
	    isOption = /option/gi.test(tagName), // the option tags must be treated differently
	    tags = [],
	    oldItems = [],
	    hasKeys,
	    isVirtual = dom.tagName == 'VIRTUAL'
	
	  // parse the each expression
	  expr = tmpl.loopKeys(expr)
	
	  // insert a marked where the loop tags will be injected
	  root.insertBefore(ref, dom)
	
	  // clean template code
	  parent.one('before-mount', function () {
	
	    // remove the original DOM node
	    dom.parentNode.removeChild(dom)
	    if (root.stub) root = parent.root
	
	  }).on('update', function () {
	    // get the new items collection
	    var items = tmpl(expr.val, parent),
	      // create a fragment to hold the new DOM nodes to inject in the parent tag
	      frag = document.createDocumentFragment()
	
	
	
	    // object loop. any changes cause full redraw
	    if (!isArray(items)) {
	      hasKeys = items || false
	      items = hasKeys ?
	        Object.keys(items).map(function (key) {
	          return mkitem(expr, key, items[key])
	        }) : []
	    }
	
	    // loop all the new items
	    each(items, function(item, i) {
	      // reorder only if the items are objects
	      var _mustReorder = mustReorder && item instanceof Object,
	        oldPos = oldItems.indexOf(item),
	        pos = ~oldPos && _mustReorder ? oldPos : i,
	        // does a tag exist in this position?
	        tag = tags[pos]
	
	      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item
	
	      // new tag
	      if (
	        !_mustReorder && !tag // with no-reorder we just update the old tags
	        ||
	        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
	      ) {
	
	        tag = new Tag(impl, {
	          parent: parent,
	          isLoop: true,
	          hasImpl: !!__tagImpl[tagName],
	          root: useRoot ? root : dom.cloneNode(),
	          item: item
	        }, dom.innerHTML)
	
	        tag.mount()
	        if (isVirtual) tag._root = tag.root.firstChild // save reference for further moves or inserts
	        // this tag must be appended
	        if (i == tags.length) {
	          if (isVirtual)
	            addVirtual(tag, frag)
	          else frag.appendChild(tag.root)
	        }
	        // this tag must be insert
	        else {
	          if (isVirtual)
	            addVirtual(tag, root, tags[i])
	          else root.insertBefore(tag.root, tags[i].root)
	          oldItems.splice(i, 0, item)
	        }
	
	        tags.splice(i, 0, tag)
	        pos = i // handled here so no move
	      } else tag.update(item)
	
	      // reorder the tag if it's not located in its previous position
	      if (pos !== i && _mustReorder) {
	        // update the DOM
	        if (isVirtual)
	          moveVirtual(tag, root, tags[i], dom.childNodes.length)
	        else root.insertBefore(tag.root, tags[i].root)
	        // update the position attribute if it exists
	        if (expr.pos)
	          tag[expr.pos] = i
	        // move the old tag instance
	        tags.splice(i, 0, tags.splice(pos, 1)[0])
	        // move the old item
	        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
	        // if the loop tags are not custom
	        // we need to move all their custom tags into the right position
	        if (!child) moveNestedTags(tag, i)
	      }
	
	      // cache the original item to use it in the events bound to this node
	      // and its children
	      tag._item = item
	      // cache the real parent tag internally
	      defineProperty(tag, '_parent', parent)
	
	    })
	
	    // remove the redundant tags
	    unmountRedundant(items, tags)
	
	    // insert the new nodes
	    if (isOption) root.appendChild(frag)
	    else root.insertBefore(frag, ref)
	
	    // set the 'tags' property of the parent tag
	    // if child is 'undefined' it means that we don't need to set this property
	    // for example:
	    // we don't need store the `myTag.tags['div']` property if we are looping a div tag
	    // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
	    if (child) parent.tags[tagName] = tags
	
	    // clone the items array
	    oldItems = items.slice()
	
	  })
	
	}
	
	
	function parseNamedElements(root, tag, childTags, forceParsingNamed) {
	
	  walk(root, function(dom) {
	    if (dom.nodeType == 1) {
	      dom.isLoop = dom.isLoop || (dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each')) ? 1 : 0
	
	      // custom child tag
	      if (childTags) {
	        var child = getTag(dom)
	
	        if (child && !dom.isLoop)
	          childTags.push(initChildTag(child, {root: dom, parent: tag}, dom.innerHTML, tag))
	      }
	
	      if (!dom.isLoop || forceParsingNamed)
	        setNamed(dom, tag, [])
	    }
	
	  })
	
	}
	
	function parseExpressions(root, tag, expressions) {
	
	  function addExpr(dom, val, extra) {
	    if (tmpl.hasExpr(val)) {
	      var expr = { dom: dom, expr: val }
	      expressions.push(extend(expr, extra))
	    }
	  }
	
	  walk(root, function(dom) {
	    var type = dom.nodeType
	
	    // text node
	    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
	    if (type != 1) return
	
	    /* element */
	
	    // loop
	    var attr = getAttr(dom, 'each')
	
	    if (attr) { _each(dom, tag, attr); return false }
	
	    // attribute expressions
	    each(dom.attributes, function(attr) {
	      var name = attr.name,
	        bool = name.split('__')[1]
	
	      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
	      if (bool) { remAttr(dom, name); return false }
	
	    })
	
	    // skip custom tags
	    if (getTag(dom)) return false
	
	  })
	
	}
	function Tag(impl, conf, innerHTML) {
	
	  var self = riot.observable(this),
	    opts = inherit(conf.opts) || {},
	    dom = mkdom(impl.tmpl),
	    parent = conf.parent,
	    isLoop = conf.isLoop,
	    hasImpl = conf.hasImpl,
	    item = cleanUpData(conf.item),
	    expressions = [],
	    childTags = [],
	    root = conf.root,
	    fn = impl.fn,
	    tagName = root.tagName.toLowerCase(),
	    attr = {},
	    propsInSyncWithParent = []
	
	  if (fn && root._tag) root._tag.unmount(true)
	
	  // not yet mounted
	  this.isMounted = false
	  root.isLoop = isLoop
	
	  // keep a reference to the tag just created
	  // so we will be able to mount this tag multiple times
	  root._tag = this
	
	  // create a unique id to this tag
	  // it could be handy to use it also to improve the virtual dom rendering speed
	  defineProperty(this, '_riot_id', ++__uid) // base 1 allows test !t._riot_id
	
	  extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item)
	
	  // grab attributes
	  each(root.attributes, function(el) {
	    var val = el.value
	    // remember attributes with expressions only
	    if (tmpl.hasExpr(val)) attr[el.name] = val
	  })
	
	  if (dom.innerHTML && !/^(select|optgroup|table|tbody|tr|col(?:group)?)$/.test(tagName))
	    // replace all the yield tags with the tag inner html
	    dom.innerHTML = replaceYield(dom.innerHTML, innerHTML)
	
	  // options
	  function updateOpts() {
	    var ctx = hasImpl && isLoop ? self : parent || self
	
	    // update opts from current DOM attributes
	    each(root.attributes, function(el) {
	      opts[toCamel(el.name)] = tmpl(el.value, ctx)
	    })
	    // recover those with expressions
	    each(Object.keys(attr), function(name) {
	      opts[toCamel(name)] = tmpl(attr[name], ctx)
	    })
	  }
	
	  function normalizeData(data) {
	    for (var key in item) {
	      if (typeof self[key] !== T_UNDEF && isWritable(self, key))
	        self[key] = data[key]
	    }
	  }
	
	  function inheritFromParent () {
	    if (!self.parent || !isLoop) return
	    each(Object.keys(self.parent), function(k) {
	      // some properties must be always in sync with the parent tag
	      var mustSync = !contains(RESERVED_WORDS_BLACKLIST, k) && contains(propsInSyncWithParent, k)
	      if (typeof self[k] === T_UNDEF || mustSync) {
	        // track the property to keep in sync
	        // so we can keep it updated
	        if (!mustSync) propsInSyncWithParent.push(k)
	        self[k] = self.parent[k]
	      }
	    })
	  }
	
	  defineProperty(this, 'update', function(data) {
	
	    // make sure the data passed will not override
	    // the component core methods
	    data = cleanUpData(data)
	    // inherit properties from the parent
	    inheritFromParent()
	    // normalize the tag properties in case an item object was initially passed
	    if (data && typeof item === T_OBJECT) {
	      normalizeData(data)
	      item = data
	    }
	    extend(self, data)
	    updateOpts()
	    self.trigger('update', data)
	    update(expressions, self)
	    self.trigger('updated')
	    return this
	  })
	
	  defineProperty(this, 'mixin', function() {
	    each(arguments, function(mix) {
	      mix = typeof mix === T_STRING ? riot.mixin(mix) : mix
	      each(Object.keys(mix), function(key) {
	        // bind methods to self
	        if (key != 'init')
	          self[key] = isFunction(mix[key]) ? mix[key].bind(self) : mix[key]
	      })
	      // init method will be called automatically
	      if (mix.init) mix.init.bind(self)()
	    })
	    return this
	  })
	
	  defineProperty(this, 'mount', function() {
	
	    updateOpts()
	
	    // initialiation
	    if (fn) fn.call(self, opts)
	
	    // parse layout after init. fn may calculate args for nested custom tags
	    parseExpressions(dom, self, expressions)
	
	    // mount the child tags
	    toggle(true)
	
	    // update the root adding custom attributes coming from the compiler
	    // it fixes also #1087
	    if (impl.attrs || hasImpl) {
	      walkAttributes(impl.attrs, function (k, v) { setAttr(root, k, v) })
	      parseExpressions(self.root, self, expressions)
	    }
	
	    if (!self.parent || isLoop) self.update(item)
	
	    // internal use only, fixes #403
	    self.trigger('before-mount')
	
	    if (isLoop && !hasImpl) {
	      // update the root attribute for the looped elements
	      self.root = root = dom.firstChild
	
	    } else {
	      while (dom.firstChild) root.appendChild(dom.firstChild)
	      if (root.stub) self.root = root = parent.root
	    }
	
	    // parse the named dom nodes in the looped child
	    // adding them to the parent as well
	    if (isLoop)
	      parseNamedElements(self.root, self.parent, null, true)
	
	    // if it's not a child tag we can trigger its mount event
	    if (!self.parent || self.parent.isMounted) {
	      self.isMounted = true
	      self.trigger('mount')
	    }
	    // otherwise we need to wait that the parent event gets triggered
	    else self.parent.one('mount', function() {
	      // avoid to trigger the `mount` event for the tags
	      // not visible included in an if statement
	      if (!isInStub(self.root)) {
	        self.parent.isMounted = self.isMounted = true
	        self.trigger('mount')
	      }
	    })
	  })
	
	
	  defineProperty(this, 'unmount', function(keepRootTag) {
	    var el = root,
	      p = el.parentNode,
	      ptag
	
	    self.trigger('before-unmount')
	
	    // remove this tag instance from the global virtualDom variable
	    __virtualDom.splice(__virtualDom.indexOf(self), 1)
	
	    if (this._virts) {
	      each(this._virts, function(v) {
	        v.parentNode.removeChild(v)
	      })
	    }
	
	    if (p) {
	
	      if (parent) {
	        ptag = getImmediateCustomParentTag(parent)
	        // remove this tag from the parent tags object
	        // if there are multiple nested tags with same name..
	        // remove this element form the array
	        if (isArray(ptag.tags[tagName]))
	          each(ptag.tags[tagName], function(tag, i) {
	            if (tag._riot_id == self._riot_id)
	              ptag.tags[tagName].splice(i, 1)
	          })
	        else
	          // otherwise just delete the tag instance
	          ptag.tags[tagName] = undefined
	      }
	
	      else
	        while (el.firstChild) el.removeChild(el.firstChild)
	
	      if (!keepRootTag)
	        p.removeChild(el)
	      else
	        // the riot-tag attribute isn't needed anymore, remove it
	        remAttr(p, 'riot-tag')
	    }
	
	
	    self.trigger('unmount')
	    toggle()
	    self.off('*')
	    self.isMounted = false
	    // somehow ie8 does not like `delete root._tag`
	    root._tag = null
	
	  })
	
	  function toggle(isMount) {
	
	    // mount/unmount children
	    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })
	
	    // listen/unlisten parent (events flow one way from parent to children)
	    if (parent) {
	      var evt = isMount ? 'on' : 'off'
	
	      // the loop tags will be always in sync with the parent automatically
	      if (isLoop)
	        parent[evt]('unmount', self.unmount)
	      else
	        parent[evt]('update', self.update)[evt]('unmount', self.unmount)
	    }
	  }
	
	  // named elements available for fn
	  parseNamedElements(dom, this, childTags)
	
	}
	/**
	 * Attach an event to a DOM node
	 * @param { String } name - event name
	 * @param { Function } handler - event callback
	 * @param { Object } dom - dom node
	 * @param { Tag } tag - tag instance
	 */
	function setEventHandler(name, handler, dom, tag) {
	
	  dom[name] = function(e) {
	
	    var ptag = tag._parent,
	      item = tag._item,
	      el
	
	    if (!item)
	      while (ptag && !item) {
	        item = ptag._item
	        ptag = ptag._parent
	      }
	
	    // cross browser event fix
	    e = e || window.event
	
	    // override the event properties
	    if (isWritable(e, 'currentTarget')) e.currentTarget = dom
	    if (isWritable(e, 'target')) e.target = e.srcElement
	    if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode
	
	    e.item = item
	
	    // prevent default behaviour (by default)
	    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
	      if (e.preventDefault) e.preventDefault()
	      e.returnValue = false
	    }
	
	    if (!e.preventUpdate) {
	      el = item ? getImmediateCustomParentTag(ptag) : tag
	      el.update()
	    }
	
	  }
	
	}
	
	
	/**
	 * Insert a DOM node replacing another one (used by if- attribute)
	 * @param   { Object } root - parent node
	 * @param   { Object } node - node replaced
	 * @param   { Object } before - node added
	 */
	function insertTo(root, node, before) {
	  if (root) {
	    root.insertBefore(before, node)
	    root.removeChild(node)
	  }
	}
	
	/**
	 * Update the expressions in a Tag instance
	 * @param   { Array } expressions - expression that must be re evaluated
	 * @param   { Tag } tag - tag instance
	 */
	function update(expressions, tag) {
	
	  each(expressions, function(expr, i) {
	
	    var dom = expr.dom,
	      attrName = expr.attr,
	      value = tmpl(expr.expr, tag),
	      parent = expr.dom.parentNode
	
	    if (expr.bool)
	      value = value ? attrName : false
	    else if (value == null)
	      value = ''
	
	    // leave out riot- prefixes from strings inside textarea
	    // fix #815: any value -> string
	    if (parent && parent.tagName == 'TEXTAREA') value = ('' + value).replace(/riot-/g, '')
	
	    // no change
	    if (expr.value === value) return
	    expr.value = value
	
	    // text node
	    if (!attrName) {
	      dom.nodeValue = '' + value    // #815 related
	      return
	    }
	
	    // remove original attribute
	    remAttr(dom, attrName)
	    // event handler
	    if (isFunction(value)) {
	      setEventHandler(attrName, value, dom, tag)
	
	    // if- conditional
	    } else if (attrName == 'if') {
	      var stub = expr.stub,
	        add = function() { insertTo(stub.parentNode, stub, dom) },
	        remove = function() { insertTo(dom.parentNode, dom, stub) }
	
	      // add to DOM
	      if (value) {
	        if (stub) {
	          add()
	          dom.inStub = false
	          // avoid to trigger the mount event if the tags is not visible yet
	          // maybe we can optimize this avoiding to mount the tag at all
	          if (!isInStub(dom)) {
	            walk(dom, function(el) {
	              if (el._tag && !el._tag.isMounted) el._tag.isMounted = !!el._tag.trigger('mount')
	            })
	          }
	        }
	      // remove from DOM
	      } else {
	        stub = expr.stub = stub || document.createTextNode('')
	        // if the parentNode is defined we can easily replace the tag
	        if (dom.parentNode)
	          remove()
	        // otherwise we need to wait the updated event
	        else (tag.parent || tag).one('updated', remove)
	
	        dom.inStub = true
	      }
	    // show / hide
	    } else if (/^(show|hide)$/.test(attrName)) {
	      if (attrName == 'hide') value = !value
	      dom.style.display = value ? '' : 'none'
	
	    // field value
	    } else if (attrName == 'value') {
	      dom.value = value
	
	    // <img src="{ expr }">
	    } else if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
	      if (value)
	        setAttr(dom, attrName.slice(RIOT_PREFIX.length), value)
	
	    } else {
	      if (expr.bool) {
	        dom[attrName] = value
	        if (!value) return
	      }
	
	      if (typeof value !== T_OBJECT) setAttr(dom, attrName, value)
	
	    }
	
	  })
	
	}
	/**
	 * Loops an array
	 * @param   { Array } els - collection of items
	 * @param   {Function} fn - callback function
	 * @returns { Array } the array looped
	 */
	function each(els, fn) {
	  for (var i = 0, len = (els || []).length, el; i < len; i++) {
	    el = els[i]
	    // return false -> remove current item during loop
	    if (el != null && fn(el, i) === false) i--
	  }
	  return els
	}
	
	/**
	 * Detect if the argument passed is a function
	 * @param   { * } v - whatever you want to pass to this function
	 * @returns { Boolean } -
	 */
	function isFunction(v) {
	  return typeof v === T_FUNCTION || false   // avoid IE problems
	}
	
	/**
	 * Remove any DOM attribute from a node
	 * @param   { Object } dom - DOM node we want to update
	 * @param   { String } name - name of the property we want to remove
	 */
	function remAttr(dom, name) {
	  dom.removeAttribute(name)
	}
	
	/**
	 * Convert a string containing dashes to camle case
	 * @param   { String } string - input string
	 * @returns { String } my-string -> myString
	 */
	function toCamel(string) {
	  return string.replace(/(\-\w)/g, function(match) {
	    return match.toUpperCase().replace('-', '')
	  })
	}
	
	/**
	 * Get the value of any DOM attribute on a node
	 * @param   { Object } dom - DOM node we want to parse
	 * @param   { String } name - name of the attribute we want to get
	 * @returns { String | undefined } name of the node attribute whether it exists
	 */
	function getAttr(dom, name) {
	  return dom.getAttribute(name)
	}
	
	/**
	 * Set any DOM attribute
	 * @param { Object } dom - DOM node we want to update
	 * @param { String } name - name of the property we want to set
	 * @param { String } val - value of the property we want to set
	 */
	function setAttr(dom, name, val) {
	  dom.setAttribute(name, val)
	}
	
	/**
	 * Detect the tag implementation by a DOM node
	 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
	 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
	 */
	function getTag(dom) {
	  return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()]
	}
	/**
	 * Add a child tag to its parent into the `tags` object
	 * @param   { Object } tag - child tag instance
	 * @param   { String } tagName - key where the new tag will be stored
	 * @param   { Object } parent - tag instance where the new child tag will be included
	 */
	function addChildTag(tag, tagName, parent) {
	  var cachedTag = parent.tags[tagName]
	
	  // if there are multiple children tags having the same name
	  if (cachedTag) {
	    // if the parent tags property is not yet an array
	    // create it adding the first cached tag
	    if (!isArray(cachedTag))
	      // don't add the same tag twice
	      if (cachedTag !== tag)
	        parent.tags[tagName] = [cachedTag]
	    // add the new nested tag to the array
	    if (!contains(parent.tags[tagName], tag))
	      parent.tags[tagName].push(tag)
	  } else {
	    parent.tags[tagName] = tag
	  }
	}
	
	/**
	 * Move the position of a custom tag in its parent tag
	 * @param   { Object } tag - child tag instance
	 * @param   { String } tagName - key where the tag was stored
	 * @param   { Number } newPos - index where the new tag will be stored
	 */
	function moveChildTag(tag, tagName, newPos) {
	  var parent = tag.parent,
	    tags
	  // no parent no move
	  if (!parent) return
	
	  tags = parent.tags[tagName]
	
	  if (isArray(tags))
	    tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0])
	  else addChildTag(tag, tagName, parent)
	}
	
	/**
	 * Create a new child tag including it correctly into its parent
	 * @param   { Object } child - child tag implementation
	 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
	 * @param   { String } innerHTML - inner html of the child node
	 * @param   { Object } parent - instance of the parent tag including the child custom tag
	 * @returns { Object } instance of the new child tag just created
	 */
	function initChildTag(child, opts, innerHTML, parent) {
	  var tag = new Tag(child, opts, innerHTML),
	    tagName = getTagName(opts.root),
	    ptag = getImmediateCustomParentTag(parent)
	  // fix for the parent attribute in the looped elements
	  tag.parent = ptag
	  // store the real parent tag
	  // in some cases this could be different from the custom parent tag
	  // for example in nested loops
	  tag._parent = parent
	
	  // add this tag to the custom parent tag
	  addChildTag(tag, tagName, ptag)
	  // and also to the real parent tag
	  if (ptag !== parent)
	    addChildTag(tag, tagName, parent)
	  // empty the child node once we got its template
	  // to avoid that its children get compiled multiple times
	  opts.root.innerHTML = ''
	
	  return tag
	}
	
	/**
	 * Loop backward all the parents tree to detect the first custom parent tag
	 * @param   { Object } tag - a Tag instance
	 * @returns { Object } the instance of the first custom parent tag found
	 */
	function getImmediateCustomParentTag(tag) {
	  var ptag = tag
	  while (!getTag(ptag.root)) {
	    if (!ptag.parent) break
	    ptag = ptag.parent
	  }
	  return ptag
	}
	
	/**
	 * Helper function to set an immutable property
	 * @param   { Object } el - object where the new property will be set
	 * @param   { String } key - object key where the new property will be stored
	 * @param   { * } value - value of the new property
	* @param   { Object } options - set the propery overriding the default options
	 * @returns { Object } - the initial object
	 */
	function defineProperty(el, key, value, options) {
	  Object.defineProperty(el, key, extend({
	    value: value,
	    enumerable: false,
	    writable: false,
	    configurable: false
	  }, options))
	  return el
	}
	
	/**
	 * Get the tag name of any DOM node
	 * @param   { Object } dom - DOM node we want to parse
	 * @returns { String } name to identify this dom node in riot
	 */
	function getTagName(dom) {
	  var child = getTag(dom),
	    namedTag = getAttr(dom, 'name'),
	    tagName = namedTag && !tmpl.hasExpr(namedTag) ?
	                namedTag :
	              child ? child.name : dom.tagName.toLowerCase()
	
	  return tagName
	}
	
	/**
	 * Extend any object with other properties
	 * @param   { Object } src - source object
	 * @returns { Object } the resulting extended object
	 *
	 * var obj = { foo: 'baz' }
	 * extend(obj, {bar: 'bar', foo: 'bar'})
	 * console.log(obj) => {bar: 'bar', foo: 'bar'}
	 *
	 */
	function extend(src) {
	  var obj, args = arguments
	  for (var i = 1; i < args.length; ++i) {
	    if (obj = args[i]) {
	      for (var key in obj) {
	        // check if this property of the source object could be overridden
	        if (isWritable(src, key))
	          src[key] = obj[key]
	      }
	    }
	  }
	  return src
	}
	
	/**
	 * Check whether an array contains an item
	 * @param   { Array } arr - target array
	 * @param   { * } item - item to test
	 * @returns { Boolean } Does 'arr' contain 'item'?
	 */
	function contains(arr, item) {
	  return ~arr.indexOf(item)
	}
	
	/**
	 * Check whether an object is a kind of array
	 * @param   { * } a - anything
	 * @returns {Boolean} is 'a' an array?
	 */
	function isArray(a) { return Array.isArray(a) || a instanceof Array }
	
	/**
	 * Detect whether a property of an object could be overridden
	 * @param   { Object }  obj - source object
	 * @param   { String }  key - object property
	 * @returns { Boolean } is this property writable?
	 */
	function isWritable(obj, key) {
	  var props = Object.getOwnPropertyDescriptor(obj, key)
	  return typeof obj[key] === T_UNDEF || props && props.writable
	}
	
	
	/**
	 * With this function we avoid that the internal Tag methods get overridden
	 * @param   { Object } data - options we want to use to extend the tag instance
	 * @returns { Object } clean object without containing the riot internal reserved words
	 */
	function cleanUpData(data) {
	  if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION)) return data
	
	  var o = {}
	  for (var key in data) {
	    if (!contains(RESERVED_WORDS_BLACKLIST, key))
	      o[key] = data[key]
	  }
	  return o
	}
	
	/**
	 * Walk down recursively all the children tags starting dom node
	 * @param   { Object }   dom - starting node where we will start the recursion
	 * @param   { Function } fn - callback to transform the child node just found
	 */
	function walk(dom, fn) {
	  if (dom) {
	    // stop the recursion
	    if (fn(dom) === false) return
	    else {
	      dom = dom.firstChild
	
	      while (dom) {
	        walk(dom, fn)
	        dom = dom.nextSibling
	      }
	    }
	  }
	}
	
	/**
	 * Minimize risk: only zero or one _space_ between attr & value
	 * @param   { String }   html - html string we want to parse
	 * @param   { Function } fn - callback function to apply on any attribute found
	 */
	function walkAttributes(html, fn) {
	  var m,
	    re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g
	
	  while (m = re.exec(html)) {
	    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
	  }
	}
	
	/**
	 * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
	 * @param   { Object }  dom - DOM node we want to parse
	 * @returns { Boolean } -
	 */
	function isInStub(dom) {
	  while (dom) {
	    if (dom.inStub) return true
	    dom = dom.parentNode
	  }
	  return false
	}
	
	/**
	 * Create a generic DOM node
	 * @param   { String } name - name of the DOM node we want to create
	 * @returns { Object } DOM node just created
	 */
	function mkEl(name) {
	  return document.createElement(name)
	}
	
	/**
	 * Replace the yield tag from any tag template with the innerHTML of the
	 * original tag in the page
	 * @param   { String } tmpl - tag implementation template
	 * @param   { String } innerHTML - original content of the tag in the DOM
	 * @returns { String } tag template updated without the yield tag
	 */
	function replaceYield(tmpl, innerHTML) {
	  return tmpl.replace(/<yield\s*(?:\/>|>\s*<\/yield\s*>)/gi, innerHTML || '')
	}
	
	/**
	 * Shorter and fast way to select multiple nodes in the DOM
	 * @param   { String } selector - DOM selector
	 * @param   { Object } ctx - DOM node where the targets of our search will is located
	 * @returns { Object } dom nodes found
	 */
	function $$(selector, ctx) {
	  return (ctx || document).querySelectorAll(selector)
	}
	
	/**
	 * Shorter and fast way to select a single node in the DOM
	 * @param   { String } selector - unique dom selector
	 * @param   { Object } ctx - DOM node where the target of our search will is located
	 * @returns { Object } dom node found
	 */
	function $(selector, ctx) {
	  return (ctx || document).querySelector(selector)
	}
	
	/**
	 * Simple object prototypal inheritance
	 * @param   { Object } parent - parent object
	 * @returns { Object } child instance
	 */
	function inherit(parent) {
	  function Child() {}
	  Child.prototype = parent
	  return new Child()
	}
	
	/**
	 * Get the name property needed to identify a DOM node in riot
	 * @param   { Object } dom - DOM node we need to parse
	 * @returns { String | undefined } give us back a string to identify this dom node
	 */
	function getNamedKey(dom) {
	  return getAttr(dom, 'id') || getAttr(dom, 'name')
	}
	
	/**
	 * Set the named properties of a tag element
	 * @param { Object } dom - DOM node we need to parse
	 * @param { Object } parent - tag instance where the named dom element will be eventually added
	 * @param { Array } keys - list of all the tag instance properties
	 */
	function setNamed(dom, parent, keys) {
	  // get the key value we want to add to the tag instance
	  var key = getNamedKey(dom),
	    // add the node detected to a tag instance using the named property
	    add = function(value) {
	      // avoid to override the tag properties already set
	      if (contains(keys, key)) return
	      // check whether this value is an array
	      var isArr = isArray(value)
	      // if the key was never set
	      if (!value)
	        // set it once on the tag instance
	        parent[key] = dom
	      // if it was an array and not yet set
	      else if (!isArr || isArr && !contains(value, dom)) {
	        // add the dom node into the array
	        if (isArr)
	          value.push(dom)
	        else
	          parent[key] = [value, dom]
	      }
	    }
	
	  // skip the elements with no named properties
	  if (!key) return
	
	  // check whether this key has been already evaluated
	  if (tmpl.hasExpr(key))
	    // wait the first updated event only once
	    parent.one('updated', function() {
	      key = getNamedKey(dom)
	      add(parent[key])
	    })
	  else
	    add(parent[key])
	
	}
	
	/**
	 * Faster String startsWith alternative
	 * @param   { String } src - source string
	 * @param   { String } str - test string
	 * @returns { Boolean } -
	 */
	function startsWith(src, str) {
	  return src.slice(0, str.length) === str
	}
	
	/**
	 * Function needed to inject in runtime the custom tags css
	 */
	var injectStyle = (function() {
	
	  if (!window) return // skip injection on the server
	
	  // create the style node
	  var styleNode = mkEl('style'),
	    placeholder = $('style[type=riot]')
	
	  setAttr(styleNode, 'type', 'text/css')
	
	  // inject the new node into the DOM -- in head
	  if (placeholder) {
	    placeholder.parentNode.replaceChild(styleNode, placeholder)
	    placeholder = null
	  }
	  else document.getElementsByTagName('head')[0].appendChild(styleNode)
	
	  /**
	   * This is the function exported that will be used to update the style tag just created
	   * innerHTML seems slow: http://jsperf.com/riot-insert-style
	   * @param   { String } css [description]
	   */
	  return styleNode.styleSheet ?
	    function (css) { styleNode.styleSheet.cssText += css } :
	    function (css) { styleNode.innerHTML += css }
	
	})()
	
	/**
	 * Mount a tag creating new Tag instance
	 * @param   { Object } root - dom node where the tag will be mounted
	 * @param   { String } tagName - name of the riot tag we want to mount
	 * @param   { Object } opts - options to pass to the Tag instance
	 * @returns { Tag } a new Tag instance
	 */
	function mountTo(root, tagName, opts) {
	  var tag = __tagImpl[tagName],
	    // cache the inner HTML to fix #855
	    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML
	
	  // clear the inner html
	  root.innerHTML = ''
	
	  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)
	
	  if (tag && tag.mount) {
	    tag.mount()
	    // add this tag to the virtualDom variable
	    if (!contains(__virtualDom, tag)) __virtualDom.push(tag)
	  }
	
	  return tag
	}
	/**
	 * Riot public api
	 */
	
	// share methods for other riot parts, e.g. compiler
	riot.util = { brackets: brackets, tmpl: tmpl }
	
	/**
	 * Create a mixin that could be globally shared across all the tags
	 */
	riot.mixin = (function() {
	  var mixins = {}
	
	  /**
	   * Create/Return a mixin by its name
	   * @param   { String } name - mixin name
	   * @param   { Object } mixin - mixin logic
	   * @returns { Object } the mixin logic
	   */
	  return function(name, mixin) {
	    if (!mixin) return mixins[name]
	    mixins[name] = mixin
	  }
	
	})()
	
	/**
	 * Create a new riot tag implementation
	 * @param   { String }   name - name/id of the new riot tag
	 * @param   { String }   html - tag template
	 * @param   { String }   css - custom tag css
	 * @param   { String }   attrs - root tag attributes
	 * @param   { Function } fn - user function
	 * @returns { String } name/id of the tag just created
	 */
	riot.tag = function(name, html, css, attrs, fn) {
	  if (isFunction(attrs)) {
	    fn = attrs
	    if (/^[\w\-]+\s?=/.test(css)) {
	      attrs = css
	      css = ''
	    } else attrs = ''
	  }
	  if (css) {
	    if (isFunction(css)) fn = css
	    else if (injectStyle) injectStyle(css)
	  }
	  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
	  return name
	}
	
	/**
	 * Create a new riot tag implementation (for use by the compiler)
	 * @param   { String }   name - name/id of the new riot tag
	 * @param   { String }   html - tag template
	 * @param   { String }   css - custom tag css
	 * @param   { String }   attrs - root tag attributes
	 * @param   { Function } fn - user function
	 * @param   { string }  [bpair] - brackets used in the compilation
	 * @returns { String } name/id of the tag just created
	 */
	riot.tag2 = function(name, html, css, attrs, fn, bpair) {
	  if (css && injectStyle) injectStyle(css)
	  //if (bpair) riot.settings.brackets = bpair
	  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
	  return name
	}
	
	/**
	 * Mount a tag using a specific tag implementation
	 * @param   { String } selector - tag DOM selector
	 * @param   { String } tagName - tag implementation name
	 * @param   { Object } opts - tag logic
	 * @returns { Array } new tags instances
	 */
	riot.mount = function(selector, tagName, opts) {
	
	  var els,
	    allTags,
	    tags = []
	
	  // helper functions
	
	  function addRiotTags(arr) {
	    var list = ''
	    each(arr, function (e) {
	      list += ', *[' + RIOT_TAG + '="' + e.trim() + '"]'
	    })
	    return list
	  }
	
	  function selectAllTags() {
	    var keys = Object.keys(__tagImpl)
	    return keys + addRiotTags(keys)
	  }
	
	  function pushTags(root) {
	    var last
	
	    if (root.tagName) {
	      if (tagName && (!(last = getAttr(root, RIOT_TAG)) || last != tagName))
	        setAttr(root, RIOT_TAG, tagName)
	
	      var tag = mountTo(root, tagName || root.getAttribute(RIOT_TAG) || root.tagName.toLowerCase(), opts)
	
	      if (tag) tags.push(tag)
	    } else if (root.length)
	      each(root, pushTags)   // assume nodeList
	
	  }
	
	  // ----- mount code -----
	
	  if (typeof tagName === T_OBJECT) {
	    opts = tagName
	    tagName = 0
	  }
	
	  // crawl the DOM to find the tag
	  if (typeof selector === T_STRING) {
	    if (selector === '*')
	      // select all the tags registered
	      // and also the tags found with the riot-tag attribute set
	      selector = allTags = selectAllTags()
	    else
	      // or just the ones named like the selector
	      selector += addRiotTags(selector.split(','))
	
	    // make sure to pass always a selector
	    // to the querySelectorAll function
	    els = selector ? $$(selector) : []
	  }
	  else
	    // probably you have passed already a tag or a NodeList
	    els = selector
	
	  // select all the registered and mount them inside their root elements
	  if (tagName === '*') {
	    // get all custom tags
	    tagName = allTags || selectAllTags()
	    // if the root els it's just a single tag
	    if (els.tagName)
	      els = $$(tagName, els)
	    else {
	      // select all the children for all the different root elements
	      var nodeList = []
	      each(els, function (_el) {
	        nodeList.push($$(tagName, _el))
	      })
	      els = nodeList
	    }
	    // get rid of the tagName
	    tagName = 0
	  }
	
	  if (els.tagName)
	    pushTags(els)
	  else
	    each(els, pushTags)
	
	  return tags
	}
	
	/**
	 * Update all the tags instances created
	 * @returns { Array } all the tags instances
	 */
	riot.update = function() {
	  return each(__virtualDom, function(tag) {
	    tag.update()
	  })
	}
	
	/**
	 * Export the Tag constructor
	 */
	riot.Tag = Tag
	  // support CommonJS, AMD & browser
	  /* istanbul ignore next */
	  if (typeof exports === T_OBJECT)
	    module.exports = riot
	  else if (true)
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return (window.riot = riot) }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  else
	    window.riot = riot
	
	})(typeof window != 'undefined' ? window : void 0);


/***/ },
/* 2 */
/*!*********************!*\
  !*** ./src/app.tag ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(/*! ./components/qapp.tag */ 3);
	
	__webpack_require__(/*! yo/lib/core/reset.scss */ 27);
	
	riot.tag2('app', '<qapp title="hy-transparent" style="transform:scale(.9) translateY(0);transition: all .5s;"></qapp> <qapp title="hy-none" style="transform:scale(.93) translateY(80px);transition: all .5s;"></qapp> <qapp title="hy-normal" style="transform:scale(.96) translateY(160px);transition: all .5s;"></qapp> <qapp title="webVC" style="transform:scale(1) translateY(240px);transition: all .5s;"></qapp>', 'app,[riot-tag="app"]{ width: 6rem; height: 6rem; }', '', function (opts) {});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! riot */ 1)))

/***/ },
/* 3 */
/*!*********************************!*\
  !*** ./src/components/qapp.tag ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(/*! ./header/header.tag */ 4);
	
	__webpack_require__(/*! ./loading/loading.tag */ 9);
	
	__webpack_require__(/*! ./qrcode/qrcode.tag */ 14);
	
	__webpack_require__(/*! ./list/list.tag */ 15);
	
	__webpack_require__(/*! riot */ 1);
	
	var _webview = __webpack_require__(/*! ./webview.js */ 23);
	
	__webpack_require__(/*! yo/lib/fragment/yo-list.scss */ 25);
	
	riot.tag2('qapp', '<yo-header></yo-header> <camel-loading if="{!show}" onclick="{chosen}"></camel-loading> <qrcode if="{show}" img="{qrcode}"></qrcode> <yo-list if="{show}" class="yo-list"></yo-list>', 'qapp,[riot-tag="qapp"]{ overflow: hidden; position: relative; }', '', function (opts) {
	    var _this = this;
	
	    var root = this.root;
	    var self = this;
	
	    this.title = opts.title;
	    this.extra = null;
	    this.chosen = function () {
	        riot.route(this.title);
	        return true;
	    };
	
	    this.on('hide', function () {
	        root.style.opacity = 0;
	
	        setTimeout(function () {
	            self.unmount();
	        }, 1000);
	    });
	    this.on('show', function () {
	        root.style.cssText += 'transform: scale(1) translateY(5%);';
	
	        _this.update({ show: true });
	
	        _this.webview();
	    });
	
	    this.on('toggle', function (e) {
	        _this.webview();
	    });
	
	    this.webview = function () {
	        switch (this.title) {
	            case 'webVC':
	                (0, _webview.webvc)(this);
	                break;
	            case 'hy-normal':
	                (0, _webview.normal)(this);
	                break;
	            case 'hy-transparent':
	                (0, _webview.transparent)(this);
	                break;
	            case 'hy-none':
	                (0, _webview.none)(this);
	                break;
	            default:
	        }
	    };
	}, '{ }');
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! riot */ 1)))

/***/ },
/* 4 */
/*!******************************************!*\
  !*** ./src/components/header/header.tag ***!
  \******************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(/*! yo/lib/fragment/yo-header.scss */ 5);
	
	riot.tag2('yo-header', '<h2 class="title">{title}</h2> <span class="regret yo-ico">{left}</span> <span class="affirm yo-ico"></span>', 'yo-header,[riot-tag="yo-header"] { display: block; border-top-left-radius: 3px; border-top-right-radius: 3px; } yo-header .title,[riot-tag="yo-header"] .title{ font-weight: normal; } yo-header.hy-transparent,[riot-tag="yo-header"].hy-transparent{ border-color: transparent; background-color: transparent; color: #212121; } yo-header.hy-transparent > .regret::before,[riot-tag="yo-header"].hy-transparent > .regret::before { content: \'\'; width: .25rem; height: .25rem; position: absolute; border: 1px solid #7cd; background-color: rgba(27,169,186,.4); border-radius: 50%; top: .09rem; left: .13rem; } yo-header.hy-none,[riot-tag="yo-header"].hy-none{ border-color: transparent; background-color: transparent; color: #212121; } yo-header.hy-none > .regret,[riot-tag="yo-header"].hy-none > .regret { display: none; } yo-header.hy-none > .affirm,[riot-tag="yo-header"].hy-none > .affirm { display: none; }', 'class="yo-header {title}"', function (opts) {
	        var title = this.parent.title;
	        var left = '';
	        if (title == 'webVC') {
	                left = '';
	        }
	        this.title = title;
	        this.left = left;
	}, '{ }');
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! riot */ 1)))

/***/ },
/* 5 */
/*!*********************************************************!*\
  !*** ./bower_components/Yo/lib/fragment/yo-header.scss ***!
  \*********************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-header.scss */ 6);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-header.scss */ 6, function() {
				var newContent = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-header.scss */ 6);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 6 */
/*!************************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./bower_components/Yo/lib/fragment/yo-header.scss ***!
  \************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\n * @module fragment\n * @method yo-header\n * @description 构造头的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-header.html\n * @param {String} $name 定义yo-header名称\n * @param {Length} $height 定义yo-header高度\n * @param {Length} $item-width 定义yo-header两侧子项宽度\n * @param {Length} $item-space 定义yo-header两侧子项离边界的间隙\n * @param {Color} $bordercolor 定义yo-header边框色\n * @param {Color} $bgcolor 定义yo-header背景色\n * @param {Color} $color 定义yo-header文本色\n * @param {Length} $font-size 定义yo-header文本大小\n * @param {Color} $item-color 定义yo-header两侧的子项文本色\n * @param {Color} $item-ico-color 定义yo-header两侧的ico色\n * @param {Length} $item-font-size 定义yo-header两侧的子项文本大小\n * @param {Length} $item-ico-size 定义yo-header两侧的ico大小\n */\n.yo-header {\n  position: relative;\n  height: 0.44rem;\n  line-height: 0.44rem;\n  border-bottom: 1px solid #1ba9ba;\n  background-color: #1ba9ba;\n  color: #fff;\n  font-size: 0.18rem;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  text-align: center; }\n  .yo-header > .title {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    margin: 0 0.6rem; }\n  .yo-header > .regret,\n  .yo-header > .affirm {\n    position: absolute;\n    top: 0;\n    width: 0.6rem;\n    cursor: pointer;\n    font-size: 0.14rem; }\n    .yo-header > .regret:active,\n    .yo-header > .affirm:active {\n      opacity: .5; }\n    .yo-header > .regret.yo-ico,\n    .yo-header > .regret > .yo-ico,\n    .yo-header > .affirm.yo-ico,\n    .yo-header > .affirm > .yo-ico {\n      color: #7ff;\n      font-size: 0.2rem; }\n  .yo-header > .regret {\n    left: 0;\n    padding-left: 0.15rem;\n    text-align: left; }\n  .yo-header > .affirm {\n    right: 0;\n    padding-right: 0.15rem;\n    text-align: right; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/fragment/yo-header.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/fragment/yo-header.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AC/0BH;;;;;;;;;;;;;;;;;GAiBG;AAgHH;EAvLI,mBAAmB;EACnB,gBFkXsB;EEjXtB,qBFiXsB;EEhXtB,iCFsXuB;EErXvB,0BFuXuB;EEpXnB,YFsXgB;EElXhB,mBFoXkB;EC0ftB,iBAAiB;EACjB,oBAAoB;EAEhB,wBAAwB;EC92B5B,mBAAmB,EA2KtB;EAFD;IDksBI,iBAAiB;IACjB,oBAAoB;IAEhB,wBAAwB;IC32BxB,iBFoWiB,EEnWpB;EAqKL;;IAlKQ,mBAAmB;IACnB,OAAO;IACP,cF8ViB;IEzVjB,gBAAgB;IAMZ,mBFmWc,EE5VrB;IA8IL;;MAzJY,YAAY,EACf;IAwJT;;;;MAjJY,YF6VY;ME5VZ,kBFgWa,EE/VhB;EA+IT;IA5IQ,QAAQ;IACR,sBF2UkB;IE1UlB,iBAAiB,EACpB;EAyIL;IAvIQ,SAAS;IACT,uBFsUkB;IErUlB,kBAAkB,EACrB","file":"yo-header.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\n * @module fragment\n * @method yo-header\n * @description 构造头的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-header.html\n * @param {String} $name 定义yo-header名称\n * @param {Length} $height 定义yo-header高度\n * @param {Length} $item-width 定义yo-header两侧子项宽度\n * @param {Length} $item-space 定义yo-header两侧子项离边界的间隙\n * @param {Color} $bordercolor 定义yo-header边框色\n * @param {Color} $bgcolor 定义yo-header背景色\n * @param {Color} $color 定义yo-header文本色\n * @param {Length} $font-size 定义yo-header文本大小\n * @param {Color} $item-color 定义yo-header两侧的子项文本色\n * @param {Color} $item-ico-color 定义yo-header两侧的ico色\n * @param {Length} $item-font-size 定义yo-header两侧的子项文本大小\n * @param {Length} $item-ico-size 定义yo-header两侧的ico大小\n */\n.yo-header {\n  position: relative;\n  height: 0.44rem;\n  line-height: 0.44rem;\n  border-bottom: 1px solid #1ba9ba;\n  background-color: #1ba9ba;\n  color: #fff;\n  font-size: 0.18rem;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  text-align: center; }\n  .yo-header > .title {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    margin: 0 0.6rem; }\n  .yo-header > .regret,\n  .yo-header > .affirm {\n    position: absolute;\n    top: 0;\n    width: 0.6rem;\n    cursor: pointer;\n    font-size: 0.14rem; }\n    .yo-header > .regret:active,\n    .yo-header > .affirm:active {\n      opacity: .5; }\n    .yo-header > .regret.yo-ico,\n    .yo-header > .regret > .yo-ico,\n    .yo-header > .affirm.yo-ico,\n    .yo-header > .affirm > .yo-ico {\n      color: #7ff;\n      font-size: 0.2rem; }\n  .yo-header > .regret {\n    left: 0;\n    padding-left: 0.15rem;\n    text-align: left; }\n  .yo-header > .affirm {\n    right: 0;\n    padding-right: 0.15rem;\n    text-align: right; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\n@import \"../core/variables\";\n@import \"../core/classes\";\n\n// 定义header的基础构造\n@mixin _header {\n    position: relative;\n    height: map-get($header, height);\n    line-height: map-get($header, height);\n    border-bottom: 1px solid map-get($header, bordercolor);\n    background-color: map-get($header, bgcolor);\n    // 如果config预设值不等于base color，则重绘color\n    @if map-get($header, color) != map-get($base, color) {\n        color: map-get($header, color);\n    }\n    // 如果config预设值不等于base font-size，则重绘font-size\n    @if map-get($header, font-size) != map-get($base, font-size) {\n        font-size: map-get($header, font-size);\n    }\n    @include ellipsis;\n    text-align: center;\n    > .title {\n        @include ellipsis;\n        margin: 0 map-get($header, item-width);\n    }\n    > .regret,\n    > .affirm {\n        position: absolute;\n        top: 0;\n        width: map-get($header, item-width);\n        // 如果config预设值不等于parent color，则重绘子项的color\n        @if map-get($header, item-color) != map-get($header, color) {\n            color: map-get($header, item-color);\n        }\n        cursor: pointer;\n        &:active {\n            opacity: .5;\n        }\n        // 如果config预设值不等于parent font-size，则重绘子项的font-size\n        @if map-get($header, item-font-size) != map-get($header, font-size) {\n            font-size: map-get($header, item-font-size);\n        }\n        &.yo-ico,\n        > .yo-ico {\n            color: map-get($header, item-ico-color);\n            font-size: map-get($header, item-ico-size);\n        }\n    }\n    > .regret {\n        left: 0;\n        padding-left: map-get($header, item-space);\n        text-align: left;\n    }\n    > .affirm {\n        right: 0;\n        padding-right: map-get($header, item-space);\n        text-align: right;\n    }\n}\n\n/**\n * @module fragment\n * @method yo-header\n * @description 构造头的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-header.html\n * @param {String} $name 定义yo-header名称\n * @param {Length} $height 定义yo-header高度\n * @param {Length} $item-width 定义yo-header两侧子项宽度\n * @param {Length} $item-space 定义yo-header两侧子项离边界的间隙\n * @param {Color} $bordercolor 定义yo-header边框色\n * @param {Color} $bgcolor 定义yo-header背景色\n * @param {Color} $color 定义yo-header文本色\n * @param {Length} $font-size 定义yo-header文本大小\n * @param {Color} $item-color 定义yo-header两侧的子项文本色\n * @param {Color} $item-ico-color 定义yo-header两侧的ico色\n * @param {Length} $item-font-size 定义yo-header两侧的子项文本大小\n * @param {Length} $item-ico-size 定义yo-header两侧的ico大小\n */\n\n@mixin yo-header(\n    $name: default,\n    $height: default,\n    $item-width: default,\n    $item-space: default,\n    $bordercolor: default,\n    $bgcolor: default,\n    $color: default,\n    $font-size: default,\n    $item-color: default,\n    $item-ico-color: default,\n    $item-font-size: default,\n    $item-ico-size: default) {\n    // 区别是否新增实例还是修改本身\n    @if $name == default {\n        $name: \"\";\n    } @else {\n        $name: \"-#{$name}\";\n    }\n    // 如果值为default，则取config的定义\n    @if $height == default {\n        $height: map-get($header, height);\n    }\n    @if $item-width == default {\n        $item-width: map-get($header, item-width);\n    }\n    @if $item-space == default {\n        $item-space: map-get($header, item-space);\n    }\n    @if $bordercolor == default {\n        $bordercolor: map-get($header, bordercolor);\n    }\n    @if $bgcolor == default {\n        $bgcolor: map-get($header, bgcolor);\n    }\n    @if $color == default {\n        $color: map-get($header, color);\n    }\n    @if $font-size == default {\n        $font-size: map-get($header, font-size);\n    }\n    @if $item-color == default {\n        $item-color: map-get($header, item-color);\n    }\n    @if $item-ico-color == default {\n        $item-ico-color: map-get($header, item-ico-color);\n    }\n    @if $item-font-size == default {\n        $item-font-size: map-get($header, item-font-size);\n    }\n    @if $item-ico-size == default {\n        $item-ico-size: map-get($header, item-ico-size);\n    }\n    .yo-header#{$name} {\n        @if $height != map-get($header, height) {\n            height: $height;\n            line-height: $height;\n        }\n        @if $bordercolor != map-get($header, bordercolor) {\n            border-color: $bordercolor;\n        }\n        @if $bgcolor != map-get($header, bgcolor) {\n            background-color: $bgcolor;\n        }\n        @if $color != map-get($header, color) {\n            color: $color;\n        }\n        @if $font-size != map-get($header, font-size) {\n            font-size: $font-size;\n        }\n        > .title {\n            @if $item-width != map-get($header, item-width) {\n                margin: 0 $item-width;\n            }\n        }\n        > .regret,\n        > .affirm {\n            @if $item-width != map-get($header, item-width) {\n                width: $item-width;\n            }\n            @if $item-color != map-get($header, item-color) {\n                color: $item-color;\n            }\n            @if $item-font-size != map-get($header, item-font-size) {\n                font-size: $item-font-size;\n            }\n            &.yo-ico,\n            > .yo-ico {\n                @if $item-ico-color != map-get($header, item-ico-color) {\n                    color: $item-ico-color;\n                }\n                @if $item-ico-size != map-get($header, item-ico-size) {\n                    font-size: $item-ico-size;\n                }\n            }\n        }\n        @if $item-space != map-get($header, item-space) {\n            > .regret {\n                    padding-left: $item-space;\n            }\n            > .affirm {\n                    padding-right: $item-space;\n            }\n        }\n        // 增量扩展\n        @content;\n    }\n}\n\n// 调用本文件时载入header基础构造\n.yo-header {\n    @include _header;\n}"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 7 */
/*!**************************************!*\
  !*** ./~/css-loader/lib/css-base.js ***!
  \**************************************/
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 8 */
/*!*************************************!*\
  !*** ./~/style-loader/addStyles.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 9 */
/*!********************************************!*\
  !*** ./src/components/loading/loading.tag ***!
  \********************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(/*! yo/lib/element/yo-loading.scss */ 10);
	
	__webpack_require__(/*! ./loading.scss */ 12);
	
	riot.tag2('camel-loading', '<svg style="display:none;"> <g id="camel-loading-svg"> <rect x="0" y="0" rx="1" ry="1" width="50" height="25" style="fill:#fafafa"></rect> <g transform="translate(-7 40)" style="fill:#1ba9ba;fill-opacity:0.6;"> <g transform="rotate(0 32 0)"> <path id="camel-bg-svg" d="m 52.537273,0.46644091 c -0.03218,-0.05608 -0.06993,-0.588419 -0.08387,-1.182966 -0.10247,-4.36961621 -2.170941,-9.48140391 -5.361663,-13.25021291 -3.925178,-4.636334 -10.353971,-7.708085 -16.232091,-7.755877 -0.625374,-0.0051 -0.849769,-0.05608 -0.849769,-0.19312 0,-0.141505 0.204009,-0.177813 0.849769,-0.151238 3.184772,0.13106 6.086623,0.842374 8.929584,2.188854 7.537239,3.56978 12.352882,10.6800607 12.996216,19.18887391 0.06397,0.846084 0.0485,1.257658 -0.04728,1.257658 -0.07831,0 -0.168708,-0.04588 -0.200893,-0.101972 z m 2.353842,-0.214388 c 0,-0.277036 -0.05285,-0.308602 -0.42521,-0.253952 -0.319206,0.04685 -0.409771,0.01555 -0.363279,-0.12552 0.03831,-0.116266 0.420812,-0.240064 1.003054,-0.324651 0.886282,-0.128755 0.943633,-0.158511 0.984217,-0.510633 0.02808,-0.24365401 -0.03112,-0.40239401 -0.169953,-0.45566701 -0.117178,-0.04496 -0.213051,-0.166985 -0.213051,-0.271154 0,-0.104168 -0.122366,-0.189397 -0.271926,-0.189397 -0.47398,0 -0.293293,-0.196739 0.374613,-0.40789 0.560051,-0.177053 0.667361,-0.272097 0.813858,-0.720836 0.134354,-0.411542 0.134354,-0.559011 0,-0.723551 -0.495181,-0.6064332 -0.689055,-0.7511172 -0.924116,-0.6896472 -0.139896,0.03658 -0.325281,-0.01894 -0.411967,-0.123391 -0.08668,-0.104451 -0.287781,-0.1949 -0.446877,-0.201 -0.234745,-0.009 -0.20794,-0.04672 0.142202,-0.200088 0.52689,-0.230792 0.632766,-0.386114 0.515358,-0.756037 -0.07589,-0.239114 -0.159345,-0.270067 -0.518638,-0.192368 -1.481174,0.320311 -1.65186,0.320882 -1.65186,0.0055 0,-0.274062 0.44805,-0.476421 1.95083,-0.881077 0.581927,-0.156696 0.589802,-0.166648 0.502047,-0.634418 -0.139175,-0.741865 -0.964787,-2.8126227 -1.651535,-4.1422947 -0.588361,-1.139174 -0.644802,-1.203542 -0.984664,-1.122964 -0.198292,0.04701 -0.452305,0.160543 -0.564475,0.252291 -0.343076,0.280614 -1.441882,0.884368 -1.60951,0.884368 -0.290105,0 -0.162609,-0.253834 0.249881,-0.497498 0.224339,-0.13252 0.408064,-0.334825 0.40828,-0.449567 2.72e-4,-0.11474 0.185679,-0.330987 0.412145,-0.480547 0.332908,-0.219855 0.395894,-0.337014 0.32893,-0.611833 -0.128283,-0.526478 -0.714282,-1.211891 -1.121479,-1.31174 -0.202282,-0.0496 -0.508064,-0.239602 -0.679516,-0.422225 -0.214891,-0.22889 -0.404961,-0.309243 -0.611834,-0.258657 -0.41081,0.100457 -1.233111,-0.629201 -1.117961,-0.992007 0.04462,-0.140579 0.02012,-0.2933 -0.05443,-0.339378 -0.07455,-0.04607 -0.102733,-0.16931 -0.06262,-0.273851 0.120356,-0.313648 -0.355533,-1.137919 -0.824208,-1.427577 -0.275958,-0.170552 -0.724203,-0.282971 -1.209191,-0.303267 -0.423873,-0.01774 -0.771095,-0.065 -0.771606,-0.105024 -5.44e-4,-0.04003 -0.213661,-0.217643 -0.473666,-0.394705 -0.366882,-0.249846 -0.444804,-0.371624 -0.347995,-0.543852 0.08915,-0.158602 0.04686,-0.30506 -0.148212,-0.513303 -0.150126,-0.160258 -0.375505,-0.496766 -0.500845,-0.747796 -0.224563,-0.449751 -1.194376,-1.074431 -1.650322,-1.063013 -0.115019,0.0029 -0.332758,0.201727 -0.483862,0.44188 -0.151105,0.240153 -0.355766,0.436643 -0.454802,0.436643 -0.09904,0 -0.281638,0.196419 -0.405782,0.436486 -0.134202,0.25952 -0.287215,0.39733 -0.377404,0.339908 -0.100896,-0.06423 0.295339,-1.029878 1.183323,-2.883815 1.200197,-2.505771 1.371383,-2.791715 1.695174,-2.831537 0.324703,-0.03993 0.35239,-0.08678 0.281228,-0.475871 -0.04341,-0.237365 -0.02626,-0.514826 0.03812,-0.61658 0.06438,-0.101752 0.08793,-0.296364 0.05233,-0.432471 -0.08485,-0.324462 -0.429494,-0.190936 -0.588822,0.228131 -0.07126,0.187417 -0.233581,0.321364 -0.38945,0.321364 -0.368671,0 -0.482507,0.239641 -0.287193,0.604588 0.185593,0.346783 0.07458,0.602752 -1.673523,3.858506 -0.961477,1.790742 -0.977553,1.810898 -1.381223,1.731713 -0.224633,-0.04406 -0.475657,-0.170117 -0.557831,-0.280117 -0.08217,-0.11 -0.185145,-0.164261 -0.228826,-0.12058 -0.131936,0.131937 -1.049379,-0.227925 -1.049379,-0.411612 0,-0.094 0.244734,-0.772394 0.543852,-1.507535 0.299119,-0.73514 0.543852,-1.410627 0.543852,-1.501084 0,-0.165422 -0.585155,-0.334417 -1.157941,-0.334417 -0.223871,0 -0.332633,0.102282 -0.397587,0.373898 -0.33097,1.383993 -0.785292,2.617289 -0.964158,2.617289 -0.237691,0 -0.242848,-0.06141 -0.05717,-0.680713 0.202201,-0.674394 0.307689,-1.464829 0.290201,-2.174511 -0.01753,-0.71141 -0.373887,-1.112429 -0.873993,-0.983529 -0.431926,0.111326 -0.601685,0.392626 -0.778108,1.289367 -0.0846,0.430027 -0.207672,0.781866 -0.273487,0.781866 -0.06582,0 -0.139216,0.137663 -0.163112,0.305917 -0.03182,0.224084 -0.134373,0.305917 -0.383355,0.305917 -0.26824,0 -0.327905,-0.05734 -0.282983,-0.271926 0.133763,-0.638986 0.0773,-1.631208 -0.09091,-1.597566 -0.09348,0.01869 -0.169954,-0.02719 -0.169954,-0.101972 0,-0.07478 -0.146326,-0.135963 -0.325168,-0.135963 -0.349395,0 -0.398668,0.109819 -0.564272,1.257658 -0.05125,0.355203 -0.148928,0.645824 -0.217067,0.645824 -0.06814,0 -0.182045,0.152959 -0.253123,0.339908 -0.07108,0.186949 -0.230405,0.339908 -0.354059,0.339908 -0.227646,0 -0.220716,-0.430047 0.02976,-1.846737 0.05999,-0.339308 0.01136,-0.460235 -0.255358,-0.634997 -0.268427,-0.175879 -0.39008,-0.18579 -0.656687,-0.0535 -0.268799,0.133375 -0.334855,0.282704 -0.369948,0.836311 -0.0235,0.370671 -0.115272,0.720078 -0.203945,0.776464 -0.235305,0.149625 -0.773057,0.129258 -0.773057,-0.02928 0,-0.07478 0.145174,-0.135963 0.322609,-0.135963 0.289368,0 0.329598,-0.07273 0.390436,-0.70589 0.05306,-0.552219 0.145624,-0.767923 0.425188,-0.990839 0.196548,-0.156723 0.35736,-0.35913 0.35736,-0.449795 0,-0.256467 0.244395,-0.193856 0.332999,0.08531 0.04367,0.137586 0.228229,0.329809 0.410135,0.427163 0.313839,0.167961 0.326481,0.222917 0.247404,1.075483 -0.07436,0.80168 -0.0606,0.879728 0.12772,0.724454 0.116868,-0.09636 0.253715,-0.515441 0.306643,-0.939065 0.156134,-1.249657 0.205425,-1.28087 1.324553,-0.838774 0.363362,0.143542 0.369012,0.163878 0.310341,1.117014 -0.04584,0.744747 -0.02755,0.892552 0.07855,0.634741 0.07607,-0.184838 0.187136,-0.368388 0.246809,-0.407889 0.05967,-0.0395 0.195759,-0.43892 0.302412,-0.887598 0.173529,-0.730013 0.247176,-0.84197 0.700509,-1.064912 0.278626,-0.137022 0.506593,-0.335869 0.506593,-0.44188 0,-0.10601 0.06118,-0.192746 0.135963,-0.192746 0.07478,0 0.135963,0.13824 0.135963,0.307201 0,0.168962 0.113771,0.378255 0.252825,0.465096 0.149103,0.09312 0.292418,0.399376 0.349331,0.74651 l 0.09651,0.58862 0.207163,-0.389738 c 0.196991,-0.370602 0.239983,-0.385383 0.875608,-0.301065 1.2975,0.17212 1.266982,0.07612 0.586796,1.845916 -0.33039,0.859652 -0.600709,1.57201 -0.600709,1.583019 0,0.01101 0.09495,0.05645 0.211006,0.100988 0.127248,0.04883 0.176137,0.02455 0.123164,-0.06116 -0.140891,-0.227965 0.06014,-0.806493 0.280254,-0.806493 0.110745,0 0.194109,-0.04589 0.185253,-0.101973 -0.06389,-0.404597 0.04488,-0.577843 0.362761,-0.577843 0.456902,0 1.148934,0.364777 1.148934,0.605614 0,0.104908 -0.09007,0.280811 -0.200154,0.390895 -0.158978,0.158977 -0.165085,0.229259 -0.02969,0.34163 0.129956,0.107853 0.419729,-0.319169 1.219317,-1.796834 1.028526,-1.900751 1.166591,-2.307051 0.982232,-2.890538 -0.07213,-0.228279 0.01221,-0.369278 0.395934,-0.66196 0.26817,-0.204544 0.487582,-0.449275 0.487582,-0.543848 0,-0.09457 0.107619,-0.200093 0.239154,-0.23449 0.144405,-0.03776 0.550957,-0.698658 1.026173,-1.668156 0.54747,-1.116906 0.830282,-1.562353 0.929156,-1.463479 0.09887,0.09887 -0.06504,0.612139 -0.538532,1.686289 -0.46939,1.064852 -0.670284,1.691862 -0.647216,2.020024 0.0184,0.261728 9.49e-4,0.535518 -0.03869,0.608423 -0.03969,0.0729 -0.07533,0.281713 -0.07922,0.46402 -0.0048,0.224407 -0.13881,0.40292 -0.414956,0.552693 -0.321762,0.174514 -0.616869,0.648435 -1.397604,2.24446 -0.588522,1.203093 -0.939974,2.072974 -0.867009,2.14594 0.07296,0.07297 0.244418,-0.07423 0.422961,-0.363118 0.318556,-0.515436 0.581598,-0.589495 1.159127,-0.326356 0.267721,0.121982 0.38748,0.121982 0.509462,0 0.245357,-0.245358 0.404814,-0.189344 0.310141,0.108944 -0.06164,0.194222 0.04857,0.402167 0.398727,0.752329 0.266155,0.266154 0.485863,0.558357 0.488242,0.649338 0.0024,0.09098 0.08768,0.275336 0.189563,0.409677 0.101881,0.13434 0.155342,0.358581 0.118801,0.498314 -0.09315,0.356221 0.412111,0.648677 1.318868,0.763387 0.411288,0.05203 0.908763,0.175856 1.105499,0.27517 0.58092,0.293253 1.06991,0.97168 1.06991,1.484395 0,0.251578 0.06281,0.496232 0.139568,0.543673 0.07677,0.04744 0.124529,0.158124 0.106145,0.24596 -0.01838,0.08783 0.0771,0.325358 0.212195,0.527828 0.196216,0.294086 0.31997,0.353258 0.615278,0.294197 0.236603,-0.04732 0.429887,-0.0014 0.536994,0.127697 0.09204,0.110897 0.287454,0.170217 0.434265,0.131825 0.168721,-0.04412 0.267545,-0.0015 0.268609,0.11601 0.0027,0.292479 0.873793,0.792131 1.222221,0.701014 0.308808,-0.08075 0.313212,-1.34e-4 0.03982,0.728703 -0.03223,0.08591 0.0067,0.196591 0.08664,0.245959 0.07988,0.04937 0.145232,0.212124 0.145232,0.361683 0,0.14956 0.06162,0.233846 0.136923,0.187303 0.07531,-0.04654 0.174228,0.01259 0.219824,0.13141 0.06061,0.157946 0.129566,0.177303 0.256464,0.07198 0.131901,-0.109468 0.274235,0.01956 0.592929,0.537507 0.230651,0.374854 0.507529,0.89256 0.615286,1.150459 0.161814,0.387276 0.249177,0.45498 0.50183,0.388911 0.244984,-0.06407 0.288651,-0.03503 0.219261,0.145801 -0.06597,0.171925 -0.0084,0.2258 0.240969,0.2258 0.180189,0 0.369465,-0.06771 0.420616,-0.150479 0.06483,-0.104899 0.128405,-0.0946 0.209888,0.034 0.176311,0.278256 0.144232,0.524377 -0.06835,0.524377 -0.247653,0 -0.402998,0.4137293 -0.222948,0.5937803 0.205445,0.205444 0.171627,0.357961 -0.07938,0.357961 -0.239237,0 -0.233613,0.05502 0.138969,1.35963 0.246324,0.862519 0.275232,1.275835 0.08083,1.155686 -0.07477,-0.04622 -0.135963,0.02709 -0.135963,0.162909 0,0.206878 -0.09374,0.239697 -0.577843,0.202294 -0.317813,-0.02455 -0.730802,0.01916 -0.91775,0.09714 -0.279416,0.116558 -0.218926,0.129757 0.339907,0.07417 0.545621,-0.05427 0.741566,-0.01455 0.992639,0.201189 0.302406,0.259854 0.305375,0.283208 0.08915,0.701341 -0.226696,0.438377 -0.130288,0.660371 0.289356,0.666295 0.08111,0.0011 0.311024,0.185632 0.510911,0.4099706 0.219978,0.246888 0.497185,0.407888 0.702289,0.407888 0.438317,0 0.436258,0.241626 -0.0034,0.408816 -0.188291,0.07159 -0.404366,0.299511 -0.48017,0.506497 -0.0758,0.206984 -0.293027,0.504336 -0.482723,0.660779 l -0.344901,0.284442 0.376044,0.446902 0.376042,0.446902 -0.436878,0.39035201 c -0.240283,0.214692 -0.58887,0.390349 -0.774641,0.390349 -0.284649,0 -0.337762,0.06414 -0.337762,0.407889 0,0.22434 -0.06119,0.40789 -0.135963,0.40789 -0.07478,0 -0.135963,-0.142362 -0.135963,-0.31636 z M 52.375799,-12.620001 c 0.13535,-0.149559 0.19072,-0.269981 0.123045,-0.267603 -0.158056,0.0056 -0.598915,0.338672 -0.598915,0.452545 0,0.172666 0.234834,0.0814 0.47587,-0.184942 z m -12.168692,-9.3656 c 0,-0.06606 -0.137662,-0.14997 -0.305916,-0.186461 -0.168254,-0.03649 -0.412988,-0.111352 -0.543853,-0.166359 -0.136781,-0.05749 -0.237935,-0.04084 -0.237935,0.03917 0,0.07655 0.168255,0.200631 0.373898,0.275739 0.481766,0.175955 0.713806,0.18828 0.713806,0.03791 z m 12.782848,15.1871817 c 0.0019,-0.256909 0.145879,-0.370653 0.779895,-0.616091 0.513909,-0.198944 0.82328,-0.255303 0.912372,-0.166212 0.208407,0.208407 -0.08161,0.558793 -0.614802,0.742777 -1.097905,0.378844 -1.079961,0.378186 -1.077465,0.03952 z m -0.345399,-0.936898 c -0.06033,-0.190101 -0.0079,-0.347371 0.160791,-0.482911 0.237366,-0.190638 0.234754,-0.196741 -0.05066,-0.118399 -0.250439,0.06874 -0.33598,-0.0014 -0.509861,-0.417455 -0.114914,-0.275028 -0.208936,-0.522141 -0.208936,-0.54914 0,-0.09175 1.3496,-0.7334817 1.542561,-0.7334817 0.105582,0 0.270906,0.1905727 0.367385,0.4234957 0.141893,0.342558 0.142473,0.476249 0.003,0.699527 -0.148134,0.237199 -0.142092,0.264408 0.04294,0.193401 0.242847,-0.09319 0.559863,0.366297 0.414735,0.601122 -0.103466,0.167411 -1.218048,0.665752 -1.489013,0.665752 -0.10093,0 -0.223773,-0.126861 -0.272985,-0.281911 z m 1.412467,-0.470232 c 0.035,-0.035 0.03814,-0.08805 0.007,-0.117883 -0.09439,-0.09039 -1.076374,0.346156 -1.076374,0.478502 0,0.108864 0.905139,-0.196366 1.06939,-0.360619 z m -0.594482,-0.334004 c 0.04763,-0.07707 -0.007,-0.09986 -0.127939,-0.05344 -0.235545,0.09039 -0.278641,0.187841 -0.08307,0.187841 0.07037,0 0.16532,-0.06048 0.211006,-0.134406 z m -0.156786,-0.358458 c 0.34192,-0.16305 0.445844,-0.287732 0.396645,-0.47587 -0.08019,-0.306643 -0.17513,-0.31363 -0.787115,-0.05793 -0.508269,0.212369 -0.512383,0.218076 -0.388976,0.53967 0.103468,0.269632 0.203282,0.26888 0.779446,-0.0059 z m -1.536718,-0.993253 c -0.159891,-0.2987617 -0.143452,-0.3146177 0.810706,-0.7820207 0.517675,-0.253588 0.640852,-0.271136 0.80038,-0.114034 0.361622,0.35612 -0.136647,0.8416287 -1.100856,1.0726667 -0.282972,0.0678 -0.401352,0.02683 -0.51023,-0.176612 z m 1.490522,-0.5862477 c 0,-0.161594 -0.258822,-0.12202 -0.761239,0.116392 -0.671902,0.318839 -0.566806,0.4642127 0.149406,0.206666 0.336507,-0.121007 0.611833,-0.266383 0.611833,-0.323058 z m -1.960118,-0.326448 c -0.04715,-0.122873 -0.06899,-0.232284 -0.04854,-0.243135 1.184832,-0.62855 1.487709,-0.759021 1.600369,-0.689392 0.296848,0.183462 0.10359,0.448231 -0.579397,0.793791 -0.842105,0.426066 -0.861134,0.428781 -0.972434,0.138736 z"></path> <use x="0" y="0" xlink:href="#camel-bg-svg" width="100%" height="100%"></use> <use x="0" y="0" xlink:href="#camel-bg-svg" transform="matrix(-0.99999448,-0.00332237,0.00332237,-0.99999448,61.817607,0.72065512)" width="100%" height="100%"></use> <use x="0" y="0" xlink:href="#camel-bg-svg" transform="matrix(0.02368043,-0.99971957,0.99971957,0.02368043,30.338939,30.637309)" width="100%" height="100%"></use> <use x="0" y="0" xlink:href="#camel-bg-svg" transform="matrix(0.01666783,0.99986108,-0.99986108,0.01666783,30.328036,-30.156237)" width="100%" height="100%"></use> <animatetransform attributename="transform" begin="0s" dur="30s" type="rotate" from="0 32 0" to="360 32 0" repeatcount="indefinite"></animatetransform> </g> </g> <g transform="translate(15 7)" style="fill:#1ba9ba"> <path id="camel1-svg" d="m 7.1120645,15.742968 c 0,-0.141356 0.080261,-0.306614 0.1783575,-0.367241 0.3900625,-0.241072 0.132766,-0.831519 -0.8026075,-1.841834 -0.5395305,-0.582758 -0.980965,-1.173477 -0.980965,-1.312709 0,-0.139232 0.230657,-0.569939 0.5125715,-0.957126 C 6.750426,10.26008 6.824206,9.898644 6.392691,9.4354675 6.13114,9.1547255 5.82008,9.044045 5.292625,9.044045 4.0763811,9.044045 2.5513803,7.9194505 1.7552163,6.435424 1.6046997,6.154865 1.3237871,5.901559 1.130966,5.8725215 0.08694992,5.7152995 -0.04522895,5.641566 0.0107852,5.247649 0.05482421,4.9379465 0.25952798,4.803909 0.95873955,4.626939 1.449222,4.502798 2.1174305,4.4225375 2.4436475,4.4485815 2.9909712,4.4922765 3.0622256,4.5713935 3.3664537,5.4731875 3.9744838,7.275513 5.0751945,7.5913 6.4878145,6.368686 7.139636,5.8045385 7.454776,5.655257 7.9938965,5.655257 8.525677,5.655257 8.6961995,5.576776 8.768959,5.2985425 8.822452,5.093984 9.012241,4.941828 9.2138995,4.941828 c 0.1934115,0 0.4796715,-0.180587 0.636133,-0.4013035 0.2657095,-0.374832 0.3005665,-0.381029 0.5284125,-0.093947 0.205081,0.2583975 0.329006,0.2752475 0.777972,0.105782 0.414832,-0.1565815 0.656233,-0.147484 1.081502,0.04076 0.47769,0.2114455 0.536096,0.312422 0.458234,0.7922265 -0.07861,0.4843955 0.04027,0.681014 0.998019,1.650731 1.032691,1.045592 1.087254,1.144641 1.087254,1.9736815 0,0.968906 0.294163,1.9962175 0.571602,1.9962175 0.099,0 0.129005,0.132868 0.06669,0.295263 -0.06857,0.178678 0.03564,0.453811 0.263926,0.696805 0.352421,0.375134 0.368836,0.519934 0.249602,2.201739 l -0.127628,1.800196 -0.512095,0 c -0.596631,0 -0.591253,0.0142 -0.245659,-0.648452 0.561499,-1.076624 0.178023,-2.529917 -1.02899,-3.899658 -0.345769,-0.392386 -0.68495,-0.65848 -0.753734,-0.59132 -0.06879,0.06716 -0.181225,0.598422 -0.249867,1.180582 -0.08591,0.728563 -0.260945,1.223496 -0.561593,1.587931 -0.240235,0.291202 -0.677572,0.942194 -0.971862,1.446648 -0.390761,0.669821 -0.643305,0.918145 -0.936375,0.92073 -0.5232,0.0046 -0.50692,-0.191979 0.05991,-0.723389 0.961341,-0.901276 1.539109,-2.820442 1.37575,-4.569818 -0.100867,-1.0801625 -0.122926,-1.1209965 -0.660021,-1.221756 -0.390156,-0.073194 -0.847412,0.031555 -1.5351425,0.351671 -0.5387125,0.250753 -1.111346,0.456698 -1.27252,0.457656 -0.42096,0.0025 -0.460968,0.232339 -0.403919,2.320387 0.02814,1.030013 0.00532,2.213859 -0.050724,2.630769 -0.087335,0.649729 -0.162235,0.758019 -0.524299,0.758019 -0.248881,0 -0.4224095,-0.105581 -0.4224095,-0.25701 z M 7.3759455,12.5666 C 7.306477,12.051594 7.210979,11.565226 7.1637295,11.485784 7.0381275,11.274608 6.5893,11.928368 6.5826655,12.332158 c -0.00485,0.296627 0.6258675,1.170818 0.844762,1.170818 0.041155,0 0.017985,-0.421369 -0.051482,-0.936376 z"> <animate id="frame1" attributename="display" values="inline;none;none;none;none;none" keytimes="0;0.20;0.40;0.60;0.80;1" dur="1s" begin="0s" repeatcount="indefinite"></animate> </path> <path id="camel2-svg" d="M 7.3178714,15.445942 C 7.5050368,14.694937 7.4709515,13.795226 7.2011665,12.36542 L 6.986861,11.229644 6.4839491,11.812196 c -0.7397701,0.856917 -0.7763682,1.20371 -0.2389533,2.264247 0.4536523,0.89524 0.4596535,0.942332 0.1490325,1.169464 C 5.8808001,15.621189 5.5759305,15.450608 5.5415664,14.768938 5.5245004,14.430396 5.4003351,13.775302 5.2656443,13.313173 5.0440088,12.552734 5.0503878,12.427472 5.3328163,11.994178 6.3993359,10.357953 6.5756539,9.1089201 5.7169372,9.2730743 4.7466199,9.4585621 4.0105416,9.1411042 2.8687515,8.0447011 2.256108,7.4564107 1.7548542,6.8330667 1.7548542,6.6594926 1.7548542,6.3676283 0.88041022,5.9795832 0.21602682,5.976619 -0.11065205,5.9751593 -0.05030538,5.1517832 0.28593702,5.0227549 0.44529549,4.9616033 1.1455409,4.8633993 1.8420379,4.8045236 L 3.108396,4.6974772 3.2214335,5.2626651 c 0.1947674,0.9738367 0.6487406,1.727538 1.1707851,1.943776 0.6616521,0.2740652 1.0763576,0.121924 1.9464919,-0.7141007 0.6110948,-0.5871397 0.8359908,-0.6925682 1.4773597,-0.6925682 0.6086309,0 0.7745172,-0.068764 0.8485149,-0.351732 0.056613,-0.2164893 0.2398841,-0.351732 0.476641,-0.351732 0.236757,0 0.4200278,-0.1352427 0.476641,-0.351732 0.1134526,-0.4338433 0.5016409,-0.4570726 0.7347299,-0.043966 0.139086,0.246505 0.217839,0.2640081 0.395644,0.087933 0.264061,-0.2614931 1.206841,-0.2958395 1.206841,-0.043966 0,0.096726 0.12794,0.175866 0.28431,0.175866 0.202268,0 0.256433,0.106607 0.187702,0.3694331 -0.09957,0.3807549 0.187234,1.2133609 0.417961,1.2133609 0.07153,0 0.413695,0.2836447 0.760372,0.6303216 0.608236,0.6082364 0.910358,1.3385186 1.012475,2.4473333 0.02672,0.2901789 0.200362,0.7016359 0.385861,0.9143479 0.1855,0.212713 0.290996,0.507344 0.234436,0.654736 -0.05769,0.150335 0.08696,0.493542 0.329483,0.781766 C 15.964448,12.403271 16,12.591674 16,14.222761 L 16,16 15.560335,16 c -0.441787,0 -0.613073,-0.399668 -0.263799,-0.615531 0.258636,-0.159846 0.214441,-0.96726 -0.104117,-1.902178 -0.259774,-0.762394 -1.676311,-2.582405 -2.009918,-2.582405 -0.0808,0 -0.196055,0.455053 -0.256116,1.01123 -0.06006,0.556176 -0.199025,1.169508 -0.308807,1.362961 -0.109782,0.193453 -0.308845,0.589151 -0.442362,0.87933 -0.133517,0.290179 -0.316807,0.665019 -0.407312,0.832977 -0.09051,0.167959 -0.164554,0.464733 -0.164554,0.659498 0,0.27622 -0.116059,0.354118 -0.527598,0.354118 -0.582631,0 -0.671984,-0.188835 -0.253638,-0.536031 0.720855,-0.598256 1.189731,-2.607674 1.031564,-4.420874 C 11.735122,9.6839943 11.731382,9.6757886 11.183804,9.5730623 10.79585,9.5002815 10.347795,9.6025836 9.6673567,9.9193056 9.1361691,10.166556 8.5605829,10.369625 8.3882761,10.37057 c -0.1723067,9.5e-4 -0.3495828,0.100643 -0.3939467,0.221551 -0.044364,0.120907 -0.012824,1.288218 0.070089,2.594023 0.082913,1.305805 0.1019093,2.424651 0.042215,2.486324 -0.059695,0.06167 -0.2946184,0.168476 -0.5220527,0.237339 -0.3940805,0.119321 -0.4066166,0.09752 -0.2667087,-0.463865 z"> <animate id="frame2" attributename="display" values="none;inline;none;none;none;none" keytimes="0;0.20;0.40;0.60;0.80;1" dur="1s" begin="0s" repeatcount="indefinite"></animate> </path> <path id="camel3-svg" d="m 11.694744,15.893439 c 0,-0.05861 0.161653,-0.312069 0.359228,-0.563245 0.197576,-0.251177 0.44296,-0.76764 0.545299,-1.147697 0.199468,-0.74077 0.04948,-2.985451 -0.210214,-3.145949 -0.08501,-0.05254 -0.154555,-0.298474 -0.154555,-0.546528 0,-1.2490252 -0.695963,-1.4316719 -2.4854398,-0.652273 -1.1345943,0.494168 -1.1358967,0.495597 -1.0191106,1.1183 0.064315,0.342925 0.23144,0.844927 0.3713898,1.11556 0.1399497,0.270633 0.254454,0.632018 0.254454,0.803079 0,0.355498 0.2878241,1.32191 0.6513016,2.186843 0.327217,0.778647 0.33612,0.758581 -0.3364431,0.758356 C 9.0970953,15.819687 9.0853682,15.803356 9.0572243,14.965269 9.0371739,14.3682 8.8068602,13.664331 8.2925679,12.628382 7.8877878,11.813025 7.556604,11.064112 7.556604,10.96413 c 0,-0.475265 -0.3345929,-0.09336 -0.5894723,0.672831 -0.1563629,0.470039 -0.4925164,1.37599 -0.7470077,2.013226 -0.2544914,0.637235 -0.4627114,1.386148 -0.4627114,1.664252 0,0.441878 -0.068066,0.505642 -0.5397575,0.505642 -0.2968665,0 -0.5397574,-0.05291 -0.5397574,-0.117579 0,-0.06467 0.194409,-0.530209 0.4320199,-1.034535 0.2376107,-0.504326 0.5166616,-1.402738 0.6201129,-1.996471 0.1034512,-0.593733 0.2834043,-1.50102 0.399896,-2.016193 C 6.4250891,9.3499742 6.3135581,9.1630726 5.2394581,9.1630726 4.4783023,9.1630726 4.225077,9.0632738 3.4795999,8.4694934 2.3897141,7.6013883 2.0536586,7.2235444 1.8163793,6.5994526 1.6728502,6.2219424 1.4367193,6.0542405 0.81430111,5.8877689 0.15656621,5.7118517 0,5.5927101 0,5.2681131 0,4.7350942 0.04357633,4.7174114 1.7167989,4.5714542 L 3.1603568,4.4455309 3.3930449,5.3534319 C 3.5210232,5.8527775 3.8181222,6.4689245 4.0532649,6.7226475 4.7726057,7.4988291 5.5322213,7.3228031 6.9201075,6.0583128 7.1142899,5.8813953 7.5827716,5.6871364 7.9611783,5.6266267 8.3654233,5.5619853 8.7233122,5.378111 8.828904,5.1808112 8.9277464,4.9961222 9.1752761,4.8450131 9.3789696,4.8450131 c 0.2190393,0 0.4087978,-0.1470171 0.4644519,-0.3598383 0.113975,-0.4358409 0.5123125,-0.4700837 0.7397945,-0.063596 0.153922,0.2750439 0.19605,0.2750439 0.58873,0 0.23262,-0.1629331 0.526376,-0.2962422 0.652791,-0.2962422 0.363936,0 0.949522,0.6820918 0.949522,1.1060048 0,0.2323329 0.419889,0.8023275 1.053373,1.4299436 0.971283,0.9622864 1.061256,1.1200064 1.154544,2.0238768 0.06689,0.6480589 0.273567,1.2407685 0.609875,1.7489632 0.350594,0.529784 0.439114,0.791897 0.284808,0.843333 -0.26756,0.08919 -0.298836,0.696767 -0.04397,0.85428 0.288884,0.178541 0.212077,0.761008 -0.29962,2.27216 -0.415472,1.22698 -0.535658,1.416183 -0.899595,1.416183 -0.519205,0 -0.519315,0.004 0.02974,-1.079515 0.586035,-1.156485 0.568232,-1.761628 -0.07808,-2.653829 -0.803258,-1.108866 -0.911479,-1.100906 -0.911479,0.06704 0,1.467271 -0.967797,3.846228 -1.564705,3.846228 -0.227923,0 -0.414406,-0.04795 -0.414406,-0.106561 z"> <animate id="frame3" attributename="display" values="none;none;inline;none;none;none" keytimes="0;0.20;0.40;0.60;0.80;1" dur="1s" begin="0s" repeatcount="indefinite"></animate> </path> <path id="camel4-svg" d="M 8.7959769,14.733538 C 8.7823709,13.962655 8.6416974,13.173477 8.4364574,12.716637 L 8.0992897,11.966141 7.9316262,12.622825 C 7.8394115,12.984001 7.7056873,13.828309 7.6344617,14.499065 7.5119445,15.65285 7.4771343,15.721823 6.9889944,15.77799 6.4016791,15.845568 6.3706616,15.734011 6.7310637,14.850321 6.8729831,14.50234 7.0314449,13.273019 7.0832012,12.118496 7.2025402,9.4564011 6.9826172,8.9629542 5.5925417,8.7738664 5.096474,8.7063876 4.5281652,8.6057104 4.3296332,8.550139 3.7880973,8.3985568 2.1379694,6.7917174 1.8662797,6.1514073 1.680471,5.7134991 1.4492167,5.5465837 0.81406548,5.3919372 0.12893242,5.2251211 0,5.1208599 0,4.7336426 0,4.336324 0.11518495,4.2524818 0.84430805,4.1190775 1.3086775,4.0341139 2.0169795,3.9496831 2.4183125,3.9314535 3.1424232,3.8985623 3.1505359,3.9060226 3.4781201,4.9059984 3.895193,6.179146 4.3323163,6.6203411 5.2093056,6.6533106 5.7732981,6.6745132 6.0485257,6.539104 6.7434918,5.8985065 7.4356058,5.2605383 7.724319,5.1178647 8.3231936,5.1178647 c 0.5750126,0 0.7539352,-0.080801 0.8309348,-0.375248 0.058037,-0.221935 0.2559221,-0.375248 0.4843416,-0.375248 0.2124165,0 0.476584,-0.1688617 0.587039,-0.3752481 0.240288,-0.4489831 0.750496,-0.4991125 0.750496,-0.073738 0,0.2135636 0.09577,0.2620819 0.328342,0.1663373 0.720327,-0.2965451 0.990415,-0.3092897 1.52643,-0.072027 0.471409,0.2086657 0.542941,0.3271373 0.456995,0.7568685 -0.08426,0.4213047 0.04204,0.6497726 0.729807,1.3201051 1.143179,1.114209 1.40549,1.5840968 1.552296,2.7806783 0.06963,0.5675626 0.216264,1.2924751 0.325848,1.6109161 0.136653,0.397104 0.138925,0.686766 0.0072,0.922089 -0.176098,0.314669 -0.214883,0.299452 -0.467988,-0.183617 -0.387542,-0.739649 -0.571885,-0.301548 -0.300332,0.713757 0.176363,0.659403 0.172812,1.132697 -0.01664,2.2179 -0.341473,1.955965 -0.274035,1.856066 -1.228584,1.81996 -0.934764,-0.03536 -1.039183,-0.214301 -0.475299,-0.814528 0.284272,-0.302594 0.382184,-0.688895 0.407282,-1.606897 0.03651,-1.33541 -0.154678,-1.844834 -0.867715,-2.312035 -0.390874,-0.25611 -0.476679,-0.46085 -0.476679,-1.137407 0,-0.7595531 -0.0436,-0.8346499 -0.548976,-0.9456498 C 11.540584,9.0697376 11.06967,9.1757694 10.327657,9.5151734 9.749393,9.7796771 9.1690775,9.996089 9.0380672,9.996089 c -0.2709452,0 -0.1985999,1.246308 0.082427,1.419992 0.091792,0.05673 0.1668938,0.589424 0.1668938,1.183763 0,0.59434 0.1304728,1.519966 0.2899394,2.056949 C 9.900035,15.743466 9.8335656,16.000084 9.2294095,16 8.8492003,15.999947 8.8166498,15.904837 8.7959769,14.733538 Z"> <animate id="frame4" attributename="display" values="none;none;none;inline;none;none" keytimes="0;0.20;0.40;0.60;0.80;1" dur="1s" begin="0s" repeatcount="indefinite"></animate> </path> <path id="camel5-svg" d="M 7.1493305,15.450337 C 7.5631556,14.650087 7.5205085,13.34185 7.0672237,12.931633 6.7569062,12.6508 6.6927936,12.311573 6.6480373,10.713674 L 6.5951997,8.8272558 5.8499795,8.7775975 C 5.4401084,8.7502855 4.9088829,8.6839924 4.6694783,8.6302797 4.1226173,8.5075861 2.4960161,7.0038832 1.9099589,6.0792563 1.5757991,5.5520499 1.3419893,5.3799123 0.95713494,5.3777595 0.27262434,5.373931 -0.06953266,5.1308761 0.01178373,4.7062204 0.09008118,4.2973304 1.5580726,3.8549351 2.5746867,3.9338613 3.1545724,3.9788816 3.2382447,4.0624038 3.506212,4.8637148 3.9045618,6.0549132 4.4254237,6.5406054 5.3299645,6.5643233 5.9338164,6.5801574 6.1745259,6.4657743 6.7514541,5.8888461 7.3404186,5.2998816 7.5691837,5.1943074 8.2564263,5.1943074 c 0.6537502,0 0.8292719,-0.072038 0.9078732,-0.3726101 0.057629,-0.2203749 0.2541231,-0.3726101 0.4809368,-0.3726101 0.2109232,0 0.4732337,-0.1676745 0.5829117,-0.3726101 0.238599,-0.4458269 0.74522,-0.4956038 0.74522,-0.07322 0,0.2148251 0.09209,0.2594296 0.326034,0.1579153 0.592919,-0.2572835 1.537017,-0.3218269 1.537017,-0.1050783 0,0.1136783 0.131405,0.2066879 0.292012,0.2066879 0.202907,0 0.25746,0.1088648 0.178779,0.3567664 -0.183804,0.5791162 0.09366,1.3018894 0.621072,1.6178186 0.972378,0.5824775 1.487316,1.4989472 1.62451,2.8912548 0.06994,0.7097724 0.199984,1.3355011 0.288987,1.3905091 0.222574,0.137558 0.205144,1.195853 -0.0197,1.195853 -0.09984,0 -0.326172,-0.272471 -0.502967,-0.605491 -0.467733,-0.881043 -0.557324,-0.182795 -0.09382,0.731169 0.254699,0.502226 0.381726,1.20786 0.430141,2.38944 l 0.0687,1.676745 -0.512339,0.05895 c -0.500627,0.0576 -0.69698,-0.202303 -0.326034,-0.431561 0.294025,-0.181717 0.217118,-1.928111 -0.115807,-2.629696 -0.375807,-0.791955 -0.603838,-0.953458 -0.487588,-0.345335 0.05233,0.273725 -0.109633,0.864282 -0.399523,1.456796 -0.268137,0.548052 -0.487522,1.176737 -0.487522,1.397076 0,0.320927 -0.111179,0.400617 -0.558915,0.400617 -0.677354,0 -0.693447,-0.15782 -0.104577,-1.025569 0.249887,-0.368228 0.550474,-0.960796 0.667972,-1.316819 0.193328,-0.58579 0.15098,-0.784126 -0.445562,-2.086767 C 12.591695,10.59284 12.269432,9.7774115 12.238111,9.5724759 12.15601,9.035273 11.346611,9.0031784 10.382034,9.498878 9.9387594,9.7266782 9.3260954,9.9653093 9.0205583,10.029169 l -0.5555222,0.116109 -0.00339,1.560209 c -0.00312,1.433143 0.036834,1.603273 0.4905408,2.088988 0.2716632,0.290829 0.6279716,0.52878 0.7917961,0.52878 0.1935167,0 0.2978626,0.163163 0.2978626,0.465762 0,0.25617 -0.04743,0.465763 -0.1054003,0.465763 -0.2360649,0 -0.9501023,-0.446888 -1.4316163,-0.895993 l -0.5123388,-0.477854 0,1.059533 C 7.9924876,15.995521 7.9901047,16 7.4287881,16 l -0.5636994,0 0.2842418,-0.549663 z"> <animate id="frame5" attributename="display" values="none;none;none;none;inline;none" keytimes="0;0.20;0.40;0.60;0.80;1" dur="1s" begin="0s" repeatcount="indefinite"></animate> </path> </g> </g> </svg> <div class="yo-loading ani fade-in"> <span class="inner"> <i class="yo-ico"></i> <div class="svg"> <svg viewbox="10 0 30 25" class="yo-camel"> <use xlink:href="#camel-loading-svg"></use> </svg> </div> <p>加载中...</p> </span> </div>', 'camel-loading,[riot-tag="camel-loading"]{ display: block; }', 'class="yo-loading yo-loading-camel"', function (opts) {});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! riot */ 1)))

/***/ },
/* 10 */
/*!*********************************************************!*\
  !*** ./bower_components/Yo/lib/element/yo-loading.scss ***!
  \*********************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-loading.scss */ 11);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-loading.scss */ 11, function() {
				var newContent = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-loading.scss */ 11);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 11 */
/*!************************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./bower_components/Yo/lib/element/yo-loading.scss ***!
  \************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * Yo框架动画解决方案\r\n * Yo内置了超过60种动画形态，不同的动画可以任意组合\r\n */\n.ani {\n  -webkit-animation-duration: 1s;\n  animation-duration: 1s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both; }\n\n.ani.infinite {\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite; }\n\n/**\r\n * @module animate\r\n * @class rotate\r\n * @description 定义旋转动画\r\n * @method rotate\r\n */\n@-webkit-keyframes rotate {\n  from {\n    -webkit-transform: rotatez(0); }\n  to {\n    -webkit-transform: rotatez(360deg); } }\n\n@keyframes rotate {\n  from {\n    transform: rotatez(0); }\n  to {\n    transform: rotatez(360deg); } }\n\n.ani.rotate {\n  -webkit-animation-name: rotate;\n  animation-name: rotate; }\n\n/**\r\n * @module element\r\n * @method yo-loading\r\n * @description 构造加载中的自定义使用方法\r\n * @demo http://doyoe.github.io/Yo/demo/element/yo-loading.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {Length} $ico-size loading的尺寸\r\n * @param {Color} $ico-color loading的颜色\r\n * @param {Color} $bgcolor 背景色\r\n * @param {Color} $mask-bgcolor 遮罩背景色\r\n * @param {Length} $font-size 文本字号\r\n * @param {Color} $color 文本颜色\r\n * @param {String} $content loading形态\r\n */\n.yo-loading {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  position: absolute;\n  z-index: 9999;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  background-color: rgba(0, 0, 0, 0.1);\n  line-height: 1; }\n  .yo-loading > .inner {\n    display: block;\n    text-align: center;\n    padding: .1rem .2rem;\n    border-radius: 0.05rem;\n    -webkit-background-clip: padding-box !important;\n    background-clip: padding-box !important;\n    color: #212121;\n    font-size: 0.14rem; }\n    .yo-loading > .inner > .yo-ico {\n      display: block;\n      margin-bottom: .1rem;\n      -webkit-animation: rotate 1s infinite linear;\n      animation: rotate 1s infinite linear;\n      -webkit-transform-origin: center;\n      transform-origin: center; }\n      .yo-loading > .inner > .yo-ico::before {\n        content: \"\\F089\";\n        color: #212121;\n        font-family: yofont;\n        font-size: 0.5rem; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/element/yo-loading.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/ani/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/ani/rotate.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/element/yo-loading.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AC14BH;;;GAGG;AAIH;EAEC,+BAA+B;EAC/B,uBAAuB;EAEvB,kCAAkC;EAClC,0BAA0B,EAC1B;;AAED;EAEC,4CAA4C;EAC5C,oCAAoC,EACpC;;AClBD;;;;;GAKG;AACH;EACI;IACI,8BAA0B,EAAA;EAE9B;IACI,mCAA0B,EAAA,EAAA;;AAGlC;EACI;IACI,sBAAkB,EAAA;EAEtB;IACI,2BAAkB,EAAA,EAAA;;AAI1B;EACC,+BAA+B;EAC/B,uBAAuB,EACvB;;ACQD;;;;;;;;;;;;;GAaG;AA0EH;EH4SgB,qBAAS;EACT,sBAAS;EAQrB,cAAS;EAjNT,mBADiD;EAEjD,cD4cc;EC3cd,OAAO;EACP,SAAS;EACT,UAAU;EACV,QAAQ;EA8VQ,yBAP2B;EAQ3B,gCAR2B;EAsE3C,wBAtE2C;EA4L3B,0BAjCmB;EAkCnB,4BAlCmB;EA2CnC,oBA3CmC;EG5sBnC,qCJyHkB;EIxHlB,eAAe,EAkHlB;EAFD;IA9GQ,eAAe;IACf,mBAAmB;IACnB,qBAAqB;IH8TzB,uBG7TiC;IHGzB,gDA6TuC;IAzT/C,wCAyT+C;IG9T3C,eJ8ByB;II7BzB,mBJoHgB,EItGnB;IA0FL;MArGY,eAAe;MACf,qBAAqB;MHJrB,6CGK4C;MHDpD,qCGCoD;MHL5C,iCGMgC;MHFxC,yBGEwC,EAOnC;MA2FT;QAhGgB,iBJgHE;QI/GF,eJqGS;QIpGT,oBJoEM;QInEN,kBJiGO,EIhGV","file":"yo-loading.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * Yo框架动画解决方案\r\n * Yo内置了超过60种动画形态，不同的动画可以任意组合\r\n */\n.ani {\n  -webkit-animation-duration: 1s;\n  animation-duration: 1s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both; }\n\n.ani.infinite {\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite; }\n\n/**\r\n * @module animate\r\n * @class rotate\r\n * @description 定义旋转动画\r\n * @method rotate\r\n */\n@-webkit-keyframes rotate {\n  from {\n    -webkit-transform: rotatez(0); }\n  to {\n    -webkit-transform: rotatez(360deg); } }\n\n@keyframes rotate {\n  from {\n    transform: rotatez(0); }\n  to {\n    transform: rotatez(360deg); } }\n\n.ani.rotate {\n  -webkit-animation-name: rotate;\n  animation-name: rotate; }\n\n/**\r\n * @module element\r\n * @method yo-loading\r\n * @description 构造加载中的自定义使用方法\r\n * @demo http://doyoe.github.io/Yo/demo/element/yo-loading.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {Length} $ico-size loading的尺寸\r\n * @param {Color} $ico-color loading的颜色\r\n * @param {Color} $bgcolor 背景色\r\n * @param {Color} $mask-bgcolor 遮罩背景色\r\n * @param {Length} $font-size 文本字号\r\n * @param {Color} $color 文本颜色\r\n * @param {String} $content loading形态\r\n */\n.yo-loading {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  position: absolute;\n  z-index: 9999;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  background-color: rgba(0, 0, 0, 0.1);\n  line-height: 1; }\n  .yo-loading > .inner {\n    display: block;\n    text-align: center;\n    padding: .1rem .2rem;\n    border-radius: 0.05rem;\n    -webkit-background-clip: padding-box !important;\n    background-clip: padding-box !important;\n    color: #212121;\n    font-size: 0.14rem; }\n    .yo-loading > .inner > .yo-ico {\n      display: block;\n      margin-bottom: .1rem;\n      -webkit-animation: rotate 1s infinite linear;\n      animation: rotate 1s infinite linear;\n      -webkit-transform-origin: center;\n      transform-origin: center; }\n      .yo-loading > .inner > .yo-ico::before {\n        content: \"\";\n        color: #212121;\n        font-family: yofont;\n        font-size: 0.5rem; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\r\n/**\r\n * Yo框架动画解决方案\r\n * Yo内置了超过60种动画形态，不同的动画可以任意组合\r\n */\r\n\r\n\r\n// 定义动画基本特性\r\n.ani {\r\n\t// 定义动画的持续时间\r\n\t-webkit-animation-duration: 1s;\r\n\tanimation-duration: 1s;\r\n\t// 定义动画运行完成之后的状态\r\n\t-webkit-animation-fill-mode: both;\r\n\tanimation-fill-mode: both;\r\n}\r\n\r\n.ani.infinite {\r\n\t//定义动画无限循环\r\n\t-webkit-animation-iteration-count: infinite;\r\n\tanimation-iteration-count: infinite;\r\n}","@charset \"utf-8\";\r\n@import \"classes\";\r\n\r\n/**\r\n * @module animate\r\n * @class rotate\r\n * @description 定义旋转动画\r\n * @method rotate\r\n */\r\n@-webkit-keyframes rotate {\r\n    from {\r\n        -webkit-transform: rotatez(0);\r\n    }\r\n    to {\r\n        -webkit-transform: rotatez(360deg);\r\n    }\r\n}\r\n@keyframes rotate {\r\n    from {\r\n        transform: rotatez(0);\r\n    }\r\n    to {\r\n        transform: rotatez(360deg);\r\n    }\r\n}\r\n\r\n.ani.rotate {\r\n\t-webkit-animation-name: rotate;\r\n\tanimation-name: rotate;\r\n}","@charset \"utf-8\";\r\n@import \"../core/variables\";\r\n@import \"../core/classes\";\r\n@import \"../ani/rotate\";\r\n\r\n// 定义loading的基础构造\r\n@mixin _loading {\r\n    @include flexbox;\r\n    @include fullscreen(map-get($z-index, loading));\r\n    @include justify-content;\r\n    @include align-items;\r\n    background-color: map-get($loading, mask-bgcolor);\r\n    line-height: 1;\r\n    > .inner {\r\n        display: block;\r\n        text-align: center;\r\n        padding: .1rem .2rem;\r\n        @include border-radius(.05rem);\r\n        background-color: map-get($loading, bgcolor);\r\n        color: map-get($loading, color);\r\n        font-size: map-get($loading, font-size);\r\n        // 增加 .yo-ico 这一级用以fix某些浏览器不支持伪元素动画\r\n        > .yo-ico {\r\n            display: block;\r\n            margin-bottom: .1rem;\r\n            @include animation(rotate 1s infinite linear);\r\n            @include transform-origin(center);\r\n            &::before {\r\n                content: map-get($loading, content);\r\n                color: map-get($loading, ico-color);\r\n                font-family: map-get($ico, font-name);\r\n                font-size: map-get($loading, ico-size);\r\n            }\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module element\r\n * @method yo-loading\r\n * @description 构造加载中的自定义使用方法\r\n * @demo http://doyoe.github.io/Yo/demo/element/yo-loading.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {Length} $ico-size loading的尺寸\r\n * @param {Color} $ico-color loading的颜色\r\n * @param {Color} $bgcolor 背景色\r\n * @param {Color} $mask-bgcolor 遮罩背景色\r\n * @param {Length} $font-size 文本字号\r\n * @param {Color} $color 文本颜色\r\n * @param {String} $content loading形态\r\n */\r\n\r\n@mixin yo-loading(\r\n    $name: default,\r\n    $ico-size: default,\r\n    $ico-color: default,\r\n    $bgcolor: default,\r\n    $mask-bgcolor: default,\r\n    $font-size: default,\r\n    $color: default,\r\n    $content: default) {\r\n    // 区别是否新增实例还是修改本身\r\n    @if $name == default {\r\n        $name: \"\";\r\n    } @else {\r\n        $name: \"-#{$name}\";\r\n    }\r\n    // 如果值为default，则取config的定义\r\n    @if $ico-size == default {\r\n        $ico-size: map-get($loading, ico-size);\r\n    }\r\n    @if $ico-color == default {\r\n        $ico-color: map-get($loading, ico-color);\r\n    }\r\n    @if $bgcolor == default {\r\n        $bgcolor: map-get($loading, bgcolor);\r\n    }\r\n    @if $mask-bgcolor == default {\r\n        $mask-bgcolor: map-get($loading, mask-bgcolor);\r\n    }\r\n    @if $font-size == default {\r\n        $font-size: map-get($loading, font-size);\r\n    }\r\n    @if $color == default {\r\n        $color: map-get($loading, color);\r\n    }\r\n    @if $content == default {\r\n        $content: map-get($loading, content);\r\n    }\r\n    .yo-loading#{$name} {\r\n        // 如果$bgcolor不等于config预设值时，则重写遮罩背景色\r\n        @if $mask-bgcolor != map-get($loading, mask-bgcolor) {\r\n            background-color: $mask-bgcolor;\r\n        }\r\n        > .inner {\r\n            @if $bgcolor != map-get($loading, bgcolor) {\r\n                background-color: $bgcolor;\r\n            }\r\n            @if $color != map-get($loading, color) {\r\n                color: $color;\r\n            }\r\n            @if $font-size != map-get($loading, font-size) {\r\n                font-size: $font-size;\r\n            }\r\n            > .yo-ico {\r\n                &::before {\r\n                    @if $content != map-get($loading, content) {\r\n                        content: $content;\r\n                    }\r\n                    @if $ico-color != map-get($loading, ico-color) {\r\n                        color: $ico-color;\r\n                    }\r\n                    @if $ico-size != map-get($loading, ico-size) {\r\n                        font-size: $ico-size;\r\n                    }\r\n                }\r\n            }\r\n        }\r\n        // 增量扩展\r\n        @content;\r\n    }\r\n}\r\n\r\n// 调用本文件时载入loading基础构造\r\n.yo-loading {\r\n    @include _loading;\r\n}"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 12 */
/*!*********************************************!*\
  !*** ./src/components/loading/loading.scss ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../~/css-loader?sourceMap!./../../../~/sass-loader?sourceMap!./loading.scss */ 13);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../~/css-loader?sourceMap!./../../../~/sass-loader?sourceMap!./loading.scss */ 13, function() {
				var newContent = __webpack_require__(/*! !./../../../~/css-loader?sourceMap!./../../../~/sass-loader?sourceMap!./loading.scss */ 13);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 13 */
/*!************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./src/components/loading/loading.scss ***!
  \************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, ".yo-loading-camel {\n  background-color: transparent; }\n  .yo-loading-camel .yo-loading {\n    background-color: transparent; }\n    .yo-loading-camel .yo-loading > .inner {\n      padding: 0;\n      position: relative;\n      width: 2rem;\n      height: 1.2rem;\n      top: -1.2rem; }\n      .yo-loading-camel .yo-loading > .inner > .yo-ico {\n        position: absolute;\n        top: .2rem;\n        width: 100%; }\n      .yo-loading-camel .yo-loading > .inner > .svg {\n        position: absolute;\n        width: 100%; }\n        .yo-loading-camel .yo-loading > .inner > .svg svg {\n          margin: 0 auto;\n          display: block;\n          height: .75rem;\n          width: 1.5rem;\n          border-radius: .1rem; }\n      .yo-loading-camel .yo-loading > .inner > .yo-ico::before {\n        color: #1ba9ba; }\n      .yo-loading-camel .yo-loading > .inner > p {\n        position: absolute;\n        bottom: 0;\n        width: 100%;\n        text-align: center; }\n", "", {"version":3,"sources":["/./src/components/src/components/loading/loading.scss"],"names":[],"mappings":"AAAA;EACI,8BAA8B,EAqCjC;EAtCD;IAGQ,8BAA8B,EAkCjC;IArCL;MAMY,WAAU;MACV,mBAAmB;MACnB,YAAY;MACZ,eAAe;MACf,aAAa,EA0BhB;MApCT;QAYgB,mBAAmB;QACnB,WAAU;QACV,YAAY,EACf;MAfb;QAiBgB,mBAAmB;QACnB,YAAY,EAQf;QA1Bb;UAoBoB,eAAe;UACf,eAAe;UACf,eAAe;UACf,cAAc;UACd,qBAAqB,EACxB;MAzBjB;QA4BgB,eAAe,EAClB;MA7Bb;QA+BgB,mBAAmB;QACnB,UAAU;QACV,YAAY;QACZ,mBAAmB,EACtB","file":"loading.scss","sourcesContent":[".yo-loading-camel{\n    background-color: transparent;\n    .yo-loading{\n        background-color: transparent;\n\n        & > .inner{\n            padding:0;\n            position: relative;\n            width: 2rem;\n            height: 1.2rem;\n            top: -1.2rem;\n            & > .yo-ico {\n                position: absolute;\n                top:.2rem;\n                width: 100%;\n            }\n            & > .svg {\n                position: absolute;\n                width: 100%;\n                svg{\n                    margin: 0 auto;\n                    display: block;\n                    height: .75rem;\n                    width: 1.5rem;\n                    border-radius: .1rem;\n                }\n            }\n            & > .yo-ico::before{\n                color: #1ba9ba;\n            }\n            & > p{\n                position: absolute;\n                bottom: 0;\n                width: 100%;\n                text-align: center;\n            }\n        }\n    }\n}\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 14 */
/*!******************************************!*\
  !*** ./src/components/qrcode/qrcode.tag ***!
  \******************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	riot.tag2('qrcode', '<div class="canvas"> </div>', 'qrcode > div,[riot-tag="qrcode"] > div{ width: 3.2rem; height: 3.2rem; padding: .1rem; display: block; overflow: hidden; margin: .1rem auto; border-radius: 3px; border: 1px solid #aaa; } qrcode > p,[riot-tag="qrcode"] > p{ padding: .1rem .2rem; } qrcode img,[riot-tag="qrcode"] img { width: 100%; height: 100%; }', '', function (opts) {
	    var _this = this;
	
	    this.on('mount update', function () {
	        var qrcode = _this.qrcode;
	        var root = _this.root;
	
	        qrcode && generateIMG();
	
	        function generateIMG() {
	            var canvas = root.querySelector('.canvas');
	            canvas.innerHTML = '';
	            canvas.appendChild(qrcode);
	        };
	    });
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! riot */ 1)))

/***/ },
/* 15 */
/*!**************************************!*\
  !*** ./src/components/list/list.tag ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(/*! yo/lib/layout/yo-flex.scss */ 16);
	
	__webpack_require__(/*! yo/lib/widget/yo-switch.scss */ 18);
	
	__webpack_require__(/*! yo/lib/element/yo-checked.scss */ 20);
	
	var _zepto = __webpack_require__(/*! zepto */ 22);
	
	var _zepto2 = _interopRequireDefault(_zepto);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	riot.tag2('yo-list', '<h2 class="label"></h2> <item class="item"> <div class="mark"> 生成URL </div> <input name="url" type="text" class="flex" readonly style="border:0;"> </item> <h2 class="label"></h2> <item class="item"> <div class="mark flex"> 系统 </div> <div class="cont"> <label> <div class="yo-checked"> <input type="radio" name="os" value="qunaraphone" checked onchange="{toggle}"> <span class="type"></span> </div> android </label> <label> <div class="yo-checked"> <input type="radio" name="os" value="qunariphone" onchange="{toggle}"> <span class="type"></span> </div> iOS </label> </div> </item>', 'yo-list,[riot-tag="yo-list"]{ display: block; }', '', function (opts) {
	    var COM_URL = 'http://985.so/api.php?format=jsonp&callback=callback&url=';
	
	    this.toggle = function (e) {
	        this.parent.trigger('toggle', e);
	    };
	    this.compress = function (e) {
	        var self = this;
	        var root = this.root;
	        var parent = this.parent.root;
	        var target = e.path.filter(function (e) {
	            return e.tagName === 'LABEL';
	        })[0];
	        var input = target.querySelector('input');
	        var schema = parent.querySelector('input[name=url]').value;
	        var url = COM_URL + encodeURIComponent(schema);
	
	        input.checked = !input.checked;
	
	        if (input.checked) {
	            _zepto2.default.ajaxJSONP({
	                url: url,
	                success: ajaxOk
	            });
	        }
	        function ajaxOk(res) {
	            var evt = document.createEvent('Event');
	            evt.initEvent('change', true);
	            input.dispatchEvent(evt);
	        };
	    };
	}, '{ }');
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! riot */ 1)))

/***/ },
/* 16 */
/*!*****************************************************!*\
  !*** ./bower_components/Yo/lib/layout/yo-flex.scss ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-flex.scss */ 17);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-flex.scss */ 17, function() {
				var newContent = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-flex.scss */ 17);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 17 */
/*!********************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./bower_components/Yo/lib/layout/yo-flex.scss ***!
  \********************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * @module layout\r\n * @method yo-flex\r\n * @description 构造弹性布局使用方法，可以是横向和纵向\r\n * @demo http://doyoe.github.io/Yo/demo/layout/yo-flex.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {String} $box 指定块级或者行级弹性盒\r\n * @param {String} $direction 指定是水平或者垂直布局\r\n */\n.yo-flex {\n  height: 100%; }\n  .yo-flex,\n  .yo-flex .flex-inherit {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    flex-direction: column;\n    overflow: hidden; }\n  .yo-flex > .flex,\n  .yo-flex .flex-inherit,\n  .yo-flex .flex-inherit > .flex {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1;\n    flex: 1;\n    position: relative; }\n  .yo-flex > .flex,\n  .yo-flex .flex-inherit > .flex {\n    overflow: auto; }\n    .yo-flex > .flex > .yo-flex,\n    .yo-flex .flex-inherit > .flex > .yo-flex {\n      position: absolute;\n      top: 0;\n      right: 0;\n      bottom: 0;\n      left: 0; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/layout/yo-flex.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/layout/yo-flex.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AC52BH;;;;;;;;GAQG;AAgDH;EAjFI,aAAa,EAmFhB;EAFD;;IDiVgB,qBAAS;IACT,sBAAS;IAQrB,cAAS;IAoFO,6BAAyC;IACzC,8BAA6C;IA2BrD,+BD/aS;ICmbjB,uBDnbiB;IEvGb,iBAAiB,EACpB;EA2EL;;;ID2WgB,oBClbO;IDmbP,gBCnbO;ID2bnB,QC3bmB;IACf,mBAAmB,EACtB;EAqEL;;IDwHQ,eAAe,ECnLlB;IA2DL;;MDyII,mBADiD;MAGjD,OAAO;MACP,SAAS;MACT,UAAU;MACV,QAAQ,EC1MH","file":"yo-flex.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * @module layout\r\n * @method yo-flex\r\n * @description 构造弹性布局使用方法，可以是横向和纵向\r\n * @demo http://doyoe.github.io/Yo/demo/layout/yo-flex.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {String} $box 指定块级或者行级弹性盒\r\n * @param {String} $direction 指定是水平或者垂直布局\r\n */\n.yo-flex {\n  height: 100%; }\n  .yo-flex,\n  .yo-flex .flex-inherit {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    flex-direction: column;\n    overflow: hidden; }\n  .yo-flex > .flex,\n  .yo-flex .flex-inherit,\n  .yo-flex .flex-inherit > .flex {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1;\n    flex: 1;\n    position: relative; }\n  .yo-flex > .flex,\n  .yo-flex .flex-inherit > .flex {\n    overflow: auto; }\n    .yo-flex > .flex > .yo-flex,\n    .yo-flex .flex-inherit > .flex > .yo-flex {\n      position: absolute;\n      top: 0;\n      right: 0;\n      bottom: 0;\n      left: 0; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\r\n@import \"../core/variables\";\r\n@import \"../core/classes\";\r\n\r\n// 定义常见弹性布局\r\n@mixin _flex {\r\n    height: 100%;\r\n    &,\r\n    .flex-inherit {\r\n        @include flexbox(map-get($flex, box));\r\n        @include flex-direction(map-get($flex, direction));\r\n        overflow: hidden;\r\n    }\r\n    > .flex,\r\n    .flex-inherit,\r\n    .flex-inherit > .flex {\r\n        @include flex(1, column);\r\n        position: relative;\r\n    }\r\n    > .flex,\r\n    .flex-inherit > .flex {\r\n        @include overflow;\r\n        // 用于解决flex无法将动态高度继承给子元素\r\n        // 这里单独处理flex的子元素为yo-flex的情况，yo-flex通过绝对定位拉伸来得到高度\r\n        // 请使用 flex-inherit 的方式来进行嵌套（推荐）\r\n        > .yo-flex {\r\n            @include fullscreen;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module layout\r\n * @method yo-flex\r\n * @description 构造弹性布局使用方法，可以是横向和纵向\r\n * @demo http://doyoe.github.io/Yo/demo/layout/yo-flex.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {String} $box 指定块级或者行级弹性盒\r\n * @param {String} $direction 指定是水平或者垂直布局\r\n */\r\n\r\n@mixin yo-flex(\r\n    $name: default,\r\n    $box: default,\r\n    $direction: default) {\r\n    // 区别是否新增实例还是修改本身\r\n    @if $name == default {\r\n        $name: \"\";\r\n    } @else {\r\n        $name: \"-#{$name}\";\r\n    }\r\n    // 如果值为default，则取config的定义\r\n    @if $box == default {\r\n        $box: map-get($flex, box);\r\n    }\r\n    @if $direction == default {\r\n        $direction: map-get($flex, direction);\r\n    }\r\n    .yo-flex#{$name} {\r\n        @if $direction == row {\r\n            height: auto;\r\n        }\r\n        &,\r\n        .flex-inherit {\r\n            // 如果$box不等于config预设，则重绘弹性盒类型\r\n            @if $box != map-get($flex, box) {\r\n                @include flexbox($box);\r\n            }\r\n            // 如果$direction不等于config预设，则重绘方向\r\n            @if $direction != map-get($flex, direction) {\r\n                @include flex-direction($direction);\r\n            }\r\n        }\r\n        > .flex,\r\n        .flex-inherit,\r\n        .flex-inherit > .flex {\r\n            // 如果$direction不等于config预设，则重绘方向\r\n            @if $direction != map-get($flex, direction) {\r\n                @include flex(1, $direction);\r\n            }\r\n        }\r\n        // 增量扩展\r\n        @content;\r\n    }\r\n}\r\n\r\n// 调用本文件时载入弹性布局基础构造\r\n.yo-flex {\r\n    @include _flex;\r\n}"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 18 */
/*!*******************************************************!*\
  !*** ./bower_components/Yo/lib/widget/yo-switch.scss ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-switch.scss */ 19);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-switch.scss */ 19, function() {
				var newContent = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-switch.scss */ 19);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 19 */
/*!**********************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./bower_components/Yo/lib/widget/yo-switch.scss ***!
  \**********************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * @module widget\r\n * @method yo-switch\r\n * @description 构造yo-switch的自定义使用方法\r\n * @demo http://doyoe.github.io/Yo/demo/widget/yo-switch.html\r\n * @param {String} $name 定义switch名称\r\n * @param {Color} $checked-bordercolor 定义switch激活边框色\r\n * @param {Color} $checked-bgcolor 定义switch激活背景色\r\n * @param {Color} $bordercolor 定义switch边框色\r\n * @param {Color} $bgcolor 定义switch背景色\r\n * @param {Color} $ball-color 定义switch滑块色\r\n */\n.yo-switch {\n  display: inline-block; }\n  .yo-switch > input {\n    display: none; }\n  .yo-switch > .track {\n    display: inline-block;\n    position: relative;\n    width: .6rem;\n    height: .32rem;\n    margin: 0;\n    cursor: pointer;\n    border: 0.02rem solid #ccc;\n    border-radius: 0.16rem;\n    -webkit-background-clip: padding-box !important;\n    background-clip: padding-box !important;\n    background-color: #fafafa;\n    vertical-align: middle;\n    -webkit-transition: border-color 0.1s ease-out, background-color 0.1s ease-out;\n    transition: border-color 0.1s ease-out, background-color 0.1s ease-out; }\n    .yo-switch > .track > .handle {\n      position: absolute;\n      top: 0;\n      left: 0;\n      width: 0.28rem;\n      height: 0.28rem;\n      border-radius: 50%;\n      background-color: #fff;\n      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);\n      -webkit-transition: -webkit-transform 0.1s ease-out;\n      transition: transform 0.1s ease-out;\n      -webkit-transform: translate(0, 0);\n      transform: translate(0, 0) translatez(0); }\n  .yo-switch > input:checked + .track {\n    border-color: #4bd763;\n    background-color: #4bd763; }\n    .yo-switch > input:checked + .track > .handle {\n      -webkit-transform: translate(100%, 0);\n      transform: translate(100%, 0) translatez(0); }\n  .yo-switch > input:disabled + .track {\n    opacity: .4;\n    border-color: #ccc;\n    background-color: #ccc; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/widget/yo-switch.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/widget/yo-switch.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;ACz1BH;;;;;;;;;;;GAWG;AA2DH;EAlHI,sBAAsB,EAoHzB;EAFD;IAhHQ,cAAc,EACjB;EA+GL;IA7GQ,sBAAsB;IACtB,mBAAmB;IACnB,aAAa;IACb,eAAe;IACf,UAAU;IACV,gBAAgB;IAChB,2BF0BsB;ICmS1B,uBC5TiC;IDEzB,gDA6TuC;IAzT/C,wCAyT+C;IC9T3C,0BF4ByB;IE3BzB,uBAAuB;IDoXnB,+EAJoE;IAY5E,uEAF8C,EC5W7C;IAsFL;MAjGY,mBAAmB;MACnB,OAAO;MACP,QAAQ;MDmzBhB,eClzB8B;MDmzB9B,gBCnzB8B;MACtB,mBAAmB;MACnB,uBF+XiB;ME9XjB,yCAA0B;MD2W1B,oDAN8E;MActF,oCAF8C;MC/WtC,mCAA4B;MAC5B,yCAAqC,EACxC;EAuFT;IApFQ,sBF+WwB;IE9WxB,0BFgXwB,EE3W3B;IA8EL;MAjFY,sCAA4B;MAC5B,4CAAwC,EAC3C;EA+ET;IA5EQ,YAAY;IACZ,mBFQsB;IEPtB,uBFOsB,EENzB","file":"yo-switch.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * @module widget\r\n * @method yo-switch\r\n * @description 构造yo-switch的自定义使用方法\r\n * @demo http://doyoe.github.io/Yo/demo/widget/yo-switch.html\r\n * @param {String} $name 定义switch名称\r\n * @param {Color} $checked-bordercolor 定义switch激活边框色\r\n * @param {Color} $checked-bgcolor 定义switch激活背景色\r\n * @param {Color} $bordercolor 定义switch边框色\r\n * @param {Color} $bgcolor 定义switch背景色\r\n * @param {Color} $ball-color 定义switch滑块色\r\n */\n.yo-switch {\n  display: inline-block; }\n  .yo-switch > input {\n    display: none; }\n  .yo-switch > .track {\n    display: inline-block;\n    position: relative;\n    width: .6rem;\n    height: .32rem;\n    margin: 0;\n    cursor: pointer;\n    border: 0.02rem solid #ccc;\n    border-radius: 0.16rem;\n    -webkit-background-clip: padding-box !important;\n    background-clip: padding-box !important;\n    background-color: #fafafa;\n    vertical-align: middle;\n    -webkit-transition: border-color 0.1s ease-out, background-color 0.1s ease-out;\n    transition: border-color 0.1s ease-out, background-color 0.1s ease-out; }\n    .yo-switch > .track > .handle {\n      position: absolute;\n      top: 0;\n      left: 0;\n      width: 0.28rem;\n      height: 0.28rem;\n      border-radius: 50%;\n      background-color: #fff;\n      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);\n      -webkit-transition: -webkit-transform 0.1s ease-out;\n      transition: transform 0.1s ease-out;\n      -webkit-transform: translate(0, 0);\n      transform: translate(0, 0) translatez(0); }\n  .yo-switch > input:checked + .track {\n    border-color: #4bd763;\n    background-color: #4bd763; }\n    .yo-switch > input:checked + .track > .handle {\n      -webkit-transform: translate(100%, 0);\n      transform: translate(100%, 0) translatez(0); }\n  .yo-switch > input:disabled + .track {\n    opacity: .4;\n    border-color: #ccc;\n    background-color: #ccc; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\r\n@import \"../core/variables\";\r\n@import \"../core/classes\";\r\n\r\n// 定义switch的基础构造\r\n@mixin _switch {\r\n    display: inline-block;\r\n    > input {\r\n        display: none;\r\n    }\r\n    > .track {\r\n        display: inline-block;\r\n        position: relative;\r\n        width: .6rem;\r\n        height: .32rem;\r\n        margin: 0;\r\n        cursor: pointer;\r\n        border: .02rem solid map-get($switch, bordercolor);\r\n        @include border-radius(.16rem);\r\n        background-color: map-get($switch, bgcolor);\r\n        vertical-align: middle;\r\n        @include transition(border-color .1s ease-out, background-color .1s ease-out);\r\n        > .handle {\r\n            position: absolute;\r\n            top: 0;\r\n            left: 0;\r\n            @include square(.28rem);\r\n            border-radius: 50%;\r\n            background-color: map-get($switch, ball-color);\r\n            box-shadow: 0 2px 5px rgba(0, 0, 0, .3);\r\n            @include transition(transform .1s ease-out);\r\n            -webkit-transform: translate(0, 0); // samsung s4 4.4.2 如果写了Z或者3D，元素的边框及背景色无法被圆角化\r\n            transform: translate(0, 0) translatez(0);\r\n        }\r\n    }\r\n    > input:checked + .track {\r\n        border-color: map-get($switch, checked-bordercolor);\r\n        background-color: map-get($switch, checked-bgcolor);\r\n        > .handle {\r\n            -webkit-transform: translate(100%, 0);\r\n            transform: translate(100%, 0) translatez(0);\r\n        }\r\n    }\r\n    > input:disabled + .track {\r\n        opacity: .4;\r\n        border-color: map-get($base, disabled-bordercolor);\r\n        background-color: map-get($base, disabled-bordercolor);\r\n    }\r\n}\r\n\r\n/**\r\n * @module widget\r\n * @method yo-switch\r\n * @description 构造yo-switch的自定义使用方法\r\n * @demo http://doyoe.github.io/Yo/demo/widget/yo-switch.html\r\n * @param {String} $name 定义switch名称\r\n * @param {Color} $checked-bordercolor 定义switch激活边框色\r\n * @param {Color} $checked-bgcolor 定义switch激活背景色\r\n * @param {Color} $bordercolor 定义switch边框色\r\n * @param {Color} $bgcolor 定义switch背景色\r\n * @param {Color} $ball-color 定义switch滑块色\r\n */\r\n\r\n@mixin yo-switch(\r\n    $name: default,\r\n    $checked-bordercolor: default,\r\n    $checked-bgcolor: default,\r\n    $bordercolor: default,\r\n    $bgcolor: default,\r\n    $ball-color: default) {\r\n    // 区别是否新增实例还是修改本身\r\n    @if $name == default {\r\n        $name: \"\";\r\n    } @else {\r\n        $name: \"-#{$name}\";\r\n    }\r\n    // 如果值为default，则取config的定义\r\n    @if $bordercolor == default {\r\n        $bordercolor: map-get($switch, bordercolor);\r\n    }\r\n    @if $bgcolor == default {\r\n        $bgcolor: map-get($switch, bgcolor);\r\n    }\r\n    @if $ball-color == default {\r\n        $ball-color: map-get($switch, ball-color);\r\n    }\r\n    @if $checked-bordercolor == default {\r\n        $checked-bordercolor: map-get($switch, checked-bordercolor);\r\n    }\r\n    @if $checked-bgcolor == default {\r\n        $checked-bgcolor: map-get($switch, checked-bgcolor);\r\n    }\r\n    .yo-switch#{$name} {\r\n        > .track {\r\n            @if $bordercolor != map-get($switch, bordercolor) {\r\n                border-color: $bordercolor;\r\n            }\r\n            @if $bgcolor != map-get($switch, bgcolor) {\r\n                background-color: $bgcolor;\r\n            }\r\n            > .handle {\r\n                @if $ball-color != map-get($switch, ball-color) {\r\n                    background-color: $ball-color;\r\n                }\r\n            }\r\n        }\r\n        > input:checked + .track {\r\n            @if $checked-bordercolor != map-get($switch, checked-bordercolor) {\r\n                border-color: $checked-bordercolor;\r\n            }\r\n            @if $checked-bgcolor != map-get($switch, checked-bgcolor) {\r\n                background-color: $checked-bgcolor;\r\n            }\r\n        }\r\n        // 增量扩展\r\n        @content;\r\n    }\r\n}\r\n\r\n// 调用本文件时载入switch基础构造\r\n.yo-switch {\r\n    @include _switch;\r\n}"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 20 */
/*!*********************************************************!*\
  !*** ./bower_components/Yo/lib/element/yo-checked.scss ***!
  \*********************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-checked.scss */ 21);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-checked.scss */ 21, function() {
				var newContent = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-checked.scss */ 21);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 21 */
/*!************************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./bower_components/Yo/lib/element/yo-checked.scss ***!
  \************************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * @module element\r\n * @method yo-checked\r\n * @description 构造单选多选的自定义使用方法，可同时作用于 checkbox 与 radio\r\n * @demo http://doyoe.github.io/Yo/demo/element/yo-checked.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {String} $content 标记（对勾，圆点或者任意字符，可以是webfonts的编码）\r\n * @param {Length} $size 元件大小\r\n * @param {Length} $font-size 标记大小\r\n * @param {Length} $border-width 边框厚度\r\n * @param {Color} $bordercolor 边框色\r\n * @param {Color} $bgcolor 背景色\r\n * @param {Color} $color 标记色\r\n * @param {Color} $on-bordercolor 选中时的边框色\r\n * @param {Color} $on-bgcolor 选中时的背景色\r\n * @param {Color} $on-color 选中时的标记色\r\n * @param {Length} $radius 圆角半径长度\r\n */\n.yo-checked {\n  display: inline-block;\n  position: relative;\n  width: 0.2rem;\n  height: 0.2rem;\n  font-size: 0.12rem;\n  font-family: yofont;\n  text-align: center;\n  vertical-align: middle;\n  cursor: pointer; }\n  .yo-checked > input,\n  .yo-checked > .type {\n    display: inline-block;\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%; }\n  .yo-checked > input {\n    z-index: 2;\n    opacity: 0; }\n  .yo-checked > .type {\n    border-radius: 0.05rem;\n    -webkit-background-clip: padding-box !important;\n    background-clip: padding-box !important;\n    background-color: transparent;\n    line-height: 0.2rem; }\n    .yo-checked > .type::after {\n      content: \"\\F078\";\n      color: transparent; }\n  .yo-checked > input:checked + .type::after {\n    color: #2b94ff; }\n  .yo-checked > input:disabled + .type {\n    opacity: .4;\n    background-color: #e0e0e0 !important; }\n    .yo-checked > input:disabled + .type::after {\n      color: #bbb !important; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/element/yo-checked.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/element/yo-checked.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;ACx0BH;;;;;;;;;;;;;;;;;GAiBG;AA0JH;EAxOI,sBAAsB;EACtB,mBAAmB;EDq0BnB,cD5mBqB;EC6mBrB,eD7mBqB;EEvNrB,mBFyNsB;EExNtB,oBFwFkB;EEvFlB,mBAAmB;EACnB,uBAAuB;EACvB,gBAAgB,EAmOnB;EAFD;;IA9NQ,sBAAsB;IACtB,mBAAmB;IACnB,OAAO;IACP,QAAQ;IDyzBZ,YCxzBwB;IDyzBxB,aCzzBwB,EACvB;EAyNL;IAvNQ,WAAW;IACX,WAAW,EACd;EAqNL;IDgGI,uBD5FsB;IC9Nd,gDA6TuC;IAzT/C,wCAyT+C;ICrT3C,8BAA8B;IAS1B,oBF2La,EErLpB;IAmML;MAtMY,iBFsLQ;MErLR,mBFiMmB,EEhMtB;EAoMT;IA3LY,eF6Le,EE5LlB;EA0LT;IAvLQ,YAAY;IAKZ,qCAA6D,EAIhE;IA8KL;MAhLY,uBAAgD,EACnD","file":"yo-checked.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * @module element\r\n * @method yo-checked\r\n * @description 构造单选多选的自定义使用方法，可同时作用于 checkbox 与 radio\r\n * @demo http://doyoe.github.io/Yo/demo/element/yo-checked.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {String} $content 标记（对勾，圆点或者任意字符，可以是webfonts的编码）\r\n * @param {Length} $size 元件大小\r\n * @param {Length} $font-size 标记大小\r\n * @param {Length} $border-width 边框厚度\r\n * @param {Color} $bordercolor 边框色\r\n * @param {Color} $bgcolor 背景色\r\n * @param {Color} $color 标记色\r\n * @param {Color} $on-bordercolor 选中时的边框色\r\n * @param {Color} $on-bgcolor 选中时的背景色\r\n * @param {Color} $on-color 选中时的标记色\r\n * @param {Length} $radius 圆角半径长度\r\n */\n.yo-checked {\n  display: inline-block;\n  position: relative;\n  width: 0.2rem;\n  height: 0.2rem;\n  font-size: 0.12rem;\n  font-family: yofont;\n  text-align: center;\n  vertical-align: middle;\n  cursor: pointer; }\n  .yo-checked > input,\n  .yo-checked > .type {\n    display: inline-block;\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%; }\n  .yo-checked > input {\n    z-index: 2;\n    opacity: 0; }\n  .yo-checked > .type {\n    border-radius: 0.05rem;\n    -webkit-background-clip: padding-box !important;\n    background-clip: padding-box !important;\n    background-color: transparent;\n    line-height: 0.2rem; }\n    .yo-checked > .type::after {\n      content: \"\";\n      color: transparent; }\n  .yo-checked > input:checked + .type::after {\n    color: #2b94ff; }\n  .yo-checked > input:disabled + .type {\n    opacity: .4;\n    background-color: #e0e0e0 !important; }\n    .yo-checked > input:disabled + .type::after {\n      color: #bbb !important; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\r\n@import \"../core/variables\";\r\n@import \"../core/classes\";\r\n\r\n// 定义checked的基础构造\r\n@mixin _checked {\r\n    display: inline-block;\r\n    position: relative;\r\n    @include square(map-get($checked, size));\r\n    font-size: map-get($checked, font-size);\r\n    font-family: map-get($ico, font-name);\r\n    text-align: center;\r\n    vertical-align: middle;\r\n    cursor: pointer;\r\n    > input,\r\n    > .type {\r\n        display: inline-block;\r\n        position: absolute;\r\n        top: 0;\r\n        left: 0;\r\n        @include square(100%);\r\n    }\r\n    > input {\r\n        z-index: 2;\r\n        opacity: 0;\r\n    }\r\n    > .type {\r\n        @include border-radius(map-get($checked, radius));\r\n        background-color: transparent;\r\n        // 当边框厚度大于0时，才定义边框相关属性\r\n        @if map-get($checked, border-width) != null and\r\n            map-get($checked, border-width) != 0 {\r\n            border-width: map-get($checked, border-width);\r\n            border-style: solid;\r\n            border-color: map-get($checked, bordercolor);\r\n            line-height: map-get($checked, size) - nth(map-get($checked, border-width), 1) * 2;\r\n        } @else {\r\n            line-height: map-get($checked, size);\r\n        }\r\n        &::after {\r\n            content: map-get($checked, content);\r\n            color: map-get($checked, color);\r\n        }\r\n    }\r\n    > input:checked + .type {\r\n        @if map-get($checked, border-width) != null and\r\n            map-get($checked, border-width) != 0 {\r\n            border-color: map-get($checked, on-bordercolor);\r\n        }\r\n        background-color: map-get($checked, on-bgcolor);\r\n        &::after {\r\n            color: map-get($checked, on-color);\r\n        }\r\n    }\r\n    > input:disabled + .type {\r\n        opacity: .4;\r\n        @if map-get($checked, border-width) != null and\r\n            map-get($checked, border-width) != 0 {\r\n            border-color: map-get($base, disabled-bordercolor) !important;\r\n        }\r\n        background-color: map-get($base, disabled-bgcolor) !important;\r\n        &::after {\r\n            color: map-get($base, disabled-color) !important;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module element\r\n * @method yo-checked\r\n * @description 构造单选多选的自定义使用方法，可同时作用于 checkbox 与 radio\r\n * @demo http://doyoe.github.io/Yo/demo/element/yo-checked.html\r\n * @param {String} $name 为新的扩展定义一个名称\r\n * @param {String} $content 标记（对勾，圆点或者任意字符，可以是webfonts的编码）\r\n * @param {Length} $size 元件大小\r\n * @param {Length} $font-size 标记大小\r\n * @param {Length} $border-width 边框厚度\r\n * @param {Color} $bordercolor 边框色\r\n * @param {Color} $bgcolor 背景色\r\n * @param {Color} $color 标记色\r\n * @param {Color} $on-bordercolor 选中时的边框色\r\n * @param {Color} $on-bgcolor 选中时的背景色\r\n * @param {Color} $on-color 选中时的标记色\r\n * @param {Length} $radius 圆角半径长度\r\n */\r\n\r\n@mixin yo-checked(\r\n    $name: default,\r\n    $content: default,\r\n    $size: default,\r\n    $font-size: default,\r\n    $border-width: default,\r\n    $bordercolor: default,\r\n    $bgcolor: default,\r\n    $color: default,\r\n    $on-bordercolor: default,\r\n    $on-bgcolor: default,\r\n    $on-color: default,\r\n    $radius: default) {\r\n    // 区别是否新增实例还是修改本身\r\n    @if $name == default {\r\n        $name: \"\";\r\n    } @else {\r\n        $name: \"-#{$name}\";\r\n    }\r\n    // 如果值为default，则取config的定义\r\n    @if $content == default {\r\n        $content: map-get($checked, content);\r\n    }\r\n    @if $size == default {\r\n        $size: map-get($checked, size);\r\n    }\r\n    @if $font-size == default {\r\n        $font-size: map-get($checked, font-size);\r\n    }\r\n    @if $border-width == default {\r\n        $border-width: map-get($checked, border-width);\r\n    }\r\n    @if $bordercolor == default {\r\n        $bordercolor: map-get($checked, bordercolor);\r\n    }\r\n    @if $bgcolor == default {\r\n        $bgcolor: map-get($checked, bgcolor);\r\n    }\r\n    @if $color == default {\r\n        $color: map-get($checked, color);\r\n    }\r\n    @if $on-bordercolor == default {\r\n        $on-bordercolor: map-get($checked, on-bordercolor);\r\n    }\r\n    @if $on-bgcolor == default {\r\n        $on-bgcolor: map-get($checked, on-bgcolor);\r\n    }\r\n    @if $on-color == default {\r\n        $on-color: map-get($checked, on-color);\r\n    }\r\n    @if $radius == default {\r\n        $radius: map-get($checked, radius);\r\n    }\r\n    .yo-checked#{$name} {\r\n        @if $size != map-get($checked, size) {\r\n            @include square($size);\r\n        }\r\n        @if $font-size != map-get($checked, font-size) {\r\n            font-size: $font-size;\r\n        }\r\n        > .type {\r\n            @if $radius != map-get($checked, radius) {\r\n                // 构造里已处理过边框+圆角+背景溢出的问题，所以这里写原生即可\r\n                border-radius: $radius;\r\n            }\r\n            // 如果$border-width不等于config设定，则重绘边框相关\r\n            @if $border-width != map-get($checked, border-width) {\r\n                // 如果$border-width为null，重设置为0\r\n                @if $border-width == null {\r\n                    $border-width: 0;\r\n                }\r\n                border-width: $border-width;\r\n                // 如果$bordercolor不等于config设定，则重绘边框色\r\n                @if $bordercolor != map-get($checked, bordercolor) {\r\n                    @if $border-width != 0 {\r\n                        border-color: $bordercolor;\r\n                    }\r\n                } @else {\r\n                    // 如果config的边框厚度定义为null或者0，在扩展时，加上边框色\r\n                    @if map-get($checked, border-width) == null or\r\n                        map-get($checked, border-width) == 0 {\r\n                        border-color: map-get($checked, bordercolor);\r\n                    }\r\n                }\r\n                // 如果config的边框厚度定义为null或者0，在扩展时，加上border-style\r\n                @if map-get($checked, border-width) == null or\r\n                    map-get($checked, border-width) == 0 {\r\n                    border-style: solid;\r\n                }\r\n                line-height: $size - nth($border-width, 1) * 2;\r\n            } @else {\r\n                // 如果扩展的边框厚度大于0且边框色和config边框色不同，在扩展时，重绘边框色\r\n                @if $border-width != null and\r\n                    $border-width != 0 and\r\n                    $bordercolor != map-get($checked, bordercolor) {\r\n                    border-color: $bordercolor;\r\n                }\r\n            }\r\n            @if $bgcolor != map-get($checked, bgcolor) {\r\n                background-color: $bgcolor;\r\n            }\r\n            &::after {\r\n                @if $content != map-get($checked, content) {\r\n                    content: $content;\r\n                }\r\n                @if $color != map-get($checked, color) {\r\n                    color: $color;\r\n                }\r\n            }\r\n        }\r\n        > input:checked + .type {\r\n            // 如果$border-width不等于config设定，则重绘边框相关\r\n            @if $border-width != map-get($checked, border-width) {\r\n                // 如果$border-width为null，重设置为0\r\n                @if $border-width == null {\r\n                    $border-width: 0;\r\n                }\r\n                // 如果$on-bordercolor不等于config设定，则重绘边框色\r\n                @if $on-bordercolor != map-get($checked, on-bordercolor) {\r\n                    @if $border-width != 0 {\r\n                        border-color: $on-bordercolor;\r\n                    }\r\n                } @else {\r\n                    // 如果config的边框厚度定义为null或者0，在扩展时，加上边框色\r\n                    @if map-get($checked, border-width) == null or\r\n                        map-get($checked, border-width) == 0 {\r\n                        border-color: map-get($checked, on-bordercolor);\r\n                    }\r\n                }\r\n            } @else {\r\n                // 如果扩展的边框厚度大于0且边框色和config边框色不同，在扩展时，重绘边框色\r\n                @if $border-width != null and\r\n                    $border-width != 0 and\r\n                    $on-bordercolor != map-get($checked, on-bordercolor) {\r\n                    border-color: $on-bordercolor;\r\n                }\r\n            }\r\n            @if $on-bgcolor != map-get($checked, on-bgcolor) {\r\n                background-color: $on-bgcolor;\r\n            }\r\n            &::after {\r\n                @if $on-color != map-get($checked, on-color) {\r\n                    color: $on-color;\r\n                }\r\n            }\r\n        }\r\n        // 增量扩展\r\n        @content;\r\n    }\r\n}\r\n\r\n// 调用本文件时载入checked基础构造\r\n.yo-checked {\r\n    @include _checked;\r\n}"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 22 */
/*!*****************************************!*\
  !*** ./bower_components/zepto/zepto.js ***!
  \*****************************************/
/***/ function(module, exports) {

	'use strict';
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */
	
	var Zepto = (function () {
	  var undefined,
	      key,
	      $,
	      classList,
	      emptyArray = [],
	      _slice = emptyArray.slice,
	      _filter = emptyArray.filter,
	      document = window.document,
	      elementDisplay = {},
	      classCache = {},
	      cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
	      fragmentRE = /^\s*<(\w+|!)[^>]*>/,
	      singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
	      tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	      rootNodeRE = /^(?:body|html)$/i,
	      capitalRE = /([A-Z])/g,
	
	  // special attributes that should be get/set via method calls
	  methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
	      adjacencyOperators = ['after', 'prepend', 'before', 'append'],
	      table = document.createElement('table'),
	      tableRow = document.createElement('tr'),
	      containers = {
	    'tr': document.createElement('tbody'),
	    'tbody': table, 'thead': table, 'tfoot': table,
	    'td': tableRow, 'th': tableRow,
	    '*': document.createElement('div')
	  },
	      readyRE = /complete|loaded|interactive/,
	      simpleSelectorRE = /^[\w-]*$/,
	      class2type = {},
	      toString = class2type.toString,
	      zepto = {},
	      camelize,
	      uniq,
	      tempParent = document.createElement('div'),
	      propMap = {
	    'tabindex': 'tabIndex',
	    'readonly': 'readOnly',
	    'for': 'htmlFor',
	    'class': 'className',
	    'maxlength': 'maxLength',
	    'cellspacing': 'cellSpacing',
	    'cellpadding': 'cellPadding',
	    'rowspan': 'rowSpan',
	    'colspan': 'colSpan',
	    'usemap': 'useMap',
	    'frameborder': 'frameBorder',
	    'contenteditable': 'contentEditable'
	  },
	      isArray = Array.isArray || function (object) {
	    return object instanceof Array;
	  };
	
	  zepto.matches = function (element, selector) {
	    if (!selector || !element || element.nodeType !== 1) return false;
	    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector;
	    if (matchesSelector) return matchesSelector.call(element, selector);
	    // fall back to performing a selector:
	    var match,
	        parent = element.parentNode,
	        temp = !parent;
	    if (temp) (parent = tempParent).appendChild(element);
	    match = ~zepto.qsa(parent, selector).indexOf(element);
	    temp && tempParent.removeChild(element);
	    return match;
	  };
	
	  function type(obj) {
	    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
	  }
	
	  function isFunction(value) {
	    return type(value) == "function";
	  }
	  function isWindow(obj) {
	    return obj != null && obj == obj.window;
	  }
	  function isDocument(obj) {
	    return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
	  }
	  function isObject(obj) {
	    return type(obj) == "object";
	  }
	  function isPlainObject(obj) {
	    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
	  }
	  function likeArray(obj) {
	    return typeof obj.length == 'number';
	  }
	
	  function compact(array) {
	    return _filter.call(array, function (item) {
	      return item != null;
	    });
	  }
	  function flatten(array) {
	    return array.length > 0 ? $.fn.concat.apply([], array) : array;
	  }
	  camelize = function (str) {
	    return str.replace(/-+(.)?/g, function (match, chr) {
	      return chr ? chr.toUpperCase() : '';
	    });
	  };
	  function dasherize(str) {
	    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
	  }
	  uniq = function (array) {
	    return _filter.call(array, function (item, idx) {
	      return array.indexOf(item) == idx;
	    });
	  };
	
	  function classRE(name) {
	    return name in classCache ? classCache[name] : classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)');
	  }
	
	  function maybeAddPx(name, value) {
	    return typeof value == "number" && !cssNumber[dasherize(name)] ? value + "px" : value;
	  }
	
	  function defaultDisplay(nodeName) {
	    var element, display;
	    if (!elementDisplay[nodeName]) {
	      element = document.createElement(nodeName);
	      document.body.appendChild(element);
	      display = getComputedStyle(element, '').getPropertyValue("display");
	      element.parentNode.removeChild(element);
	      display == "none" && (display = "block");
	      elementDisplay[nodeName] = display;
	    }
	    return elementDisplay[nodeName];
	  }
	
	  function _children(element) {
	    return 'children' in element ? _slice.call(element.children) : $.map(element.childNodes, function (node) {
	      if (node.nodeType == 1) return node;
	    });
	  }
	
	  // `$.zepto.fragment` takes a html string and an optional tag name
	  // to generate DOM nodes nodes from the given html string.
	  // The generated DOM nodes are returned as an array.
	  // This function can be overriden in plugins for example to make
	  // it compatible with browsers that don't support the DOM fully.
	  zepto.fragment = function (html, name, properties) {
	    var dom, nodes, container;
	
	    // A special case optimization for a single tag
	    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1));
	
	    if (!dom) {
	      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
	      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
	      if (!(name in containers)) name = '*';
	
	      container = containers[name];
	      container.innerHTML = '' + html;
	      dom = $.each(_slice.call(container.childNodes), function () {
	        container.removeChild(this);
	      });
	    }
	
	    if (isPlainObject(properties)) {
	      nodes = $(dom);
	      $.each(properties, function (key, value) {
	        if (methodAttributes.indexOf(key) > -1) nodes[key](value);else nodes.attr(key, value);
	      });
	    }
	
	    return dom;
	  };
	
	  // `$.zepto.Z` swaps out the prototype of the given `dom` array
	  // of nodes with `$.fn` and thus supplying all the Zepto functions
	  // to the array. Note that `__proto__` is not supported on Internet
	  // Explorer. This method can be overriden in plugins.
	  zepto.Z = function (dom, selector) {
	    dom = dom || [];
	    dom.__proto__ = $.fn;
	    dom.selector = selector || '';
	    return dom;
	  };
	
	  // `$.zepto.isZ` should return `true` if the given object is a Zepto
	  // collection. This method can be overriden in plugins.
	  zepto.isZ = function (object) {
	    return object instanceof zepto.Z;
	  };
	
	  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
	  // takes a CSS selector and an optional context (and handles various
	  // special cases).
	  // This method can be overriden in plugins.
	  zepto.init = function (selector, context) {
	    var dom;
	    // If nothing given, return an empty Zepto collection
	    if (!selector) return zepto.Z();
	    // Optimize for string selectors
	    else if (typeof selector == 'string') {
	        selector = selector.trim();
	        // If it's a html fragment, create nodes from it
	        // Note: In both Chrome 21 and Firefox 15, DOM error 12
	        // is thrown if the fragment doesn't begin with <
	        if (selector[0] == '<' && fragmentRE.test(selector)) dom = zepto.fragment(selector, RegExp.$1, context), selector = null;
	        // If there's a context, create a collection on that context first, and select
	        // nodes from there
	        else if (context !== undefined) return $(context).find(selector);
	          // If it's a CSS selector, use it to select nodes.
	          else dom = zepto.qsa(document, selector);
	      }
	      // If a function is given, call it when the DOM is ready
	      else if (isFunction(selector)) return $(document).ready(selector);
	        // If a Zepto collection is given, just return it
	        else if (zepto.isZ(selector)) return selector;else {
	            // normalize array if an array of nodes is given
	            if (isArray(selector)) dom = compact(selector);
	            // Wrap DOM nodes.
	            else if (isObject(selector)) dom = [selector], selector = null;
	              // If it's a html fragment, create nodes from it
	              else if (fragmentRE.test(selector)) dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null;
	                // If there's a context, create a collection on that context first, and select
	                // nodes from there
	                else if (context !== undefined) return $(context).find(selector);
	                  // And last but no least, if it's a CSS selector, use it to select nodes.
	                  else dom = zepto.qsa(document, selector);
	          }
	    // create a new Zepto collection from the nodes found
	    return zepto.Z(dom, selector);
	  };
	
	  // `$` will be the base `Zepto` object. When calling this
	  // function just call `$.zepto.init, which makes the implementation
	  // details of selecting nodes and creating Zepto collections
	  // patchable in plugins.
	  $ = function (selector, context) {
	    return zepto.init(selector, context);
	  };
	
	  function extend(target, source, deep) {
	    for (key in source) {
	      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
	        if (isPlainObject(source[key]) && !isPlainObject(target[key])) target[key] = {};
	        if (isArray(source[key]) && !isArray(target[key])) target[key] = [];
	        extend(target[key], source[key], deep);
	      } else if (source[key] !== undefined) target[key] = source[key];
	    }
	  }
	
	  // Copy all but undefined properties from one or more
	  // objects to the `target` object.
	  $.extend = function (target) {
	    var deep,
	        args = _slice.call(arguments, 1);
	    if (typeof target == 'boolean') {
	      deep = target;
	      target = args.shift();
	    }
	    args.forEach(function (arg) {
	      extend(target, arg, deep);
	    });
	    return target;
	  };
	
	  // `$.zepto.qsa` is Zepto's CSS selector implementation which
	  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
	  // This method can be overriden in plugins.
	  zepto.qsa = function (element, selector) {
	    var found,
	        maybeID = selector[0] == '#',
	        maybeClass = !maybeID && selector[0] == '.',
	        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
	        // Ensure that a 1 char tag name still gets checked
	    isSimple = simpleSelectorRE.test(nameOnly);
	    return isDocument(element) && isSimple && maybeID ? (found = element.getElementById(nameOnly)) ? [found] : [] : element.nodeType !== 1 && element.nodeType !== 9 ? [] : _slice.call(isSimple && !maybeID ? maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
	    element.getElementsByTagName(selector) : // Or a tag
	    element.querySelectorAll(selector) // Or it's not simple, and we need to query all
	    );
	  };
	
	  function filtered(nodes, selector) {
	    return selector == null ? $(nodes) : $(nodes).filter(selector);
	  }
	
	  $.contains = document.documentElement.contains ? function (parent, node) {
	    return parent !== node && parent.contains(node);
	  } : function (parent, node) {
	    while (node && (node = node.parentNode)) {
	      if (node === parent) return true;
	    }return false;
	  };
	
	  function funcArg(context, arg, idx, payload) {
	    return isFunction(arg) ? arg.call(context, idx, payload) : arg;
	  }
	
	  function setAttribute(node, name, value) {
	    value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
	  }
	
	  // access className property while respecting SVGAnimatedString
	  function className(node, value) {
	    var klass = node.className || '',
	        svg = klass && klass.baseVal !== undefined;
	
	    if (value === undefined) return svg ? klass.baseVal : klass;
	    svg ? klass.baseVal = value : node.className = value;
	  }
	
	  // "true"  => true
	  // "false" => false
	  // "null"  => null
	  // "42"    => 42
	  // "42.5"  => 42.5
	  // "08"    => "08"
	  // JSON    => parse if valid
	  // String  => self
	  function deserializeValue(value) {
	    try {
	      return value ? value == "true" || (value == "false" ? false : value == "null" ? null : +value + "" == value ? +value : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
	    } catch (e) {
	      return value;
	    }
	  }
	
	  $.type = type;
	  $.isFunction = isFunction;
	  $.isWindow = isWindow;
	  $.isArray = isArray;
	  $.isPlainObject = isPlainObject;
	
	  $.isEmptyObject = function (obj) {
	    var name;
	    for (name in obj) {
	      return false;
	    }return true;
	  };
	
	  $.inArray = function (elem, array, i) {
	    return emptyArray.indexOf.call(array, elem, i);
	  };
	
	  $.camelCase = camelize;
	  $.trim = function (str) {
	    return str == null ? "" : String.prototype.trim.call(str);
	  };
	
	  // plugin compatibility
	  $.uuid = 0;
	  $.support = {};
	  $.expr = {};
	
	  $.map = function (elements, callback) {
	    var value,
	        values = [],
	        i,
	        key;
	    if (likeArray(elements)) for (i = 0; i < elements.length; i++) {
	      value = callback(elements[i], i);
	      if (value != null) values.push(value);
	    } else for (key in elements) {
	      value = callback(elements[key], key);
	      if (value != null) values.push(value);
	    }
	    return flatten(values);
	  };
	
	  $.each = function (elements, callback) {
	    var i, key;
	    if (likeArray(elements)) {
	      for (i = 0; i < elements.length; i++) {
	        if (callback.call(elements[i], i, elements[i]) === false) return elements;
	      }
	    } else {
	      for (key in elements) {
	        if (callback.call(elements[key], key, elements[key]) === false) return elements;
	      }
	    }
	
	    return elements;
	  };
	
	  $.grep = function (elements, callback) {
	    return _filter.call(elements, callback);
	  };
	
	  if (window.JSON) $.parseJSON = JSON.parse;
	
	  // Populate the class2type map
	  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
	    class2type["[object " + name + "]"] = name.toLowerCase();
	  });
	
	  // Define methods that will be available on all
	  // Zepto collections
	  $.fn = {
	    // Because a collection acts like an array
	    // copy over these useful array functions.
	    forEach: emptyArray.forEach,
	    reduce: emptyArray.reduce,
	    push: emptyArray.push,
	    sort: emptyArray.sort,
	    indexOf: emptyArray.indexOf,
	    concat: emptyArray.concat,
	
	    // `map` and `slice` in the jQuery API work differently
	    // from their array counterparts
	    map: function map(fn) {
	      return $($.map(this, function (el, i) {
	        return fn.call(el, i, el);
	      }));
	    },
	    slice: function slice() {
	      return $(_slice.apply(this, arguments));
	    },
	
	    ready: function ready(callback) {
	      // need to check if document.body exists for IE as that browser reports
	      // document ready when it hasn't yet created the body element
	      if (readyRE.test(document.readyState) && document.body) callback($);else document.addEventListener('DOMContentLoaded', function () {
	        callback($);
	      }, false);
	      return this;
	    },
	    get: function get(idx) {
	      return idx === undefined ? _slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
	    },
	    toArray: function toArray() {
	      return this.get();
	    },
	    size: function size() {
	      return this.length;
	    },
	    remove: function remove() {
	      return this.each(function () {
	        if (this.parentNode != null) this.parentNode.removeChild(this);
	      });
	    },
	    each: function each(callback) {
	      emptyArray.every.call(this, function (el, idx) {
	        return callback.call(el, idx, el) !== false;
	      });
	      return this;
	    },
	    filter: function filter(selector) {
	      if (isFunction(selector)) return this.not(this.not(selector));
	      return $(_filter.call(this, function (element) {
	        return zepto.matches(element, selector);
	      }));
	    },
	    add: function add(selector, context) {
	      return $(uniq(this.concat($(selector, context))));
	    },
	    is: function is(selector) {
	      return this.length > 0 && zepto.matches(this[0], selector);
	    },
	    not: function not(selector) {
	      var nodes = [];
	      if (isFunction(selector) && selector.call !== undefined) this.each(function (idx) {
	        if (!selector.call(this, idx)) nodes.push(this);
	      });else {
	        var excludes = typeof selector == 'string' ? this.filter(selector) : likeArray(selector) && isFunction(selector.item) ? _slice.call(selector) : $(selector);
	        this.forEach(function (el) {
	          if (excludes.indexOf(el) < 0) nodes.push(el);
	        });
	      }
	      return $(nodes);
	    },
	    has: function has(selector) {
	      return this.filter(function () {
	        return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size();
	      });
	    },
	    eq: function eq(idx) {
	      return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
	    },
	    first: function first() {
	      var el = this[0];
	      return el && !isObject(el) ? el : $(el);
	    },
	    last: function last() {
	      var el = this[this.length - 1];
	      return el && !isObject(el) ? el : $(el);
	    },
	    find: function find(selector) {
	      var result,
	          $this = this;
	      if (!selector) result = $();else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) == 'object') result = $(selector).filter(function () {
	        var node = this;
	        return emptyArray.some.call($this, function (parent) {
	          return $.contains(parent, node);
	        });
	      });else if (this.length == 1) result = $(zepto.qsa(this[0], selector));else result = this.map(function () {
	        return zepto.qsa(this, selector);
	      });
	      return result;
	    },
	    closest: function closest(selector, context) {
	      var node = this[0],
	          collection = false;
	      if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) == 'object') collection = $(selector);
	      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector))) {
	        node = node !== context && !isDocument(node) && node.parentNode;
	      }return $(node);
	    },
	    parents: function parents(selector) {
	      var ancestors = [],
	          nodes = this;
	      while (nodes.length > 0) {
	        nodes = $.map(nodes, function (node) {
	          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
	            ancestors.push(node);
	            return node;
	          }
	        });
	      }return filtered(ancestors, selector);
	    },
	    parent: function parent(selector) {
	      return filtered(uniq(this.pluck('parentNode')), selector);
	    },
	    children: function children(selector) {
	      return filtered(this.map(function () {
	        return _children(this);
	      }), selector);
	    },
	    contents: function contents() {
	      return this.map(function () {
	        return _slice.call(this.childNodes);
	      });
	    },
	    siblings: function siblings(selector) {
	      return filtered(this.map(function (i, el) {
	        return _filter.call(_children(el.parentNode), function (child) {
	          return child !== el;
	        });
	      }), selector);
	    },
	    empty: function empty() {
	      return this.each(function () {
	        this.innerHTML = '';
	      });
	    },
	    // `pluck` is borrowed from Prototype.js
	    pluck: function pluck(property) {
	      return $.map(this, function (el) {
	        return el[property];
	      });
	    },
	    show: function show() {
	      return this.each(function () {
	        this.style.display == "none" && (this.style.display = '');
	        if (getComputedStyle(this, '').getPropertyValue("display") == "none") this.style.display = defaultDisplay(this.nodeName);
	      });
	    },
	    replaceWith: function replaceWith(newContent) {
	      return this.before(newContent).remove();
	    },
	    wrap: function wrap(structure) {
	      var func = isFunction(structure);
	      if (this[0] && !func) var dom = $(structure).get(0),
	          clone = dom.parentNode || this.length > 1;
	
	      return this.each(function (index) {
	        $(this).wrapAll(func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom);
	      });
	    },
	    wrapAll: function wrapAll(structure) {
	      if (this[0]) {
	        $(this[0]).before(structure = $(structure));
	        var children;
	        // drill down to the inmost element
	        while ((children = structure.children()).length) {
	          structure = children.first();
	        }$(structure).append(this);
	      }
	      return this;
	    },
	    wrapInner: function wrapInner(structure) {
	      var func = isFunction(structure);
	      return this.each(function (index) {
	        var self = $(this),
	            contents = self.contents(),
	            dom = func ? structure.call(this, index) : structure;
	        contents.length ? contents.wrapAll(dom) : self.append(dom);
	      });
	    },
	    unwrap: function unwrap() {
	      this.parent().each(function () {
	        $(this).replaceWith($(this).children());
	      });
	      return this;
	    },
	    clone: function clone() {
	      return this.map(function () {
	        return this.cloneNode(true);
	      });
	    },
	    hide: function hide() {
	      return this.css("display", "none");
	    },
	    toggle: function toggle(setting) {
	      return this.each(function () {
	        var el = $(this);(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide();
	      });
	    },
	    prev: function prev(selector) {
	      return $(this.pluck('previousElementSibling')).filter(selector || '*');
	    },
	    next: function next(selector) {
	      return $(this.pluck('nextElementSibling')).filter(selector || '*');
	    },
	    html: function html(_html) {
	      return 0 in arguments ? this.each(function (idx) {
	        var originHtml = this.innerHTML;
	        $(this).empty().append(funcArg(this, _html, idx, originHtml));
	      }) : 0 in this ? this[0].innerHTML : null;
	    },
	    text: function text(_text) {
	      return 0 in arguments ? this.each(function (idx) {
	        var newText = funcArg(this, _text, idx, this.textContent);
	        this.textContent = newText == null ? '' : '' + newText;
	      }) : 0 in this ? this[0].textContent : null;
	    },
	    attr: function attr(name, value) {
	      var result;
	      return typeof name == 'string' && !(1 in arguments) ? !this.length || this[0].nodeType !== 1 ? undefined : !(result = this[0].getAttribute(name)) && name in this[0] ? this[0][name] : result : this.each(function (idx) {
	        if (this.nodeType !== 1) return;
	        if (isObject(name)) for (key in name) {
	          setAttribute(this, key, name[key]);
	        } else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
	      });
	    },
	    removeAttr: function removeAttr(name) {
	      return this.each(function () {
	        this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
	          setAttribute(this, attribute);
	        }, this);
	      });
	    },
	    prop: function prop(name, value) {
	      name = propMap[name] || name;
	      return 1 in arguments ? this.each(function (idx) {
	        this[name] = funcArg(this, value, idx, this[name]);
	      }) : this[0] && this[0][name];
	    },
	    data: function data(name, value) {
	      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();
	
	      var data = 1 in arguments ? this.attr(attrName, value) : this.attr(attrName);
	
	      return data !== null ? deserializeValue(data) : undefined;
	    },
	    val: function val(value) {
	      return 0 in arguments ? this.each(function (idx) {
	        this.value = funcArg(this, value, idx, this.value);
	      }) : this[0] && (this[0].multiple ? $(this[0]).find('option').filter(function () {
	        return this.selected;
	      }).pluck('value') : this[0].value);
	    },
	    offset: function offset(coordinates) {
	      if (coordinates) return this.each(function (index) {
	        var $this = $(this),
	            coords = funcArg(this, coordinates, index, $this.offset()),
	            parentOffset = $this.offsetParent().offset(),
	            props = {
	          top: coords.top - parentOffset.top,
	          left: coords.left - parentOffset.left
	        };
	
	        if ($this.css('position') == 'static') props['position'] = 'relative';
	        $this.css(props);
	      });
	      if (!this.length) return null;
	      var obj = this[0].getBoundingClientRect();
	      return {
	        left: obj.left + window.pageXOffset,
	        top: obj.top + window.pageYOffset,
	        width: Math.round(obj.width),
	        height: Math.round(obj.height)
	      };
	    },
	    css: function css(property, value) {
	      if (arguments.length < 2) {
	        var computedStyle,
	            element = this[0];
	        if (!element) return;
	        computedStyle = getComputedStyle(element, '');
	        if (typeof property == 'string') return element.style[camelize(property)] || computedStyle.getPropertyValue(property);else if (isArray(property)) {
	          var props = {};
	          $.each(property, function (_, prop) {
	            props[prop] = element.style[camelize(prop)] || computedStyle.getPropertyValue(prop);
	          });
	          return props;
	        }
	      }
	
	      var css = '';
	      if (type(property) == 'string') {
	        if (!value && value !== 0) this.each(function () {
	          this.style.removeProperty(dasherize(property));
	        });else css = dasherize(property) + ":" + maybeAddPx(property, value);
	      } else {
	        for (key in property) {
	          if (!property[key] && property[key] !== 0) this.each(function () {
	            this.style.removeProperty(dasherize(key));
	          });else css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
	        }
	      }
	
	      return this.each(function () {
	        this.style.cssText += ';' + css;
	      });
	    },
	    index: function index(element) {
	      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
	    },
	    hasClass: function hasClass(name) {
	      if (!name) return false;
	      return emptyArray.some.call(this, function (el) {
	        return this.test(className(el));
	      }, classRE(name));
	    },
	    addClass: function addClass(name) {
	      if (!name) return this;
	      return this.each(function (idx) {
	        if (!('className' in this)) return;
	        classList = [];
	        var cls = className(this),
	            newName = funcArg(this, name, idx, cls);
	        newName.split(/\s+/g).forEach(function (klass) {
	          if (!$(this).hasClass(klass)) classList.push(klass);
	        }, this);
	        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "));
	      });
	    },
	    removeClass: function removeClass(name) {
	      return this.each(function (idx) {
	        if (!('className' in this)) return;
	        if (name === undefined) return className(this, '');
	        classList = className(this);
	        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
	          classList = classList.replace(classRE(klass), " ");
	        });
	        className(this, classList.trim());
	      });
	    },
	    toggleClass: function toggleClass(name, when) {
	      if (!name) return this;
	      return this.each(function (idx) {
	        var $this = $(this),
	            names = funcArg(this, name, idx, className(this));
	        names.split(/\s+/g).forEach(function (klass) {
	          (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass);
	        });
	      });
	    },
	    scrollTop: function scrollTop(value) {
	      if (!this.length) return;
	      var hasScrollTop = 'scrollTop' in this[0];
	      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
	      return this.each(hasScrollTop ? function () {
	        this.scrollTop = value;
	      } : function () {
	        this.scrollTo(this.scrollX, value);
	      });
	    },
	    scrollLeft: function scrollLeft(value) {
	      if (!this.length) return;
	      var hasScrollLeft = 'scrollLeft' in this[0];
	      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
	      return this.each(hasScrollLeft ? function () {
	        this.scrollLeft = value;
	      } : function () {
	        this.scrollTo(value, this.scrollY);
	      });
	    },
	    position: function position() {
	      if (!this.length) return;
	
	      var elem = this[0],
	
	      // Get *real* offsetParent
	      offsetParent = this.offsetParent(),
	
	      // Get correct offsets
	      offset = this.offset(),
	          parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();
	
	      // Subtract element margins
	      // note: when an element has margin: auto the offsetLeft and marginLeft
	      // are the same in Safari causing offset.left to incorrectly be 0
	      offset.top -= parseFloat($(elem).css('margin-top')) || 0;
	      offset.left -= parseFloat($(elem).css('margin-left')) || 0;
	
	      // Add offsetParent borders
	      parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
	      parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;
	
	      // Subtract the two offsets
	      return {
	        top: offset.top - parentOffset.top,
	        left: offset.left - parentOffset.left
	      };
	    },
	    offsetParent: function offsetParent() {
	      return this.map(function () {
	        var parent = this.offsetParent || document.body;
	        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static") {
	          parent = parent.offsetParent;
	        }return parent;
	      });
	    }
	  };
	
	  // for now
	  $.fn.detach = $.fn.remove
	
	  // Generate the `width` and `height` functions
	  ;['width', 'height'].forEach(function (dimension) {
	    var dimensionProperty = dimension.replace(/./, function (m) {
	      return m[0].toUpperCase();
	    });
	
	    $.fn[dimension] = function (value) {
	      var offset,
	          el = this[0];
	      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] : isDocument(el) ? el.documentElement['scroll' + dimensionProperty] : (offset = this.offset()) && offset[dimension];else return this.each(function (idx) {
	        el = $(this);
	        el.css(dimension, funcArg(this, value, idx, el[dimension]()));
	      });
	    };
	  });
	
	  function traverseNode(node, fun) {
	    fun(node);
	    for (var i = 0, len = node.childNodes.length; i < len; i++) {
	      traverseNode(node.childNodes[i], fun);
	    }
	  }
	
	  // Generate the `after`, `prepend`, `before`, `append`,
	  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
	  adjacencyOperators.forEach(function (operator, operatorIndex) {
	    var inside = operatorIndex % 2; //=> prepend, append
	
	    $.fn[operator] = function () {
	      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
	      var argType,
	          nodes = $.map(arguments, function (arg) {
	        argType = type(arg);
	        return argType == "object" || argType == "array" || arg == null ? arg : zepto.fragment(arg);
	      }),
	          parent,
	          copyByClone = this.length > 1;
	      if (nodes.length < 1) return this;
	
	      return this.each(function (_, target) {
	        parent = inside ? target : target.parentNode;
	
	        // convert all methods to a "before" operation
	        target = operatorIndex == 0 ? target.nextSibling : operatorIndex == 1 ? target.firstChild : operatorIndex == 2 ? target : null;
	
	        var parentInDocument = $.contains(document.documentElement, parent);
	
	        nodes.forEach(function (node) {
	          if (copyByClone) node = node.cloneNode(true);else if (!parent) return $(node).remove();
	
	          parent.insertBefore(node, target);
	          if (parentInDocument) traverseNode(node, function (el) {
	            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src) window['eval'].call(window, el.innerHTML);
	          });
	        });
	      });
	    };
	
	    // after    => insertAfter
	    // prepend  => prependTo
	    // before   => insertBefore
	    // append   => appendTo
	    $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
	      $(html)[operator](this);
	      return this;
	    };
	  });
	
	  zepto.Z.prototype = $.fn;
	
	  // Export internal API functions in the `$.zepto` namespace
	  zepto.uniq = uniq;
	  zepto.deserializeValue = deserializeValue;
	  $.zepto = zepto;
	
	  return $;
	})();
	
	window.Zepto = Zepto;
	window.$ === undefined && (window.$ = Zepto);(function ($) {
	  var _zid = 1,
	      undefined,
	      slice = Array.prototype.slice,
	      isFunction = $.isFunction,
	      isString = function isString(obj) {
	    return typeof obj == 'string';
	  },
	      handlers = {},
	      specialEvents = {},
	      focusinSupported = 'onfocusin' in window,
	      focus = { focus: 'focusin', blur: 'focusout' },
	      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' };
	
	  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';
	
	  function zid(element) {
	    return element._zid || (element._zid = _zid++);
	  }
	  function findHandlers(element, event, fn, selector) {
	    event = parse(event);
	    if (event.ns) var matcher = matcherFor(event.ns);
	    return (handlers[zid(element)] || []).filter(function (handler) {
	      return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector);
	    });
	  }
	  function parse(event) {
	    var parts = ('' + event).split('.');
	    return { e: parts[0], ns: parts.slice(1).sort().join(' ') };
	  }
	  function matcherFor(ns) {
	    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
	  }
	
	  function eventCapture(handler, captureSetting) {
	    return handler.del && !focusinSupported && handler.e in focus || !!captureSetting;
	  }
	
	  function realEvent(type) {
	    return hover[type] || focusinSupported && focus[type] || type;
	  }
	
	  function add(element, events, fn, data, selector, delegator, capture) {
	    var id = zid(element),
	        set = handlers[id] || (handlers[id] = []);
	    events.split(/\s/).forEach(function (event) {
	      if (event == 'ready') return $(document).ready(fn);
	      var handler = parse(event);
	      handler.fn = fn;
	      handler.sel = selector;
	      // emulate mouseenter, mouseleave
	      if (handler.e in hover) fn = function (e) {
	        var related = e.relatedTarget;
	        if (!related || related !== this && !$.contains(this, related)) return handler.fn.apply(this, arguments);
	      };
	      handler.del = delegator;
	      var callback = delegator || fn;
	      handler.proxy = function (e) {
	        e = compatible(e);
	        if (e.isImmediatePropagationStopped()) return;
	        e.data = data;
	        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
	        if (result === false) e.preventDefault(), e.stopPropagation();
	        return result;
	      };
	      handler.i = set.length;
	      set.push(handler);
	      if ('addEventListener' in element) element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
	    });
	  }
	  function remove(element, events, fn, selector, capture) {
	    var id = zid(element);(events || '').split(/\s/).forEach(function (event) {
	      findHandlers(element, event, fn, selector).forEach(function (handler) {
	        delete handlers[id][handler.i];
	        if ('removeEventListener' in element) element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
	      });
	    });
	  }
	
	  $.event = { add: add, remove: remove };
	
	  $.proxy = function (fn, context) {
	    var args = 2 in arguments && slice.call(arguments, 2);
	    if (isFunction(fn)) {
	      var proxyFn = function proxyFn() {
	        return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
	      };
	      proxyFn._zid = zid(fn);
	      return proxyFn;
	    } else if (isString(context)) {
	      if (args) {
	        args.unshift(fn[context], fn);
	        return $.proxy.apply(null, args);
	      } else {
	        return $.proxy(fn[context], fn);
	      }
	    } else {
	      throw new TypeError("expected function");
	    }
	  };
	
	  $.fn.bind = function (event, data, callback) {
	    return this.on(event, data, callback);
	  };
	  $.fn.unbind = function (event, callback) {
	    return this.off(event, callback);
	  };
	  $.fn.one = function (event, selector, data, callback) {
	    return this.on(event, selector, data, callback, 1);
	  };
	
	  var returnTrue = function returnTrue() {
	    return true;
	  },
	      returnFalse = function returnFalse() {
	    return false;
	  },
	      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
	      eventMethods = {
	    preventDefault: 'isDefaultPrevented',
	    stopImmediatePropagation: 'isImmediatePropagationStopped',
	    stopPropagation: 'isPropagationStopped'
	  };
	
	  function compatible(event, source) {
	    if (source || !event.isDefaultPrevented) {
	      source || (source = event);
	
	      $.each(eventMethods, function (name, predicate) {
	        var sourceMethod = source[name];
	        event[name] = function () {
	          this[predicate] = returnTrue;
	          return sourceMethod && sourceMethod.apply(source, arguments);
	        };
	        event[predicate] = returnFalse;
	      });
	
	      if (source.defaultPrevented !== undefined ? source.defaultPrevented : 'returnValue' in source ? source.returnValue === false : source.getPreventDefault && source.getPreventDefault()) event.isDefaultPrevented = returnTrue;
	    }
	    return event;
	  }
	
	  function createProxy(event) {
	    var key,
	        proxy = { originalEvent: event };
	    for (key in event) {
	      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];
	    }return compatible(proxy, event);
	  }
	
	  $.fn.delegate = function (selector, event, callback) {
	    return this.on(event, selector, callback);
	  };
	  $.fn.undelegate = function (selector, event, callback) {
	    return this.off(event, selector, callback);
	  };
	
	  $.fn.live = function (event, callback) {
	    $(document.body).delegate(this.selector, event, callback);
	    return this;
	  };
	  $.fn.die = function (event, callback) {
	    $(document.body).undelegate(this.selector, event, callback);
	    return this;
	  };
	
	  $.fn.on = function (event, selector, data, callback, one) {
	    var autoRemove,
	        delegator,
	        $this = this;
	    if (event && !isString(event)) {
	      $.each(event, function (type, fn) {
	        $this.on(type, selector, data, fn, one);
	      });
	      return $this;
	    }
	
	    if (!isString(selector) && !isFunction(callback) && callback !== false) callback = data, data = selector, selector = undefined;
	    if (isFunction(data) || data === false) callback = data, data = undefined;
	
	    if (callback === false) callback = returnFalse;
	
	    return $this.each(function (_, element) {
	      if (one) autoRemove = function (e) {
	        remove(element, e.type, callback);
	        return callback.apply(this, arguments);
	      };
	
	      if (selector) delegator = function (e) {
	        var evt,
	            match = $(e.target).closest(selector, element).get(0);
	        if (match && match !== element) {
	          evt = $.extend(createProxy(e), { currentTarget: match, liveFired: element });
	          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
	        }
	      };
	
	      add(element, event, callback, data, selector, delegator || autoRemove);
	    });
	  };
	  $.fn.off = function (event, selector, callback) {
	    var $this = this;
	    if (event && !isString(event)) {
	      $.each(event, function (type, fn) {
	        $this.off(type, selector, fn);
	      });
	      return $this;
	    }
	
	    if (!isString(selector) && !isFunction(callback) && callback !== false) callback = selector, selector = undefined;
	
	    if (callback === false) callback = returnFalse;
	
	    return $this.each(function () {
	      remove(this, event, callback, selector);
	    });
	  };
	
	  $.fn.trigger = function (event, args) {
	    event = isString(event) || $.isPlainObject(event) ? $.Event(event) : compatible(event);
	    event._args = args;
	    return this.each(function () {
	      // handle focus(), blur() by calling them directly
	      if (event.type in focus && typeof this[event.type] == "function") this[event.type]();
	      // items in the collection might not be DOM elements
	      else if ('dispatchEvent' in this) this.dispatchEvent(event);else $(this).triggerHandler(event, args);
	    });
	  };
	
	  // triggers event handlers on current element just as if an event occurred,
	  // doesn't trigger an actual event, doesn't bubble
	  $.fn.triggerHandler = function (event, args) {
	    var e, result;
	    this.each(function (i, element) {
	      e = createProxy(isString(event) ? $.Event(event) : event);
	      e._args = args;
	      e.target = element;
	      $.each(findHandlers(element, event.type || event), function (i, handler) {
	        result = handler.proxy(e);
	        if (e.isImmediatePropagationStopped()) return false;
	      });
	    });
	    return result;
	  }
	
	  // shortcut methods for `.bind(event, fn)` for each event type
	  ;('focusin focusout focus blur load resize scroll unload click dblclick ' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' + 'change select keydown keypress keyup error').split(' ').forEach(function (event) {
	    $.fn[event] = function (callback) {
	      return 0 in arguments ? this.bind(event, callback) : this.trigger(event);
	    };
	  });
	
	  $.Event = function (type, props) {
	    if (!isString(type)) props = type, type = props.type;
	    var event = document.createEvent(specialEvents[type] || 'Events'),
	        bubbles = true;
	    if (props) for (var name in props) {
	      name == 'bubbles' ? bubbles = !!props[name] : event[name] = props[name];
	    }event.initEvent(type, bubbles, true);
	    return compatible(event);
	  };
	})(Zepto);(function ($) {
	  var jsonpID = 0,
	      document = window.document,
	      key,
	      name,
	      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	      scriptTypeRE = /^(?:text|application)\/javascript/i,
	      xmlTypeRE = /^(?:text|application)\/xml/i,
	      jsonType = 'application/json',
	      htmlType = 'text/html',
	      blankRE = /^\s*$/,
	      originAnchor = document.createElement('a');
	
	  originAnchor.href = window.location.href;
	
	  // trigger a custom event and return false if it was cancelled
	  function triggerAndReturn(context, eventName, data) {
	    var event = $.Event(eventName);
	    $(context).trigger(event, data);
	    return !event.isDefaultPrevented();
	  }
	
	  // trigger an Ajax "global" event
	  function triggerGlobal(settings, context, eventName, data) {
	    if (settings.global) return triggerAndReturn(context || document, eventName, data);
	  }
	
	  // Number of active Ajax requests
	  $.active = 0;
	
	  function ajaxStart(settings) {
	    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart');
	  }
	  function ajaxStop(settings) {
	    if (settings.global && ! --$.active) triggerGlobal(settings, null, 'ajaxStop');
	  }
	
	  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
	  function ajaxBeforeSend(xhr, settings) {
	    var context = settings.context;
	    if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) return false;
	
	    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
	  }
	  function ajaxSuccess(data, xhr, settings, deferred) {
	    var context = settings.context,
	        status = 'success';
	    settings.success.call(context, data, status, xhr);
	    if (deferred) deferred.resolveWith(context, [data, status, xhr]);
	    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
	    ajaxComplete(status, xhr, settings);
	  }
	  // type: "timeout", "error", "abort", "parsererror"
	  function ajaxError(error, type, xhr, settings, deferred) {
	    var context = settings.context;
	    settings.error.call(context, xhr, type, error);
	    if (deferred) deferred.rejectWith(context, [xhr, type, error]);
	    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type]);
	    ajaxComplete(type, xhr, settings);
	  }
	  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
	  function ajaxComplete(status, xhr, settings) {
	    var context = settings.context;
	    settings.complete.call(context, xhr, status);
	    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
	    ajaxStop(settings);
	  }
	
	  // Empty function, used as default callback
	  function empty() {}
	
	  $.ajaxJSONP = function (options, deferred) {
	    if (!('type' in options)) return $.ajax(options);
	
	    var _callbackName = options.jsonpCallback,
	        callbackName = ($.isFunction(_callbackName) ? _callbackName() : _callbackName) || 'jsonp' + ++jsonpID,
	        script = document.createElement('script'),
	        originalCallback = window[callbackName],
	        responseData,
	        abort = function abort(errorType) {
	      $(script).triggerHandler('error', errorType || 'abort');
	    },
	        xhr = { abort: abort },
	        abortTimeout;
	
	    if (deferred) deferred.promise(xhr);
	
	    $(script).on('load error', function (e, errorType) {
	      clearTimeout(abortTimeout);
	      $(script).off().remove();
	
	      if (e.type == 'error' || !responseData) {
	        ajaxError(null, errorType || 'error', xhr, options, deferred);
	      } else {
	        ajaxSuccess(responseData[0], xhr, options, deferred);
	      }
	
	      window[callbackName] = originalCallback;
	      if (responseData && $.isFunction(originalCallback)) originalCallback(responseData[0]);
	
	      originalCallback = responseData = undefined;
	    });
	
	    if (ajaxBeforeSend(xhr, options) === false) {
	      abort('abort');
	      return xhr;
	    }
	
	    window[callbackName] = function () {
	      responseData = arguments;
	    };
	
	    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName);
	    document.head.appendChild(script);
	
	    if (options.timeout > 0) abortTimeout = setTimeout(function () {
	      abort('timeout');
	    }, options.timeout);
	
	    return xhr;
	  };
	
	  $.ajaxSettings = {
	    // Default type of request
	    type: 'GET',
	    // Callback that is executed before request
	    beforeSend: empty,
	    // Callback that is executed if the request succeeds
	    success: empty,
	    // Callback that is executed the the server drops error
	    error: empty,
	    // Callback that is executed on request complete (both: error and success)
	    complete: empty,
	    // The context for the callbacks
	    context: null,
	    // Whether to trigger "global" Ajax events
	    global: true,
	    // Transport
	    xhr: function xhr() {
	      return new window.XMLHttpRequest();
	    },
	    // MIME types mapping
	    // IIS returns Javascript as "application/x-javascript"
	    accepts: {
	      script: 'text/javascript, application/javascript, application/x-javascript',
	      json: jsonType,
	      xml: 'application/xml, text/xml',
	      html: htmlType,
	      text: 'text/plain'
	    },
	    // Whether the request is to another domain
	    crossDomain: false,
	    // Default timeout
	    timeout: 0,
	    // Whether data should be serialized to string
	    processData: true,
	    // Whether the browser should be allowed to cache GET responses
	    cache: true
	  };
	
	  function mimeToDataType(mime) {
	    if (mime) mime = mime.split(';', 2)[0];
	    return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
	  }
	
	  function appendQuery(url, query) {
	    if (query == '') return url;
	    return (url + '&' + query).replace(/[&?]{1,2}/, '?');
	  }
	
	  // serialize payload and append it to the URL for GET requests
	  function serializeData(options) {
	    if (options.processData && options.data && $.type(options.data) != "string") options.data = $.param(options.data, options.traditional);
	    if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) options.url = appendQuery(options.url, options.data), options.data = undefined;
	  }
	
	  $.ajax = function (options) {
	    var settings = $.extend({}, options || {}),
	        deferred = $.Deferred && $.Deferred(),
	        urlAnchor;
	    for (key in $.ajaxSettings) {
	      if (settings[key] === undefined) settings[key] = $.ajaxSettings[key];
	    }ajaxStart(settings);
	
	    if (!settings.crossDomain) {
	      urlAnchor = document.createElement('a');
	      urlAnchor.href = settings.url;
	      urlAnchor.href = urlAnchor.href;
	      settings.crossDomain = originAnchor.protocol + '//' + originAnchor.host !== urlAnchor.protocol + '//' + urlAnchor.host;
	    }
	
	    if (!settings.url) settings.url = window.location.toString();
	    serializeData(settings);
	
	    var dataType = settings.dataType,
	        hasPlaceholder = /\?.+=\?/.test(settings.url);
	    if (hasPlaceholder) dataType = 'jsonp';
	
	    if (settings.cache === false || (!options || options.cache !== true) && ('script' == dataType || 'jsonp' == dataType)) settings.url = appendQuery(settings.url, '_=' + Date.now());
	
	    if ('jsonp' == dataType) {
	      if (!hasPlaceholder) settings.url = appendQuery(settings.url, settings.jsonp ? settings.jsonp + '=?' : settings.jsonp === false ? '' : 'callback=?');
	      return $.ajaxJSONP(settings, deferred);
	    }
	
	    var mime = settings.accepts[dataType],
	        headers = {},
	        setHeader = function setHeader(name, value) {
	      headers[name.toLowerCase()] = [name, value];
	    },
	        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
	        xhr = settings.xhr(),
	        nativeSetHeader = xhr.setRequestHeader,
	        abortTimeout;
	
	    if (deferred) deferred.promise(xhr);
	
	    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest');
	    setHeader('Accept', mime || '*/*');
	    if (mime = settings.mimeType || mime) {
	      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
	      xhr.overrideMimeType && xhr.overrideMimeType(mime);
	    }
	    if (settings.contentType || settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET') setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
	
	    if (settings.headers) for (name in settings.headers) {
	      setHeader(name, settings.headers[name]);
	    }xhr.setRequestHeader = setHeader;
	
	    xhr.onreadystatechange = function () {
	      if (xhr.readyState == 4) {
	        xhr.onreadystatechange = empty;
	        clearTimeout(abortTimeout);
	        var result,
	            error = false;
	        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 || xhr.status == 0 && protocol == 'file:') {
	          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
	          result = xhr.responseText;
	
	          try {
	            // http://perfectionkills.com/global-eval-what-are-the-options/
	            if (dataType == 'script') (1, eval)(result);else if (dataType == 'xml') result = xhr.responseXML;else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result);
	          } catch (e) {
	            error = e;
	          }
	
	          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred);else ajaxSuccess(result, xhr, settings, deferred);
	        } else {
	          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred);
	        }
	      }
	    };
	
	    if (ajaxBeforeSend(xhr, settings) === false) {
	      xhr.abort();
	      ajaxError(null, 'abort', xhr, settings, deferred);
	      return xhr;
	    }
	
	    if (settings.xhrFields) for (name in settings.xhrFields) {
	      xhr[name] = settings.xhrFields[name];
	    }var async = 'async' in settings ? settings.async : true;
	    xhr.open(settings.type, settings.url, async, settings.username, settings.password);
	
	    for (name in headers) {
	      nativeSetHeader.apply(xhr, headers[name]);
	    }if (settings.timeout > 0) abortTimeout = setTimeout(function () {
	      xhr.onreadystatechange = empty;
	      xhr.abort();
	      ajaxError(null, 'timeout', xhr, settings, deferred);
	    }, settings.timeout);
	
	    // avoid sending empty string (#319)
	    xhr.send(settings.data ? settings.data : null);
	    return xhr;
	  };
	
	  // handle optional data/success arguments
	  function parseArguments(url, data, success, dataType) {
	    if ($.isFunction(data)) dataType = success, success = data, data = undefined;
	    if (!$.isFunction(success)) dataType = success, success = undefined;
	    return {
	      url: url,
	      data: data,
	      success: success,
	      dataType: dataType
	    };
	  }
	
	  $.get = function () /* url, data, success, dataType */{
	    return $.ajax(parseArguments.apply(null, arguments));
	  };
	
	  $.post = function () /* url, data, success, dataType */{
	    var options = parseArguments.apply(null, arguments);
	    options.type = 'POST';
	    return $.ajax(options);
	  };
	
	  $.getJSON = function () /* url, data, success */{
	    var options = parseArguments.apply(null, arguments);
	    options.dataType = 'json';
	    return $.ajax(options);
	  };
	
	  $.fn.load = function (url, data, success) {
	    if (!this.length) return this;
	    var self = this,
	        parts = url.split(/\s/),
	        selector,
	        options = parseArguments(url, data, success),
	        callback = options.success;
	    if (parts.length > 1) options.url = parts[0], selector = parts[1];
	    options.success = function (response) {
	      self.html(selector ? $('<div>').html(response.replace(rscript, "")).find(selector) : response);
	      callback && callback.apply(self, arguments);
	    };
	    $.ajax(options);
	    return this;
	  };
	
	  var escape = encodeURIComponent;
	
	  function serialize(params, obj, traditional, scope) {
	    var type,
	        array = $.isArray(obj),
	        hash = $.isPlainObject(obj);
	    $.each(obj, function (key, value) {
	      type = $.type(value);
	      if (scope) key = traditional ? scope : scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']';
	      // handle data in serializeArray() format
	      if (!scope && array) params.add(value.name, value.value);
	      // recurse into nested objects
	      else if (type == "array" || !traditional && type == "object") serialize(params, value, traditional, key);else params.add(key, value);
	    });
	  }
	
	  $.param = function (obj, traditional) {
	    var params = [];
	    params.add = function (key, value) {
	      if ($.isFunction(value)) value = value();
	      if (value == null) value = "";
	      this.push(escape(key) + '=' + escape(value));
	    };
	    serialize(params, obj, traditional);
	    return params.join('&').replace(/%20/g, '+');
	  };
	})(Zepto);(function ($) {
	  $.fn.serializeArray = function () {
	    var name,
	        type,
	        result = [],
	        add = function add(value) {
	      if (value.forEach) return value.forEach(add);
	      result.push({ name: name, value: value });
	    };
	    if (this[0]) $.each(this[0].elements, function (_, field) {
	      type = field.type, name = field.name;
	      if (name && field.nodeName.toLowerCase() != 'fieldset' && !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' && (type != 'radio' && type != 'checkbox' || field.checked)) add($(field).val());
	    });
	    return result;
	  };
	
	  $.fn.serialize = function () {
	    var result = [];
	    this.serializeArray().forEach(function (elm) {
	      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value));
	    });
	    return result.join('&');
	  };
	
	  $.fn.submit = function (callback) {
	    if (0 in arguments) this.bind('submit', callback);else if (this.length) {
	      var event = $.Event('submit');
	      this.eq(0).trigger(event);
	      if (!event.isDefaultPrevented()) this.get(0).submit();
	    }
	    return this;
	  };
	})(Zepto);(function ($) {
	  // __proto__ doesn't exist on IE<11, so redefine
	  // the Z function to use object extension instead
	  if (!('__proto__' in {})) {
	    $.extend($.zepto, {
	      Z: function Z(dom, selector) {
	        dom = dom || [];
	        $.extend(dom, $.fn);
	        dom.selector = selector || '';
	        dom.__Z = true;
	        return dom;
	      },
	      // this is a kludge but works
	      isZ: function isZ(object) {
	        return $.type(object) === 'array' && '__Z' in object;
	      }
	    });
	  }
	
	  // getComputedStyle shouldn't freak out when called
	  // without a valid element as argument
	  try {
	    getComputedStyle(undefined);
	  } catch (e) {
	    var nativeGetComputedStyle = getComputedStyle;
	    window.getComputedStyle = function (element) {
	      try {
	        return nativeGetComputedStyle(element);
	      } catch (e) {
	        return null;
	      }
	    };
	  }
	})(Zepto);
	
	module.exports = Zepto;

/***/ },
/* 23 */
/*!***********************************!*\
  !*** ./src/components/webview.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.webvc = webvc;
	exports.transparent = transparent;
	exports.none = none;
	exports.normal = normal;
	
	var _qrcode = __webpack_require__(/*! qrcode */ 24);
	
	var _qrcode2 = _interopRequireDefault(_qrcode);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var QR_CODE = "http://qr.liantu.com/api.php?text=";
	
	function webvc(self, extra) {
	    var root = self.root;
	    getURL(function (href) {
	        var host = '://web/url?url=';
	        var protocol = chooseOS(root);
	        var schema = [protocol, host, encodeURIComponent(href)].join('');
	        genrtateQR(self, schema);
	
	        self.schema = schema;
	    });
	};
	
	function transparent(self, extra) {
	    var root = self.root;
	
	    getURL(function (href) {
	        var host = '://hy/url?type=navibar-transparent&url=';
	        var protocol = chooseOS(root);
	        var schema = [protocol, host, encodeURIComponent(href)].join('');
	        genrtateQR(self, schema);
	
	        self.schema = schema;
	    });
	};
	
	function none(self, extra) {
	    var root = self.root;
	
	    getURL(function (href) {
	        var host = '://hy/url?type=navibar-none&url=';
	        var protocol = chooseOS(root);
	        var schema = [protocol, host, encodeURIComponent(href)].join('');
	        genrtateQR(self, schema);
	
	        self.schema = schema;
	    });
	};
	
	function normal(self, extra) {
	    var root = self.root;
	
	    getURL(function (href) {
	        var host = '://hy/url?url=';
	        var protocol = chooseOS(root);
	        var schema = [protocol, host, encodeURIComponent(href)].join('');
	        genrtateQR(self, schema);
	
	        self.schema = schema;
	    });
	};
	
	function chooseOS(root) {
	    var os = Array.from(root.querySelectorAll('input[name=os]')).filter(function (e) {
	        return e.checked;
	    });
	
	    return os[0].value;
	};
	
	function genrtateQR(self, schema) {
	    var qrcode = self.tags['qrcode'];
	    var root = self.root;
	    var input = root.querySelector('input[name=url]');
	
	    input.value = schema;
	
	    var src = QR_CODE + encodeURIComponent(schema);
	    var img = new _qrcode2.default({ text: schema, size: 300 });
	
	    qrcode.update({ qrcode: img });
	};
	
	function getURL(callback) {
	    chrome.tabs.getSelected(null, function (tab) {
	        callback(tab.url);
	    });
	};

/***/ },
/* 24 */
/*!******************************************************************!*\
  !*** ./bower_components/qrcode/dist/arale-qrcode/3.0.5/index.js ***!
  \******************************************************************/
/***/ function(module, exports) {

	"use strict";
	
	module.exports = (function (t) {
	  function e(o) {
	    if (r[o]) return r[o].exports;var i = r[o] = { exports: {}, id: o, loaded: !1 };return t[o].call(i.exports, i, i.exports, e), i.loaded = !0, i.exports;
	  }var r = {};return e.m = t, e.c = r, e.p = "", e(0);
	})([function (t, e, r) {
	  t.exports = r(1);
	}, function (t, e, r) {
	  "use strict";
	  t.exports = r(2);
	}, function (t, e, r) {
	  "use strict";
	  var o = r(4),
	      i = [],
	      n = r(3),
	      s = function s(t) {
	    var e = t.options;return e.pdground && (t.row > 1 && t.row < 5 && t.col > 1 && t.col < 5 || t.row > t.count - 6 && t.row < t.count - 2 && t.col > 1 && t.col < 5 || t.row > 1 && t.row < 5 && t.col > t.count - 6 && t.col < t.count - 2) ? e.pdground : e.foreground;
	  },
	      u = function u(t) {
	    var e = t.backingStorePixelRatio || t.webkitBackingStorePixelRatio || t.mozBackingStorePixelRatio || t.msBackingStorePixelRatio || t.oBackingStorePixelRatio || t.backingStorePixelRatio || 1;return (window.devicePixelRatio || 1) / e;
	  },
	      a = function a(t) {
	    "string" == typeof t && (t = { text: t }), this.options = o({}, { text: "", render: "", size: 256, correctLevel: 3, background: "#ffffff", foreground: "#000000", image: "", imageSize: 30 }, t);for (var e = null, r = 0, s = i.length; s > r; r++) {
	      if (i[r].text == this.options.text && i[r].text.correctLevel == this.options.correctLevel) {
	        e = i[r].obj;break;
	      }
	    }if ((r == s && (e = new n(this.options.text, this.options.correctLevel), i.push({ text: this.options.text, correctLevel: this.options.correctLevel, obj: e })), this.options.render)) switch (this.options.render) {case "canvas":
	        return this.createCanvas(e);case "table":
	        return this.createTable(e);case "svg":
	        return this.createSVG(e);default:
	        return this.createDefault(e);}return this.createDefault(e);
	  };o(a.prototype, { createDefault: function createDefault(t) {
	      var e = document.createElement("canvas");if (e.getContext) return this.createCanvas(t);var r = "http://www.w3.org/2000/svg";return document.createElementNS && document.createElementNS(r, "svg").createSVGRect ? this.createSVG(t) : this.createTable(t);
	    }, createCanvas: function createCanvas(t) {
	      var e = this.options,
	          r = document.createElement("canvas"),
	          o = r.getContext("2d"),
	          i = t.getModuleCount(),
	          n = u(o),
	          a = e.size,
	          l = a * n,
	          h = e.imageSize * n,
	          g = function g(t, e) {
	        var r = new Image();r.src = t, r.onload = function () {
	          e(this), r.onload = null;
	        };
	      },
	          c = (l / i).toPrecision(4),
	          f = (l / i).toPrecision(4);r.width = l, r.height = l;for (var d = 0; i > d; d++) {
	        for (var m = 0; i > m; m++) {
	          var p = Math.ceil((m + 1) * c) - Math.floor(m * c),
	              v = Math.ceil((d + 1) * c) - Math.floor(d * c),
	              b = s({ row: d, col: m, count: i, options: e });o.fillStyle = t.modules[d][m] ? b : e.background, o.fillRect(Math.round(m * c), Math.round(d * f), p, v);
	        }
	      }return e.image && g(e.image, function (t) {
	        var e = ((l - h) / 2).toFixed(2),
	            r = ((l - h) / 2).toFixed(2);o.drawImage(t, e, r, h, h);
	      }), r.style.width = a + "px", r.style.height = a + "px", r;
	    }, createTable: function createTable(t) {
	      var e = this.options,
	          r = t.getModuleCount(),
	          o = Math.floor(e.size / r),
	          i = Math.floor(e.size / r);0 >= o && (o = 80 > r ? 2 : 1), 0 >= i && (i = 80 > r ? 2 : 1);var n = [];n.push('<table style="border:0px; margin:0px; padding:0px; border-collapse:collapse; background-color:' + e.background + ';">');for (var u = 0; r > u; u++) {
	        n.push('<tr style="border:0px; margin:0px; padding:0px; height:' + i + 'px">');for (var a = 0; r > a; a++) {
	          var l = s({ row: u, col: a, count: r, options: e });t.modules[u][a] ? n.push('<td style="border:0px; margin:0px; padding:0px; width:' + o + "px; background-color:" + l + '"></td>') : n.push('<td style="border:0px; margin:0px; padding:0px; width:' + o + "px; background-color:" + e.background + '"></td>');
	        }n.push("</tr>");
	      }if ((n.push("</table>"), e.image)) {
	        var h = o * r,
	            g = i * r,
	            c = ((h - e.imageSize) / 2).toFixed(2),
	            f = ((g - e.imageSize) / 2).toFixed(2);n.unshift("<div style='position:relative;\n                        width:" + h + "px;\n                        height:" + g + "px;'>"), n.push("<img src='" + e.image + "'\n                        width='" + e.imageSize + "'\n                        height='" + e.imageSize + "'\n                        style='position:absolute;left:" + c + "px; top:" + f + "px;'>"), n.push("</div>");
	      }var d = document.createElement("span");return d.innerHTML = n.join(""), d.firstChild;
	    }, createSVG: function createSVG(t) {
	      var e = this.options,
	          r = t.getModuleCount(),
	          o = r / e.size,
	          i = document.createElementNS("http://www.w3.org/2000/svg", "svg");i.setAttribute("width", e.size), i.setAttribute("height", e.size), i.setAttribute("viewBox", "0 0 " + r + " " + r);for (var n = 0; r > n; n++) {
	        for (var u = 0; r > u; u++) {
	          var a = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
	              l = s({ row: n, col: u, count: r, options: e });a.setAttribute("x", u), a.setAttribute("y", n), a.setAttribute("width", 1), a.setAttribute("height", 1), a.setAttribute("stroke-width", 0), t.modules[n][u] ? a.setAttribute("fill", l) : a.setAttribute("fill", e.background), i.appendChild(a);
	        }
	      }if (e.image) {
	        var h = document.createElementNS("http://www.w3.org/2000/svg", "image");h.setAttributeNS("http://www.w3.org/1999/xlink", "href", e.image), h.setAttribute("x", ((r - e.imageSize * o) / 2).toFixed(2)), h.setAttribute("y", ((r - e.imageSize * o) / 2).toFixed(2)), h.setAttribute("width", e.imageSize * o), h.setAttribute("height", e.imageSize * o), i.appendChild(h);
	      }return i;
	    } }), t.exports = a;
	}, function (t, e) {
	  "use strict";
	  function r(t) {
	    var e, r, o;return 128 > t ? [t] : 2048 > t ? (e = 192 + (t >> 6), r = 128 + (63 & t), [e, r]) : (e = 224 + (t >> 12), r = 128 + (t >> 6 & 63), o = 128 + (63 & t), [e, r, o]);
	  }function o(t) {
	    for (var e = [], o = 0; o < t.length; o++) {
	      for (var i = t.charCodeAt(o), n = r(i), s = 0; s < n.length; s++) {
	        e.push(n[s]);
	      }
	    }return e;
	  }function i(t, e) {
	    this.typeNumber = -1, this.errorCorrectLevel = e, this.modules = null, this.moduleCount = 0, this.dataCache = null, this.rsBlocks = null, this.totalDataCount = -1, this.data = t, this.utf8bytes = o(t), this.make();
	  }function n(t, e) {
	    if (void 0 == t.length) throw new Error(t.length + "/" + e);for (var r = 0; r < t.length && 0 == t[r];) {
	      r++;
	    }this.num = new Array(t.length - r + e);for (var o = 0; o < t.length - r; o++) {
	      this.num[o] = t[o + r];
	    }
	  }function s() {
	    this.buffer = new Array(), this.length = 0;
	  }i.prototype = { constructor: i, getModuleCount: function getModuleCount() {
	      return this.moduleCount;
	    }, make: function make() {
	      this.getRightType(), this.dataCache = this.createData(), this.createQrcode();
	    }, makeImpl: function makeImpl(t) {
	      this.moduleCount = 4 * this.typeNumber + 17, this.modules = new Array(this.moduleCount);for (var e = 0; e < this.moduleCount; e++) {
	        this.modules[e] = new Array(this.moduleCount);
	      }this.setupPositionProbePattern(0, 0), this.setupPositionProbePattern(this.moduleCount - 7, 0), this.setupPositionProbePattern(0, this.moduleCount - 7), this.setupPositionAdjustPattern(), this.setupTimingPattern(), this.setupTypeInfo(!0, t), this.typeNumber >= 7 && this.setupTypeNumber(!0), this.mapData(this.dataCache, t);
	    }, setupPositionProbePattern: function setupPositionProbePattern(t, e) {
	      for (var r = -1; 7 >= r; r++) {
	        if (!(-1 >= t + r || this.moduleCount <= t + r)) for (var o = -1; 7 >= o; o++) {
	          -1 >= e + o || this.moduleCount <= e + o || (r >= 0 && 6 >= r && (0 == o || 6 == o) || o >= 0 && 6 >= o && (0 == r || 6 == r) || r >= 2 && 4 >= r && o >= 2 && 4 >= o ? this.modules[t + r][e + o] = !0 : this.modules[t + r][e + o] = !1);
	        }
	      }
	    }, createQrcode: function createQrcode() {
	      for (var t = 0, e = 0, r = null, o = 0; 8 > o; o++) {
	        this.makeImpl(o);var i = l.getLostPoint(this);(0 == o || t > i) && (t = i, e = o, r = this.modules);
	      }this.modules = r, this.setupTypeInfo(!1, e), this.typeNumber >= 7 && this.setupTypeNumber(!1);
	    }, setupTimingPattern: function setupTimingPattern() {
	      for (var t = 8; t < this.moduleCount - 8; t++) {
	        null == this.modules[t][6] && (this.modules[t][6] = t % 2 == 0, null == this.modules[6][t] && (this.modules[6][t] = t % 2 == 0));
	      }
	    }, setupPositionAdjustPattern: function setupPositionAdjustPattern() {
	      for (var t = l.getPatternPosition(this.typeNumber), e = 0; e < t.length; e++) {
	        for (var r = 0; r < t.length; r++) {
	          var o = t[e],
	              i = t[r];if (null == this.modules[o][i]) for (var n = -2; 2 >= n; n++) {
	            for (var s = -2; 2 >= s; s++) {
	              -2 == n || 2 == n || -2 == s || 2 == s || 0 == n && 0 == s ? this.modules[o + n][i + s] = !0 : this.modules[o + n][i + s] = !1;
	            }
	          }
	        }
	      }
	    }, setupTypeNumber: function setupTypeNumber(t) {
	      for (var e = l.getBCHTypeNumber(this.typeNumber), r = 0; 18 > r; r++) {
	        var o = !t && 1 == (e >> r & 1);this.modules[Math.floor(r / 3)][r % 3 + this.moduleCount - 8 - 3] = o, this.modules[r % 3 + this.moduleCount - 8 - 3][Math.floor(r / 3)] = o;
	      }
	    }, setupTypeInfo: function setupTypeInfo(t, e) {
	      for (var r = u[this.errorCorrectLevel] << 3 | e, o = l.getBCHTypeInfo(r), i = 0; 15 > i; i++) {
	        var n = !t && 1 == (o >> i & 1);6 > i ? this.modules[i][8] = n : 8 > i ? this.modules[i + 1][8] = n : this.modules[this.moduleCount - 15 + i][8] = n;var n = !t && 1 == (o >> i & 1);8 > i ? this.modules[8][this.moduleCount - i - 1] = n : 9 > i ? this.modules[8][15 - i - 1 + 1] = n : this.modules[8][15 - i - 1] = n;
	      }this.modules[this.moduleCount - 8][8] = !t;
	    }, createData: function createData() {
	      var t = new s(),
	          e = this.typeNumber > 9 ? 16 : 8;t.put(4, 4), t.put(this.utf8bytes.length, e);for (var r = 0, o = this.utf8bytes.length; o > r; r++) {
	        t.put(this.utf8bytes[r], 8);
	      }for (t.length + 4 <= 8 * this.totalDataCount && t.put(0, 4); t.length % 8 != 0;) {
	        t.putBit(!1);
	      }for (;;) {
	        if (t.length >= 8 * this.totalDataCount) break;if ((t.put(i.PAD0, 8), t.length >= 8 * this.totalDataCount)) break;t.put(i.PAD1, 8);
	      }return this.createBytes(t);
	    }, createBytes: function createBytes(t) {
	      for (var e = 0, r = 0, o = 0, i = this.rsBlock.length / 3, s = new Array(), u = 0; i > u; u++) {
	        for (var a = this.rsBlock[3 * u + 0], h = this.rsBlock[3 * u + 1], g = this.rsBlock[3 * u + 2], c = 0; a > c; c++) {
	          s.push([g, h]);
	        }
	      }for (var f = new Array(s.length), d = new Array(s.length), m = 0; m < s.length; m++) {
	        var p = s[m][0],
	            v = s[m][1] - p;r = Math.max(r, p), o = Math.max(o, v), f[m] = new Array(p);for (var u = 0; u < f[m].length; u++) {
	          f[m][u] = 255 & t.buffer[u + e];
	        }e += p;var b = l.getErrorCorrectPolynomial(v),
	            w = new n(f[m], b.getLength() - 1),
	            A = w.mod(b);d[m] = new Array(b.getLength() - 1);for (var u = 0; u < d[m].length; u++) {
	          var T = u + A.getLength() - d[m].length;d[m][u] = T >= 0 ? A.get(T) : 0;
	        }
	      }for (var P = new Array(this.totalDataCount), y = 0, u = 0; r > u; u++) {
	        for (var m = 0; m < s.length; m++) {
	          u < f[m].length && (P[y++] = f[m][u]);
	        }
	      }for (var u = 0; o > u; u++) {
	        for (var m = 0; m < s.length; m++) {
	          u < d[m].length && (P[y++] = d[m][u]);
	        }
	      }return P;
	    }, mapData: function mapData(t, e) {
	      for (var r = -1, o = this.moduleCount - 1, i = 7, n = 0, s = this.moduleCount - 1; s > 0; s -= 2) {
	        for (6 == s && s--;;) {
	          for (var u = 0; 2 > u; u++) {
	            if (null == this.modules[o][s - u]) {
	              var a = !1;n < t.length && (a = 1 == (t[n] >>> i & 1));var h = l.getMask(e, o, s - u);h && (a = !a), this.modules[o][s - u] = a, i--, -1 == i && (n++, i = 7);
	            }
	          }if ((o += r, 0 > o || this.moduleCount <= o)) {
	            o -= r, r = -r;break;
	          }
	        }
	      }
	    } }, i.PAD0 = 236, i.PAD1 = 17;for (var u = [1, 0, 3, 2], a = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 }, l = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1335, G18: 7973, G15_MASK: 21522, getBCHTypeInfo: function getBCHTypeInfo(t) {
	      for (var e = t << 10; l.getBCHDigit(e) - l.getBCHDigit(l.G15) >= 0;) {
	        e ^= l.G15 << l.getBCHDigit(e) - l.getBCHDigit(l.G15);
	      }return (t << 10 | e) ^ l.G15_MASK;
	    }, getBCHTypeNumber: function getBCHTypeNumber(t) {
	      for (var e = t << 12; l.getBCHDigit(e) - l.getBCHDigit(l.G18) >= 0;) {
	        e ^= l.G18 << l.getBCHDigit(e) - l.getBCHDigit(l.G18);
	      }return t << 12 | e;
	    }, getBCHDigit: function getBCHDigit(t) {
	      for (var e = 0; 0 != t;) {
	        e++, t >>>= 1;
	      }return e;
	    }, getPatternPosition: function getPatternPosition(t) {
	      return l.PATTERN_POSITION_TABLE[t - 1];
	    }, getMask: function getMask(t, e, r) {
	      switch (t) {case a.PATTERN000:
	          return (e + r) % 2 == 0;case a.PATTERN001:
	          return e % 2 == 0;case a.PATTERN010:
	          return r % 3 == 0;case a.PATTERN011:
	          return (e + r) % 3 == 0;case a.PATTERN100:
	          return (Math.floor(e / 2) + Math.floor(r / 3)) % 2 == 0;case a.PATTERN101:
	          return e * r % 2 + e * r % 3 == 0;case a.PATTERN110:
	          return (e * r % 2 + e * r % 3) % 2 == 0;case a.PATTERN111:
	          return (e * r % 3 + (e + r) % 2) % 2 == 0;default:
	          throw new Error("bad maskPattern:" + t);}
	    }, getErrorCorrectPolynomial: function getErrorCorrectPolynomial(t) {
	      for (var e = new n([1], 0), r = 0; t > r; r++) {
	        e = e.multiply(new n([1, h.gexp(r)], 0));
	      }return e;
	    }, getLostPoint: function getLostPoint(t) {
	      for (var e = t.getModuleCount(), r = 0, o = 0, i = 0; e > i; i++) {
	        for (var n = 0, s = t.modules[i][0], u = 0; e > u; u++) {
	          var a = t.modules[i][u];if ((e - 6 > u && a && !t.modules[i][u + 1] && t.modules[i][u + 2] && t.modules[i][u + 3] && t.modules[i][u + 4] && !t.modules[i][u + 5] && t.modules[i][u + 6] && (e - 10 > u ? t.modules[i][u + 7] && t.modules[i][u + 8] && t.modules[i][u + 9] && t.modules[i][u + 10] && (r += 40) : u > 3 && t.modules[i][u - 1] && t.modules[i][u - 2] && t.modules[i][u - 3] && t.modules[i][u - 4] && (r += 40)), e - 1 > i && e - 1 > u)) {
	            var l = 0;a && l++, t.modules[i + 1][u] && l++, t.modules[i][u + 1] && l++, t.modules[i + 1][u + 1] && l++, (0 == l || 4 == l) && (r += 3);
	          }s ^ a ? n++ : (s = a, n >= 5 && (r += 3 + n - 5), n = 1), a && o++;
	        }
	      }for (var u = 0; e > u; u++) {
	        for (var n = 0, s = t.modules[0][u], i = 0; e > i; i++) {
	          var a = t.modules[i][u];e - 6 > i && a && !t.modules[i + 1][u] && t.modules[i + 2][u] && t.modules[i + 3][u] && t.modules[i + 4][u] && !t.modules[i + 5][u] && t.modules[i + 6][u] && (e - 10 > i ? t.modules[i + 7][u] && t.modules[i + 8][u] && t.modules[i + 9][u] && t.modules[i + 10][u] && (r += 40) : i > 3 && t.modules[i - 1][u] && t.modules[i - 2][u] && t.modules[i - 3][u] && t.modules[i - 4][u] && (r += 40)), s ^ a ? n++ : (s = a, n >= 5 && (r += 3 + n - 5), n = 1);
	        }
	      }var h = Math.abs(100 * o / e / e - 50) / 5;return r += 10 * h;
	    } }, h = { glog: function glog(t) {
	      if (1 > t) throw new Error("glog(" + t + ")");return h.LOG_TABLE[t];
	    }, gexp: function gexp(t) {
	      for (; 0 > t;) {
	        t += 255;
	      }for (; t >= 256;) {
	        t -= 255;
	      }return h.EXP_TABLE[t];
	    }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) }, g = 0; 8 > g; g++) {
	    h.EXP_TABLE[g] = 1 << g;
	  }for (var g = 8; 256 > g; g++) {
	    h.EXP_TABLE[g] = h.EXP_TABLE[g - 4] ^ h.EXP_TABLE[g - 5] ^ h.EXP_TABLE[g - 6] ^ h.EXP_TABLE[g - 8];
	  }for (var g = 0; 255 > g; g++) {
	    h.LOG_TABLE[h.EXP_TABLE[g]] = g;
	  }n.prototype = { get: function get(t) {
	      return this.num[t];
	    }, getLength: function getLength() {
	      return this.num.length;
	    }, multiply: function multiply(t) {
	      for (var e = new Array(this.getLength() + t.getLength() - 1), r = 0; r < this.getLength(); r++) {
	        for (var o = 0; o < t.getLength(); o++) {
	          e[r + o] ^= h.gexp(h.glog(this.get(r)) + h.glog(t.get(o)));
	        }
	      }return new n(e, 0);
	    }, mod: function mod(t) {
	      var e = this.getLength(),
	          r = t.getLength();if (0 > e - r) return this;for (var o = new Array(e), i = 0; e > i; i++) {
	        o[i] = this.get(i);
	      }for (; o.length >= r;) {
	        for (var s = h.glog(o[0]) - h.glog(t.get(0)), i = 0; i < t.getLength(); i++) {
	          o[i] ^= h.gexp(h.glog(t.get(i)) + s);
	        }for (; 0 == o[0];) {
	          o.shift();
	        }
	      }return new n(o, 0);
	    } };var c = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];i.prototype.getRightType = function () {
	    for (var t = 1; 41 > t; t++) {
	      var e = c[4 * (t - 1) + this.errorCorrectLevel];if (void 0 == e) throw new Error("bad rs block @ typeNumber:" + t + "/errorCorrectLevel:" + this.errorCorrectLevel);for (var r = e.length / 3, o = 0, i = 0; r > i; i++) {
	        var n = e[3 * i + 0],
	            s = e[3 * i + 2];o += s * n;
	      }var u = t > 9 ? 2 : 1;if (this.utf8bytes.length + u < o || 40 == t) {
	        this.typeNumber = t, this.rsBlock = e, this.totalDataCount = o;break;
	      }
	    }
	  }, s.prototype = { get: function get(t) {
	      var e = Math.floor(t / 8);return this.buffer[e] >>> 7 - t % 8 & 1;
	    }, put: function put(t, e) {
	      for (var r = 0; e > r; r++) {
	        this.putBit(t >>> e - r - 1 & 1);
	      }
	    }, putBit: function putBit(t) {
	      var e = Math.floor(this.length / 8);this.buffer.length <= e && this.buffer.push(0), t && (this.buffer[e] |= 128 >>> this.length % 8), this.length++;
	    } }, t.exports = i;
	}, function (t, e) {
	  t.exports = function (t) {
	    for (var e, r = Array.prototype.slice.call(arguments, 1), o = 0; e = r[o]; o++) {
	      if (e) for (var i in e) {
	        t[i] = e[i];
	      }
	    }return t;
	  };
	}]);

/***/ },
/* 25 */
/*!*******************************************************!*\
  !*** ./bower_components/Yo/lib/fragment/yo-list.scss ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-list.scss */ 26);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-list.scss */ 26, function() {
				var newContent = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./yo-list.scss */ 26);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 26 */
/*!**********************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./bower_components/Yo/lib/fragment/yo-list.scss ***!
  \**********************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\n * @module fragment\n * @method yo-list\n * @description 构造列表的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-list.html\n * @param {String} $name 定义list名称\n * @param {Length} $margin 定义list外边距\n * @param {Length} $radius 定义list圆角\n * @param {Length} $border-width 定义list外边框厚度\n * @param {Color} $bordercolor 定义list边框色\n * @param {Length} $item-padding 定义list项的内补白\n * @param {Length} $label-padding 定义list分组标题内补白\n * @param {Color} $label-bgcolor 定义list分组标题背景色\n * @param {Color} $active-bgcolor 定义list点击反馈背景色\n * @param {Color} $on-bgcolor 定义list选中背景色\n * @param {Color} $on-color 定义list选中文本色\n * @param {Color} $item-bordercolor 定义list子项边框色\n * @param {Color} $label-bordercolor 定义list子项组头边框色\n * @param {Length} $item-font-size 定义list项字号\n * @param {Length} $label-font-size 定义list列表组头字号\n * @param {Length} $item-border-space 列表项下边线距离左侧的间隙\n */\n.yo-list > .label,\n.yo-list > .item,\n.yo-list .front {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  -webkit-transform: translatez(0);\n  transform: translatez(0); }\n  .yo-list > .label > .mark:not(:last-child),\n  .yo-list > .label > .yo-ico:not(:last-child),\n  .yo-list > .item > .mark:not(:last-child),\n  .yo-list > .item > .yo-ico:not(:last-child),\n  .yo-list .front > .mark:not(:last-child),\n  .yo-list .front > .yo-ico:not(:last-child) {\n    margin-right: .1rem; }\n  .yo-list > .label > .flex,\n  .yo-list > .item > .flex,\n  .yo-list .front > .flex {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1;\n    flex: 1;\n    width: .1px; }\n  .yo-list > .label > .mark,\n  .yo-list > .label > .yo-ico,\n  .yo-list > .label > .col,\n  .yo-list > .label > .flex,\n  .yo-list > .item > .mark,\n  .yo-list > .item > .yo-ico,\n  .yo-list > .item > .col,\n  .yo-list > .item > .flex,\n  .yo-list .front > .mark,\n  .yo-list .front > .yo-ico,\n  .yo-list .front > .col,\n  .yo-list .front > .flex {\n    display: block; }\n  .yo-list > .label.tr,\n  .yo-list > .item.tr,\n  .yo-list .front.tr {\n    padding: 0; }\n\n.yo-list > .label {\n  padding: 0.03rem 0.1rem;\n  border: 1px solid #eee;\n  border-width: 0 0 1px 0;\n  background-color: #fafafa;\n  color: #666;\n  font-size: 0.13rem;\n  font-weight: normal; }\n  .yo-list > .label > .col {\n    padding: 0.03rem 0.1rem; }\n  .yo-list > .label:not(:first-child) {\n    border-width: 1px 0;\n    margin-top: -1px; }\n\n.yo-list > .item,\n.yo-list .front {\n  padding: 0.11rem 0.1rem 0.12rem; }\n\n.yo-list > .item {\n  background-color: #fff;\n  color: #212121;\n  font-size: 0.14rem;\n  background-image: -webkit-linear-gradient#ddd, #ddd;\n  background-image: linear-gradient(#ddd, #ddd);\n  -webkit-background-size: 100% 1px;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: 0.1rem bottom; }\n  .yo-list > .item:last-child {\n    margin-bottom: -1px;\n    background-image: -webkit-linear-gradient#ccc, #ccc;\n    background-image: linear-gradient(#ccc, #ccc);\n    background-position: 0 bottom; }\n  .yo-list > .item-stacked {\n    display: block; }\n    .yo-list > .item-stacked > .mark {\n      padding-bottom: .05rem; }\n  .yo-list > .item-input > .yo-input {\n    height: auto;\n    padding: 0;\n    border: 0; }\n  .yo-list > .item.item-active:active,\n  .yo-list > .item.item-active:active .front, .yo-list > .item.item-light,\n  .yo-list > .item.item-light .front {\n    background-color: #f8f8f8; }\n  .yo-list > .item > .col {\n    padding: 0.11rem 0.1rem 0.12rem; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/fragment/yo-list.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/fragment/yo-list.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;ACtxBH;;;;;;;;;;;;;;;;;;;;;GAqBG;AAgLH;;;ED8GgB,qBAAS;EACT,sBAAS;EAQrB,cAAS;EAuUO,0BAjCmB;EAkCnB,4BAlCmB;EA2CnC,oBA3CmC;EAnsB3B,iCCCyB;EDGjC,yBCHiC,EAmBhC;EAkRL;;;;;;IAlSY,oBAAoB,EACvB;EAiST;;;IDwIgB,oBANI;IAOJ,gBAPI;IAehB,QAfgB;IAkBZ,YAAY,ECjbX;EA6RT;;;;;;;;;;;;IAxRY,eAAe,EAClB;EAuRT;;;IApRY,WAAW,EACd;;AAmRT;EAhRQ,wBF6P2B;EE5P3B,uBFwQmB;EEvQnB,wBAAwB;EACxB,0BFEyB;EEDzB,YFKsB;EEJtB,mBFwQqB;EEvQrB,oBAAoB,EASvB;EAiQL;IAvQY,wBFoPuB,EEnP1B;EAsQT;IApQY,oBAAoB;IACpB,iBAAiB,EACpB;;AAkQT;;EA9PQ,gCFyOkC,EExOrC;;AA6PL;EA3PQ,uBAAuB;EACvB,eFfyB;EEgBzB,mBFoPqB;ECtBjB,oDAA6C;EAGrD,8CAA4C;EA9QpC,kCCiD6B;ED7CrC,0BC6CqC;EACjC,6BAA6B;EAE7B,mCAA6D,EA0ChE;EAwML;IA/OY,oBAAoB;IDoNpB,oDAA6C;IAGrD,8CAA4C;ICnNpC,8BAA8B,EACjC;EA0OT;IAvOY,eAAe,EAIlB;IAmOT;MArOgB,uBAAuB,EAC1B;EAoOb;IA/NgB,aAAa;IACb,WAAW;IACX,UAAU,EACb;EA4Nb;;;IApNgB,0BFqMc,EEpMjB;EAmNb;IA1MY,gCFqL8B,EEpLjC","file":"yo-list.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\n * @module fragment\n * @method yo-list\n * @description 构造列表的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-list.html\n * @param {String} $name 定义list名称\n * @param {Length} $margin 定义list外边距\n * @param {Length} $radius 定义list圆角\n * @param {Length} $border-width 定义list外边框厚度\n * @param {Color} $bordercolor 定义list边框色\n * @param {Length} $item-padding 定义list项的内补白\n * @param {Length} $label-padding 定义list分组标题内补白\n * @param {Color} $label-bgcolor 定义list分组标题背景色\n * @param {Color} $active-bgcolor 定义list点击反馈背景色\n * @param {Color} $on-bgcolor 定义list选中背景色\n * @param {Color} $on-color 定义list选中文本色\n * @param {Color} $item-bordercolor 定义list子项边框色\n * @param {Color} $label-bordercolor 定义list子项组头边框色\n * @param {Length} $item-font-size 定义list项字号\n * @param {Length} $label-font-size 定义list列表组头字号\n * @param {Length} $item-border-space 列表项下边线距离左侧的间隙\n */\n.yo-list > .label,\n.yo-list > .item,\n.yo-list .front {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  -webkit-transform: translatez(0);\n  transform: translatez(0); }\n  .yo-list > .label > .mark:not(:last-child),\n  .yo-list > .label > .yo-ico:not(:last-child),\n  .yo-list > .item > .mark:not(:last-child),\n  .yo-list > .item > .yo-ico:not(:last-child),\n  .yo-list .front > .mark:not(:last-child),\n  .yo-list .front > .yo-ico:not(:last-child) {\n    margin-right: .1rem; }\n  .yo-list > .label > .flex,\n  .yo-list > .item > .flex,\n  .yo-list .front > .flex {\n    -webkit-box-flex: 1;\n    -webkit-flex: 1;\n    flex: 1;\n    width: .1px; }\n  .yo-list > .label > .mark,\n  .yo-list > .label > .yo-ico,\n  .yo-list > .label > .col,\n  .yo-list > .label > .flex,\n  .yo-list > .item > .mark,\n  .yo-list > .item > .yo-ico,\n  .yo-list > .item > .col,\n  .yo-list > .item > .flex,\n  .yo-list .front > .mark,\n  .yo-list .front > .yo-ico,\n  .yo-list .front > .col,\n  .yo-list .front > .flex {\n    display: block; }\n  .yo-list > .label.tr,\n  .yo-list > .item.tr,\n  .yo-list .front.tr {\n    padding: 0; }\n\n.yo-list > .label {\n  padding: 0.03rem 0.1rem;\n  border: 1px solid #eee;\n  border-width: 0 0 1px 0;\n  background-color: #fafafa;\n  color: #666;\n  font-size: 0.13rem;\n  font-weight: normal; }\n  .yo-list > .label > .col {\n    padding: 0.03rem 0.1rem; }\n  .yo-list > .label:not(:first-child) {\n    border-width: 1px 0;\n    margin-top: -1px; }\n\n.yo-list > .item,\n.yo-list .front {\n  padding: 0.11rem 0.1rem 0.12rem; }\n\n.yo-list > .item {\n  background-color: #fff;\n  color: #212121;\n  font-size: 0.14rem;\n  background-image: -webkit-linear-gradient#ddd, #ddd;\n  background-image: linear-gradient(#ddd, #ddd);\n  -webkit-background-size: 100% 1px;\n  background-size: 100% 1px;\n  background-repeat: no-repeat;\n  background-position: 0.1rem bottom; }\n  .yo-list > .item:last-child {\n    margin-bottom: -1px;\n    background-image: -webkit-linear-gradient#ccc, #ccc;\n    background-image: linear-gradient(#ccc, #ccc);\n    background-position: 0 bottom; }\n  .yo-list > .item-stacked {\n    display: block; }\n    .yo-list > .item-stacked > .mark {\n      padding-bottom: .05rem; }\n  .yo-list > .item-input > .yo-input {\n    height: auto;\n    padding: 0;\n    border: 0; }\n  .yo-list > .item.item-active:active,\n  .yo-list > .item.item-active:active .front, .yo-list > .item.item-light,\n  .yo-list > .item.item-light .front {\n    background-color: #f8f8f8; }\n  .yo-list > .item > .col {\n    padding: 0.11rem 0.1rem 0.12rem; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\n@import \"../core/variables\";\n@import \"../core/classes\";\n\n// 定义list的基础构造\n@mixin _list {\n    margin: map-get($list, margin);\n    border-radius: map-get($list, radius);\n    // 当边框厚度大于0时，才定义边框相关属性\n    @if map-get($list, border-width) != null and\n        map-get($list, border-width) != 0 {\n        border-width: map-get($list, border-width);\n        border-style: solid;\n        border-color: map-get($list, bordercolor);\n    }\n    > .label,\n    > .item,\n    .front {\n        @include flexbox;\n        @include align-items;\n        // 修复某些安卓版本开启了3D，yo-list当成滚动内容时出现的诡异问题\n        @include transform(translatez(0));\n        > .mark:not(:last-child),\n        > .yo-ico:not(:last-child) {\n            margin-right: .1rem;\n        }\n        // 定义需要自适应宽度的列\n        > .flex {\n            @include flex;\n        }\n        > .mark,\n        > .yo-ico,\n        > .col,\n        > .flex {\n            display: block;\n        }\n        &.tr {\n            // 当模式为table时，padding将设置到col上\n            padding: 0;\n        }\n    }\n    > .label {\n        padding: map-get($list, label-padding);\n        border: 1px solid map-get($list, label-bordercolor);\n        border-width: 0 0 1px 0;\n        background-color: map-get($list, label-bgcolor);\n        color: map-get($base, sub-color);\n        font-size: map-get($list, label-font-size);\n        font-weight: normal;\n        // 定义单元格的padding\n        > .col {\n            padding: map-get($list, label-padding);\n        }\n        &:not(:first-child) {\n            border-width: 1px 0;\n            margin-top: -1px;\n        }\n    }\n    > .item,\n    .front {\n        padding: map-get($list, item-padding);\n    }\n    > .item {\n        background-color: #fff;\n        color: map-get($base, color);\n        font-size: map-get($list, item-font-size);\n\n        // 描述线条\n        @include gradient(linear, map-get($list, item-bordercolor), map-get($list, item-bordercolor));\n        @include background-size(100% 1px);\n        background-repeat: no-repeat;\n        // 设置底边线的位置\n        background-position: map-get($list, item-border-space) bottom;\n\n        &:last-child {\n            margin-bottom: -1px;\n            // 最后一根线的颜色与外边框颜色相同\n            @include gradient(linear, map-get($list, bordercolor), map-get($list, bordercolor));\n            // 最后一根线的左边不留间隙\n            background-position: 0 bottom;\n        }\n\n        &-stacked {\n            display: block;\n            > .mark {\n                padding-bottom: .05rem;\n            }\n        }\n        &-input {\n            // 让输入框占满整个父容器\n            > .yo-input {\n                height: auto;\n                padding: 0;\n                border: 0;\n            }\n        }\n        // 常规需要active的项目，没有使用到第3方组件的\n        &.item-active:active,\n        // 为第3方组件提供active状态\n        &.item-light {\n            &,\n            .front {\n                background-color: map-get($list, active-bgcolor);\n            }\n        }\n        // 选中时背景和文本色\n        &.item-on {\n            background-color: map-get($list, on-bgcolor);\n            color: map-get($list, on-color);\n        }\n        // 定义单元格的padding\n        > .col {\n            padding: map-get($list, item-padding);\n        }\n    }\n}\n\n/**\n * @module fragment\n * @method yo-list\n * @description 构造列表的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-list.html\n * @param {String} $name 定义list名称\n * @param {Length} $margin 定义list外边距\n * @param {Length} $radius 定义list圆角\n * @param {Length} $border-width 定义list外边框厚度\n * @param {Color} $bordercolor 定义list边框色\n * @param {Length} $item-padding 定义list项的内补白\n * @param {Length} $label-padding 定义list分组标题内补白\n * @param {Color} $label-bgcolor 定义list分组标题背景色\n * @param {Color} $active-bgcolor 定义list点击反馈背景色\n * @param {Color} $on-bgcolor 定义list选中背景色\n * @param {Color} $on-color 定义list选中文本色\n * @param {Color} $item-bordercolor 定义list子项边框色\n * @param {Color} $label-bordercolor 定义list子项组头边框色\n * @param {Length} $item-font-size 定义list项字号\n * @param {Length} $label-font-size 定义list列表组头字号\n * @param {Length} $item-border-space 列表项下边线距离左侧的间隙\n */\n\n@mixin yo-list(\n    $name: default,\n    $margin: default,\n    $radius: default,\n    $border-width: default,\n    $bordercolor: default,\n    $item-padding: default,\n    $label-padding: default,\n    $label-bgcolor: default,\n    $active-bgcolor: default,\n    $on-bgcolor: default,\n    $on-color: default,\n    $item-bordercolor: default,\n    $label-bordercolor: default,\n    $item-font-size: default,\n    $label-font-size: default,\n    $item-border-space: default) {\n    // 区别是否新增实例还是修改本身\n    @if $name == default {\n        $name: \"\";\n    } @else {\n        $name: \"-#{$name}\";\n    }\n    // 如果值为default，则取config的定义\n    @if $margin == default {\n        $margin: map-get($list, margin);\n    }\n    @if $radius == default {\n        $radius: map-get($list, radius);\n    }\n    @if $border-width == default {\n        $border-width: map-get($list, border-width);\n    }\n    @if $bordercolor == default {\n        $bordercolor: map-get($list, bordercolor);\n    }\n    @if $item-padding == default {\n        $item-padding: map-get($list, item-padding);\n    }\n    @if $label-padding == default {\n        $label-padding: map-get($list, label-padding);\n    }\n    @if $label-bgcolor == default {\n        $label-bgcolor: map-get($list, label-bgcolor);\n    }\n    @if $active-bgcolor == default {\n        $active-bgcolor: map-get($list, active-bgcolor);\n    }\n    @if $on-bgcolor == default {\n        $on-bgcolor: map-get($list, on-bgcolor);\n    }\n    @if $on-color == default {\n        $on-color: map-get($list, on-color);\n    }\n    @if $item-bordercolor == default {\n        $item-bordercolor: map-get($list, item-bordercolor);\n    }\n    @if $label-bordercolor == default {\n        $label-bordercolor: map-get($list, label-bordercolor);\n    }\n    @if $label-font-size == default {\n        $label-font-size: map-get($list, label-font-size);\n    }\n    @if $item-font-size == default {\n        $item-font-size: map-get($list, item-font-size);\n    }\n    @if $item-border-space == default {\n        $item-border-space: map-get($list, item-border-space);\n    }\n    .yo-list#{$name} {\n        @if $margin != map-get($list, margin) {\n            margin: $margin;\n        }\n        @if $radius != map-get($list, radius) {\n            border-radius: $radius;\n        }\n        // 如果$border-width不等于config设定，则重绘边框相关\n        @if $border-width != map-get($list, border-width) {\n            // 如果$border-width为null，重设置为0\n            @if $border-width == null {\n                $border-width: 0;\n            }\n            border-width: $border-width;\n            // 如果$bordercolor不等于config设定，则重绘边框色\n            @if $bordercolor != map-get($list, bordercolor) {\n                @if $border-width != 0 {\n                    border-color: $bordercolor;\n                }\n            } @else {\n                // 如果config的边框厚度定义为null或者0，在扩展时，加上边框色\n                @if map-get($list, border-width) == null or\n                    map-get($list, border-width) == 0 {\n                    border-color: map-get($list, bordercolor);\n                }\n            }\n            // 如果config的边框厚度定义为null或者0，在扩展时，加上border-style\n            @if map-get($list, border-width) == null or\n                map-get($list, border-width) == 0 {\n                border-style: solid;\n            }\n        } @else {\n            // 如果扩展的边框厚度大于0且边框色和config边框色不同，在扩展时，重绘边框色\n            @if $border-width != null and\n                $border-width != 0 and\n                $bordercolor != map-get($list, bordercolor) {\n                border-color: $bordercolor;\n            }\n        }\n        > .label {\n            @if $label-padding != map-get($list, label-padding) {\n                padding: $label-padding;\n                > .col {\n                    padding: $label-padding;\n                }\n            }\n            @if $label-bordercolor != map-get($list, label-bordercolor) {\n                border-color: $label-bordercolor;\n            }\n            @if $label-bgcolor != map-get($list, label-bgcolor) {\n                background-color: $label-bgcolor;\n            }\n            @if $label-font-size != map-get($list, label-font-size) {\n                font-size: $label-font-size;\n            }\n        }\n        > .item,\n        .front {\n            @if $item-padding != map-get($list, item-padding) {\n                padding: $item-padding;\n                > .col {\n                    padding: $item-padding;\n                }\n            }\n        }\n        > .item {\n            @if $item-bordercolor != map-get($list, item-bordercolor) {\n                @include gradient(linear, $item-bordercolor, $item-bordercolor);\n            }\n            @if $item-border-space != map-get($list, item-border-space) {\n                background-position: $item-border-space bottom;\n            }\n            @if $item-font-size != map-get($list, item-font-size) {\n                font-size: $item-font-size;\n            }\n            &:last-child {\n                // 最后一根线的颜色与外边框颜色相同\n                @if $bordercolor != map-get($list, bordercolor) {\n                    @include gradient(linear, $bordercolor, $bordercolor);\n                }\n            }\n            &.item-active:active,\n            &.item-light {\n                &,\n                .front {\n                    @if $active-bgcolor != map-get($list, active-bgcolor) {\n                        background-color: $active-bgcolor;\n                    }\n                }\n            }\n            &.item-on {\n                @if $on-bgcolor != map-get($list, on-bgcolor) {\n                    background-color: $on-bgcolor;\n                }\n                @if $on-color != map-get($list, on-color) {\n                    color: $on-color;\n                }\n            }\n        }\n        // 增量扩展\n        @content;\n    }\n}\n\n// 调用本文件时载入list基础构造\n.yo-list {\n    @include _list;\n}"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 27 */
/*!*************************************************!*\
  !*** ./bower_components/Yo/lib/core/reset.scss ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./reset.scss */ 28);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./reset.scss */ 28, function() {
				var newContent = __webpack_require__(/*! !./../../../../~/css-loader?sourceMap!./../../../../~/sass-loader?sourceMap!./reset.scss */ 28);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 28 */
/*!****************************************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./bower_components/Yo/lib/core/reset.scss ***!
  \****************************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * Yo框架全局Reset\r\n * Yo重置Mobile及高级浏览器上常见的差异\r\n */\n*,\n::before,\n::after {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-tap-highlight-color: transparent; }\n\nhtml,\nbody {\n  overflow: hidden;\n  height: 100%; }\n\nhtml {\n  background-color: #fafafa;\n  color: #212121;\n  font-size: 100px;\n  -webkit-user-select: none;\n  user-select: none; }\n\nbody {\n  margin: 0;\n  font-size: 14px;\n  line-height: 1.5;\n  font-family: Helvetica Neue, Helvetica, STHeiTi, sans-serif; }\n\nul,\nol,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nfigure,\nform,\nfieldset,\nlegend,\ninput,\ntextarea,\nbutton,\np,\nblockquote,\nth,\ntd,\npre,\nxmp {\n  margin: 0;\n  padding: 0; }\n\ninput,\ntextarea,\nbutton,\nselect,\npre,\nxmp,\ntt,\ncode,\nkbd,\nsamp {\n  line-height: inherit;\n  font-family: inherit; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nsmall,\nbig,\ninput,\ntextarea,\nbutton,\nselect {\n  font-size: inherit; }\n\naddress,\ncite,\ndfn,\nem,\ni,\noptgroup,\nvar {\n  font-style: normal; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n  table-layout: fixed;\n  text-align: left; }\n\nul,\nol,\nmenu {\n  list-style: none; }\n\nfieldset,\nimg {\n  border: 0;\n  vertical-align: middle; }\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block; }\n\naudio,\ncanvas,\nvideo {\n  display: inline-block; }\n\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: \" \"; }\n\ntextarea,\npre,\nxmp {\n  overflow: auto; }\n\ntextarea {\n  resize: vertical; }\n\ninput,\ntextarea,\nbutton,\nselect\na {\n  outline: 0 none; }\n\ninput,\ntextarea,\nbutton,\nselect {\n  color: inherit; }\n  input:disabled,\n  textarea:disabled,\n  button:disabled,\n  select:disabled {\n    opacity: 1; }\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  padding: 0;\n  border: 0; }\n\ninput[type=\"button\"],\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"file\"]::-webkit-file-upload-button,\ninput[type=\"search\"]::-webkit-search-cancel-button {\n  -webkit-appearance: none;\n  appearance: none; }\n\nmark {\n  background-color: transparent; }\n\na,\nins,\ns,\nu,\ndel {\n  text-decoration: none; }\n\na,\nimg {\n  -webkit-touch-callout: none; }\n\na {\n  color: #00afc7; }\n\n.g-clear::after,\n.g-mod::after {\n  display: block;\n  overflow: hidden;\n  clear: both;\n  height: 0;\n  content: \" \"; }\n\n@font-face {\n  font-family: yofont;\n  src: url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.woff\") format(\"woff\"), url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.ttf\") format(\"truetype\"); }\n\n.yo-ico {\n  font-family: yofont !important;\n  font-style: normal;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  vertical-align: middle; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/core/reset.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/reset.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;ACx4BH;;;GAGG;AAIH;;;EDUY,+BCPsB;EDW9B,uBCX8B;EAC9B,yCAAiC,EACpC;;AD2KG;;EAMQ,iBAAiB;EACjB,aAAa,EAEpB;;AC/KL;EACI,0BFoB6B;EEnB7B,eF2B6B;EEzB7B,iBFE6B;ECNrB,0BAiPyB;EA7OjC,kBA6OiC,EC5NpC;;AAMD;EACI,UAAU;EAEV,gBFhB0B;EEiB1B,iBFZyB;EEazB,4DFfyE,EEgB5E;;AAeD;;;;;;;;;;;;;;;;;;;;;;;EAuBI,UAAU;EACV,WAAW,EACd;;AAID;;;;;;;;;;EAUI,qBAAqB;EACrB,qBAAqB,EACxB;;AAGD;;;;;;;;;;;;EAYI,mBAAmB,EACtB;;AAGD;;;;;;;EAOI,mBAAmB,EACtB;;AAGD;EACI,0BAA0B;EAC1B,kBAAkB;EAClB,oBAAoB;EACpB,iBAAiB,EACpB;;AAGD;;;EAGI,iBAAiB,EACpB;;AAID;;EAEI,UAAU;EACV,uBAAuB,EAC1B;;AAGD;;;;;;;;;;;;EAYI,eAAe,EAClB;;AAGD;;;EAGI,sBAAsB,EACzB;;AAGD;;;;EAII,aAAiB,EACpB;;AAGD;;;EDcQ,eAAe,ECVtB;;AAGD;EACI,iBAAiB,EACpB;;AAGD;;;;;EAKI,gBAAgB,EACnB;;AAID;;;;EAII,eAAe,EAIlB;EARD;;;;IAMQ,WAAW,EACd;;AAIL;;EAEI,WAAW;EACX,UAAU,EACb;;AAGD;;;;;EDrNY,yBAsOuB;EAlO/B,iBAkO+B,ECXlC;;AAGD;EACI,8BAAsB,EACzB;;AAGD;;;;;EAKI,sBAAsB,EACzB;;AAID;;EAEI,4BAA4B,EAC/B;;AAGD;EACI,eFxM6B,EEyMhC;;AAMD;;EDlKY,eAAe;EACf,iBAAiB;EACjB,YAAY;EACZ,UAAU;EACV,aAAiB,EACpB;;AApCD;EACI,oBDmBU;EClBV,+JAI0E,EAAA;;AAE9E;EACI,+BAAgD;EAChD,mBAAmB;EACnB,oCAAoC;EAGpC,mCAAmC;EACnC,uBAAuB,EAC1B","file":"reset.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * Yo框架全局Reset\r\n * Yo重置Mobile及高级浏览器上常见的差异\r\n */\n*,\n::before,\n::after {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-tap-highlight-color: transparent; }\n\nhtml,\nbody {\n  overflow: hidden;\n  height: 100%; }\n\nhtml {\n  background-color: #fafafa;\n  color: #212121;\n  font-size: 100px;\n  -webkit-user-select: none;\n  user-select: none; }\n\nbody {\n  margin: 0;\n  font-size: 14px;\n  line-height: 1.5;\n  font-family: Helvetica Neue, Helvetica, STHeiTi, sans-serif; }\n\nul,\nol,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nfigure,\nform,\nfieldset,\nlegend,\ninput,\ntextarea,\nbutton,\np,\nblockquote,\nth,\ntd,\npre,\nxmp {\n  margin: 0;\n  padding: 0; }\n\ninput,\ntextarea,\nbutton,\nselect,\npre,\nxmp,\ntt,\ncode,\nkbd,\nsamp {\n  line-height: inherit;\n  font-family: inherit; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nsmall,\nbig,\ninput,\ntextarea,\nbutton,\nselect {\n  font-size: inherit; }\n\naddress,\ncite,\ndfn,\nem,\ni,\noptgroup,\nvar {\n  font-style: normal; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n  table-layout: fixed;\n  text-align: left; }\n\nul,\nol,\nmenu {\n  list-style: none; }\n\nfieldset,\nimg {\n  border: 0;\n  vertical-align: middle; }\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block; }\n\naudio,\ncanvas,\nvideo {\n  display: inline-block; }\n\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: \"\\0020\"; }\n\ntextarea,\npre,\nxmp {\n  overflow: auto; }\n\ntextarea {\n  resize: vertical; }\n\ninput,\ntextarea,\nbutton,\nselect\na {\n  outline: 0 none; }\n\ninput,\ntextarea,\nbutton,\nselect {\n  color: inherit; }\n  input:disabled,\n  textarea:disabled,\n  button:disabled,\n  select:disabled {\n    opacity: 1; }\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  padding: 0;\n  border: 0; }\n\ninput[type=\"button\"],\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"file\"]::-webkit-file-upload-button,\ninput[type=\"search\"]::-webkit-search-cancel-button {\n  -webkit-appearance: none;\n  appearance: none; }\n\nmark {\n  background-color: transparent; }\n\na,\nins,\ns,\nu,\ndel {\n  text-decoration: none; }\n\na,\nimg {\n  -webkit-touch-callout: none; }\n\na {\n  color: #00afc7; }\n\n.g-clear::after,\n.g-mod::after {\n  display: block;\n  overflow: hidden;\n  clear: both;\n  height: 0;\n  content: \"\\0020\"; }\n\n@font-face {\n  font-family: yofont;\n  src: url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.woff\") format(\"woff\"), url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.ttf\") format(\"truetype\"); }\n\n.yo-ico {\n  font-family: yofont !important;\n  font-style: normal;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  vertical-align: middle; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\r\n@import \"variables\";\r\n@import \"classes\";\r\n/**\r\n * Yo框架全局Reset\r\n * Yo重置Mobile及高级浏览器上常见的差异\r\n */\r\n\r\n// 1. 将元素的盒模型统一为: border-box\r\n// 2. 清除元素tap时出现的焦点框\r\n*,\r\n::before,\r\n::after {\r\n    @include box-sizing(border-box);\r\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\r\n}\r\n// 1. 默认关闭页面滚动条\r\n@include root-scroll;\r\n\r\n// 1. 防止用户自定义网页背景及文字颜色、大小影响\r\nhtml {\r\n    background-color: map-get($base, doc-bgcolor);\r\n    color: map-get($base, color);\r\n    // 用于rem计算\r\n    font-size: map-get($base, font-size-root);\r\n    // 为不同屏幕质量定义对应的字体大小，用于匹配viewport缩放值\r\n    @if map-get($setting, is-ios-1pixel) {\r\n        &[ios=\"true\"] {\r\n            @include responsive(retina2x) {\r\n                font-size: map-get($base, font-size-root) * 2;\r\n            }\r\n            @include responsive(retina3x) {\r\n                font-size: map-get($base, font-size-root) * 3;\r\n            }\r\n        }\r\n    }\r\n    // 如果是适配大小的场景\r\n    @if map-get($base, responsive-type) == scaling {\r\n        font-size: map-get($base, font-size-root-scaling);\r\n    }\r\n    @include user-select();\r\n}\r\n\r\n// 1. 清除body的默认margin\r\n// 2. 定义页面的默认字号\r\n// 3. 定义页面的默认行高\r\n// 4. 定义页面的默认字体\r\nbody {\r\n    margin: 0;\r\n    // 为不同屏幕质量定义对应的字体大小\r\n    font-size: map-get($base, font-size);\r\n    line-height: map-get($base, line-height);\r\n    font-family: map-get($base, font-family);\r\n}\r\n\r\n// 为不同屏幕质量定义对应的字体大小，用于匹配viewport缩放值\r\n@if map-get($setting, is-ios-1pixel) {\r\n    html[ios=\"true\"] body {\r\n        @include responsive(retina2x) {\r\n            font-size: map-get($base, font-size) * 2;\r\n        }\r\n        @include responsive(retina3x) {\r\n            font-size: map-get($base, font-size) * 3;\r\n        }\r\n    }\r\n}\r\n\r\n// 1. 清除某些元素在不同浏览器下内外补白不同造成的影响\r\nul,\r\nol,\r\ndl,\r\ndd,\r\nh1,\r\nh2,\r\nh3,\r\nh4,\r\nh5,\r\nh6,\r\nfigure,\r\nform,\r\nfieldset,\r\nlegend,\r\ninput,\r\ntextarea,\r\nbutton,\r\np,\r\nblockquote,\r\nth,\r\ntd,\r\npre,\r\nxmp {\r\n    margin: 0;\r\n    padding: 0;\r\n}\r\n\r\n// 1. 为不继承的元素设定继承父级行高\r\n// 2. 为不继承的元素设定继承父级字体\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect,\r\npre,\r\nxmp,\r\ntt,\r\ncode,\r\nkbd,\r\nsamp {\r\n    line-height: inherit;\r\n    font-family: inherit;\r\n}\r\n\r\n// 1. 为不继承的元素设定继承父级字号\r\nh1,\r\nh2,\r\nh3,\r\nh4,\r\nh5,\r\nh6,\r\nsmall,\r\nbig,\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect {\r\n    font-size: inherit;\r\n}\r\n\r\n// 1. 重置斜体表现为正常文本\r\naddress,\r\ncite,\r\ndfn,\r\nem,\r\ni,\r\noptgroup,\r\nvar {\r\n    font-style: normal;\r\n}\r\n\r\n// 1. 清除单元格边距并让边框合并\r\ntable {\r\n    border-collapse: collapse;\r\n    border-spacing: 0;\r\n    table-layout: fixed;\r\n    text-align: left;\r\n}\r\n\r\n// 1. 清除列表默认序号\r\nul,\r\nol,\r\nmenu {\r\n    list-style: none;\r\n}\r\n\r\n// 1. 清除默认边框\r\n// 2. 清除img底部留白问题，并使得默认居中\r\nfieldset,\r\nimg {\r\n    border: 0;\r\n    vertical-align: middle;\r\n}\r\n\r\n// 1. 设置HTML5部分新增元素为块元素\r\narticle,\r\naside,\r\ndetails,\r\nfigcaption,\r\nfigure,\r\nfooter,\r\nheader,\r\nmain,\r\nmenu,\r\nnav,\r\nsection,\r\nsummary {\r\n    display: block;\r\n}\r\n\r\n// 1. 设置HTML5新增媒体元素与img, object保持一致\r\naudio,\r\ncanvas,\r\nvideo {\r\n    display: inline-block;\r\n}\r\n\r\n// 1. 清除引用元素的默认派生标识\r\nblockquote:before,\r\nblockquote:after,\r\nq:before,\r\nq:after {\r\n    content: \"\\0020\";\r\n}\r\n\r\n// 1. 设置文本域和代码块在需要时出现滚动条\r\ntextarea,\r\npre,\r\nxmp {\r\n    @include overflow;\r\n}\r\n\r\n// 1. 设置文本域滚可拖动改变垂直方向尺寸\r\ntextarea {\r\n    resize: vertical;\r\n}\r\n\r\n// 1. 清除webkit下表单元素的outline\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect\r\na {\r\n    outline: 0 none;\r\n}\r\n\r\n// 1. 让表单元素具有颜色继承\r\n// 2. iOS上当禁用时会设置opacity: .4\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect {\r\n    color: inherit;\r\n    &:disabled {\r\n        opacity: 1;\r\n    }\r\n}\r\n\r\n// 1. 清除Firefox按钮内部边框和补白\r\nbutton::-moz-focus-inner,\r\ninput::-moz-focus-inner {\r\n    padding: 0;\r\n    border: 0;\r\n}\r\n\r\n// 1. 重置按钮的外观\r\ninput[type=\"button\"],\r\ninput[type=\"submit\"],\r\ninput[type=\"reset\"],\r\ninput[type=\"file\"]::-webkit-file-upload-button,\r\ninput[type=\"search\"]::-webkit-search-cancel-button {\r\n    @include appearance;\r\n}\r\n\r\n// 1. 重置mark元素的默认背景色\r\nmark {\r\n    background-color: rgba(0, 0, 0, 0);\r\n}\r\n\r\n// 1. 清除文本线条装饰\r\na,\r\nins,\r\ns,\r\nu,\r\ndel {\r\n    text-decoration: none;\r\n}\r\n\r\n// 1. 禁止长按链接与图片弹出菜单\r\n// issues: 在iOS8.1下此设置对a仍无效\r\na,\r\nimg {\r\n    -webkit-touch-callout: none;\r\n}\r\n\r\n// 1. 预设默认链接表现\r\na {\r\n    color: map-get($base, link-color);\r\n}\r\n\r\n// 1. fix Android Browser 4.2.* 及以下 input:checked ~ .xxx 失效的问题\r\nhtml + input {}\r\n\r\n// 1. 预设清除浮动\r\n.g-clear,\r\n.g-mod {\r\n    @include clearfix;\r\n}\r\n\r\n// 1. 使用字体图标\r\n@include yofont;"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 29 */
/*!***********************!*\
  !*** ./src/router.js ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _riot = __webpack_require__(/*! riot */ 1);
	
	var _riot2 = _interopRequireDefault(_riot);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	_riot2.default.route.start(true);
	
	_riot2.default.route(function (tag) {
	    var app = window.__APP__;
	
	    var currTag = app.tags['qapp'].filter(function (t) {
	        return t.title === tag;
	    });
	    var appTag = app.tags['qapp'].filter(function (t) {
	        return t.title !== tag;
	    });
	
	    currTag.forEach(function (t) {
	        return t.trigger('show');
	    });
	    appTag.forEach(function (t) {
	        return t.trigger('hide');
	    });
	});

/***/ },
/* 30 */
/*!*******************************!*\
  !*** ./src/style/global.scss ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(/*! !./../../~/css-loader?sourceMap!./../../~/sass-loader?sourceMap!./global.scss */ 31);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(/*! ./../../~/style-loader/addStyles.js */ 8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(/*! !./../../~/css-loader?sourceMap!./../../~/sass-loader?sourceMap!./global.scss */ 31, function() {
				var newContent = __webpack_require__(/*! !./../../~/css-loader?sourceMap!./../../~/sass-loader?sourceMap!./global.scss */ 31);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 31 */
/*!**********************************************************************************!*\
  !*** ./~/css-loader?sourceMap!./~/sass-loader?sourceMap!./src/style/global.scss ***!
  \**********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(/*! ./../../~/css-loader/lib/css-base.js */ 7)();
	// imports
	
	
	// module
	exports.push([module.id, "html {\n  display: block;\n  position: relative;\n  width: 414px;\n  height: 736px;\n  overflow: hidden;\n  font-size: 100px;\n  padding: 0 20px; }\n  html body {\n    background-color: #fafafa;\n    width: 100%;\n    height: 100%;\n    margin: 0; }\n    html body app {\n      display: block;\n      background-color: #fafafa;\n      position: absolute;\n      width: 100%;\n      height: 100%; }\n      html body app qapp {\n        display: block;\n        background-color: #fafafa;\n        position: absolute;\n        width: calc(100% - 40px);\n        height: 100%;\n        border-radius: 3px;\n        box-shadow: 0 0 2px #666; }\n", "", {"version":3,"sources":["/./src/src/style/global.scss"],"names":[],"mappings":"AAIA;EACI,eAAe;EACf,mBAAmB;EACnB,aAAa;EACb,cAAc;EACd,iBAAiB;EACjB,iBAAiB;EACjB,gBAAgB,EAwBnB;EA/BD;IAUQ,0BAZS;IAaT,YAAY;IACZ,aAAa;IACb,UAAU,EAiBb;IA9BL;MAeY,eAAe;MACf,0BAlBK;MAmBL,mBAAmB;MACnB,YAAY;MACZ,aAAa,EAUhB;MA7BT;QAqBgB,eAAe;QACf,0BAxBC;QAyBD,mBAAmB;QACnB,yBAAW;QACX,aAAa;QACb,mBAAmB;QACnB,yBAAyB,EAC5B","file":"global.scss","sourcesContent":["@charset \"UTF-8\";\n\n$bgcolor: #fafafa;\n\nhtml{\n    display: block;\n    position: relative;\n    width: 414px;\n    height: 736px;\n    overflow: hidden;\n    font-size: 100px;\n    padding: 0 20px;\n\n    body{\n        background-color: $bgcolor;\n        width: 100%;\n        height: 100%;\n        margin: 0;\n        app{\n            display: block;\n            background-color: $bgcolor;\n            position: absolute;\n            width: 100%;\n            height: 100%;\n            qapp{\n                display: block;\n                background-color: $bgcolor;\n                position: absolute;\n                width: calc(100% - 40px);\n                height: 100%;\n                border-radius: 3px;\n                box-shadow: 0 0 2px #666;\n            }\n        }\n    }\n}\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map