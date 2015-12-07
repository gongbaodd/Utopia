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
/******/ 	var hotCurrentHash = "e8cc31387a3b474ce4dc"; // eslint-disable-line no-unused-vars
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _riot = __webpack_require__(1);
	
	var _riot2 = _interopRequireDefault(_riot);
	
	__webpack_require__(2);
	
	__webpack_require__(11);
	
	__webpack_require__(12);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	chrome.tabs.getSelected(null, function () {
	    document.body.innerHTML += '<app></app>';
	
	    _riot2.default.mount('app');
	});

/***/ },
/* 1 */
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
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(3);
	
	__webpack_require__(9);
	
	riot.tag2('app', '<qapp title="webVC" style="top:0;transform:scale(.9);"></qapp> <qapp title="hy-normal" style="top:20%;transform:scale(.93);"></qapp> <qapp title="hy-transparent" style="top:40%;transform:scale(.96);"></qapp> <qapp title="hy-none" style="top:60%;transform:scale(1);"></qapp>', ':scope{ width: 3.2rem; height: 5.78rem; }', '', function (opts) {});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(4);
	
	riot.tag2('qapp', '<yo-header></yo-header>', ':scope{ overflow: hidden; position: relative; }', '', function (opts) {
	        this.title = opts.title;
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(riot) {'use strict';
	
	__webpack_require__(5);
	
	riot.tag2('yo-header', '<h2 class="title">{title}</h2> <span class="regret yo-ico">{left}</span> <span class="affirm yo-ico"></span>', 'yo-header,[riot-tag="yo-header"] { display: block; border-top-left-radius: 3px; border-top-right-radius: 3px; } yo-header .title,[riot-tag="yo-header"] .title{ font-weight: normal; } yo-header.hy-transparent,[riot-tag="yo-header"].hy-transparent{ border-color: transparent; background-color: transparent; color: #212121; } yo-header.hy-transparent > .regret::before,[riot-tag="yo-header"].hy-transparent > .regret::before { content: \'\'; width: .35rem; height: .35rem; position: absolute; border: 2px solid #7cd; background-color: rgba(27,169,186,.4); border-radius: 50%; top: .04rem; left: .1rem; } yo-header.hy-none,[riot-tag="yo-header"].hy-none{ border-color: transparent; background-color: transparent; color: #212121; } yo-header.hy-none > .regret,[riot-tag="yo-header"].hy-none > .regret { display: none; } yo-header.hy-none > .affirm,[riot-tag="yo-header"].hy-none > .affirm { display: none; }', 'class="yo-header {title}"', function (opts) {
	        var title = this.parent.title;
	        var left = '';
	        if (title == 'webVC') {
	                left = '';
	        }
	        this.title = title;
	        this.left = left;
	}, '{ }');
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(6);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(6, function() {
				var newContent = __webpack_require__(6);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\n * @module fragment\n * @method yo-header\n * @description 构造头的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-header.html\n * @param {String} $name 定义yo-header名称\n * @param {Length} $height 定义yo-header高度\n * @param {Length} $item-width 定义yo-header两侧子项宽度\n * @param {Length} $item-space 定义yo-header两侧子项离边界的间隙\n * @param {Color} $bordercolor 定义yo-header边框色\n * @param {Color} $bgcolor 定义yo-header背景色\n * @param {Color} $color 定义yo-header文本色\n * @param {Length} $font-size 定义yo-header文本大小\n * @param {Color} $item-color 定义yo-header两侧的子项文本色\n * @param {Color} $item-ico-color 定义yo-header两侧的ico色\n * @param {Length} $item-font-size 定义yo-header两侧的子项文本大小\n * @param {Length} $item-ico-size 定义yo-header两侧的ico大小\n */\n.yo-header {\n  position: relative;\n  height: 0.44rem;\n  line-height: 0.44rem;\n  border-bottom: 1px solid #1ba9ba;\n  background-color: #1ba9ba;\n  color: #fff;\n  font-size: 0.18rem;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  text-align: center; }\n  .yo-header > .title {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    margin: 0 0.6rem; }\n  .yo-header > .regret,\n  .yo-header > .affirm {\n    position: absolute;\n    top: 0;\n    width: 0.6rem;\n    cursor: pointer;\n    font-size: 0.14rem; }\n    .yo-header > .regret:active,\n    .yo-header > .affirm:active {\n      opacity: .5; }\n    .yo-header > .regret.yo-ico,\n    .yo-header > .regret > .yo-ico,\n    .yo-header > .affirm.yo-ico,\n    .yo-header > .affirm > .yo-ico {\n      color: #7ff;\n      font-size: 0.2rem; }\n  .yo-header > .regret {\n    left: 0;\n    padding-left: 0.15rem;\n    text-align: left; }\n  .yo-header > .affirm {\n    right: 0;\n    padding-right: 0.15rem;\n    text-align: right; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/fragment/yo-header.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/fragment/yo-header.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AC/0BH;;;;;;;;;;;;;;;;;GAiBG;AAgHH;EAvLI,mBAAmB;EACnB,gBFkXsB;EEjXtB,qBFiXsB;EEhXtB,iCFsXuB;EErXvB,0BFuXuB;EEpXnB,YFsXgB;EElXhB,mBFoXkB;EC0ftB,iBAAiB;EACjB,oBAAoB;EAEhB,wBAAwB;EC92B5B,mBAAmB,EA2KtB;EAFD;IDksBI,iBAAiB;IACjB,oBAAoB;IAEhB,wBAAwB;IC32BxB,iBFoWiB,EEnWpB;EAqKL;;IAlKQ,mBAAmB;IACnB,OAAO;IACP,cF8ViB;IEzVjB,gBAAgB;IAMZ,mBFmWc,EE5VrB;IA8IL;;MAzJY,YAAY,EACf;IAwJT;;;;MAjJY,YF6VY;ME5VZ,kBFgWa,EE/VhB;EA+IT;IA5IQ,QAAQ;IACR,sBF2UkB;IE1UlB,iBAAiB,EACpB;EAyIL;IAvIQ,SAAS;IACT,uBFsUkB;IErUlB,kBAAkB,EACrB","file":"yo-header.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\n * @module fragment\n * @method yo-header\n * @description 构造头的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-header.html\n * @param {String} $name 定义yo-header名称\n * @param {Length} $height 定义yo-header高度\n * @param {Length} $item-width 定义yo-header两侧子项宽度\n * @param {Length} $item-space 定义yo-header两侧子项离边界的间隙\n * @param {Color} $bordercolor 定义yo-header边框色\n * @param {Color} $bgcolor 定义yo-header背景色\n * @param {Color} $color 定义yo-header文本色\n * @param {Length} $font-size 定义yo-header文本大小\n * @param {Color} $item-color 定义yo-header两侧的子项文本色\n * @param {Color} $item-ico-color 定义yo-header两侧的ico色\n * @param {Length} $item-font-size 定义yo-header两侧的子项文本大小\n * @param {Length} $item-ico-size 定义yo-header两侧的ico大小\n */\n.yo-header {\n  position: relative;\n  height: 0.44rem;\n  line-height: 0.44rem;\n  border-bottom: 1px solid #1ba9ba;\n  background-color: #1ba9ba;\n  color: #fff;\n  font-size: 0.18rem;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  text-align: center; }\n  .yo-header > .title {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    margin: 0 0.6rem; }\n  .yo-header > .regret,\n  .yo-header > .affirm {\n    position: absolute;\n    top: 0;\n    width: 0.6rem;\n    cursor: pointer;\n    font-size: 0.14rem; }\n    .yo-header > .regret:active,\n    .yo-header > .affirm:active {\n      opacity: .5; }\n    .yo-header > .regret.yo-ico,\n    .yo-header > .regret > .yo-ico,\n    .yo-header > .affirm.yo-ico,\n    .yo-header > .affirm > .yo-ico {\n      color: #7ff;\n      font-size: 0.2rem; }\n  .yo-header > .regret {\n    left: 0;\n    padding-left: 0.15rem;\n    text-align: left; }\n  .yo-header > .affirm {\n    right: 0;\n    padding-right: 0.15rem;\n    text-align: right; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\n@import \"../core/variables\";\n@import \"../core/classes\";\n\n// 定义header的基础构造\n@mixin _header {\n    position: relative;\n    height: map-get($header, height);\n    line-height: map-get($header, height);\n    border-bottom: 1px solid map-get($header, bordercolor);\n    background-color: map-get($header, bgcolor);\n    // 如果config预设值不等于base color，则重绘color\n    @if map-get($header, color) != map-get($base, color) {\n        color: map-get($header, color);\n    }\n    // 如果config预设值不等于base font-size，则重绘font-size\n    @if map-get($header, font-size) != map-get($base, font-size) {\n        font-size: map-get($header, font-size);\n    }\n    @include ellipsis;\n    text-align: center;\n    > .title {\n        @include ellipsis;\n        margin: 0 map-get($header, item-width);\n    }\n    > .regret,\n    > .affirm {\n        position: absolute;\n        top: 0;\n        width: map-get($header, item-width);\n        // 如果config预设值不等于parent color，则重绘子项的color\n        @if map-get($header, item-color) != map-get($header, color) {\n            color: map-get($header, item-color);\n        }\n        cursor: pointer;\n        &:active {\n            opacity: .5;\n        }\n        // 如果config预设值不等于parent font-size，则重绘子项的font-size\n        @if map-get($header, item-font-size) != map-get($header, font-size) {\n            font-size: map-get($header, item-font-size);\n        }\n        &.yo-ico,\n        > .yo-ico {\n            color: map-get($header, item-ico-color);\n            font-size: map-get($header, item-ico-size);\n        }\n    }\n    > .regret {\n        left: 0;\n        padding-left: map-get($header, item-space);\n        text-align: left;\n    }\n    > .affirm {\n        right: 0;\n        padding-right: map-get($header, item-space);\n        text-align: right;\n    }\n}\n\n/**\n * @module fragment\n * @method yo-header\n * @description 构造头的自定义使用方法\n * @demo http://doyoe.github.io/Yo/demo/fragment/yo-header.html\n * @param {String} $name 定义yo-header名称\n * @param {Length} $height 定义yo-header高度\n * @param {Length} $item-width 定义yo-header两侧子项宽度\n * @param {Length} $item-space 定义yo-header两侧子项离边界的间隙\n * @param {Color} $bordercolor 定义yo-header边框色\n * @param {Color} $bgcolor 定义yo-header背景色\n * @param {Color} $color 定义yo-header文本色\n * @param {Length} $font-size 定义yo-header文本大小\n * @param {Color} $item-color 定义yo-header两侧的子项文本色\n * @param {Color} $item-ico-color 定义yo-header两侧的ico色\n * @param {Length} $item-font-size 定义yo-header两侧的子项文本大小\n * @param {Length} $item-ico-size 定义yo-header两侧的ico大小\n */\n\n@mixin yo-header(\n    $name: default,\n    $height: default,\n    $item-width: default,\n    $item-space: default,\n    $bordercolor: default,\n    $bgcolor: default,\n    $color: default,\n    $font-size: default,\n    $item-color: default,\n    $item-ico-color: default,\n    $item-font-size: default,\n    $item-ico-size: default) {\n    // 区别是否新增实例还是修改本身\n    @if $name == default {\n        $name: \"\";\n    } @else {\n        $name: \"-#{$name}\";\n    }\n    // 如果值为default，则取config的定义\n    @if $height == default {\n        $height: map-get($header, height);\n    }\n    @if $item-width == default {\n        $item-width: map-get($header, item-width);\n    }\n    @if $item-space == default {\n        $item-space: map-get($header, item-space);\n    }\n    @if $bordercolor == default {\n        $bordercolor: map-get($header, bordercolor);\n    }\n    @if $bgcolor == default {\n        $bgcolor: map-get($header, bgcolor);\n    }\n    @if $color == default {\n        $color: map-get($header, color);\n    }\n    @if $font-size == default {\n        $font-size: map-get($header, font-size);\n    }\n    @if $item-color == default {\n        $item-color: map-get($header, item-color);\n    }\n    @if $item-ico-color == default {\n        $item-ico-color: map-get($header, item-ico-color);\n    }\n    @if $item-font-size == default {\n        $item-font-size: map-get($header, item-font-size);\n    }\n    @if $item-ico-size == default {\n        $item-ico-size: map-get($header, item-ico-size);\n    }\n    .yo-header#{$name} {\n        @if $height != map-get($header, height) {\n            height: $height;\n            line-height: $height;\n        }\n        @if $bordercolor != map-get($header, bordercolor) {\n            border-color: $bordercolor;\n        }\n        @if $bgcolor != map-get($header, bgcolor) {\n            background-color: $bgcolor;\n        }\n        @if $color != map-get($header, color) {\n            color: $color;\n        }\n        @if $font-size != map-get($header, font-size) {\n            font-size: $font-size;\n        }\n        > .title {\n            @if $item-width != map-get($header, item-width) {\n                margin: 0 $item-width;\n            }\n        }\n        > .regret,\n        > .affirm {\n            @if $item-width != map-get($header, item-width) {\n                width: $item-width;\n            }\n            @if $item-color != map-get($header, item-color) {\n                color: $item-color;\n            }\n            @if $item-font-size != map-get($header, item-font-size) {\n                font-size: $item-font-size;\n            }\n            &.yo-ico,\n            > .yo-ico {\n                @if $item-ico-color != map-get($header, item-ico-color) {\n                    color: $item-ico-color;\n                }\n                @if $item-ico-size != map-get($header, item-ico-size) {\n                    font-size: $item-ico-size;\n                }\n            }\n        }\n        @if $item-space != map-get($header, item-space) {\n            > .regret {\n                    padding-left: $item-space;\n            }\n            > .affirm {\n                    padding-right: $item-space;\n            }\n        }\n        // 增量扩展\n        @content;\n    }\n}\n\n// 调用本文件时载入header基础构造\n.yo-header {\n    @include _header;\n}"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 7 */
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
		if(false) {
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
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(10);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(10, function() {
				var newContent = __webpack_require__(10);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(7)();
	// imports
	
	
	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * Yo框架全局Reset\r\n * Yo重置Mobile及高级浏览器上常见的差异\r\n */\n*,\n::before,\n::after {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-tap-highlight-color: transparent; }\n\nhtml,\nbody {\n  overflow: hidden;\n  height: 100%; }\n\nhtml {\n  background-color: #fafafa;\n  color: #212121;\n  font-size: 100px;\n  -webkit-user-select: none;\n  user-select: none; }\n\nbody {\n  margin: 0;\n  font-size: 14px;\n  line-height: 1.5;\n  font-family: Helvetica Neue, Helvetica, STHeiTi, sans-serif; }\n\nul,\nol,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nfigure,\nform,\nfieldset,\nlegend,\ninput,\ntextarea,\nbutton,\np,\nblockquote,\nth,\ntd,\npre,\nxmp {\n  margin: 0;\n  padding: 0; }\n\ninput,\ntextarea,\nbutton,\nselect,\npre,\nxmp,\ntt,\ncode,\nkbd,\nsamp {\n  line-height: inherit;\n  font-family: inherit; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nsmall,\nbig,\ninput,\ntextarea,\nbutton,\nselect {\n  font-size: inherit; }\n\naddress,\ncite,\ndfn,\nem,\ni,\noptgroup,\nvar {\n  font-style: normal; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n  table-layout: fixed;\n  text-align: left; }\n\nul,\nol,\nmenu {\n  list-style: none; }\n\nfieldset,\nimg {\n  border: 0;\n  vertical-align: middle; }\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block; }\n\naudio,\ncanvas,\nvideo {\n  display: inline-block; }\n\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: \" \"; }\n\ntextarea,\npre,\nxmp {\n  overflow: auto; }\n\ntextarea {\n  resize: vertical; }\n\ninput,\ntextarea,\nbutton,\nselect\na {\n  outline: 0 none; }\n\ninput,\ntextarea,\nbutton,\nselect {\n  color: inherit; }\n  input:disabled,\n  textarea:disabled,\n  button:disabled,\n  select:disabled {\n    opacity: 1; }\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  padding: 0;\n  border: 0; }\n\ninput[type=\"button\"],\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"file\"]::-webkit-file-upload-button,\ninput[type=\"search\"]::-webkit-search-cancel-button {\n  -webkit-appearance: none;\n  appearance: none; }\n\nmark {\n  background-color: transparent; }\n\na,\nins,\ns,\nu,\ndel {\n  text-decoration: none; }\n\na,\nimg {\n  -webkit-touch-callout: none; }\n\na {\n  color: #00afc7; }\n\n.g-clear::after,\n.g-mod::after {\n  display: block;\n  overflow: hidden;\n  clear: both;\n  height: 0;\n  content: \" \"; }\n\n@font-face {\n  font-family: yofont;\n  src: url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.woff\") format(\"woff\"), url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.ttf\") format(\"truetype\"); }\n\n.yo-ico {\n  font-family: yofont !important;\n  font-style: normal;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  vertical-align: middle; }\n", "", {"version":3,"sources":["/./bower_components/Yo/lib/core/reset.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/variables.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/classes.scss","/./bower_components/Yo/lib/bower_components/Yo/lib/core/reset.scss"],"names":[],"mappings":"AAAA,iBAAiB;ACCjB;;;;GAIG;ACJH;;;GAGG;AAEH;;;;;;;GAOG;AAcH;;;;;;;;;GASG;AAeH;;;;;;GAMG;AAWH;;;;;;GAMG;AAwBH;;;;;;GAMG;AAiBH;;;;;GAKG;AAWH;;;;;;;GAOG;AAgBH;;;;;;;GAOG;AAWH;;;;;;GAMG;AAcH;;;;;;GAMG;AAWH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;;GAOG;AAUH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAKH;;;;;;GAMG;AAQH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AAKH;;;;;GAKG;AA4BH;;;;;;GAMG;AA2BH;;;;;;;GAOG;AA0BH;;;;;;GAMG;AAmBH;;;;;;GAMG;AAoDH;;;;;;GAMG;AAOH;;;;;;GAMG;AA0EH;;;;;;;GAOG;AAoEH;;;;;;GAMG;AA+CH;;;;;;GAMG;AA4CH;;;;;;;GAOG;AAMH;;;;;;GAMG;AAMH;;;;;;;GAOG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;AAMH;;;;;;GAMG;AASH;;;;;GAKG;ACx4BH;;;GAGG;AAIH;;;EDUY,+BCPsB;EDW9B,uBCX8B;EAC9B,yCAAiC,EACpC;;AD2KG;;EAMQ,iBAAiB;EACjB,aAAa,EAEpB;;AC/KL;EACI,0BFoB6B;EEnB7B,eF2B6B;EEzB7B,iBFE6B;ECNrB,0BAiPyB;EA7OjC,kBA6OiC,EC5NpC;;AAMD;EACI,UAAU;EAEV,gBFhB0B;EEiB1B,iBFZyB;EEazB,4DFfyE,EEgB5E;;AAeD;;;;;;;;;;;;;;;;;;;;;;;EAuBI,UAAU;EACV,WAAW,EACd;;AAID;;;;;;;;;;EAUI,qBAAqB;EACrB,qBAAqB,EACxB;;AAGD;;;;;;;;;;;;EAYI,mBAAmB,EACtB;;AAGD;;;;;;;EAOI,mBAAmB,EACtB;;AAGD;EACI,0BAA0B;EAC1B,kBAAkB;EAClB,oBAAoB;EACpB,iBAAiB,EACpB;;AAGD;;;EAGI,iBAAiB,EACpB;;AAID;;EAEI,UAAU;EACV,uBAAuB,EAC1B;;AAGD;;;;;;;;;;;;EAYI,eAAe,EAClB;;AAGD;;;EAGI,sBAAsB,EACzB;;AAGD;;;;EAII,aAAiB,EACpB;;AAGD;;;EDcQ,eAAe,ECVtB;;AAGD;EACI,iBAAiB,EACpB;;AAGD;;;;;EAKI,gBAAgB,EACnB;;AAID;;;;EAII,eAAe,EAIlB;EARD;;;;IAMQ,WAAW,EACd;;AAIL;;EAEI,WAAW;EACX,UAAU,EACb;;AAGD;;;;;EDrNY,yBAsOuB;EAlO/B,iBAkO+B,ECXlC;;AAGD;EACI,8BAAsB,EACzB;;AAGD;;;;;EAKI,sBAAsB,EACzB;;AAID;;EAEI,4BAA4B,EAC/B;;AAGD;EACI,eFxM6B,EEyMhC;;AAMD;;EDlKY,eAAe;EACf,iBAAiB;EACjB,YAAY;EACZ,UAAU;EACV,aAAiB,EACpB;;AApCD;EACI,oBDmBU;EClBV,+JAI0E,EAAA;;AAE9E;EACI,+BAAgD;EAChD,mBAAmB;EACnB,oCAAoC;EAGpC,mCAAmC;EACnC,uBAAuB,EAC1B","file":"reset.scss","sourcesContent":["@charset \"UTF-8\";\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\n/**\r\n * Yo框架全局Reset\r\n * Yo重置Mobile及高级浏览器上常见的差异\r\n */\n*,\n::before,\n::after {\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-tap-highlight-color: transparent; }\n\nhtml,\nbody {\n  overflow: hidden;\n  height: 100%; }\n\nhtml {\n  background-color: #fafafa;\n  color: #212121;\n  font-size: 100px;\n  -webkit-user-select: none;\n  user-select: none; }\n\nbody {\n  margin: 0;\n  font-size: 14px;\n  line-height: 1.5;\n  font-family: Helvetica Neue, Helvetica, STHeiTi, sans-serif; }\n\nul,\nol,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nfigure,\nform,\nfieldset,\nlegend,\ninput,\ntextarea,\nbutton,\np,\nblockquote,\nth,\ntd,\npre,\nxmp {\n  margin: 0;\n  padding: 0; }\n\ninput,\ntextarea,\nbutton,\nselect,\npre,\nxmp,\ntt,\ncode,\nkbd,\nsamp {\n  line-height: inherit;\n  font-family: inherit; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nsmall,\nbig,\ninput,\ntextarea,\nbutton,\nselect {\n  font-size: inherit; }\n\naddress,\ncite,\ndfn,\nem,\ni,\noptgroup,\nvar {\n  font-style: normal; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n  table-layout: fixed;\n  text-align: left; }\n\nul,\nol,\nmenu {\n  list-style: none; }\n\nfieldset,\nimg {\n  border: 0;\n  vertical-align: middle; }\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block; }\n\naudio,\ncanvas,\nvideo {\n  display: inline-block; }\n\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: \"\\0020\"; }\n\ntextarea,\npre,\nxmp {\n  overflow: auto; }\n\ntextarea {\n  resize: vertical; }\n\ninput,\ntextarea,\nbutton,\nselect\na {\n  outline: 0 none; }\n\ninput,\ntextarea,\nbutton,\nselect {\n  color: inherit; }\n  input:disabled,\n  textarea:disabled,\n  button:disabled,\n  select:disabled {\n    opacity: 1; }\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  padding: 0;\n  border: 0; }\n\ninput[type=\"button\"],\ninput[type=\"submit\"],\ninput[type=\"reset\"],\ninput[type=\"file\"]::-webkit-file-upload-button,\ninput[type=\"search\"]::-webkit-search-cancel-button {\n  -webkit-appearance: none;\n  appearance: none; }\n\nmark {\n  background-color: transparent; }\n\na,\nins,\ns,\nu,\ndel {\n  text-decoration: none; }\n\na,\nimg {\n  -webkit-touch-callout: none; }\n\na {\n  color: #00afc7; }\n\n.g-clear::after,\n.g-mod::after {\n  display: block;\n  overflow: hidden;\n  clear: both;\n  height: 0;\n  content: \"\\0020\"; }\n\n@font-face {\n  font-family: yofont;\n  src: url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.woff\") format(\"woff\"), url(\"http://source.qunarzz.com/fonts/yo/1.0.0/yofont.ttf\") format(\"truetype\"); }\n\n.yo-ico {\n  font-family: yofont !important;\n  font-style: normal;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  vertical-align: middle; }\n","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局Variables\r\n * Yo基础变量map，如果不想定义某属性，将其value设置为null；\r\n * Yo仅使用2种长度单位：px用于边框，rem用于除边框之外的所有地方\r\n */\r\n\r\n$setting: (\r\n    // 版本号\r\n    version:          \"1.8.7\",\r\n    // 是否开启厂商前缀\r\n    is-vendor-prefix: true,\r\n    // 厂商前缀\r\n    vendor-prefix:    -webkit-,\r\n    // 是否开启iOS 1px方案\r\n    // Android4.3及以下不支持initial-scale除1之外的设置，暂不考虑\r\n    is-ios-1pixel:    false,\r\n    // 背景图片服务器\r\n    bgimg-domain:     \"http://source.qunarzz.com/yo/bgimg/\"\r\n) !default;\r\n\r\n// base\r\n$base: (\r\n    // 响应式的类型：none | scaling\r\n    responsive-type:        none,\r\n    // html root使用100px，方便rem单位的换算\r\n    font-size-root:         100px,\r\n    // 适配：用于做元素随屏幕大小而变化的情况\r\n    font-size-root-scaling: 31.25vw,\r\n    // body的默认字体\r\n    // chrome37.0.2062.120/opera24在body上使用rem时有个bug（其他版本未测）:\r\n    // 只要引用了外部样式，不论里面的内容是什么，body上的rem就会失效\r\n    // 这时在开发者工具里，关闭又开启一次该条属性，则生效，刷新又挂\r\n    // 所以这里注释该条属性，默认字号不能从root相对而来，所以定义成px\r\n    font-size:            14px,\r\n    // font-family\r\n    // escape('微软雅黑').replace(/\\%u/g,'\\\\').toLowerCase()\r\n    font-family:          #{\"Helvetica Neue\", Helvetica, STHeiTi, sans-serif},\r\n    // lin-height\r\n    line-height:          1.5,\r\n    // 默认文档背景色\r\n    doc-bgcolor:          #fafafa,\r\n    // 默认边框色\r\n    bordercolor:          #ccc,\r\n    // 默认次级边框色\r\n    sub-bordercolor:      #ddd,\r\n    // 默认背景颜色\r\n    bgcolor:              #fafafa,\r\n    // 默认文本颜色\r\n    color:                #212121,\r\n    // 默认次级文本颜色\r\n    sub-color:            #666,\r\n    // 默认边框色\r\n    disabled-bordercolor: #ccc,\r\n    // 默认文档颜色\r\n    disabled-bgcolor:     #e0e0e0,\r\n    // 默认禁用文本颜色\r\n    disabled-color:       #bbb,\r\n    // 高亮色\r\n    light-color:          #FE0053,\r\n    // 价格颜色\r\n    price-color:          #f60,\r\n    // Link Colors\r\n    // 默认链接色\r\n    link-color:           #00afc7,\r\n    // 链接经过色\r\n    link-hover-color:     #f60\r\n) !default;\r\n\r\n// responsive media types\r\n$media-types: (\r\n    // {String} 横屏\r\n    landscape: \"screen and (orientation: landscape)\",\r\n    // {String} 竖屏\r\n    portrait:  \"screen and (orientation: portrait)\",\r\n    // {String} 视网膜屏2x\r\n    retina2x:  \"(min--moz-device-pixel-ratio: 1.5),\r\n                (-webkit-min-device-pixel-ratio: 1.5),\r\n                (min-device-pixel-ratio: 1.5),\r\n                (min-resolution: 144dpi),\r\n                (min-resolution: 1.5dppx)\",\r\n    // {String} 视网膜屏3x\r\n    retina3x:  \"(min--moz-device-pixel-ratio: 2.5),\r\n                (-webkit-min-device-pixel-ratio: 2.5),\r\n                (min-device-pixel-ratio: 2.5),\r\n                (min-resolution: 240dpi),\r\n                (min-resolution: 2.5dppx)\",\r\n    // {String} PC\r\n    pc:        \"(min-width: 8rem)\",\r\n    // {String} mobile\r\n    mobile:    \"(max-width: 7.99rem)\"\r\n) !default;\r\n\r\n// ico font\r\n$ico: (\r\n    // {Boolean} 是否使用图标字体\r\n    is-use:     true,\r\n    // {String} 图标字体文件名\r\n    font-name:  yofont,\r\n    // {Url} 图标字体路径\r\n    font-path:  \"http://source.qunarzz.com/fonts/yo/1.0.0/\"\r\n) !default;\r\n\r\n// Layout Stacked\r\n$stacked: (\r\n    // {Length} 区块外边距\r\n    margin: .2rem .1rem\r\n) !default;\r\n\r\n// Layout flex\r\n$flex: (\r\n    // {String} 定义弹性布局: flex |inline-flex\r\n    box:       flex,\r\n    // {String} 定义是水平布局还是垂直布局: row | column\r\n    direction: column\r\n) !default;\r\n\r\n// Layout align\r\n$align: (\r\n    // {String} 定义弹性水平对齐方式\r\n    text-align:     center,\r\n    // {String} 定义弹性垂直对齐方式\r\n    vertical-align: center\r\n) !default;\r\n\r\n// Element loading(7)\r\n$loading: (\r\n    // {Length} 菊花大小\r\n    ico-size:     .5rem,\r\n    // {Color} 菊花颜色\r\n    ico-color:    #212121,\r\n    // {Color} mask颜色\r\n    mask-bgcolor: rgba(0, 0, 0, .1),\r\n    // {Color} 背景颜色\r\n    bgcolor:      null,\r\n    // {Length} 字号\r\n    font-size:    .14rem,\r\n    // {Color} 文本颜色\r\n    color:        map-get($base, color),\r\n    // {String} loading的ico编码，自定义的webfont\r\n    content:      \"\\f089\"\r\n) !default;\r\n\r\n// Element Input(8)\r\n$input: (\r\n    // {Length} 输入框宽度\r\n    width:             100%,\r\n    // {Length} 输入框高度\r\n    height:            .44rem,\r\n    // {Length} 输入框内补白\r\n    padding:           .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:            .02rem,\r\n    // {Color} 输入框边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:           transparent,\r\n    // {Color} 文本色\r\n    color:             map-get($base, color),\r\n    // {Color} 占位符颜色\r\n    placeholder-color: #bbb\r\n) !default;\r\n\r\n// Element Button(18)\r\n$btn: (\r\n    // {Color} Length\r\n    border-width:   1px,\r\n    // {Color} 边框色\r\n    bordercolor:    #e26704,\r\n    // {Color} 背景色\r\n    bgcolor:        #ff801a,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Color} 激活时边框色\r\n    active-bordercolor: null,\r\n    // {Color} 激活时背景色\r\n    active-bgcolor:     null,\r\n    // {Color} 激活时文本色\r\n    active-color:       null,\r\n    // {Length} 内补白(使用em让根据字号动态调整)\r\n    padding:        0 1.2em,\r\n    // {Length} 圆角半径\r\n    radius:         .02rem,\r\n    // {Length} 字号\r\n    font-size:      null,\r\n    // {Length} 宽度\r\n    width:          null,\r\n    // {Length} 高度\r\n    height:         null,\r\n    // {Length} 默认预设3种尺寸按钮：\r\n    // small\r\n    s-height:       .28rem,\r\n    s-font-size:    .12rem,\r\n    // medium\r\n    m-height:       .36rem,\r\n    m-font-size:    .14rem,\r\n    // large\r\n    l-height:       .44rem,\r\n    l-font-size:    .16rem\r\n) !default;\r\n\r\n// Element UI badge(7)\r\n$badge: (\r\n    // {Length} 内补白\r\n    padding:      0 .03rem,\r\n    // {Color} 边框厚度\r\n    border-width: 1px,\r\n    // {Color} 边框色\r\n    bordercolor:  #f00,\r\n    // {Color} 背景色\r\n    bgcolor:      #f00,\r\n    // {Color} 文本色\r\n    color:        #fff,\r\n    // {Number} 圆角\r\n    radius:       .1rem,\r\n    // {Length} 字号\r\n    font-size:    .12rem\r\n) !default;\r\n\r\n// Element checked(11)\r\n$checked: (\r\n    // {String} 选中标记的内容，可以是自定义的webfont\r\n    content:        \"\\f078\",\r\n    // {Length} 元件大小\r\n    size:           .2rem,\r\n    // {Length} 标签大小\r\n    font-size:      .12rem,\r\n    // {Length} 边框厚度\r\n    border-width:   null,\r\n    // {Color} 未选中时的边框色\r\n    bordercolor:    null,\r\n    // {Color} 未选中时的背景色\r\n    bgcolor:        null,\r\n    // {Color} 未选中时的标记颜色\r\n    color:          transparent,\r\n    // {Color} 激活边框色\r\n    on-bordercolor: null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:     null,\r\n    // {Color} 激活标记颜色\r\n    on-color:       #2b94ff,\r\n    // {Length} 圆角\r\n    radius:         .05rem\r\n) !default;\r\n\r\n// Element range(3)\r\n$range: (\r\n    // {Color} 已选择区域的滑轴背景色\r\n    inner-bgcolor: #444,\r\n    // {Color} 未选择区域的滑轴背景色\r\n    outer-bgcolor: #ccc,\r\n    // {Color} 滑块色\r\n    ball-color:    #fff\r\n) !default;\r\n\r\n// Element loadtip(3)\r\n$loadtip: (\r\n    // {Color} 文本色\r\n    color:     #666,\r\n    // {Length} 字号\r\n    font-size: .14rem,\r\n    // {Color} ico色\r\n    ico-color: map-get($base, link-color)\r\n) !default;\r\n\r\n// Widget UI score(3)\r\n$score: (\r\n    // {Length} 单项宽度\r\n    item-width:  .16rem,\r\n    // {Length} 单项高度\r\n    item-height: .12rem,\r\n    // {String} 图片URL\r\n    url:         \"star.png\"\r\n) !default;\r\n\r\n// Fragment btnbar(1)\r\n$btnbar: (\r\n    // {auto | Length} 工具栏圆角\r\n    // 当值为auto时，btnbar的圆角半径取决于按钮的圆角定义\r\n    radius: auto\r\n) !default;\r\n\r\n// Fragment list(14)\r\n$list: (\r\n    // {Length} 列表外边距\r\n    margin:            null,\r\n    // {Length} 列表圆角\r\n    radius:            null,\r\n    // {Length} 列表边框厚度\r\n    border-width:      null,\r\n    // {Color} 列表边框色\r\n    bordercolor:       map-get($base, bordercolor),\r\n    // {Length} 列表项内补白，列表项有最小高度.44rem\r\n    item-padding:      .11rem .1rem .12rem,\r\n    // {Length} 列表组头内补白\r\n    label-padding:     .03rem .1rem,\r\n    // {Color} 列表组头背景色\r\n    label-bgcolor:     map-get($base, bgcolor),\r\n    // {Color} 点击反馈背景色\r\n    active-bgcolor:    #f8f8f8,\r\n    // {Color} 选中背景色\r\n    on-bgcolor:        null,\r\n    // {Color} 选中文本色\r\n    on-color:          null,\r\n    // {Color} 列表项边框色\r\n    item-bordercolor:  map-get($base, sub-bordercolor),\r\n    // {Color} 列表项组名边框色\r\n    label-bordercolor: #eee,\r\n    // {Length} 列表项字号\r\n    item-font-size:    .14rem,\r\n    // {Length} 列表组头字号\r\n    label-font-size:   .13rem,\r\n    // {Length} 列表项下边线距离左侧的间隙\r\n    item-border-space: .1rem\r\n) !default;\r\n\r\n// Widget tab(15)\r\n$tab: (\r\n    // {Length} 组件宽度\r\n    width:              null,\r\n    // {Length} 组件高度\r\n    height:             .44rem,\r\n    // {Length} 圆角半径\r\n    radius:             null,\r\n    // {Length} 边框厚度\r\n    border-width:       1px 0 0 0,\r\n    // {Color} 边框色\r\n    bordercolor:        map-get($base, bordercolor),\r\n    // {Color} tab背景色\r\n    bgcolor:            #fafafa,\r\n    // {Color} tab文本色\r\n    color:              map-get($base, sub-color),\r\n    // {Color} tab激活背景色\r\n    on-bgcolor:         null,\r\n    // {Color} tab激活文本色\r\n    on-color:           #00bec8,\r\n    // {Length} 文本大小\r\n    font-size:          .14rem,\r\n    // {Length} 水平ico大小\r\n    x-ico-size:         .12rem,\r\n    // {Length} 垂直ico大小\r\n    y-ico-size:         .2rem,\r\n    // {Length} only ico大小\r\n    only-ico-size:      .28rem,\r\n    // {Color} item间隔线高度\r\n    item-border-height: 100%,\r\n    // {Color} item间隔线颜色\r\n    item-bordercolor:   transparent\r\n) !default;\r\n\r\n// Fragment Table(10)\r\n$table: (\r\n    // {Length} 表头部内补白\r\n    width:               100%,\r\n    // {Boolean} 是否需要纵向边框\r\n    has-vertical-border: false,\r\n    // {Length} 表头部内补白\r\n    thead-padding:       .05rem .1rem,\r\n    // {Length} 表主体内补白\r\n    tbody-padding:       .1rem,\r\n    // {Color} table边框色，表格必须有边框，所以不能有null值\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 表头部背景色\r\n    thead-bgcolor:       #eee,\r\n    // {Color} 表主体奇数行背景色\r\n    odd-bgcolor:         null,\r\n    // {Color} 表主体偶数行背景色\r\n    even-bgcolor:        null,\r\n    // {Color} 表主体激活行背景色\r\n    active-bgcolor:      null,\r\n    // {Color} 表主体选中行背景色\r\n    on-bgcolor:          null\r\n) !default;\r\n\r\n// Fragment header(11)\r\n$header: (\r\n    // {Length} 高度\r\n    height:         .44rem,\r\n    // {Length} 两侧的子项宽度\r\n    item-width:     .6rem,\r\n    // {Length} 两侧的子项离边界的间隙\r\n    item-space:     .15rem,\r\n    // {Color} 边框色\r\n    bordercolor:    #1ba9ba,\r\n    // {Color} 背景色\r\n    bgcolor:        #1ba9ba,\r\n    // {Color} 文本色\r\n    color:          #fff,\r\n    // {Length} 文本大小\r\n    font-size:      .18rem,\r\n    // {Color} 文本色\r\n    item-color:     null,\r\n    // {Length} 两侧的子项ico颜色\r\n    item-ico-color: #7ff,\r\n    // {Length} 两侧的子项文本大小\r\n    item-font-size: .14rem,\r\n    // {Length} 两侧的子项ico大小\r\n    item-ico-size:  .2rem\r\n) !default;\r\n\r\n// Widget switch(5)\r\n$switch: (\r\n    // {Color} 激活边框色\r\n    checked-bordercolor: #4bd763,\r\n    // {Color} 激活背景色\r\n    checked-bgcolor:     #4bd763,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {Color} 背景色\r\n    bgcolor:             map-get($base, bgcolor),\r\n    // {Color} 滑块色\r\n    ball-color:          #fff\r\n) !default;\r\n\r\n// Widget index(3)\r\n$index: (\r\n    // {Length} 索引宽度\r\n    width:     .3rem,\r\n    // {Color} 文本色\r\n    color:     #555,\r\n    // {Length} 索引字号\r\n    font-size: .12rem\r\n) !default;\r\n\r\n// Widget group(1)\r\n$group: (\r\n    // {Length} group顶部偏移值\r\n    top: 0\r\n) !default;\r\n\r\n// Widget suggest(15)\r\n$suggest: (\r\n    // {Length} 输入框高度\r\n    height:           .29rem,\r\n    // {Length} 搜索区文字大小\r\n    font-size:        .14rem,\r\n    // {Length} 搜索区内补白\r\n    op-padding:       .07rem .1rem,\r\n    // {Length} 输入框圆角\r\n    radius:           .05rem,\r\n    // {Color} 边框色\r\n    bordercolor:      map-get($base, bordercolor),\r\n    // {Color} 输入框背景色\r\n    bgcolor:          map-get($base, bordercolor),\r\n    // {Color} 输入框文本色\r\n    color:            map-get($base, color),\r\n    // {Color} 激活边框色\r\n    on-bordercolor:   null,\r\n    // {Color} 激活背景色\r\n    on-bgcolor:       null,\r\n    // {Color} placeholder文本色\r\n    placeholder-color:#fff,\r\n    // {Color} 操作区图标颜色\r\n    ico-color:        #999,\r\n    // {Color} 取消按钮颜色\r\n    cancel-color:     map-get($base, link-color),\r\n    // {Color} 搜索区背景色\r\n    op-bgcolor:       #fff,\r\n    // {Color} mask背景色\r\n    mask-bgcolor:     rgba(#fff, .9),\r\n    // {Length} 取消按钮区域宽度\r\n    cancel-width:     .7rem\r\n) !default;\r\n\r\n// Widget UI Dialog(11)\r\n$dialog: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          null,\r\n    // {Length} 圆角\r\n    radius:          .05rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .44rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      white,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 主体区域文字大小\r\n    bd-font-size:    .16rem\r\n) !default;\r\n\r\n// Widget UI Popup(11)\r\n$popup: (\r\n    // {Length | null} 宽度\r\n    width:           null,\r\n    // {Length} 高度\r\n    height:          3rem,\r\n    // {Length} 圆角\r\n    radius:          .03rem,\r\n    // {Number} 阴影透明度(如果不想使用阴影，值为0)\r\n    shadow-opacity:  .5,\r\n    // {Color} 边框色\r\n    bordercolor:     map-get($base, bordercolor),\r\n    // {Length} 头部高度\r\n    hd-height:       .5rem,\r\n    // {Color} 头部背景色\r\n    hd-bgcolor:      #eee,\r\n    // {Color} 标题颜色\r\n    title-color:     map-get($base, color),\r\n    // {Length} 标题文字大小\r\n    title-font-size: .16rem,\r\n    // {Length} 主体区域间隙\r\n    bd-padding:      .1rem,\r\n    // {Length} 箭头大小\r\n    arrow-size:      .12rem\r\n) !default;\r\n\r\n// Widget UI Tip(4)\r\n$tip: (\r\n    // {Length} 内补白\r\n    padding: .06rem .15rem,\r\n    // {Length} 圆角\r\n    radius:  .05rem,\r\n    // {Color} 背景色\r\n    bgcolor: #000,\r\n    // {Color} 文本色\r\n    color:   #fff\r\n) !default;\r\n\r\n// Widget UI select(3)\r\n$select: (\r\n    // {Length} 默认显示几个列表项\r\n    item:        5,\r\n    // {Length} 每个列表项的高度\r\n    item-height: .3rem,\r\n    // {Color} 边框色\r\n    bordercolor: map-get($base, bordercolor),\r\n) !default;\r\n\r\n// Widget UI number(7)\r\n$number: (\r\n    // {Length} 宽度\r\n    width:               1.2rem,\r\n    // {Length} 高度\r\n    height:              .36rem,\r\n    // {Color} 边框色\r\n    bordercolor:         map-get($base, bordercolor),\r\n    // {color} 输入框文本色\r\n    color:               map-get($base, color),\r\n    // {Color} 加减号背景色\r\n    sign-bgcolor:        map-get($base, bgcolor),\r\n    // {Color} 加减号文本色\r\n    sign-color:          #999,\r\n    // {Color} 禁用加减号文本色\r\n    disabled-sign-color: map-get($base, disabled-color)\r\n) !default;\r\n\r\n// Widget UI switchable(9)\r\n$switchable: (\r\n    // {Boolean} 是否有按钮\r\n    has-btn:            false,\r\n    // {Length} 按钮大小\r\n    btn-size:           .44rem,\r\n    // {Color} 按钮背景色\r\n    btn-bgcolor:        rgba(#09a5c4, .8),\r\n    // {Color} 按钮文本色\r\n    btn-color:          #fff,\r\n    // {Color} 按钮按下时背景色\r\n    btn-active-bgcolor: rgba(#09a5c4, .5),\r\n    // {Color} 按钮按下时文本色\r\n    btn-active-color:   null,\r\n    // {Length} 索引大小\r\n    index-size:         .1rem,\r\n    // {Color} 索引背景色\r\n    index-bgcolor:      #85c8d1,\r\n    // {Color} 索引的当前项背景色\r\n    index-on-bgcolor:   #09a5c4\r\n) !default;\r\n\r\n// Widget UI mask(1)\r\n$mask: (\r\n    // {Color} 背景色\r\n    bgcolor: rgba(#000, .2)\r\n) !default;\r\n\r\n// Widget UI slidermenu(1)\r\n$slidermenu: (\r\n    // {Length} action 宽度\r\n    action-width: 1rem,\r\n    // {Color} action 背景色\r\n    action-bgcolor: #ccc\r\n) !default;\r\n\r\n// Widget UI rating(3)\r\n$rating: (\r\n    // {Length} 单项宽度\r\n    item-width:  .24rem,\r\n    // {Length} 单项高度\r\n    item-height: .18rem,\r\n    // {String} 图片URL\r\n    url:    \"star.png\"\r\n) !default;\r\n\r\n// Widget UI doublelist(1)\r\n$doublelist: (\r\n    // {Length} 导航panel宽度\r\n    aside-width: null,\r\n    // {Length} 导航panel顺序，从0开始\r\n    aside-order: null\r\n) !default;\r\n\r\n// Widget UI datepicker(25)\r\n$datepicker: (\r\n    // {Length} 星期bar高度\r\n    week-bar-height:      .22rem,\r\n    // {Color} 星期bar背景色\r\n    week-bar-bgcolor:     #1ba9ba,\r\n    // {Color} 星期bar文本色\r\n    week-bar-color:       #fff,\r\n    // {Length} 星期bar字号\r\n    week-bar-font-size:   .12rem,\r\n\r\n    // {Length} 月份bar高度\r\n    month-bar-height:     .25rem,\r\n    // {Color} 月份bar边线色\r\n    month-bar-bordercolor: #ddd,\r\n    // {Color} 月份bar背景色\r\n    month-bar-bgcolor:     #f9f9f9,\r\n    // {Color} 月份bar文本色\r\n    month-bar-color:       #000,\r\n    // {Length} 月份bar字号\r\n    month-bar-font-size:   .14rem,\r\n\r\n    // {Length} 每行高度\r\n    week-height:           .54rem,\r\n    // {Color} 每行边线色\r\n    week-bordercolor:       #ddd,\r\n    // {Color} 每行文本色\r\n    week-color:             #000,\r\n\r\n    // {Length} 每日高度\r\n    day-height:            .24rem,\r\n    // {Length} 每日间距\r\n    day-margin:            .05rem 0 .02rem,\r\n    // {Length} 每日圆角\r\n    day-radius:            50%,\r\n    // {Length} 每日字号\r\n    day-font-size:         .14rem,\r\n\r\n    // {color} 特殊日文本色\r\n    special-color:         #f50,\r\n    // {color} 周末文本色\r\n    weekend-color:         #f00,\r\n    // {color} 禁用日子文本色\r\n    disabled-color:        map-get($base, disabled-color),\r\n\r\n    // {color} 选中日期背景色\r\n    on-bgcolor:            #1ba9ba,\r\n    // {color} 选中日期文本色\r\n    on-color:              #fff,\r\n    // {color} 选中日期提示语文本色\r\n    on-tip-color:          #1ba9ba,\r\n    // {Length} 选中日期提示语字号\r\n    on-tip-font-size:      .14rem,\r\n\r\n    // {String} 开始日期提示语\r\n    start-content:         \"入店\",\r\n    // {String} 结束日期提示语\r\n    end-content:           \"离店\"\r\n) !default;\r\n\r\n// z-index\r\n$z-index: (\r\n    // {Number} 下拉菜单层级范围50-100\r\n    dropdown: 50,\r\n    // {Number} 遮罩层级\r\n    mask:     1000,\r\n    // {Number} 弹窗层级范围1001-2000\r\n    dialog:   1001,\r\n    // {Number} 浮层层级范围2001-2500\r\n    popup:    2001,\r\n    // {Number} 搜索层级范围2501-3000\r\n    suggest:  2501,\r\n    // {Number} 浮层层级范围3001-4000\r\n    tip:      3001,\r\n    // {Number} loading层级\r\n    loading:  9999\r\n) !default;","@charset \"utf-8\";\r\n/**\r\n * Yo框架全局基础方法\r\n * Yo内置了包括响应式方案，CSS3兼容性方案，厂商前缀方案，iconfont方案，flex布局等全局方法\r\n */\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 给需要的属性加厂家前缀\r\n * @method prefix\r\n * @param {String} $property 指定属性\r\n * @param {String} $value 指定属性值\r\n */\r\n@mixin prefix($property, $value) {\r\n    // 老式浏览器\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            #{$vendor}#{$property}: $value;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    #{$property}: $value;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 四则运算，安卓需要使用该方法，需要Android4.4及以上\r\n * @method calc\r\n * @param {String} $property 指定需要进行计算的CSS属性\r\n * @param {String} $value 与原生CSS语法一致，区别在于需要使用引号包裹表达式\r\n * @example <div class=\"calc\">四则运算</div>\r\n * .calc { @include calc(width, \"100% - 100px\"); }\r\n */\r\n@mixin calc($property, $value) {\r\n    // 是否开启厂商前缀支持\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        // 遍历输出厂商代码\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // 输出所有厂商前缀（IE9.0+支持标准写法，更早版本不支持该函数）\r\n            @if $vendor != -ms- {\r\n                #{$property}: #{$vendor}calc(#{$value});\r\n            }\r\n        }\r\n    }\r\n    #{$property}: calc(#{$value});\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义响应式方案\r\n * @method responsive\r\n * @param {String} $media 指定媒体查询条件\r\n */\r\n@mixin responsive($media) {\r\n    @if not map-has-key($media-types, $media) {\r\n        @warn \"#{$media} is not a known media type. Using portrait instead.\";\r\n        $media: portrait;\r\n    }\r\n    @media #{map-get($media-types, $media)} {\r\n        @content;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义字体图标\r\n * @method yofont\r\n * @skip\r\n */\r\n@mixin yofont() {\r\n    // 是否开启图标字体\r\n    @if map-get($ico, is-use) {\r\n        @font-face {\r\n            font-family: map-get($ico, font-name);\r\n            src:\r\n                // 现代浏览器\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.woff\") format(\"woff\"),\r\n                // Android2.2+\r\n                url(\"#{map-get($ico,font-path)}#{map-get($ico,font-name)}.ttf\") format(\"truetype\");\r\n        }\r\n        .yo-ico {\r\n            font-family: map-get($ico, font-name) !important;\r\n            font-style: normal;\r\n            -webkit-font-smoothing: antialiased;\r\n            // PC端chrome有锯齿问题，Mobile不需要\r\n            // -webkit-text-stroke-width: .1px;\r\n            -moz-osx-font-smoothing: grayscale;\r\n            vertical-align: middle;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除浮动方案\r\n * @method clearfix\r\n * @param {String} $type 指定清除浮动的方式，包括：pseudo-element | bfc，默认值：pseudo-element {add: 1.8.5}\r\n */\r\n@mixin clearfix($type: pseudo-element) {\r\n    @if $type == pseudo-element {\r\n        // 创建伪元素用以清除自身浮动\r\n        &::after{\r\n            display: block;\r\n            overflow: hidden;\r\n            clear: both;\r\n            height: 0;\r\n            content: \"\\0020\";\r\n        }\r\n    } @else {\r\n        // 创建BFC用以清除自身浮动\r\n        overflow: hidden;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 清除行内级元素间间隙方案\r\n * @method killspace\r\n */\r\n@mixin killspace() {\r\n    font-size: 0;\r\n    font-family: arial;\r\n    > .item {\r\n        display: inline-block;\r\n        font-size: map-get($base, font-size);\r\n        font-family: map-get($base, font-family);\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 未知尺寸元素垂直居中解决方案\r\n * @method valign\r\n * @example <div class=\"demo\"><img src=\"*.jpg\" alt=\"未知尺寸图片居中\" class=\"item\" /></div>\r\n * .demo {@include valign;}\r\n */\r\n@mixin valign() {\r\n    @include killspace;\r\n    &::after {\r\n        display: inline-block;\r\n        overflow: hidden;\r\n        width: 0;\r\n        height: 100%;\r\n        content: \"\\0020\";\r\n    }\r\n    &::after,\r\n    > .item {\r\n        vertical-align: middle;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 已知尺寸元素垂直居中解决方案\r\n * @method alignment\r\n * @param {Length} $width 居中元素的宽度\r\n * @param {Length} $height 居中元素的高度\r\n */\r\n@mixin alignment($width: 2rem, $height: 2rem) {\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    width: $width;\r\n    height: $height;\r\n    margin-top: -$height/2;\r\n    margin-left: -$width/2;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义文档根节点是否允许滚动\r\n * @method root-scroll\r\n * @param {Boolean} $is-scroll 指定是否有滚动，默认值：false {add: 1.8.6}\r\n */\r\n@mixin root-scroll($is-scroll: false) {\r\n    html,\r\n    body {\r\n        @if $is-scroll {\r\n            overflow: visible;\r\n            height: auto;\r\n        } @else {\r\n            overflow: hidden;\r\n            height: 100%;\r\n        }\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 定义是否有滚动条\r\n * @method overflow\r\n * @param {String} $overflow 取值与最新原生语法一致，默认值：auto\r\n */\r\n@mixin overflow($overflow: auto) {\r\n    @if $overflow == auto {\r\n        overflow: auto;\r\n        // 移除此条规则，防止iOS webview崩溃\r\n        // -webkit-overflow-scrolling: touch;\r\n    } @else {\r\n        overflow: $overflow;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 功能\r\n * @description 生成全屏方法\r\n * @method fullscreen\r\n * @param {Integer} $z-index 指定层叠级别\r\n * @param {Keywords} $position 指定定位方式，取除`static | relative`之外的值，默认值：absolute\r\n */\r\n@mixin fullscreen($z-index: null, $position: absolute) {\r\n    position: $position;\r\n    z-index: $z-index;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义使用何种滤镜\r\n * @method filter\r\n * @param {String} $filter 取值与`filter`属性一致\r\n */\r\n@mixin filter($filter...) {\r\n    @include prefix(filter, $filter);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义UA默认外观\r\n * @method appearance\r\n * @param {String} $appearance 取值与`appearance`属性一致，默认值：none\r\n */\r\n@mixin appearance($appearance: none) {\r\n    @include prefix(appearance, $appearance);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义如何选中内容\r\n * @method user-select\r\n * @param {String} $user-select 取值与`user-select`属性一致，默认值：none\r\n */\r\n@mixin user-select($user-select: none) {\r\n    @include prefix(user-select, $user-select);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 用户界面\r\n * @description 定义盒模型\r\n * @method box-sizing\r\n * @param {String} $box-sizing 指定盒模型类型，取值与`box-sizing`属性一致，默认值：border-box\r\n */\r\n@mixin box-sizing($box-sizing: border-box) {\r\n    @include prefix(box-sizing, $box-sizing);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义渐变色值\r\n * @method gradient\r\n * @param {String} $type 指定渐变的4种类型：linear, repeating-linear, radial, repeating-radial\r\n * @param {String} $gradient 指定渐变取值，与w3c最新原生语法一致\r\n */\r\n@mixin gradient($type, $gradient...) {\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            background-image: #{$vendor}#{$type}-gradient($gradient);\r\n        }\r\n    }\r\n    background-image: #{$type}-gradient($gradient);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景图像缩放（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-size\r\n * @param {Keywords | Length} $background-size 指定背景图缩放值，取值与`background-size`属性一致\r\n */\r\n@mixin background-size($background-size...) {\r\n    @include prefix(background-size, $background-size);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景裁减（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-clip\r\n * @param {Keywords} $background-clip 指定背景图缩放值，取值与`background-clip`属性一致\r\n */\r\n@mixin background-clip($background-clip...) {\r\n    @include prefix(background-clip, $background-clip);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义背景显示区域（AndroidBrowser2.3.*还需要厂商前缀）\r\n * @method background-origin\r\n * @param {Keywords} $background-origin 指定背景图`background-position`属性计算相对的参考点，取值与`background-origin`属性一致\r\n */\r\n@mixin background-origin($background-origin...) {\r\n    @include prefix(background-origin, $background-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 背景与边框\r\n * @description 定义圆角\r\n * @method border-radius\r\n * @param {Length} $border-radius 指定元素的圆角半径，取值与`border-radius`属性一致\r\n */\r\n@mixin border-radius($border-radius...) {\r\n    border-radius: $border-radius;\r\n    // 修复某些安卓机型上“边框+背景”，背景溢出的情况\r\n    // 之所以会这样是因为这些机型的背景是从边框处开始渲染，所以只需要改成从padding处渲染即可\r\n    @include background-clip(padding-box !important);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义简单变换\r\n * @method transform\r\n * @param {String} $transform 取值与原生语法一致\r\n */\r\n@mixin transform($transform...) {\r\n    @include prefix(transform, $transform);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义变换原点\r\n * @method transform-origin\r\n * @param {String} $transform-origin 取值与原生语法一致\r\n */\r\n@mixin transform-origin($transform-origin) {\r\n    @include prefix(transform-origin, $transform-origin);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义动画\r\n * @method animation\r\n * @param {String} $animation 取值与原生语法一致\r\n */\r\n@mixin animation($animation...) {\r\n    @include prefix(animation, $animation);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @description 定义补间\r\n * @method transition\r\n * @param {String} $transition 取值与原生语法一致\r\n */\r\n@mixin transition($transition...){\r\n    $transitionable-prefixed-values: transform, transform-origin !default;\r\n    $vendor-list: ();\r\n    $list: ();\r\n\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @for $i from 1 through length($transition) {\r\n                @if type-of(nth($transition, $i)) == list {\r\n                    @if index($transitionable-prefixed-values, nth(nth($transition, $i), 1)){\r\n                        $vendor-list: join($vendor-list, #{$vendor}#{nth($transition, $i)}, $separator: comma);\r\n                    } @else {\r\n                        $vendor-list: join($vendor-list, #{nth($transition, $i)}, $separator: comma);\r\n                    }\r\n                }\r\n            }\r\n            #{$vendor}transition: $vendor-list;\r\n            $vendor-list: ();\r\n        }\r\n    }\r\n\r\n    @for $i from 1 through length($transition) {\r\n        $list: join($list, #{nth($transition, $i)}, $separator: comma);\r\n    }\r\n    transition: $list;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义显示类型为伸缩盒\r\n * @method flexbox\r\n * @param {String} $flexbox 默认值：flex，可选值：flex | inline-flex\r\n */\r\n@mixin flexbox($flexbox: flex) {\r\n    @if $flexbox == inline-flex or $flexbox == inline {\r\n        $flexbox: \"inline-\";\r\n    } @else {\r\n        $flexbox: \"\";\r\n    }\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    // 原始草案：20090723\r\n    // 过渡草案：20110322-20120322（以后面这个日期为准）\r\n    // 最新草案：20120612-20140925（以后面这个日期为准）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}box;\r\n                display: #{$vendor}#{$flexbox}flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                display: #{$vendor}#{$flexbox}flexbox;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    display: #{$flexbox}flex;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素如何分配空间\r\n * @method flex\r\n * @param {String} $flex 默认值：1，取值与最新原生语法一致\r\n * @param {String} $direction 默认值: row\r\n */\r\n@mixin flex($flex: 1, $direction: row) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-flex: $flex;\r\n                #{$vendor}flex: $flex;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex: $flex;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex: $flex;\r\n    // 修复Android Browser4.3及以下，iOS Safari6.1及以下按比例分配错误的问题\r\n    @if $direction == row {\r\n        width: .1px;\r\n    }\r\n    // @else {\r\n    //     height: .1px;\r\n    // }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的排版顺序\r\n * @method order\r\n * @param {String} $order 默认值：1，取值范围与最新草案语法一致\r\n */\r\n@mixin order($order: 1) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            @if $vendor != -ms- {\r\n                // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                #{$vendor}box-ordinal-group: $order;\r\n                #{$vendor}order: $order;\r\n            } @else {\r\n                // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                #{$vendor}flex-order: $order;\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    order: $order;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义伸缩盒子元素的流动方向\r\n * @method flex-direction\r\n * @param {String} $flex-direction 默认值：row，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-direction($flex-direction: row) {\r\n    // 老式浏览器（实验性质支持原始草案）\r\n    // 当厂商前缀不为`-ms-`时输出原始草案厂商前缀版\r\n    @if $flex-direction == row {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: normal;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == row-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: horizontal;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    } @else if $flex-direction == column-reverse {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    #{$vendor}box-orient: vertical;\r\n                    #{$vendor}box-direction: reverse;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 老式浏览器（实验性质支持过渡及最新草案）\r\n    @if map-get($setting, is-vendor-prefix) {\r\n        @each $vendor in map-get($setting, vendor-prefix) {\r\n            // `flex-direction`属性在过渡和最新草案中语法一致\r\n            #{$vendor}flex-direction: $flex-direction;\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    flex-direction: $flex-direction;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性盒子元素溢出排版\r\n * @method flex-wrap\r\n * @param {String} $flex-wrap 默认值：nowrap，取值范围与最新草案语法一致\r\n */\r\n@mixin flex-wrap($flex-wrap: nowrap) {\r\n    // 老式浏览器（实验性质支持过渡和最新2个阶段草案）+ 现代浏览器\r\n    // 原始草案有`box-lines`对应本书，不过虽然被webkit实验性质支援，但却未被任何浏览器实现（等同于未实现）\r\n    @include prefix(flex-wrap, $flex-wrap);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器主轴对齐方式\r\n * @method justify-content\r\n * @param {String} $justify-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin justify-content($justify-content: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $justify-content == center {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: $justify-content;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: $justify-content;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: start;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: end;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-pack: justify;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $justify-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    // 原始草案不支持`space-around`(过渡版本中的`distribute`) 值\r\n                    //#{$vendor}box-pack: distribute;\r\n                    #{$vendor}justify-content: $justify-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    justify-content: $justify-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义多行弹性容器侧轴对齐方式\r\n * @method align-content\r\n * @version 1.8.5\r\n * @param {String} $align-content 默认值：center，取值范围与最新草案语法一致\r\n */\r\n@mixin align-content($align-content: center) {\r\n    // 老式浏览器（实验性质支持2个阶段草案）\r\n    @if $align-content == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-between {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: justify;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == space-around {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: distribute;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-content == center or $align-content == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-content: $align-content;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-line-pack: $align-content;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-content: $align-content;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义单行弹性容器侧轴对齐方式\r\n * @method align-items\r\n * @param {String} $align-items 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-items($align-items: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-items == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: start;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: end;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-items == center or $align-items == baseline or $align-items == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输出原始和最新草案厂商前缀版\r\n                    #{$vendor}box-align: $align-items;\r\n                    #{$vendor}align-items: $align-items;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-align: $align-items;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-items: $align-items;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 弹性盒\r\n * @description 定义弹性容器中子元素自身的在侧轴对齐方式\r\n * @method align-self\r\n * @param {String} $align-self 默认值：center，取值与最新原生语法一致\r\n */\r\n@mixin align-self($align-self: center) {\r\n    // 老式浏览器（实验性质支持3个阶段草案）\r\n    @if $align-self == flex-start {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: start;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == flex-end {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: end;\r\n                }\r\n            }\r\n        }\r\n    } @else if $align-self == auto or $align-self == center or $align-self == baseline or $align-self == stretch {\r\n        @if map-get($setting, is-vendor-prefix) {\r\n            @each $vendor in map-get($setting, vendor-prefix) {\r\n                @if $vendor != -ms- {\r\n                    // 当厂商前缀不为`-ms-`时输最新草案厂商前缀版（原始草案没有类似属性）\r\n                    #{$vendor}align-self: $align-self;\r\n                } @else {\r\n                    // 当厂商前缀为`-ms-`时输出过渡草案厂商前缀版\r\n                    #{$vendor}flex-item-align: $align-self;\r\n                }\r\n            }\r\n        }\r\n    }\r\n    // 现代浏览器（支持最新草案）\r\n    align-self: $align-self;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成矩形方法\r\n * @method rect\r\n * @param {Length} $width 定义矩形的长度\r\n * @param {Length} $height 定义矩形的高度\r\n */\r\n@mixin rect($width, $height) {\r\n    width: $width;\r\n    height: $height;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成正方形方法\r\n * @method square\r\n * @param {Length} $size 定义正方形的边长\r\n */\r\n@mixin square($size) {\r\n    width: $size;\r\n    height: $size;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 形状\r\n * @description 生成圆形方法\r\n * @method circle\r\n * @param {Length} $size 定义圆的半径长度\r\n * @param {Length} $radius 定义圆的圆角半径长度\r\n */\r\n@mixin circle($size, $radius: 50%) {\r\n    @include square($size);\r\n    @include border-radius($radius);\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 链接处理方法\r\n * @method link\r\n * @param {Color} $color 定义链接颜色\r\n */\r\n@mixin link($color: map-get($base, link-color)) {\r\n    color: $color;\r\n    cursor: pointer;\r\n    &:active {\r\n        opacity: .5;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 强制换行方案\r\n * @method wrap\r\n */\r\n@mixin wrap() {\r\n    word-wrap: break-word;\r\n    word-break: break-all;\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 单行文本溢出显示方案\r\n * @method ellipsis\r\n * @param {Boolen} $ellipsis 定义是否需要省略号\r\n */\r\n@mixin ellipsis($ellipsis: true) {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    @if $ellipsis {\r\n        text-overflow: ellipsis;\r\n    }\r\n}\r\n\r\n/**\r\n * @module core\r\n * @class 文本\r\n * @description 文字隐藏方案\r\n * @method texthide\r\n */\r\n@mixin texthide() {\r\n    overflow: hidden;\r\n    white-space: nowrap;\r\n    text-indent: 100%;\r\n}","@charset \"utf-8\";\r\n@import \"variables\";\r\n@import \"classes\";\r\n/**\r\n * Yo框架全局Reset\r\n * Yo重置Mobile及高级浏览器上常见的差异\r\n */\r\n\r\n// 1. 将元素的盒模型统一为: border-box\r\n// 2. 清除元素tap时出现的焦点框\r\n*,\r\n::before,\r\n::after {\r\n    @include box-sizing(border-box);\r\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\r\n}\r\n// 1. 默认关闭页面滚动条\r\n@include root-scroll;\r\n\r\n// 1. 防止用户自定义网页背景及文字颜色、大小影响\r\nhtml {\r\n    background-color: map-get($base, doc-bgcolor);\r\n    color: map-get($base, color);\r\n    // 用于rem计算\r\n    font-size: map-get($base, font-size-root);\r\n    // 为不同屏幕质量定义对应的字体大小，用于匹配viewport缩放值\r\n    @if map-get($setting, is-ios-1pixel) {\r\n        &[ios=\"true\"] {\r\n            @include responsive(retina2x) {\r\n                font-size: map-get($base, font-size-root) * 2;\r\n            }\r\n            @include responsive(retina3x) {\r\n                font-size: map-get($base, font-size-root) * 3;\r\n            }\r\n        }\r\n    }\r\n    // 如果是适配大小的场景\r\n    @if map-get($base, responsive-type) == scaling {\r\n        font-size: map-get($base, font-size-root-scaling);\r\n    }\r\n    @include user-select();\r\n}\r\n\r\n// 1. 清除body的默认margin\r\n// 2. 定义页面的默认字号\r\n// 3. 定义页面的默认行高\r\n// 4. 定义页面的默认字体\r\nbody {\r\n    margin: 0;\r\n    // 为不同屏幕质量定义对应的字体大小\r\n    font-size: map-get($base, font-size);\r\n    line-height: map-get($base, line-height);\r\n    font-family: map-get($base, font-family);\r\n}\r\n\r\n// 为不同屏幕质量定义对应的字体大小，用于匹配viewport缩放值\r\n@if map-get($setting, is-ios-1pixel) {\r\n    html[ios=\"true\"] body {\r\n        @include responsive(retina2x) {\r\n            font-size: map-get($base, font-size) * 2;\r\n        }\r\n        @include responsive(retina3x) {\r\n            font-size: map-get($base, font-size) * 3;\r\n        }\r\n    }\r\n}\r\n\r\n// 1. 清除某些元素在不同浏览器下内外补白不同造成的影响\r\nul,\r\nol,\r\ndl,\r\ndd,\r\nh1,\r\nh2,\r\nh3,\r\nh4,\r\nh5,\r\nh6,\r\nfigure,\r\nform,\r\nfieldset,\r\nlegend,\r\ninput,\r\ntextarea,\r\nbutton,\r\np,\r\nblockquote,\r\nth,\r\ntd,\r\npre,\r\nxmp {\r\n    margin: 0;\r\n    padding: 0;\r\n}\r\n\r\n// 1. 为不继承的元素设定继承父级行高\r\n// 2. 为不继承的元素设定继承父级字体\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect,\r\npre,\r\nxmp,\r\ntt,\r\ncode,\r\nkbd,\r\nsamp {\r\n    line-height: inherit;\r\n    font-family: inherit;\r\n}\r\n\r\n// 1. 为不继承的元素设定继承父级字号\r\nh1,\r\nh2,\r\nh3,\r\nh4,\r\nh5,\r\nh6,\r\nsmall,\r\nbig,\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect {\r\n    font-size: inherit;\r\n}\r\n\r\n// 1. 重置斜体表现为正常文本\r\naddress,\r\ncite,\r\ndfn,\r\nem,\r\ni,\r\noptgroup,\r\nvar {\r\n    font-style: normal;\r\n}\r\n\r\n// 1. 清除单元格边距并让边框合并\r\ntable {\r\n    border-collapse: collapse;\r\n    border-spacing: 0;\r\n    table-layout: fixed;\r\n    text-align: left;\r\n}\r\n\r\n// 1. 清除列表默认序号\r\nul,\r\nol,\r\nmenu {\r\n    list-style: none;\r\n}\r\n\r\n// 1. 清除默认边框\r\n// 2. 清除img底部留白问题，并使得默认居中\r\nfieldset,\r\nimg {\r\n    border: 0;\r\n    vertical-align: middle;\r\n}\r\n\r\n// 1. 设置HTML5部分新增元素为块元素\r\narticle,\r\naside,\r\ndetails,\r\nfigcaption,\r\nfigure,\r\nfooter,\r\nheader,\r\nmain,\r\nmenu,\r\nnav,\r\nsection,\r\nsummary {\r\n    display: block;\r\n}\r\n\r\n// 1. 设置HTML5新增媒体元素与img, object保持一致\r\naudio,\r\ncanvas,\r\nvideo {\r\n    display: inline-block;\r\n}\r\n\r\n// 1. 清除引用元素的默认派生标识\r\nblockquote:before,\r\nblockquote:after,\r\nq:before,\r\nq:after {\r\n    content: \"\\0020\";\r\n}\r\n\r\n// 1. 设置文本域和代码块在需要时出现滚动条\r\ntextarea,\r\npre,\r\nxmp {\r\n    @include overflow;\r\n}\r\n\r\n// 1. 设置文本域滚可拖动改变垂直方向尺寸\r\ntextarea {\r\n    resize: vertical;\r\n}\r\n\r\n// 1. 清除webkit下表单元素的outline\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect\r\na {\r\n    outline: 0 none;\r\n}\r\n\r\n// 1. 让表单元素具有颜色继承\r\n// 2. iOS上当禁用时会设置opacity: .4\r\ninput,\r\ntextarea,\r\nbutton,\r\nselect {\r\n    color: inherit;\r\n    &:disabled {\r\n        opacity: 1;\r\n    }\r\n}\r\n\r\n// 1. 清除Firefox按钮内部边框和补白\r\nbutton::-moz-focus-inner,\r\ninput::-moz-focus-inner {\r\n    padding: 0;\r\n    border: 0;\r\n}\r\n\r\n// 1. 重置按钮的外观\r\ninput[type=\"button\"],\r\ninput[type=\"submit\"],\r\ninput[type=\"reset\"],\r\ninput[type=\"file\"]::-webkit-file-upload-button,\r\ninput[type=\"search\"]::-webkit-search-cancel-button {\r\n    @include appearance;\r\n}\r\n\r\n// 1. 重置mark元素的默认背景色\r\nmark {\r\n    background-color: rgba(0, 0, 0, 0);\r\n}\r\n\r\n// 1. 清除文本线条装饰\r\na,\r\nins,\r\ns,\r\nu,\r\ndel {\r\n    text-decoration: none;\r\n}\r\n\r\n// 1. 禁止长按链接与图片弹出菜单\r\n// issues: 在iOS8.1下此设置对a仍无效\r\na,\r\nimg {\r\n    -webkit-touch-callout: none;\r\n}\r\n\r\n// 1. 预设默认链接表现\r\na {\r\n    color: map-get($base, link-color);\r\n}\r\n\r\n// 1. fix Android Browser 4.2.* 及以下 input:checked ~ .xxx 失效的问题\r\nhtml + input {}\r\n\r\n// 1. 预设清除浮动\r\n.g-clear,\r\n.g-mod {\r\n    @include clearfix;\r\n}\r\n\r\n// 1. 使用字体图标\r\n@include yofont;"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _riot = __webpack_require__(1);
	
	var _riot2 = _interopRequireDefault(_riot);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	_riot2.default.route.start(true);
	_riot2.default.route(function () {});

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(13);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(13, function() {
				var newContent = __webpack_require__(13);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(7)();
	// imports
	
	
	// module
	exports.push([module.id, "html {\n  display: block;\n  position: relative;\n  width: 320px;\n  height: 568px;\n  overflow: hidden;\n  font-size: 100px;\n  padding: 0 20px; }\n  html body {\n    background-color: #fafafa;\n    width: 100%;\n    height: 100%;\n    margin: 0; }\n    html body app {\n      display: block;\n      background-color: #fafafa;\n      position: absolute;\n      width: 100%;\n      height: 100%; }\n      html body app qapp {\n        display: block;\n        background-color: #fafafa;\n        position: absolute;\n        width: calc(100% - 40px);\n        height: 100%;\n        border-radius: 3px;\n        box-shadow: 0 0 2px #666; }\n", "", {"version":3,"sources":["/./src/src/style/global.scss"],"names":[],"mappings":"AAIA;EACI,eAAe;EACf,mBAAmB;EACnB,aAAa;EACb,cAAc;EACd,iBAAiB;EACjB,iBAAiB;EACjB,gBAAgB,EAwBnB;EA/BD;IAUQ,0BAZS;IAaT,YAAY;IACZ,aAAa;IACb,UAAU,EAiBb;IA9BL;MAeY,eAAe;MACf,0BAlBK;MAmBL,mBAAmB;MACnB,YAAY;MACZ,aAAa,EAUhB;MA7BT;QAqBgB,eAAe;QACf,0BAxBC;QAyBD,mBAAmB;QACnB,yBAAW;QACX,aAAa;QACb,mBAAmB;QACnB,yBAAyB,EAC5B","file":"global.scss","sourcesContent":["@charset \"UTF-8\";\n\n$bgcolor: #fafafa;\n\nhtml{\n    display: block;\n    position: relative;\n    width: 320px;\n    height: 568px;\n    overflow: hidden;\n    font-size: 100px;\n    padding: 0 20px;\n\n    body{\n        background-color: $bgcolor;\n        width: 100%;\n        height: 100%;\n        margin: 0;\n        app{\n            display: block;\n            background-color: $bgcolor;\n            position: absolute;\n            width: 100%;\n            height: 100%;\n            qapp{\n                display: block;\n                background-color: $bgcolor;\n                position: absolute;\n                width: calc(100% - 40px);\n                height: 100%;\n                border-radius: 3px;\n                box-shadow: 0 0 2px #666;\n            }\n        }\n    }\n}\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map