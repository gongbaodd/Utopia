
;(function(__context){
    var module = {
        id : "f8fe06789b5d8adc0f656022eef1fd51" ,
        filename : "riot.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /* Riot v2.3.1, @license MIT, (c) 2015 Muut Inc. + contributors */

;
(function(window, undefined) {
    'use strict';
    var riot = {
        version: 'v2.3.1',
        settings: {}
    },
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
        T_UNDEF = 'undefined',
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
                onEachEvent = function(e, fn) {
                    e.replace(/\S+/g, fn)
                },
                defineProperty = function(key, value) {
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
                    if (typeof fn != 'function') return el

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
                    if (events == '*') callbacks = {}; else {
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
                            } catch (e) { /* error */ }
                            if (fns[i] !== fn) {
                                i--
                            }
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
        ;
    (function(riot) {
        if (!window) return;

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
            base, current, parser, secondParser, emitStack = [],
            emitStackLevel = 0

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
                return base[0] == '#' ? (href || loc.href).split(base)[1] || '' : getPathFromRoot(href)[REPLACE](base, '')
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
                if (!el || el.nodeName != 'A' // not A tag
                    || el[HAS_ATTRIBUTE]('download') // has download attr
                    || !el[HAS_ATTRIBUTE]('href') // has no href attr
                    || el.target && el.target != '_self' // another window or frame
                    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
                ) return

                if (el.href != loc.href) {
                    if (el.href.split('#')[0] == loc.href.split('#')[0]) return // internal jump
                    go(getPathFromBase(el.href), el.title || doc.title)
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
                emit()
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
                        return true // exit from loop
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
            loc.href[REPLACE](/[?&](.+?)=([^&]*)/g, function(_, k, v) {
                q[k] = v
            })
            return q
        }

        /** Stop routing **/
        route.stop = function() {
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
        route.start = function(autoExec) {
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
     * @version 2.3.0
     */

    /**
     * @module brackets
     *
     * `brackets         `  Returns a string or regex based on its parameter:
     *                      With a number returns the current left (0) or right (1) brackets.
     *                      With a regex, returns the original regex if the current brackets
     *                      are the default, or a new one with the default brackets replaced
     *                      by the current custom brackets.
     *                      WARNING: recreated regexes discards the `/i` and `/m` flags.
     * `brackets.settings`  This object mirrors the `riot.settings` object, you can assign this
     *                      if riot is not in context.
     * `brackets.set     `  The recommended option to change the current tiot brackets, check
     *                      its parameter and reconfigures the internal state immediately.
     */

    var brackets = (function(UNDEF) {

        var
        REGLOB = 'g',

            MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,
            STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,

            S_QBSRC = STRINGS.source + '|' +
                /(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/])/.source + '|' +
                /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,

            DEFAULT = '{ }',

            FINDBRACES = {
                '(': _regExp('([()])|' + S_QBSRC, REGLOB),
                '[': _regExp('([[\\]])|' + S_QBSRC, REGLOB),
                '{': _regExp('([{}])|' + S_QBSRC, REGLOB)
            }

        var
        cachedBrackets = UNDEF,
            _regex,
            _pairs = []

            function _regExp(source, flags) {
                return new RegExp(source, flags)
            }

            function _loopback(re) {
                return re
            }

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
                    } else {
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
                    _pairs[9] = _regExp(/^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S+)\s*}/)
                    _pairs[8] = pair
                }
                _brackets.settings.brackets = cachedBrackets = pair
            }

            function _set(pair) {
                if (cachedBrackets !== pair) {
                    _reset(pair)
                }
            }

            function _brackets(reOrIdx) {
                _set(_brackets.settings.brackets)
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
                    if (match[1] && !(match[1] === ch ? ++level : --level)) break
                }
                return match ? recch.lastIndex : str.length
            }
        }

        _brackets.hasExpr = function hasExpr(str) {
            return _brackets(4).test(str)
        }

        _brackets.loopKeys = function loopKeys(expr) {
            var m = expr.match(_brackets(9))
            return m ? {
                key: m[1],
                pos: m[2],
                val: _pairs[0] + m[3] + _pairs[1]
            } : {
                val: expr.trim()
            }
        }

        _brackets.array = function array(pair) {
            if (pair != null) _reset(pair)
            return _pairs
        }

        /* istanbul ignore next: in the node version riot is not in the scope */
        _brackets.settings = typeof riot !== 'undefined' && riot.settings || {}
        _brackets.set = _set

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

    var tmpl = (function() {

        var
        FALSE = !1,
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
                    _riot_id: ctx && ctx._riot_id //eslint-disable-line camelcase
                }
                _tmpl.errorHandler(err)
            }
        }

        function _create(str) {

            var expr = _getTmpl(str)
            if (expr.slice(0, 11) !== "try{return ") expr = 'return ' + expr

            return new Function('E', expr + ';') // eslint-disable-line indent
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
                    } else {

                        expr = _parseExpr(parts[1], 0, qstr)
                    }

                    if (qstr[0])
                        expr = expr.replace(RE_QBMARK, function(_, pos) {
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
                    .replace(RE_QBLOCK, function(s, div) {
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
                        (match = expr.match(CS_IDENT)) && !match.index
                    ) {
                        var
                        key,
                            jsb,
                            re = /,|([[{(])|$/g

                        expr = RegExp.rightContext
                        key = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1]

                        while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re)

                        jsb = expr.slice(0, match.index)
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
                        if (match[0] === jsb)++lv
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

                expr = expr.replace(JS_VARNAME, function(match, p, mvar, pos, s) {
                    if (mvar) {
                        pos = tb ? 0 : pos + match.length

                        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
                            match = p + '("' + mvar + JS_CONTEXT + mvar
                            if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '['
                        } else if (pos)
                            tb = !/^(?=(\.[$\w]+))\1(?:[^.[(]|$)/.test(s.slice(pos))
                    }
                    return match
                })

                if (tb) {
                    expr = "try{return " + expr + '}catch(e){E(e,this)}'
                }

                if (key) {

                    expr = (tb ?
                        'function(){' + expr + '}.call(this)' : '(' + expr + ')'
                    ) + '?"' + key + '":""'
                } else if (asText) {

                    expr = 'function(v){' + (tb ?
                        expr.replace('return ', 'v=') : 'v=(' + expr + ')'
                    ) + ';return v||v===0?v:""}.call(this)'
                }

                return expr
            }

            // istanbul ignore next: compatibility fix for beta versions
        _tmpl.parse = function(s) {
            return s
        }

        return _tmpl

    })()


    /*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and bellow

*/
    // http://kangax.github.io/compat-table/es5/#ie8
    // http://codeplanet.io/dropping-ie8/

    var mkdom = (function(checkIE) {

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
                ie9elem(el, html, tagName, !! match[1])
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
                    each(tag, function(t) {
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
                impl = __tagImpl[tagName] || {
                    tmpl: dom.outerHTML
                },
                useRoot = SPECIAL_TAGS_REGEX.test(tagName),
                root = dom.parentNode,
                isSpecialTag = SPECIAL_TAGS_REGEX.test(tagName),
                ref = document.createTextNode(''),
                child = getTag(dom),
                tags = [],
                oldItems = [],
                checksum,
                isVirtual = dom.tagName == 'VIRTUAL'

                // parse the each expression
            expr = tmpl.loopKeys(expr)

            // insert a marked where the loop tags will be injected
            root.insertBefore(ref, dom)

            // clean template code
            parent.one('before-mount', function() {

                // remove the original DOM node
                dom.parentNode.removeChild(dom)
                if (root.stub) root = parent.root

            }).on('update', function() {
                // get the new items collection
                var items = tmpl(expr.val, parent),
                    // create a fragment to hold the new DOM nodes to inject in the parent tag
                    frag = document.createDocumentFragment()

                    // object loop. any changes cause full redraw
                    if (!isArray(items)) {
                        checksum = items ? JSON.stringify(items) : ''
                        items = !items ? [] :
                            Object.keys(items).map(function(key) {
                                return mkitem(expr, key, items[key])
                            })
                    }

                    // loop all the new items
                each(items, function(item, i) {
                    // reorder only if the items are objects
                    var _mustReorder = mustReorder && item instanceof Object,
                        oldPos = oldItems.indexOf(item),
                        pos = ~oldPos && _mustReorder ? oldPos : i,
                        // does a tag exist in this position?
                        tag = tags[pos]

                        item = !checksum && expr.key ? mkitem(expr, item, i) : item

                        // new tag
                    if (!_mustReorder && !tag // with no-reorder we just update the old tags
                        ||
                        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
                    ) {

                        tag = new Tag(impl, {
                            parent: parent,
                            isLoop: true,
                            hasImpl: !! __tagImpl[tagName],
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
                if (isSpecialTag) root.appendChild(frag)
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
                            childTags.push(initChildTag(child, {
                                root: dom,
                                parent: tag
                            }, dom.innerHTML, tag))
                    }

                    if (!dom.isLoop || forceParsingNamed)
                        setNamed(dom, tag, [])
                }

            })

        }

        function parseExpressions(root, tag, expressions) {

            function addExpr(dom, val, extra) {
                if (tmpl.hasExpr(val)) {
                    var expr = {
                        dom: dom,
                        expr: val
                    }
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

                if (attr) {
                    _each(dom, tag, attr);
                    return false
                }

                // attribute expressions
                each(dom.attributes, function(attr) {
                    var name = attr.name,
                        bool = name.split('__')[1]

                        addExpr(dom, attr.value, {
                            attr: bool || name,
                            bool: bool
                        })
                        if (bool) {
                            remAttr(dom, name);
                            return false
                        }

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

            extend(this, {
                parent: parent,
                root: root,
                opts: opts,
                tags: {}
            }, item)

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

            function inheritFromParent() {
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
                    walkAttributes(impl.attrs, function(k, v) {
                        setAttr(root, k, v)
                    })
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
                    } else
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
                each(childTags, function(child) {
                    child[isMount ? 'mount' : 'unmount']()
                })

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
                    dom.nodeValue = '' + value // #815 related
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
                        add = function() {
                            insertTo(stub.parentNode, stub, dom)
                        },
                        remove = function() {
                            insertTo(dom.parentNode, dom, stub)
                        }

                        // add to DOM
                    if (value) {
                        if (stub) {
                            add()
                            dom.inStub = false
                            // avoid to trigger the mount event if the tags is not visible yet
                            // maybe we can optimize this avoiding to mount the tag at all
                            if (!isInStub(dom)) {
                                walk(dom, function(el) {
                                    if (el._tag && !el._tag.isMounted) el._tag.isMounted = !! el._tag.trigger('mount')
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
                        else(tag.parent || tag).one('updated', remove)

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
            return typeof v === T_FUNCTION || false // avoid IE problems
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
            return~ arr.indexOf(item)
        }

        /**
         * Check whether an object is a kind of array
         * @param   { * } a - anything
         * @returns {Boolean} is 'a' an array?
         */

        function isArray(a) {
            return Array.isArray(a) || a instanceof Array
        }

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
            return tmpl.replace(/<(yield)\/?>(<\/\1>)?/gi, innerHTML || '')
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
            } else document.getElementsByTagName('head')[0].appendChild(styleNode)

            /**
             * This is the function exported that will be used to update the style tag just created
             * innerHTML seems slow: http://jsperf.com/riot-insert-style
             * @param   { String } css [description]
             */
        return styleNode.styleSheet ?
            function(css) {
                styleNode.styleSheet.cssText += css
        } :
            function(css) {
                styleNode.innerHTML += css
        }

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

            if (tag && root) tag = new Tag(tag, {
                root: root,
                opts: opts
            }, innerHTML)

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
        riot.util = {
            brackets: brackets,
            tmpl: tmpl
        }

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
            __tagImpl[name] = {
                name: name,
                tmpl: html,
                attrs: attrs,
                fn: fn
            }
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
            __tagImpl[name] = {
                name: name,
                tmpl: html,
                attrs: attrs,
                fn: fn
            }
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
                    each(arr, function(e) {
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
                        each(root, pushTags) // assume nodeList

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
            } else
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
                    each(els, function(_el) {
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
    else if (typeof define === 'function' && define.amd)
        define(function() {
            return (window.riot = riot)
        })
    else
        window.riot = riot

})(typeof window != 'undefined' ? window : void 0);

    })( module.exports , module , __context );
    __context.____MODULES[ "f8fe06789b5d8adc0f656022eef1fd51" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "95923bd4035d22821d1a4a428e7ef568" ,
        filename : "defineView.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];

function defineView( name, option) {
    var mojo = this,
        tags = mojo.tags,
        name = name.replace('.','-');

    tags[name] = {
        option: option,
        ready: option.ready
    };

    riot.observable(tags[name]);

    Object.keys(option.init).forEach(function(key) {
        tags[name][key] = option.init[key];
    });

    Object.keys(option.bindEvents).forEach(function(key) {
        tags[name].on(key, option.bindEvents[key]);
    });
};

module.exports = defineView;


    })( module.exports , module , __context );
    __context.____MODULES[ "95923bd4035d22821d1a4a428e7ef568" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "017476039f552853ecf216957daea213" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var defineView = __context.____MODULES['95923bd4035d22821d1a4a428e7ef568'];
var mojo = {
    home: 'index',
    app: null,
    currentTag: "",
    defineView: defineView,
    _viewCache:{}
};

module.exports = mojo;


    })( module.exports , module , __context );
    __context.____MODULES[ "017476039f552853ecf216957daea213" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "0feadbd5c501078cd412dc770c08ed39" ,
        filename : "promise.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var PENDING = undefined,
    FULFILLED = 1,
    REJECTED = 2;

function Promise (resolver) {
    if (!isFunction(resolver)) throw new TypeError('no resolver');
    if(!(this instanceof Promise)) return new Promise(resolver);

    var promise = this;
        promise._value,
        promise._reason,
        promise._status = PENDING,
        promise._resolves = [],
        promise._rejects = [];

    resolver(resolve,reject);

    function resolve(value) {
        transition.apply(promise,[FULFILLED].concat([value]))
    };

    function reject(value) {
        transition.apply(promise,[REJECTED].concat([value]));
    };

};

Promise.prototype.then = function (onFulfilled, onRejected) {
    var promise = this;

    return Promise(function(resolve, reject) {
        switch (promise._status) {
            case PENDING :
                promise._resolves.push(callback);
                promise._rejects.push(errback);
                break;
            case FULFILLED :
                callback(promise._value);
            case REJECTED :
                errback(promise._reason);
        }

        function callback(value) {
                var ret = isFunction(onFulfilled) && onFulfilled(value) || value;
                if (isThenable(ret)) {
                    ret.then(function(value) {
                        resolve(value);
                    },function(value) {
                        reject(value);
                    });
                } else {
                    resolve(ret);
                }
        };

        function errback(value) {
                value = isFunction(onRejected) && onRejected(value) || value;
                reject(value);
        };
    })
};

Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected);
};

Promise.prototype.delay = function (ms, val) {
    return Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve();
            }, ms);
    });
};

Promise.prototype.resolve = function (arg) {
    return Promise(function(resolve, reject) {
        resolve(arg);
    });
};

Promise.prototype.reject = function (arg) {
    return Promise(function(resolve, reject) {
        reject(arg);
    });
};

Promise.all = function(promises) {
    if (!isArray(promises)) throw new TypeError('Need more promises');

    return Promise(function(resolve, reject) {
        var i = 0,
            result = [],
            len = promises.length;

        for (; i< len; i++) {
            promises[i].then(resolver(i),rejector);
        }

        function resolver(index) {
            return function () {
                resolveAll(index, value);
            };
        };

        function rejector(value) {
            reject(value);
        };

        function resolveAll(index, value) {
            result[index] = value;
            if(index == len - 1) resolve(result);
        };
    });
};

Promise.race = function(promises) {
    if (!isArray(promises)) throw new TypeError('Need more promises');
    return Promise(function(resolve, reject) {
        var i = 0,
            len = promise.length;

        for(; i<len; i++) {
            promises[i].then(resolver,rejector);
        }

        function resolver(value) {
            resolve(value);
        };
        function rejector(value) {
            rejector(value);
        };
    })
};

function transition ( status, value ) {
    var promise = this;
    if (promise._status !== PENDING) return;

    setTimeout(function() {
        promise._status = status;
        publish.call(promise,value);
    });
};

function publish (value) {
    var promise = this,
        fn,
        status = promise._status === FULFILLED,
        queue = promise[status ? '_resolves' : '_rejects'];

    while (fn = queue.shift()) {
        value = fn.call(promise, value) || value;
    }
    promise[status ? '_value' : '_reason'] = value;
    promise['_resolves'] = promise['_rejects'] = undefined;
};

function isFunction (obj) {
    return 'function' === typeof obj;
};

function isArray (obj) {
    return Array.isArray ? Array.isArray(obj) : obj instanceof Array;
};

function isThenable (obj) {
    return obj && typeof obj['then'] == 'function';
};

module.exports = Promise;


    })( module.exports , module , __context );
    __context.____MODULES[ "0feadbd5c501078cd412dc770c08ed39" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "05943f74374ea01e34a27d1daf86141d" ,
        filename : "export_promise.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var Promise = Promise ||__context.____MODULES['0feadbd5c501078cd412dc770c08ed39'];

module.exports = function(fn) {
    return function() {
        return new Promise(fn);
    };
};


    })( module.exports , module , __context );
    __context.____MODULES[ "05943f74374ea01e34a27d1daf86141d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6d0ca3ce71dd4c4751cc8941e8cb475b" ,
        filename : "initApp.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'],
    mojo =__context.____MODULES['017476039f552853ecf216957daea213'],
    promise =__context.____MODULES['05943f74374ea01e34a27d1daf86141d'];

function main(resolve, reject) {
    var qapp = document.querySelector('qapp-app');

    createApp(function() {
        riot.mount('qapp-app');
    });

    function createApp(callback) {
        riot.tag('qapp-app','<yield/>',function() {
            this.on('mount',function() {
                mojo.app = this;

                resolve();

                this.root.addEventListener('touchmove',function(e) {
                    e.stopPropagation();
                },false);
            });
        });

        if (!qapp) {
            var app = '<qapp-app></qapp-app>';
            document.body.innerHTML += app;
        }

        callback && callback();
    };
};

module.exports = promise(main);


    })( module.exports , module , __context );
    __context.____MODULES[ "6d0ca3ce71dd4c4751cc8941e8cb475b" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ae214ffd680da3b2049f2dc9092bd578" ,
        filename : "initRoute.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'],
    mojo =__context.____MODULES['017476039f552853ecf216957daea213'],
    promise =__context.____MODULES['05943f74374ea01e34a27d1daf86141d'];

function main( resolve, reject ) {
    riot.route(goto);
    riot.route.exec();
    resolve();

    function goto( collection,id,action) {
        var app = mojo.app,
            root = app.root,
            toTag = collection,
            homeTag = mojo.home;

        _goView((function() {
            return toTag ? toTag.replace('.','-') : homeTag;
        })());

        function _goView(to) {
            var tag = root.querySelector(to);

            if (!tag) root.innerHTML += mojo.tags[to].option.html;

            __renderCurrTag(to);

            function __renderCurrTag(currTag) {
                mojo.currentTag = currTag;

                var tag = mojo.tag[currTag],
                    opt = tag.option,
                    evt = opt.bindEvents;

                tag.ready();
                tag.trigger('ready');
            };
        };
    };
};

module.exports = promise(main);


    })( module.exports , module , __context );
    __context.____MODULES[ "ae214ffd680da3b2049f2dc9092bd578" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "08ea436ba00b2c3de0c3bcb11912e372" ,
        filename : "util.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /* Zepto v1.1.3-27-gb9328f1 - zepto event touch - zeptojs.com/license */
/**
 * kami定制化的zepto，对于事件
 * 
 * @type {[type]}
 */
var global = global || window;
window.Kami = window.Kami || {};
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
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
    camelize, uniq,
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
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
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
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

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
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = []
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = document.documentElement.contains(parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()



;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if (swipeDirectionFromVelocity) {
          if (touch && touch.el) {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
          }
          
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            if (touch && touch.el) {
              touch.el.trigger('swipe');
              touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            }
            // touch.el.trigger('swipe')
            // touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              
              if (!!!global.Kami.disableTapEvent) {

                var event = $.Event('tap')
                event.cancelTouch = cancelAll
                touch.el.trigger(event)
              }

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  // ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
  //   'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
  //   $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  // })
  ;['tap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)

;(function($){
  function detect(ua, platform){
    var os = this.os = {}, browser = this.browser = {},
        webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
        android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
        osx = !!ua.match(/\(Macintosh\; Intel /),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
        iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        win = /Win\d{2}|Windows/.test(platform),
        wp = ua.match(/Windows Phone ([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        kindle = ua.match(/Kindle\/([\d.]+)/),
        silk = ua.match(/Silk\/([\d._]+)/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
        bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
        rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
        playbook = ua.match(/PlayBook/),
        chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
        firefox = ua.match(/Firefox\/([\d.]+)/),
        firefoxos = ua.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
        ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
        webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
        safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    if (wp) os.wp = true, os.version = wp[1]
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]
    if (firefoxos) os.firefoxos = true, os.version = firefoxos[1]
    if (ie) browser.ie = true, browser.version = ie[1]
    if (safari && (osx || os.ios || win)) {
      browser.safari = true
      if (!os.ios) browser.version = safari[1]
    }
    if (webview) browser.webview = true

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
    (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
    (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
    (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($, navigator.userAgent, navigator.platform)
  // make available to unit tests
  $.__detect = detect

})(Zepto)

module.exports = Zepto;

    })( module.exports , module , __context );
    __context.____MODULES[ "08ea436ba00b2c3de0c3bcb11912e372" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "897499f6c44f901ecc6fd2b84da5b878" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['08ea436ba00b2c3de0c3bcb11912e372']

    })( module.exports , module , __context );
    __context.____MODULES[ "897499f6c44f901ecc6fd2b84da5b878" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "f9c4b0992faed28c88a4ede2a56e29c7" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["util"] = __context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];
module.exports = obj["util"];

    })( module.exports , module , __context );
    __context.____MODULES[ "f9c4b0992faed28c88a4ede2a56e29c7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9487578d3e42bc2a142f3d268c5606e5" ,
        filename : "base.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    alert(1)
QApp.Kami = window.Kami = {};
window.kamiData = window.kamiData || {};
QApp.util.createStyle([
    '.kami-header {position: relative; width: 100%; height: 40px;line-height: 40px}',
    '.kami-header .ar {right: 10px;}',
    '.kami-header .al {left: 10px;}',
    '.kami-header .btn {position: absolute; top: 0; font-size: 12px;color: #419bf9;}',
    '.kami-header .title {text-align: center;}',
    '.kami-content {position: absolute; top: 40px; left: 0; right: 0; bottom: 0}'
].join(''));


    })( module.exports , module , __context );
    __context.____MODULES[ "9487578d3e42bc2a142f3d268c5606e5" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "3ff523358aea650d06e1196dab33b145" ,
        filename : "class.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * [Kami description]
 * 所以由Kami.create 或者由 Kami.extend创建的类要想用到父类的方法,需要通过
 * xxxClass.superClass.xxxmethod.apply| call(this, options)
 * 来调用
 */

(function () {

    'use strict';

    var utils = {};

    function Kami(options) {
        
        //由于this可能为superClass.call而来，所以this对象未必是Kami类型
        //
        if (!(this instanceof Kami) && 
            utils.isFunction(options)) {
            return utils.classify(options);
        }
        
    }

    
    /**
     * create a new Class, the base for Kami.extend and you can
     * var Dialog = Kami.create({
     *     Extends: 'Popup',
     *     Mixins: 'Position',
     *     initialize: function() {
     *         Dialog.superClass.initialize.apply(this, arguments);
     *     }
     * })
     * Kami.create(Object)
     * Kami.create(Object, options)
     * Kami.create(Function, Object)
     * @param  {Function| Object}   superClass  the parent of the created class
     * @param  {Object}             options     the options to overide or extend to 
     * @return {Class}              
     */
    Kami.create = function (superClass, options) {
        

        if (utils.isObject(superClass) && 
            superClass != null) {

            if (options && utils.isObject(options)) {
                utils.extend(superClass, options);
            }
            options = superClass;
            superClass = null;
        }
        else if (utils.isFunction(superClass)) {
            options = options || {};
            options.Extends = superClass;
        }
        else {
            throw ('invalid type of superClass to create class');
        }

        superClass = superClass || options.Extends || Kami;

        function subClass() {
            var arg = [].slice.call(arguments);
            // debugger
            superClass.apply(this, arg);
            // debugger
            if (this.constructor === subClass && utils.isFunction(this.initialize)) {
                this.initialize.apply(this, arg);
            }
        }
        if (subClass !== Kami) {
            utils.extend(subClass, superClass);
        }
        // debugger
        utils.implement.call(subClass, options);

        // subClass.superClass = superClass.prototype;
        // subClass.prototype.constructor = subClass;

        return utils.classify(subClass);
    };

    /**
     * 使用Extend的方式来拓展对象
     * 
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    Kami.extend = function (options) {
        
        // debugger
        options || (options = {});
        options.Extends = this;

        return Kami.create(options);
    };
    

    var TYPES = ['Function', 'Object', 'Array'];
    TYPES.forEach(function (type, i) {

        utils['is' + type] = function (o)  {
            return utils.toString.call(o) === '[object ' + type + ']';
        };
    });
    Array.prototype.forEach = [].forEach ? [].forEach:
    function (fn, scope) {
        for (var i = 0; i < this.length; i++) {
            fn.call(scope, this[i], i);
        }
    };

    /**
     * 除了Extend和Mixin方法以外，其他的options里的选项都拷贝到
     * subClass.prototype上
     * @param  {Object} options 选项
     */
    utils.implement = function (options) {
        var StaticMethods = Kami.StaticMethods;

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                if (StaticMethods.hasOwnProperty(key)) {
                    StaticMethods[key].call(this, options[key]);
                }
                else {
                    this.prototype[key] = options[key];
                }
            }
        }
    };
    /**
     * 为fun添加必要的方法extend和mixin
     * 
     * @param  {[type]} fun [description]
     * @return {[type]}     [description]
     */
    utils.classify = function (fun) {
        fun.extend = Kami.extend;
        // fun.implement = utils.implement;
        return fun;
    };
    


    utils.createObject = function (proto) {
        if (Object.create) {
            return Object.create(proto);//es5
        }
        else if (Object.__proto__) {//firefox
            return {
                __proto__: proto
            };
        }
        else {
            var Ctor = function () {};
            Ctor.prototype = proto;
            return new Ctor();
        }
    };
    /**
     * 深度复制source的属性和值到target中，如果deep则递归复制
     * @param  {[type]} target [description]
     * @param  {[type]} source [description]
     * @param  {[type]} deep   [description]
     * @return {[type]}        [description]
     */
    utils.extend = function (target, source, deep) {

        for (var key in source) {
            if (source.hasOwnProperty(key) && 
                key !== 'utils') 
            { //skip Kami.utils
                if (deep && utils.isObject(source[key])) {
                    utils.extend(target[key], source[key], deep);
                }
                else {
                    if (key  !== 'prototype') {
                        target[key] = source[key];
                    }
                    
                }
            }
        }
    };
    utils.toString = Object.prototype.toString;

    /**
     * Kami static methods t
     */

    
    Kami.StaticMethods = {
        /**
         * 需要mixin的对象，数组或者单个对象，由于采用extend的方式
         * 来实现多个对象的混入，所以如果mixin的对象本身有重复的key那么
         * 遵循相同属性后边的object覆盖前边对象
         * @param  {Array | Object} superClass 父类
         */
        'Mixins': function (superClass) {

            if (!utils.isArray(superClass)) {
                superClass = [superClass];
            }
            for (var i = 0; i < superClass.length; i++) {
                var sp = superClass[i];
                //普通对象没有prototype 所以只能赋值sp本身
                utils.extend(this.prototype, sp.prototype || sp);
            }
        },
        /**
         * 通过原型链的形式来实现集成
         * 只能是唯一的，不能实现多重继承
         * @param  {Function} superClass 父类
         */
        'Extends':  function (superClass) {
            // debugger
            var superClassInstance = utils.createObject(superClass.prototype);
            utils.extend(superClassInstance, this.prototype);
            this.prototype = superClassInstance;
            this.prototype.constructor = this;
            this.superClass = superClass.prototype;
        }
        // ,
        // 'Statics': function (superClass) {
        //     for (var key in superClass) {
        //         if (superClass.hasOwnProperty(key)) {
        //             this[key] = superClass[key];
        //         }
        //     }
        // }
    };
    if (typeof module != 'undefined' && module.exports) {
        module.exports = Kami;
    }


}());







    })( module.exports , module , __context );
    __context.____MODULES[ "3ff523358aea650d06e1196dab33b145" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "2aa616cd8537012234a4f75239bbb891" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['3ff523358aea650d06e1196dab33b145'];


    })( module.exports , module , __context );
    __context.____MODULES[ "2aa616cd8537012234a4f75239bbb891" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ff21b565e1a890a59a1ce1bf37e9a6de" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    // Events
// -----------------
// 参考
//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
//  - https://github.com/joyent/node/blob/master/lib/events.js

'use strict';

var eventSplitter = /\s+/;


//
//     var object = new Events();
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
function Events() {
}



Events.prototype.on = function (events, callback, context) {
    var cache, event, list;
    if (!callback) {
        return this;
    }

    cache = this._events || (this._events = {});
    events = events.split(eventSplitter);//多个事件同时挂载，用空格分开'change test'

    while (event = events.shift()) {
        list = cache[event] || (cache[event] = []);
        var tmp = {
            handler: callback,
            context: context
        };
        list.push(tmp);
    }

    return this;
};

Events.prototype.once = function (events, callback, context) {
    var me = this;
    var cb = function () {
        me.off(events, cb);
        callback.apply(context || me, arguments);
    };
    return this.on(events, cb, context);
};


Events.prototype.off = function (events, callback, context) {
    var cache, event, list, i;

    // No events, or removing *all* events.
    if (!(cache = this._events)) {
        return this;
    }
    if (!(events || callback || context)) {
        delete this._events;
        return this;
    }

    events = events ? events.split(eventSplitter) : keys(cache);

  // Loop through the callback list, splicing where appropriate.
    while (event = events.shift()) {
        list = cache[event];
        if (!list) {
            continue;
        }

        if (!(callback || context)) {
            delete cache[event];
            continue;
        }

    
        for (i = list.length - 1 ; i >= 0; i--) {
            var tmp = list[i];
            if (!(callback && tmp.handler !== callback ||
                context && tmp.context !== context)) {
                list.splice(i, 1);
            }
        }
    }

    return this;
};

Events.prototype.trigger = function (events) {
    var cache, event, all, list, i, len, rest = [], args, returned = true;
    if (!(cache = this._events)) return this;

    events = events.split(eventSplitter);

  
    rest = Array.prototype.splice.call(arguments, 1);



    while (event = events.shift()) {
        // Copy callback lists to prevent modification.
        if (all = cache.all) {
            all = all.slice();
        }
        if (list = cache[event]) {
            list = list.slice();
        }

        // Execute event callbacks
        if (event !== 'all') {
            returned = triggerEvents(list, rest, this) && returned;
        }

    
    }

    return returned;
};

// Helpers
// get Enumberable property of Object

var keys = Object.keys;

if (!keys) {
    keys = function (o) {
        var result = [];

        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                result.push(name);
            }
        }
        return result;
    };
}


// Execute callbacks
function triggerEvents(list, args, context) {
    var pass = true;

    if (list) {
        var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2];
    
    // http://blog.csdn.net/zhengyinhui100/article/details/7837127
        

        switch (args.length) {
            case 0: 
                for (; i < l; i ++) {
                    var tmp = list[i];
                    pass = tmp.handler.call(tmp.context || context) !== false && pass;
                }
                break;
            case 1: 
                for (; i < l; i ++) {
                    var tmp = list[i];
                    pass = tmp.handler.call(tmp.context  || context, a1) !== false && pass;
                }
                break;
            case 2: for (; i < l; i ++) {
                    var tmp = list[i];
                    pass = tmp.handler.call(tmp.context  || context, a1, a2) !== false && pass;
                }
                break;
            case 3: 
                for (; i < l; i ++) {
                    var tmp = list[i];
                    pass = tmp.handler.call(tmp.context || context, a1, a2, a3) !== false && pass;
                } 
                break;
            default: 
                for (; i < l; i ++) {
                    var tmp = list[i];
                    pass = tmp.handler.apply(tmp.context  || context, args) !== false && pass;
                } 
                break;
        }
    }
    // trigger will return false if one of the callbacks return false
    return pass;
}
module.exports = Events;

    })( module.exports , module , __context );
    __context.____MODULES[ "ff21b565e1a890a59a1ce1bf37e9a6de" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "63e90e0c8b075bd9d527fe9f9845586d" ,
        filename : "attribute.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    

;(function () {
    'use strict';
    var Attribute = {
        initAttrs : function (config) {
            
            var options = this.options = {};

            mergeInheritedOptions(options, this);

            if (config) {
                
                merge(options, config);
                
            }
            
            parseEventsFromOptions(this, options);

        },
        get: function (key) {
            var options = this.options;
            
            var value = null;
            if (options.hasOwnProperty(key)) {
                value = options[key];
            }
            
            return value;

        },
        set: function (key, value) {
            //【TODO setter和getter】
            var options = this.options;
            if (options.hasOwnProperty(key)) {
                options[key] = value;
            }
        }
        
    };

    /**
     * 暴露当前接口
     */
    if (typeof module != 'undefined' && module.exports) {
        module.exports = Attribute;
    } 

    var toString = Object.prototype.toString;
    


    var isArray = Array.isArray || function (val) {
        return toString.call(val) === '[object Array]';
    };

    function isFunction(val) {
        return toString.call(val) === '[object Function]';
    }

    function isWindow(o) {
        return o != null && o == o.window;
    }

    function isPlainObject(o) {

        if (!o || toString.call(o) !== '[object Object]' ||
            o.nodeType || isWindow(o)) {
            return false;
        }
        else {
            return true;
        }

    }

    function isEmptyObject(o) {
        if (!o || toString.call(o) !== '[object Object]' ||
          o.nodeType || isWindow(o) || !o.hasOwnProperty) {
            return false;
        }

        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    }

    

    function merge(receiver, supplier) {
        var key, value;
        for (key in supplier) {
            if (supplier.hasOwnProperty(key)) {
                value = supplier[key];
                // 只 clone 数组和 plain object，其他的保持不变
                if (isArray(value)) {
                    value = value.slice();
                } else if (isPlainObject(value)) {
                    var prev = receiver[key];
                    isPlainObject(prev) || (prev = {});
                    value = merge(prev, value);
                }
                receiver[key] = value;
            }
        }
        return receiver;
    }

    function mergeInheritedOptions(options, instance) {
        // debugger
        var inherited = [];
        // debugger
        var proto = instance.constructor.prototype;
        //在类的创建时，已经将options拷贝到subClass.prototype上
        //
        while (proto) {
            // 不要拿到 prototype 上的
            if (!proto.hasOwnProperty('options')) {
                proto.options = {};
            }
            // 为空时不添加
            if (!isEmptyObject(proto.options)) {
                inherited.unshift(proto.options);
            }

            // 向上回溯一级
            proto = proto.constructor.superClass;

            
        }

        // Merge and clone default values to instance.
        while (inherited.length) {
            var item = inherited.shift();
            merge(options, item);
        }
 
    }



    var EVENT_PATTERN = /^(on)([a-zA-Z]*)$/;
    var EVENT_NAME_PATTERN = /^([cC]hange)?([a-zA-Z]*)/;

    function parseEventsFromOptions(host, options) {
        // debugger
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                var value, m;
                if (options[key] != null) {
                    value = options[key].value || options[key];
                }
                
                // debugger
                if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
                    // this.on('show', value)
                    //this.on('change:title', value);
                    host[m[1]](getEventName(m[2]), value);
                    delete options[key];
                }
            }
        }
    }

    // Converts `Show` to `show` and `changeTitle` to `change:title`
    function getEventName(name) {
        //[TODO] 优化暴露事件
        // debugger
        var m = name.match(EVENT_NAME_PATTERN);
        var ret = m[1] ? 'change:' : '';
        ret += m[2].toLowerCase();
        return ret;
    }

    return Attribute;
    
}());

    })( module.exports , module , __context );
    __context.____MODULES[ "63e90e0c8b075bd9d527fe9f9845586d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4276ddd415309466e73d5046e490fae4" ,
        filename : "base.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    

;(function () {
    'use strict';

    var Kami =__context.____MODULES['2aa616cd8537012234a4f75239bbb891'];
    var Event =__context.____MODULES['ff21b565e1a890a59a1ce1bf37e9a6de'];
    
    var Attribute =__context.____MODULES['63e90e0c8b075bd9d527fe9f9845586d'];
    
    var Base = Kami.create({
        Mixins: [Event, Attribute],

        initialize: function (config) {
            /**
             * nothing to do now
             */
            
            this.initAttrs(config);
        },
        
        destroy: function () {
            this.off();
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            this.destroy = function () {};
            this.isDestroy = true;
        }

    });
    if (typeof module != 'undefined' && module.exports) {
        module.exports = Base;
    }
    
}());




    })( module.exports , module , __context );
    __context.____MODULES[ "4276ddd415309466e73d5046e490fae4" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ba335bae023b1e48c033d17d911cf60a" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['4276ddd415309466e73d5046e490fae4'];


    })( module.exports , module , __context );
    __context.____MODULES[ "ba335bae023b1e48c033d17d911cf60a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8f29abeebdfb2c4ade593479757cbc93" ,
        filename : "widget.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * dependance Base.js
 * @author  sharon.li <xuan.li@qunar.com>
 */
/**
 * 关于resize的处理，当窗口resize后
 * 需要重新计算与节点属性相关的属性，默认调用组件的resize方法
 * 继承与widget或者widget子类的组件，需要实现自己的resize方法
 * 
 * 关于组合组件，例如组件A由 A1, A2组成，为了避免A1 A2的resize和
 * A出现问题，推荐在A中实现resize，而A1,A2的实例将resizable
 * 设置为false
 * @return {[type]} [description]
 */
(function () {

    'use strict';
    

    var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];
    
    var Base =__context.____MODULES['ba335bae023b1e48c033d17d911cf60a'];
    
    
    window.Kami = window.Kami || {};
    window.Kami._widgetCache = {};

    
    var EVENT_PREFIX = 'delegate-event-{cid}:';
    var DATA_WIDGET_CID = 'data-widget-cid';
    var DELEGATE_EVENT_NS = '.delegate-events-';
    var $PARENT_NODE = document.body;
    var Widget = Base.extend({
        /**
         */
        options: {
            //当前组件的类型
            type: 'widget',

            container: null,

            // 默认数据模型
            datasource: null,

            // 组件的默认父节点
            parentNode: document.body,

            template: null,

            //组件界别的主题
            skin: 'ui',

            //组件提供的额外样式选项
            extraClass: '',

            // attr: {},
            // yo: false,

            events: {
                // 'eventName selector' : function() {}
            },
            resizable: false //是否允许监听窗口resize
        },

        getClassNamePrefix : function () {
            

            var uiPrefix = window.Kami.theme || this.get('skin');
            uiPrefix += '-';


            if (!this.classNamePrefix) {
                var options = this.options;
                if (!this.get('className')) {
                    var type = options.type || 'widget';
                    this.classNamePrefix =  uiPrefix + type.toLowerCase();
                }
                else {
                    this.classNamePrefix = this.get('className').toString();
                }
            }
            return this.classNamePrefix;
        },

        getClassName: function (name) {
            /**
             * @type {[type]}
             */
            if (!this.classNamePrefix) {
                this.getClassNamePrefix();
            }
            if (name) {
                name = '-' + name;
            }
            else {
                name = '';
            }
            return this.classNamePrefix + name;
        },
        _getMainElement: function (config) {
            this.widgetEl = null;
            var container = this.get('container');

            if (this.get('template')) {
                this.fromTemplate = true;
                try {
                    this.widgetEl = $(this.parseTemplate(this.get('template')));
                    //获得组件的容器
                    container = container || $PARENT_NODE;
                    container = $(container);
                }
                catch (e) {
                    throw new Error('template is not valid');
                }
            }
            else {
                //没传模板，只有容器，仅仅兼容在页面上自己写组件HTML的形式
                container = container || $PARENT_NODE;
                container = $(container);

                if (!container.length) { 
                    console.log('type of widget is ' + this.options.type);
                    throw new Error('container is not valid');
                } else {
                    //获得组件的容器
                    this.widgetEl = $(container[0].firstElementChild);
                }
            }
            
            this.container = $(container);
        },
        
        /**
         * 子类可以覆盖如何处理tpl
         * 
         * @param  {[type]} tpl [description]
         * @return {[type]}     [description]
         */
        parseTemplate : function (tpl) {
            return tpl || '';
        },
        
        /**
         * 组件初始化方法,initialize是new组件时调用的，而init是给子组件暴露的方法
         * 可以在该方法中绑定事件或者处理其他逻辑
         * 
         * @return {[type]} [description]
         */
        init : function () {

        },
        /**
         * 对参数进行初始化
         * @param  {[type]} config [description]
         * @return {[type]}        [description]
         */
        initialize: function (config) {
            if (!this._isInit) {
               
                

                this.cid = uniqueCid();

                this._widgetMap = this.get('_widgetMap') || {};


                // debugger
                Widget.superClass.initialize.call(this, config);

                //初始化样式和样式名称前缀
                this.getClassNamePrefix();

                

                //启动UI
                //init方法是对子类开发的接口，如果需要在new的时候进行初始化，那么可以覆盖这个方法
                //
                this.init();
                

                //初始化this.container 和 .this.widgetEl 对象
                //
            
                this._getMainElement(config);

                this.delegateEvents();
                
                //缓存UI
                this._cacheWidget();

                this._isInit = true;

                return this;

            }
            else {
                return this;
            }
            
        },
        _cacheWidget: function () {
            var cid = this.cid;
            Kami._widgetCache[this.cid] = this;
            this.widgetEl.attr(DATA_WIDGET_CID, cid);
            // debugger

        },
        /**
         * 渲染组件到页面中
         * 并且出发事件，方便用户处理在组件渲染后的行为
         * @return {[type]} [description]
         */
        render: function () {
            
            if (!this._isRender) {
                
                 
                // 插入到文档流中
                if (this.fromTemplate) {
                    this.widgetEl.appendTo(this.container);
                }
                this._isRender = true;
                
                this.widgetEl.addClass(this.getClassName());
                var extraClass = this.get('extraClass') || '';
                if (extraClass) {
                    this.widgetEl.addClass(extraClass);
                }
                // this.__renderEvent();
            }
            
            return this;

        },
        /**
         * 空方法，需要子类自己去实现
         */
        resize: function () {},
        /**
         * 不需要在代理到container的事件，解绑方法
         * 例如resize
         */
        __renderEvent: function () {

            var widget = this;
            
            
            widget.__resizeFun = function () {
            // debugger
                if (widget.__resizeTimer) {
                    clearTimeout(widget.__resizeTimer);
                }
                widget.__resizeTimer = setTimeout(function () {
                    // console.log('resize');
                    widget.resize();
                }, 200);
                
            };

            var resizable = !!this.get('resizable');
            if (resizable) {
                window.addEventListener('resize', widget.__resizeFun);
            }
        },
        /**
         * 不需要在代理到container的事件，解绑方法
         * 例如resize
         */
        __unrenderEvent: function () {

            var widget = this;
            var resizable = !!this.get('resizable');
            if (resizable) {
                window.removeEventListener('resize', widget.__resizeFun);
            }
        },
        /**
         * 注册事件代理
         */
        delegateEvents: function (element, events, handler) {
            // debugger
            if (arguments.length === 0) {
                events = this.get('events');
                element = this.widgetEl;
            }
            else if (arguments.length === 1) {
                events = element;
                element = this.widgetEl;
            }
            else if (arguments.length === 2) {
                handler = events;
                events = element;
                element = this.widgetEl;
            }
            else {
                element = element || this.widgetEl;
                this._delegateEvent = this._delegateEvent || [];
                this._delegateEvent.push(element);
            }
            
            // debugger
            // key 为 'event selector'
            for (var key in events) {
                if (!events.hasOwnProperty(key)) {
                    continue;
                }
                //args:{type, selector}
                //type: tap.delegateeventtype{cid}
                var args = parseEventKey(key, this);
                var eventType = args.type;
                // console.log('widget:eventType=' + eventType);
                var selector = args.selector;

                
                (function (handler, widget) {
                    
                    //事件如果为字符串而非function则默认在this中查找
                    var callback = function (ev) {

                        if ($.isFunction(handler)) {
                            return handler.call(widget, ev, this);
                        } else {
                            
                            return widget[handler](ev, this);
                        }
                    };

                    if (selector) {
                        // console.log(element[0])
                        $(element).on(eventType, selector, callback);
                    } else {
                        $(element).on(eventType, callback);
                    }
                }(events[key], this));
            }

            // 绑定window resize handler
            this.__renderEvent();

            return this;
        },

        // 卸载事件代理
        undelegateEvents: function (element, eventKey) {
            

            if (!eventKey) {
                eventKey = element;
                element = null;
            }
            // 卸载所有
            if (arguments.length === 0) {
                var type = DELEGATE_EVENT_NS + this.cid;
                
                this.widgetEl && this.widgetEl.off(type);
                // 卸载所有外部传入的 element
                if (this._delegateElements) {
                    for (var de in this._delegateEvent) {
                        if (!this._delegateEvent.hasOwnProperty(de)) continue;
                        this._delegateEvent[de].off(type);
                    }
                }
            } else {
                var args = parseEventKey(eventKey, this);
                // 卸载 this.widgetEl
                // .undelegateEvents(events)
                if (!element) {
                    this.widgetEl && this.widgetEl.off(args.type, args.selector);
                } else {
                    $(element).off(args.type, args.selector);
                }
            }

            // 绑定window resize handler
            this.__unrenderEvent();

            return this;
        },
        

        destroy: function () {
            this.undelegateEvents();
            delete Kami._widgetCache[this.cid];

            var widgetMap = this._widgetMap || {};
            for (var key in widgetMap) {
                if (widgetMap.hasOwnProperty(key)) {
                    var _widget = widgetMap[key];
                    if (_widget && _widget instanceof Widget) {
                        _widget.destroy && _widget.destroy();
                    }
                }
            }
            
            if (this.fromTemplate) {
                
                this.widgetEl.remove();
            }
            
            

            Widget.superClass.destroy.call(this);
            

            this.container = null;
            this.widgetEl = null;
            
        }


    });

    
    if (typeof module != 'undefined' && module.exports) {
        module.exports = Widget;
    }

    $.isEmptyObject = function(obj) {
        return $.isPlainObject(obj) && (Object.keys(obj) === 0);
    };
    /**
     * 是否已经在document中
     * @param  {[type]}  el [description]
     * @return {Boolean}    [description]
     */
    function isInDocument (el) {
        if (el && !el.nodeName) {
            el = el[0];
        }
        return $.contains(document, el);
    }
    /**
     * handler is not function then skip it
     * @param  {[type]} events [description]
     * @return {[type]}        [description]
     */
    function parseEvent(events, widget) {
        var newEvent = [];
        for (var key in events) {
            if (!events.hasOwnProperty(key)) {
                continue;
            }
            var value = events[key];
            if ($.isFunction(value)) {
                var o  = {};
                var keyArr = key.split(/\s+/);
                o.type = EVENT_PREFIX.replace('{cid}', widget.cid) +  keyArr[0];
                o.selector = keyArr.length > 1 ? keyArr[1] : null;
                o.handler = value;
                newEvent.push(o);
            }

        }
        return newEvent;
    }
    function uniqueCid() {
        return 'widget-' + setTimeout('1');
    }
    //默认dom 绑定事件格式为'tap selector': function() {}
    //
    var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/;
    var INVALID_SELECTOR = 'INVALID_SELECTOR';

    function parseEventKey(eventKey, widget) {
        var match = eventKey.match(EVENT_KEY_SPLITTER);
        //tap.delegateeventtype{cid}
        var eventType = match[1] + DELEGATE_EVENT_NS + widget.cid;

        // 当没有 selector 时，需要设置为 undefined，以使得 zepto 能正确转换为 bind
        var selector = match[2] || undefined;

        return {
            type: eventType,
            selector: selector
        };
    }

    window.addEventListener('unload', function () {
        
        for (var key in Kami._widgetCache) {
            if (Kami._widgetCache.hasOwnProperty(key)) {
                var widget = Kami._widgetCache[key];
                widget && widget.destroy && widget.destroy();
                
            }
        }
    });

}());




    })( module.exports , module , __context );
    __context.____MODULES[ "8f29abeebdfb2c4ade593479757cbc93" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "727699dca154f9ef72d5e879dadfb5a5" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['8f29abeebdfb2c4ade593479757cbc93']

    })( module.exports , module , __context );
    __context.____MODULES[ "727699dca154f9ef72d5e879dadfb5a5" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "baf4648f172f182107a54340b837577d" ,
        filename : "template.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * @description 模板解析
 * @author zxiao <jiuhu.zh@gmail.com>
 * @date 2014/11/12
 *
 * 简要使用描述:
 * variable --> {{name}}
 * if --> {{#if age == 12}}{{#else if !age}}{{#else}}{{/if}}
 * for -->{{#each data as userlist [index]}}{{/each}}
 *
 * 待完善：
 * 1、预编译
 * 2、安全
 * 3、性能
 * 4、可配置
 * 。。。
 *
 */

var reg = {
    'if': /{{#(if)\s+(.+?)\s*}}/,
    'else': /{{#(else)}}/,
    'elseif': /{{#(else\s+?if)\s+(.+?)\s*}}/,
    'endif': /{{\/if}}/,
    'each': /{{#each\s+(.+?)\s*}}/,
    'endeach': /{{\/each}}/,
    'eval': /{{\s*eval\s+.+?}}/
};

function template(tplStr, data) {
    if(!tplStr) {
        return '';
    }

    var preFlag = 1; // 上一次命中的类型：1：html文本，2：变量，3：语句
    var flag; // 本次命中的类型
    var source = ''; // 输出的源码
    var isFirst = true; // 是否第一行
    var str; // 循环中每行的代码
    var arr;

    // 去注释空行，转义双引号和斜杆，根据语法进行分行，去空行，然后根据行切割
    tplStr = tplStr.replace(/<!--[\s\S]*?-->/g, '').replace(/("|\\)/g, '\\$1').replace(/({{.+?}})/g,function(s) {
        return '\n' + s + '\n';
    }).replace(/\r/g, '');
    arr = tplStr.split('\n').filter(function(v, i) {
        return !/^\s*$/.test(v);
    });

    for(var i = 0, len = arr.length; i < len; i++) {
        str = arr[i].replace(/^\s+|\s+$/, ' ');
        if(str) {
            var statementType = '';
            if(/{{.+?}}/.test(str)) {
                flag = 2;
                for(var type in reg) {
                    if((reg[type]).test(str)) {
                        flag = 3;
                        statementType = type;
                    }
                }
            } else {
                flag = 1;
            }
            if(preFlag == 1) {
                if(isFirst) {
                    source += '\'';
                }
                if(flag == 1) {
                    source += ' ' + str;
                } else if(flag == 2) {
                    source += '\',' + helper.variable(str);
                } else if(flag == 3) {
                    source += '\');' + helper.statement(str, statementType);
                }
            } else if(preFlag == 2) {
                if(flag == 1) {
                    source += ',\'' + str;
                } else if(flag == 2) {
                    source += ',' + helper.variable(str);
                } else if(flag == 3) {
                    source += ');' + helper.statement(str, statementType);
                }
            } else if(preFlag == 3) {
                if(flag == 1) {
                    source += '_s.push(\' ' + str;
                } else if(flag == 2) {
                    source += '_s.push(' + helper.variable(str);
                } else if(flag == 3) {
                    source += helper.statement(str, statementType);
                }
            }
            isFirst = false;
            preFlag = flag;
        }
    }
    if(flag == 1) {
        source += '\');';
    } else if(flag == 2) {
        source += ');';
    }

    var func = function(map) {
        var p = [], v = [], ret = '';
        for(var i in map) {
            p.push(i), v.push(map[i]);
        }
        try{
            ret = (new Function(p, "var _s=[];_s.push(" + source + " return _s;")).apply(null, v).join("");
        } catch(e) {
            console.error('parse error: ' + e.message);
        }
        return ret;
    };

    return data ? func(data): func;
};

var helper = {
    variable: function(str) {
        return str.replace(/{{(.+?)}}/, '$1');
    },
    statement: function(str, type) {
        var result = '';
        switch(type) {
            case 'if': result = str.replace(reg['if'], '$1($2)') + '{'; break;
            case 'elseif': result = '}' + str.replace(reg['elseif'], '$1($2)') + '{'; break;
            case 'else': result = '}' + str.replace(reg['else'], '$1') + '{'; break;
            case 'each':
                str = str.replace(reg['each'], '$1');
                var split = str.split(/\s+/);
                var list = split[0] || '$list';
                var value = split[2] || '$value';
                var index = split[3] || '$index';
                result = 'for(var ' + index + ' in ' + list + '){var ' + value + '=' + list + '[' + index + '];';
                break;
            case 'endif':
            case 'endeach':result = '}';break;
            case 'eval': result = str.replace(/^{{\s*eval/, '').replace(/}}\s*$/, '') + ';';
        }
        return result;
    }
};

module.exports = template;

    })( module.exports , module , __context );
    __context.____MODULES[ "baf4648f172f182107a54340b837577d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9e11d69af7743de93f8c257f13101434" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['baf4648f172f182107a54340b837577d'];


    })( module.exports , module , __context );
    __context.____MODULES[ "9e11d69af7743de93f8c257f13101434" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e043f2686c14ccae31ca6c2e64b3df50" ,
        filename : "overlay.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["overlay"] = "<div class=\"{{uiClass}}\">{{content}}</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["overlay"];

    })( module.exports , module , __context );
    __context.____MODULES[ "e043f2686c14ccae31ca6c2e64b3df50" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "2d3c12a5f27393892fff6130acff491d" ,
        filename : "mask.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["mask"] = "<div class=\"yo-mask \"></div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["mask"];

    })( module.exports , module , __context );
    __context.____MODULES[ "2d3c12a5f27393892fff6130acff491d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "0ac114f125b5c281842e79cfc0fcd0b9" ,
        filename : "overlay.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * 浮层的基类
 */

var Widget =__context.____MODULES['727699dca154f9ef72d5e879dadfb5a5'];
var Template =__context.____MODULES['9e11d69af7743de93f8c257f13101434'];
var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];
var OverlayTpl =__context.____MODULES['e043f2686c14ccae31ca6c2e64b3df50'];


var MaskTpl =__context.____MODULES['2d3c12a5f27393892fff6130acff491d'];
var Overlay = Widget.extend({
    options: {
        width: null,
        height: null,
        zIndex: 3001,//mask 99
        hasMask: true,
        template: OverlayTpl,
        visiable: false,
        type: 'overlay',
        effect: null,
        maskTpl: null,
        maskOffset: [0, 0],
        posObj: {
            self: [0, 0],
            base: [0, 0],
            baseObj: window
        }//默认都是相对于viewport定位，所以此处的定位点设置为当前元素的左上角
    },
    parseTemplate: function (tpl) {


        this.content = this.get('content') || '';
        // debugger
        return Template(tpl || OverlayTpl, {
            uiClass: this.getClassName(),
            content: this.content
        });


    },
    resize: function () {
    },
    _hasMask : function () {
        return this.hasMask && this.mask && this.mask.length;
    },
    show: function () {
        if (!this._isRender) {
            this.render();
            if (this._hasMask()) {

                this.mask.css('display', 'block');
            }
        }




        this.visiable = true;
        if (this._hasMask()) {
            this.mask.css('display', 'block');
        }


        this.widgetEl.css('display', this.displayStyle);
        var effect = this.get('effect');
        if (effect) {
            this.widgetEl.addClass('ani fade-in');
        }
        this.trigger('aftershow');
        this.resize();

    },
    hide: function () {
        this.visiable = false;


        var effect = this.get('effect');
        if (effect) {

            this.widgetEl.addClass('fade-out');
        }
        else {
            this.widgetEl.css('display', 'none');
        }
        if (this._hasMask()) {
            this.mask.css('display', 'none');

        }


        this.trigger('afterhide');
    },
    touchHandler: function (event) {

        return false;
    },

    init: function () {

        this.hasMask = this.get('hasMask');
        this.zIndex = this.get('zIndex') || 3001;
        this.useYo = !!this.get('yo');

        // debugger
        var posObj = {
            self: [0, 0],
            baseObj: window,
            base: [0, 0]
        };
        // debugger
        $.extend(
            posObj,
            this.get('posObj') || {}

        );
        this.posObj = posObj;
        // this.parentNode = this.get('parentNode');

    },

    render: function () {
        Overlay.superClass.render.call(this);


        this.initProp();

        this.initUi();

    },
    initUi: function () {

        if (!this._hasMask()) {

            this.mask = this.get('maskTpl') || MaskTpl;
            this.mask = $(this.mask);

        }

        this.maskOffset = this.get('maskOffset') || [0, 0];
        this.widgetEl.css('z-index', this.zIndex);
        if (this._hasMask()) {
            var _views = document.querySelectorAll('qapp-view');
            var heights = [];
            for(var i=0,l=_views.length;i<l;i++) {
              heights.push($(_views[i]).height());
            }
            heights.push($(document.documentElement).height());
            heights.push($(document.body).height());
            heights.push(window.innerHeight);
            // console.log(heights)
            var maskHeight = Math.max.apply(null,heights);
            this.mask.css({
                'z-index': (this.zIndex - 1),
                'position': 'absolute',
                'display': 'none',
                'top': (0 + this.maskOffset[0]),
                'bottom': (0 + this.maskOffset[1]),
                'left': 0,
                'right': 0,
                'height': maskHeight + 'px'
            });


            var maskClass = this.useYo ? 'yo-' : 'ui-';
            maskClass += 'mask';
            this.mask.addClass(maskClass);
            // debugger
            this.mask.insertBefore(this.widgetEl);
        }
        var width = this.get('width');
        if (width) {
            this.widgetEl.css('width', width);
        }
        var height = this.get('height');
        if (height) {
            this.widgetEl.css('height', height);
        }
        // debugger


        this.displayStyle = this.widgetEl.css('display');
        // debugger
    },

    initProp: function () {



    },
    htmlsafe: function (str) {
        if ($.type(str) === 'string') {
            return str.replace(/</g, '&lt')
                .replace(/>/g, '&gt');

        }
    },
    destroy : function () {

        if (this.hasMask && this.mask) {

            this.mask.remove();
        }

        this.trigger('afterhide');
        Overlay.superClass.destroy.call(this);
    }

});


module.exports = Overlay;


    })( module.exports , module , __context );
    __context.____MODULES[ "0ac114f125b5c281842e79cfc0fcd0b9" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "d79271f5e1db960ae5a5827a5ebf276d" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['0ac114f125b5c281842e79cfc0fcd0b9'];


    })( module.exports , module , __context );
    __context.____MODULES[ "d79271f5e1db960ae5a5827a5ebf276d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b8cca259bff23536d3a2fec380276d12" ,
        filename : "tips.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["tips"] = "<div class=\"{{uiClass}} yo-tip\">{{content}}</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["tips"];

    })( module.exports , module , __context );
    __context.____MODULES[ "b8cca259bff23536d3a2fec380276d12" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "981b0c355026a0f8de7e01d99dc33239" ,
        filename : "tips.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    

var Overlay =__context.____MODULES['d79271f5e1db960ae5a5827a5ebf276d'];

var TipsTpl =__context.____MODULES['b8cca259bff23536d3a2fec380276d12'];
var Template =__context.____MODULES['9e11d69af7743de93f8c257f13101434'];
var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];

var Tips = Overlay.extend({
    options: {
        posObj: {
            self: ['center', 'center'],
            base: ['50%', '50%']
        },
        usePin: false,
        hasMask: false,
        type: 'tip',
        autoHide: true,
        content: '我是tips',
        template: TipsTpl,
        effect: true,
        onhide: function () {

        },
        autoHideTime: 2//默认为秒
    },

    setContent: function(content) {
        this.widgetEl[0].innerHTML = content;
        // this.resize();
    },
    parseTemplate: function (template) {

        this.content = this.get('content') || '';
        // debugger
        return Template(this.get('template') || TipsTpl, {
            uiClass: this.getClassName(),
            content: this.content
        });

    },

    show: function (content) {
        var widget = this;
        Tips.superClass.show.call(this);
        if (this.autoHide) {
            // window.clearTimeout(this.timer);
            if (this.timer) {
                window.clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                widget.hide();
                widget.timer = null;

            }, this.autoHideTime * 1000);
        }
        // this.resize();
    },
    hide: function() {
        Tips.superClass.hide.call(this);
        this.trigger('hide');
        var widget = this;
        setTimeout(function() {
            widget.destroy();
        }, 200);
        // this.destroy();
    },
    destroy: function () {
        this.timer && window.clearTimeout(this.timer);
        Tips.superClass.destroy.call(this);
    },
    initUi: function () {
        Tips.superClass.initUi.call(this);

        var dialogOffset = this.widgetEl.offset();
        var viewportOffset = {
            height: window.innerHeight,
            width: window.innerWidth
        };
        var left = (viewportOffset.width - dialogOffset.width) / 2;
        var top = (viewportOffset.height - dialogOffset.height) / 2;
        this.widgetEl.css({
            'position': 'fixed',
            'left': left + 'px',
            'top': top + 'px'

        });

    },
    init: function () {
        this.autoHide = !!this.get('autoHide');
        this.autoHideTime = parseInt(this.get('autoHideTime')|| 0, 10) || 2;
        Tips.superClass.init.call(this);

    }

});




var tips = null;
var DEFAULT_OPT = {
    content: '提示',
    autoHide: true,
    autoHideTime: 3,
    effect: null,
    force: false
};
var KamiTips = {
    show: function(opt) {
        if (tips == null || !tips._isInit) {

            var _opt = {};
            $.extend(_opt, DEFAULT_OPT, opt);
            if (opt.template) {
                _opt.template = opt.template;
            }
            _opt.ohhide = function () {
                if (opt && opt.onhide) {
                    opt.onhide.call(KamiTips);
                }
            };
            tips = new Tips(_opt);
            tips.show();
        }
        else if (tips.visiable) {
            if (!!opt.force) {
                tips.destroy();
                KamiTips.show(opt);
            }
            else {
                return;
            }
        }
        else {
            tips.show();
        }


    },
    hide: function() {
        if (!!tips) {
            tips.hide();
            tips = null;
        }
    }
}
module.exports = KamiTips;


    })( module.exports , module , __context );
    __context.____MODULES[ "981b0c355026a0f8de7e01d99dc33239" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "dea5a1ebdce0420db9e4d6a5c703640e" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['981b0c355026a0f8de7e01d99dc33239']

    })( module.exports , module , __context );
    __context.____MODULES[ "dea5a1ebdce0420db9e4d6a5c703640e" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "86118d626eb3f159da83a64f163558db" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["tips"] = __context.____MODULES['dea5a1ebdce0420db9e4d6a5c703640e'];
module.exports = obj["tips"];

    })( module.exports , module , __context );
    __context.____MODULES[ "86118d626eb3f159da83a64f163558db" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "412fdafd4e2b7739c300811c531dafa9" ,
        filename : "tips.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['9487578d3e42bc2a142f3d268c5606e5'];
var QApp = window.QApp,
_ = QApp.util,
KamiTips = QApp.Kami.tips =__context.____MODULES['86118d626eb3f159da83a64f163558db'];

QApp.addWidget('tips', function(element, opt) {

    // KamiTips.show(opt);

    KamiTips.show(opt);

    return {
        hide: function() {
            KamiTips.hide();
        }
    };

}, true);


    })( module.exports , module , __context );
    __context.____MODULES[ "412fdafd4e2b7739c300811c531dafa9" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "5af0d735d928064b6db94e75d2b9d406" ,
        filename : "dialog.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["dialog"] = "<div class=\"{{uiClass}} yo-dialog\">\n    {{#if header}}\n    <header class=\"hd\">\n        {{#if header.title}}\n        <h2 class=\"title \">{{header.title}}</h2>\n        {{/if}}\n        {{#if header.cancelBtn}}\n        <span class=\"regret \" data-role=\"close\" >{{header.cancelBtn.text}}</span>\n        {{/if}}\n        {{#if header.okBtn}}\n        <span class=\"affirm \" data-role=\"ok\" >{{header.okBtn.text}}</span>\n        {{/if}}\n    </header>\n    {{/if}}\n    {{#if content}}\n    <div class=\"bd \" data-role=\"content\">\n        {{content}}\n    </div>\n    {{/if}}\n    {{#if footer}}\n    <footer class=\"ft\">\n        {{#if footer.cancelBtn}}\n        <a href=\"javascript:void(0)\" class=\"yo-btn yo-btn-dialog yo-btn-l \" data-role=\"close\" >{{footer.cancelBtn.text}}</a>\n        {{/if}}\n        {{#if footer.okBtn}}\n        <a href=\"javascript:void(0)\" class=\"yo-btn yo-btn-dialog yo-btn-l \" data-role=\"ok\">{{footer.okBtn.text}}</a>\n        {{/if}}\n    </footer>\n    {{/if}}\n</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["dialog"];

    })( module.exports , module , __context );
    __context.____MODULES[ "5af0d735d928064b6db94e75d2b9d406" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "0d62f8c0bd2f21d4e3950f710c31bce1" ,
        filename : "dialog.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    

var Overlay =__context.____MODULES['d79271f5e1db960ae5a5827a5ebf276d'];
var DialogTpl =__context.____MODULES['5af0d735d928064b6db94e75d2b9d406'];
var Template =__context.____MODULES['9e11d69af7743de93f8c257f13101434'];
var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];


var CONTENT_CLASSNAME = 'js-dialog-content';
var TITLE_CLASSNAME = 'js-dialog-title';

var Dialog = Overlay.extend({
    options: {
        posObj: {
            self: ['center', 'center'],
            base: ['center', 'center']
        },
        align: 'center',
        hasMask: true,
        type: 'dialog',
        content: '',
        title: '',
        usePin: false,
        template: DialogTpl,
        // header: {
        //     cancelBtn: {
        //         text: '取消'
        //     },

        //     okBtn: {
        //         text: '保存'
        //     }
        // },
        // footer: {
        //     cancelBtn: {
        //         text: '取消'
        //     },
        //     okBtn: {
        //         text: '保存'
        //     }
        // },
        events : {
            'tap [data-role=close]' : function (event) {
                var btn = event.target;
                var widget = this;
                if (btn.disabled) {
                    return;
                }
                else {
                    btn.disabled = true;
                    widget.btnState.push(btn);
                    widget.trigger('cancel', btn);

                }

            },
            'tap [data-role=ok]': function (event) {
                var btn = event.target;
                var widget = this;
                if (btn.disabled) {
                    return;
                }
                else {
                    btn.disabled = true;
                    widget.btnState.push(btn);
                    widget.trigger('ok', btn);
                }
            }
        },
        onok: function () {
            this.onOkHandler();
        },
        oncancel: function () {
            this.onCancelHandler();
        }

    },

    onOkHandler: function (btn) {

        this.hide();
        // btn.disabled = false;

    },
    onCancelHandler: function (btn) {

        this.hide();
        // btn.disabled = false;

    },
    parseTemplate: function (tpl) {



        this.title = this.get('title');
        this.content = this.get('content') || '';

        this.header = this.get('header');// || {};

        if (this.header ||  this.title) { //有header或者有title那么设置headder对象
            this.header = this.header || {};
            this.header.title = this.header.title || this.title;
        }

        this.footer = this.get('footer') || {};
        // debugger

        return Template(tpl || DialogTpl, {
            uiClass: this.getClassName(),
            content: this.content,

            header: this.header,
            footer: this.footer
        });

        // this.content = htmlsafe(this.get('content') || '');

    },

    init: function () {
        Dialog.superClass.init.call(this);
        this.btnState = [];
    },
    hide: function () {

        Dialog.superClass.hide.call(this);
        for (var i = 0;i < this.btnState.length;i++) {
            this.btnState[i].disabled = false;
        }
        // this.destroy();

    },
    getContent: function () {
        return this.widgetEl.find('[data-role="content"]');
    },

    initUi: function () {

        Dialog.superClass.initUi.call(this);


        var align = this.get('align') || 'center';

        var dialogOffset = this.widgetEl.offset();
        var viewportOffset = {
            height: window.innerHeight,
            width: window.innerWidth
        };

        this.widgetEl.css('position', 'fixed');

        var left = (viewportOffset.width - dialogOffset.width) / 2;

        switch (align) {
        case 'center':
            this.widgetEl.css({
                'left': left + 'px',
                'top': (viewportOffset.height - dialogOffset.height) / 2 + 'px'
            });

            break;
        case 'top':
            this.widgetEl.css({
                'left': left + 'px',
                'top': 0
            });
            break;
        case 'bottom':
            var top = 0;
            if (dialogOffset.height < viewportOffset.height) {
                top = viewportOffset.height - dialogOffset.height;
            }
            this.widgetEl.css({
                'left': left + 'px',
                'top': top
            });
            break;
        default:
            break;
        }
    }

});
module.exports = Dialog;


    })( module.exports , module , __context );
    __context.____MODULES[ "0d62f8c0bd2f21d4e3950f710c31bce1" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1940106703ae84aadcf797b941220e74" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = __context.____MODULES['0d62f8c0bd2f21d4e3950f710c31bce1'];


    })( module.exports , module , __context );
    __context.____MODULES[ "1940106703ae84aadcf797b941220e74" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "75b57a04ac1f5c1d7e35208e043a0358" ,
        filename : "alert.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var Dialog =__context.____MODULES['1940106703ae84aadcf797b941220e74'];


var dialog = null;



var KamiAlert = {
    show: function (opt) {
        
        if (dialog == null) {
            var header = null;
            if (opt && opt.title) {
                header = {
                    title: opt.title
                };

            }
            var _opt = {
                content: (opt && opt.content) || '内容',
                extraClass: opt && opt.extraClass || '',
                // template: (opt && opt.template) || null,
                footer: {
                    okBtn: {
                        text: (opt && opt.okText) || '确定'
                    }
                },
                align: (opt && opt.align) || 'center',
                hasMask: (opt && opt.hasMask === false) ? false : true,
                stylesObj: opt && opt.stylesObj,
                resizable: !!(opt && opt.resizable),
                onok: function () {
                    
                    if (opt && opt.onok) {
                        opt.onok.call(KamiAlert, function() {
                            KamiAlert.hide();
                        });
                    }
                    else {
                        KamiAlert.hide();    
                    }
                    
                }
            };
            header && (_opt.header = header);
            (opt && opt.template) && (_opt.template = opt.template);
            dialog = new Dialog(_opt);
            dialog.show();      
        }
        else if (dialog.visiable) {
            return;
        }
        else {
            dialog.show();
        }
        
    },
    hide: function () {
        if (!!dialog) {
            dialog.hide();
            dialog.destroy();
            dialog = null;
        } 
    }
};
module.exports = KamiAlert;
      

    })( module.exports , module , __context );
    __context.____MODULES[ "75b57a04ac1f5c1d7e35208e043a0358" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a3457ccc2a71118d5547c6c33e7e4b04" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['75b57a04ac1f5c1d7e35208e043a0358']

    })( module.exports , module , __context );
    __context.____MODULES[ "a3457ccc2a71118d5547c6c33e7e4b04" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "10093e6bec1d62e02277882defdcb4ee" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["alert"] = __context.____MODULES['a3457ccc2a71118d5547c6c33e7e4b04'];
module.exports = obj["alert"];

    })( module.exports , module , __context );
    __context.____MODULES[ "10093e6bec1d62e02277882defdcb4ee" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6c9fba6928ea04e68414175795d6bfe3" ,
        filename : "confirm.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var Dialog =__context.____MODULES['1940106703ae84aadcf797b941220e74'];


var dialog = null;

var KamiConfirm = {
    show: function (opt) {
        if (dialog == null) {

            var header = null;
            if (opt && opt.title) {
                header = {
                    title: opt.title
                };

            }
            var _opt = {
                content: (opt && opt.content) || '内容',
                extraClass: opt && opt.extraClass || '',
                align: (opt && opt.align) || 'center',
                hasMask: (opt && opt.hasMask === false) ? false : true,
                stylesObj: opt && opt.stylesObj,
                resizable: !!(opt && opt.resizable),
                footer: {
                    okBtn: {
                        text: (opt && opt.okText) || '确定'
                    },
                    cancelBtn: {
                        text: (opt && opt.cancelText) || '取消'
                    }
                },
                onok: function () {
                    if (opt && opt.onok) {
                        opt.onok.call(KamiConfirm, function () {
                            KamiConfirm.hide();
                        });
                    }
                    else {
                        KamiConfirm.hide();
                    }
                    // KamiConfirm.hide();
                },
                oncancel: function () {
                    if (opt && opt.oncancel) {
                        opt.oncancel.call(KamiConfirm, function () {
                            KamiConfirm.hide();
                        });
                    }
                    else {
                        KamiConfirm.hide();
                    }
                    // KamiConfirm.hide();
                }
            };
            header && (_opt.header = header);
            (opt && opt.template) && (_opt.template = opt.template);
            dialog = new Dialog(_opt);
            dialog.show();
        }
        else if (dialog.visiable) {
            return;
        }
        else {
            dialog.show();    
        }
        
        
    },
    hide: function () {
        if (!!dialog) {
            dialog.hide();
            dialog.destroy();
            dialog = null;
        } 
    }
}
module.exports = KamiConfirm;  

    })( module.exports , module , __context );
    __context.____MODULES[ "6c9fba6928ea04e68414175795d6bfe3" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ef6cc7531a1a6f7d5764a3cf4aa980a2" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['6c9fba6928ea04e68414175795d6bfe3']

    })( module.exports , module , __context );
    __context.____MODULES[ "ef6cc7531a1a6f7d5764a3cf4aa980a2" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "5667db7708d819de2fec63d01101ccd9" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["confirm"] = __context.____MODULES['ef6cc7531a1a6f7d5764a3cf4aa980a2'];
module.exports = obj["confirm"];

    })( module.exports , module , __context );
    __context.____MODULES[ "5667db7708d819de2fec63d01101ccd9" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "089ac77de682ff7ac4fc6a86ca7f2431" ,
        filename : "dialog.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['9487578d3e42bc2a142f3d268c5606e5'];

var QApp = window.QApp,
    _ = QApp.util,
    KamiAlert = QApp.Kami.alert =__context.____MODULES['10093e6bec1d62e02277882defdcb4ee'],
    KamiConfirm = QApp.Kami.confirm =__context.____MODULES['5667db7708d819de2fec63d01101ccd9'];
// debugger
var list = [];

function addId(id) {
    list.push(id);
}

function removeId(id) {
    list.splice(list.indexOf(id), 1);
}

QApp.Kami = QApp.Kami || {};

QApp.Kami.hasDialog = function() {
    return !!list.length;
};

QApp.addWidget('alert', function (element, opt) {

    var id = setTimeout('1');

    addId(id);

    KamiAlert.show(_.extend({}, {
        onok: function () {
            if (_.isFunction(opt.onComplete)) {
                opt.onComplete();
                this.hide();
            }
            else {
                this.hide();
            }
            
            removeId(id);
        }
    }, 
    opt));

}, 'tap');

QApp.addWidget('confirm', function  (element, opt) {

    var id = setTimeout('1');

    addId(id);

    KamiConfirm.show(_.extend({}, {
        onok: function () {
            
            if (_.isFunction(opt.onComplete)) {
                opt.onComplete(true);
                this.hide();
            }
            else {
                this.hide();
            }
            // this.hide();
            removeId(id);
        },
        oncancel: function () {
            if (_.isFunction(opt.onComplete)) {
                opt.onComplete(false);
                this.hide();
            }
            else {
                this.hide();
            }
            // this.hide();
            removeId(id);
        }
    }, opt));

}, 'tap');


    })( module.exports , module , __context );
    __context.____MODULES[ "089ac77de682ff7ac4fc6a86ca7f2431" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4ce9cb1bc0a43d03587b3cb9b70ba2f7" ,
        filename : "selectitemlist.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["selectitemlist"] = "<div class=\"{{uiClass}} yo-select-item-list\" data-role=\"list-wrap\"> \n    <!-- ui-select-item-list -->\n    <ul class=\"{{listClass}}\" data-role=\"list\">\n        {{#each list as item}}\n        <li class=\"{{itemClass}}\" value=\"{{item.value}}\" data-role=\"list-item\">{{item.text}}</li>\n        {{/each}}\n    </ul>\n</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["selectitemlist"];

    })( module.exports , module , __context );
    __context.____MODULES[ "4ce9cb1bc0a43d03587b3cb9b70ba2f7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4b85e486420da56e43a447d5502ff2ab" ,
        filename : "selectitemlist.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    
 ;(function () {

    /**
     * datasource like
     * [
     *     {vale: value, text:text}
     * ]
     */
   
    
    var SelectItemListTpl =__context.____MODULES['4ce9cb1bc0a43d03587b3cb9b70ba2f7'];
    var Widget =__context.____MODULES['727699dca154f9ef72d5e879dadfb5a5'];
    var Template =__context.____MODULES['9e11d69af7743de93f8c257f13101434'];
    var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];



    var isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));
    var isBadIphone = false;
    var SelectItemList = Widget.extend({

        options: {
            showline: true,
            datasource: [],
            type: 'select-item-list',
            displayCount: 5,
            curIndex: 0,
            infinite: false,
            use3d: true,
            template: SelectItemListTpl,
            onchangevalue: function (value, prevValue) {

            }
        },
        /**
         *  处理滚动事件
         * @return {[type]} [description]
         */
        renderEvent: function () {
            
            var widget = this;
            
            
            var touchStart =  function (e) {

                e.preventDefault();
                if (!widget.enable) {
                    return;
                }
                widget.isMoving = false;
                widget.prevItem = widget.getValue();
                // console.log('widget.prevItem=' + widget.getValue().value);
            
                // console.log('touchstart');
                var point = e.touches ? e.touches[0] : e;
                

                

                widget.initialte = 1;
                widget.moved = false;

                widget.distX      = 0;
                widget.distY      = 0;
                widget.directionX = 0;
                widget.directionY = 0;

                widget.y = widget._getY();
                widget.x = widget._getX();
                // widget._transitionTime();
                widget._translate(widget.x, widget.y);


                widget.startX    = widget.x;
                widget.startY    = widget.y;
                widget.absStartX = widget.x;
                widget.absStartY = widget.y;
                widget.pointX    = point.pageX;
                widget.pointY    = point.pageY;

                widget.startTime = new Date().getTime();

                widget.scrollX = false;    //滑动方向
                // alert(1)
            };
            
            var touchMove = function (e) {
                
                if (!widget.enable) {
                    return;
                }
                e.preventDefault();
                
                var point       = e.touches ? e.touches[0] : e,
                    deltaX      = point.pageX - widget.pointX,
                    deltaY      = point.pageY - widget.pointY,
                    timestamp   = new Date().getTime(),
                    newX, newY,
                    absDistX, absDistY;
                // console.log(e.touches);
                // console.log('widget.pointX:' + widget.pointX + 'widget.pointY:' + widget.pointY);
                widget.pointX     = point.pageX;
                widget.pointY     = point.pageY;
                // console.log('pointX:' + point.pageX + 'pointY:' + point.pageY);
                widget.distX      += deltaX;
                widget.distY      += deltaY;
                absDistX        = Math.abs(widget.distX);
                absDistY        = Math.abs(widget.distY);

                widget.isMoving = true;
                // console.log('endTime:' + (timestamp - widget.endTime), 'absDistY=' + absDistY);
                // We need to move at least 10 pixels for the scrolling to initiate
                if (timestamp - widget.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
                    // alert(123);
                    // console.log(123)
                    widget.isMoveing = false;
                    return;
                }
                if (widget.scrollX == true) {
                    
                    return;
                }
                if (absDistX > absDistY) {
                    widget.scrollX = true;

                    return;
                }
                deltaX = 0;

                newX = widget.x + deltaX;//0
                newY = widget.y + deltaY;

                // console.log('widget.y=' + widget.y, 'newY=' + newY, 'deltaY=' + deltaY);
                widget.deltaY = deltaY;
                widget.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

                widget.deltaT = timestamp - widget.startTime;

                

                
                if (widget.infinite) {
                    
                    if (Math.abs(newY - widget.startY) > widget.wrapperHeight) {
                        return;
                    }
                    else {

                        widget._translate(newX, newY);
                        //[处理惯性位移]
                        // if ( timestamp - this.startTime > 300 ) {
                        //     // debugger
                        //     this.startTime = timestamp;
                        //     this.startX = this.x;
                        //     this.startY = this.y;

                        // }
                        widget.scrollItems();
                    }
                    
                    
                }
                else {
                    
                    var offset = 2 * widget.itemHeight;
                    var _newY = newY;
                    if (newY <= widget.limitOffset - offset || newY >= widget.initOffset + offset) {
                        //非infinite的情况下如果是超过最大限最小限那么直接return
                        _newY = (newY - (deltaY * 9 / 9));
                        // return;//return后导致android机器出现 touchend不执行的问题
                    }
                    widget._translate(newX, _newY);
                    widget.slideItems(); 

                    
                }
                
                
            };
            var touchEnd = function (e) {
                
                if (!widget.enable) {
                    return;
                }

                e.preventDefault();
                // debugger
                var point = e.changedTouches ? e.changedTouches[0] : e,
                    momentumX,
                    momentumY,
                    duration = new Date().getTime() - widget.startTime,
                    newX = Math.round(widget.x),
                    newY = Math.round(widget.y),
                    distanceX = Math.abs(newX - widget.startX),
                    distanceY = Math.abs(newY - widget.startY),
                    time = 0,
                    easing = '';

                widget.endTime = new Date().getTime();

                //[处理惯性位移]
                // var speed = widget.deltaY / widget.deltaT;
                // var B = 0.004;
                // // console.log('时间:' + duration);
                // // console.log('速度:' + speed);
                // // console.log('偏移:' + distanceY + '瞬时偏移' + widget.deltaY);
                // var inertiaY = Math.floor(Math.pow(speed, 2) / 2 * B);
                // if (speed < 0) {
                //     inertiaY *= -1;
                // }

                // // console.log('惯性位移' + inertiaY);
                // // console.log('newY' + newY);
                // newY += inertiaY;



                
                
                // console.log('touchEnd');

                
                if (!widget.isMoving) { //表示用户未滚动过， 直接点击
                    
                    var prevValue = widget.getValue();
                    var roleName = e.target.getAttribute('data-role');
                    
                    if (! ('list-item' ===  roleName)) {
                        //not 
                    }
                    else {
                        if (!e.target.classList.contains(widget.get('disableCls'))) {
                            var newValue = e.target.getAttribute('value');

                            if (prevValue.value != newValue) {
                                widget.setValue(e.target.getAttribute('value'));

                            }
                        }
                        
                    }
                    
                }
                else  {
                    if (widget.infinite) {
                        var remainY = (newY % widget.itemHeight);
                        if (remainY != 0) {
                            if (remainY <= Math.floor(widget.itemHeight / 2)) {
                                newY = newY - remainY;
                            }
                            else {
                                newY = newY - remainY + widget.itemHeight;
                            }
                        }
                        widget._translate(newX, newY);  // ensures that the last position is rounded
                        widget.scrollItems();
                    }
                    else {
                        
                        if (newY <= widget.limitOffset) {
                            newY = widget.limitOffset;
                        }
                        else if (newY >= widget.initOffset) {
                            newY = widget.initOffset;
                        }
                        else {
                            var remainY = (newY % widget.itemHeight);
                            if (remainY != 0) {
                                if (remainY <= Math.floor(widget.itemHeight / 2)) {
                                    newY = newY - remainY;
                                }
                                else {
                                    newY = newY - remainY + widget.itemHeight;
                                }
                            }
                        }
                        widget._scrollTo(newX, newY);
                        widget.slideItems();
                    }

                    widget.item = widget.getValue();
                    
                    if (widget.item.value !== widget.prevItem.value) {
                        
                        widget.trigger('change:value', widget.item, widget.prevItem);
                        
                    }
                }
                
            };
            

            this._start = touchStart;
            this._move = touchMove;
            this._end = touchEnd;

            this.container.addEventListener('touchstart', this._start);
            this.container.addEventListener('touchmove', this._move);
            this.container.addEventListener('touchend', this._end);
            this.container.addEventListener('touchcancel', this._end);
        },
        

        _scrollTo: function (x, y, time, easing) {
            
            var style = 'cubic-bezier(0.1, 0.57, 0.1, 1)';
           
            this._transitionTimingFunction(style);
            this._transitionTime(time);
            this._translate(x, y);
        },
        _getOffset: function (el) {
            var left = -el.offsetLeft,
                top = -el.offsetTop;

            // jshint -W084
            while (el = el.offsetParent) {
                left -= el.offsetLeft;
                top -= el.offsetTop;
            }
            // jshint +W084

            return {
                left: left,
                top: top
            };
        },

        _transitionTime: function (time) {
            var defaultTime = 0;
            if (!this.infinite) {
                defaultTime = 0;
            }
            
            time = time || defaultTime;
            this.itemListContainer.style['-webkit-transition-duration'] = time + 'ms';
            // this.itemListContainer.style['transition-duration'] = time + 'ms';
            
            if (!time && isBadAndroid) {
                this.itemListContainer.style['-webkit-transition-duration'] = '0.001s';
            }



        },
        _translate: function (x, y) {
            var str = 'translateY(' + y + 'px )';
            if (this.get('use3d')) {
                str += this.translatez;
            }
            this.itemListContainer.style['-webkit-transform'] = str;
            this.x = 0;
            this.y = y;
            

        },
        _transitionTimingFunction: function (easing) {
            this.itemListContainer.style['-webkit-transition-timing-function'] = easing;
            // this.itemListContainer.style['transition-timing-function'] = easing;

        },
        _getX: function (el) {
            return 0;
        },
        _setX: function (el, x) {
            // this.x = 0;
            return;
        },
        _setY: function (el, y) {
            if (typeof el === 'string' || typeof el === 'number') {
                y = el;
                el  = this.itemListContainer;
            }

            var str = 'translateY(' + y + 'px )';
            if (this.get('use3d')) {
                str += this.translatez;
            }
            // el.style['-webkit-transform'] = 'translate3d(0, ' + y + 'px, 0)';
            // el.style['transform'] = 'translate3d(0, ' + y + 'px, 0)';
            el.style['-webkit-transform'] = str;
            // el.style['transform'] = str;
            // el.style['-webkit-transform'] = 'translateY(' + y + 'px) translateZ(0px)';
            // el.style['transform'] = 'translateY(' + y + 'px) translateZ(0px)';
            // this.y = y;
        },
        _getY: function (el) {
            el = el || this.itemListContainer;
            // debugger
            var transform = el.style['transform'] || el.style['-webkit-transform'];
            // var match = transform.match(/\s([^,]*)px,/);
            var match = transform.match(/translateY\(([\-0-9]+)px\)/);
            var y = 0;
            if (match && match.length > 1) {
                y = match[1];
            }
            y = parseInt(y, 10);
            return y;
        },
        /**
         * 处理数据
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        _getData: function (index) {
            index = index || this.curIndex;
            
            
            
            var ds = this.datasource;
            var list = [];
            var size = this.cacheSize;
            if (!this.infinite) {
                size = this.datasource.length;
            }
            
            if (index >= ds.length || index < 0) {
                return [];
            }
            else {
                
                for (var i = 0;i < size; i++) {
                    if (this.infinite) {
                        list.push({value: ' ', text: ' '});    
                    }
                    else {
                        list.push({value: this.datasource[i].value, text: this.datasource[i].text});
                    }
                    
                }
                return list;
            }
        },
        /**
         * 如果不是infinite的形式，那么采用这种方式来进行滚动
         * 
         * @return {[type]} [description]
         */
        slideItems: function () {
            
            var deltaY = this.initOffset - this.y;
            var curIndex = Math.floor(deltaY / this.itemHeight);
            this.curIndex = curIndex;
            for (var i = 0;i<this.itemList.length;i++) {
                $(this.itemList[i]).removeClass('cur-select');
            }
            if (this.curIndex >= 0 && this.curIndex < this.itemList.length) {
                $(this.itemList[i]).addClass('cur-select');
            }
            

        },
        /**
         * 对ios特别版本进行hack
         */
        _addBadIphone: function () {
            setTimeout(function () {}, 0);
        },
        /**
         * infinite 为true的 下拉框的滚动方法
         * 
         * @return {[type]} [description]
         */
        scrollItems: function () {

            
            /**
             * 此处不考虑container的小大和给的总高度不一致的情况
             * @type {[type]}
             */
            //如果滚动没有超过itemHeight，那么是0；
            var curY = this.y;
            curY = parseInt(curY, 10);
            var absY = Math.abs(curY);

            

            if (isBadIphone) {
                // console.log('bad iphone');
                // alert('bad iphone')
                this._addBadIphone(); 
            }
            
            // 1为滚动向上， -1 为向下
            var direction = 1;

            if (curY > 0) {
                direction = -1;
            }
            else {
                direction = 1;
            }
            
            
            var size = this.cacheSize;

            var scrolledItemCount = Math.floor(absY / this.itemHeight);

            

            var curIndex = direction * scrolledItemCount;

            

            this.curIndex = curIndex;


            var tIndexArr = [];
            var halfLength = (size - 1) / 2;
            var i = null;

            // var degArr = [];
            // var degItem = 20;
            // var skew = [];
            // var leftArr = [];
            for (i = halfLength; i >= 0; i--) {
                tIndexArr.push(curIndex - i);
                // degArr.push(degItem * i );
                // skew.push(-i);
                // leftArr.push(i);
            }
            
            for (i = 1; i <= halfLength; i++) {
                tIndexArr.push(curIndex + i);
                
                // degArr.push(degItem * i );
                // skew.push(i);
                // leftArr.push(-i);
            }
            
            //console.log('this.y='+ this.y + ' direction=' +  direction +' scrolledItemCount='+ scrolledItemCount +' curIndex='+ curIndex + ' tIndexArr=' + tIndexArr);

            for (i = 0; i < tIndexArr.length; i++) {

                var domIndex = tIndexArr[i] % size;
                if (domIndex < 0) {
                    domIndex = domIndex + size;
                }
                var dom = this.itemList[domIndex];



                var itemIndex = tIndexArr[i] % (this.datasource.length);
                if (itemIndex < 0) {
                    itemIndex += this.datasource.length;
                }
                var itemData = this.datasource[itemIndex];
                var halfDisplayLength = (this.displayCount - 1) / 2;
                var top = (tIndexArr[i] + halfDisplayLength) * this.itemHeight;
                

                var str = 'translateX(0px) translateY({{top}}px)';
                str = str.replace('{{top}}', top);
                str += this.translatez;
                // console.log(i, halfLength + 1, itemData.text);
                if (i == (halfLength)) {
                    $(dom).removeClass('cur-select');
                }
                else {
                    $(dom).removeClass('cur-select');
                }

                // debugger
                dom.style['-webkit-transform'] = str;


                // if (i==1) {
                //     dom.style['-webkit-mask-image'] = '-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0)),to(rgba(255,255,255,1)))';
                // }
                // else if (i == 5) {
                //     dom.style['-webkit-mask-image'] = '-webkit-gradient(linear,left bottom,left top,from(rgba(255,255,255,0)),to(rgba(255,255,255,1)))';
                // }
                // else {
                //     dom.style['-webkit-mask-image'] = '';
                // }

                // this._setY(dom, top);
            
                
                dom.innerHTML = itemData.text || itemData;
                dom.setAttribute('value', itemData.value == null ? itemData : itemData.value);
                // dom.style.display = 'block';
            }
            tIndexArr.length = 0;


        },
        
        init: function () {

            /**
             * 初始化好数据
             * @type {[type]}
             */
            
            var ds = this.get('datasource') || [];
            
            this.datasource = ds || [];
            this.displayCount = parseInt(this.get('displayCount'), 10);
            this.lineTpl = this.get('lineTpl');
            this.infinite = this.get('infinite');


            
            //displayCount 超过数据的个数，默认设置为数据总个数
            if (ds.length  - this.displayCount < 2) {
                // this.displayCount = ds.length;
                // this.set('displayCount', this.displayCount);
                this.infinite = false;
                this.cacheSize = this.displayCount;
                this.curIndex = 0;
                return;
                
                
            }
            //如果displayCount为偶数，那么先+1
            if (this.displayCount % 2 === 0) {
                this.displayCount++;
                this.set('displayCount', this.displayCount);
            }
            /*如果是设置的displayCount为偶数，或者this.displayCount的个数不够滚动，那么设置this.infinite为false*/
            if (this.displayCount > ds.length) {
                if (this.infinite) {
                    this.displayCount = ds.length;
                    this.set('displayCount', this.displayCount);
                    this.infinite = false;
                    console.log('displayCount is not enough ,so use limit slide automatically!');    
                }
                
            }

            this.cacheSize = this.displayCount;
            if (this.displayCount + 2 <= ds.length) {

                this.cacheSize = this.displayCount + 2;
            }
            
            this.curIndex = 0;
            


        },
        setValue: function (value) {
            // console.log('setValue 了');
            var prevItem = this.getValue();
            var indexOfValue = this._getIndexByValue(value);
            this.curIndex = indexOfValue % this.datasource.length;
            var nowItem = null;
            /**
             * 如果是infinite 的话需要不同的处理方式
             */
             
            if (this.infinite) {
                
                this._translate(0, -1 * this.curIndex * this.itemHeight);

                nowItem = this.getValue();
                
                this.scrollItems();
                
            }
            else  {
                this._translate(0, this.initOffset - 1 * this.curIndex * this.itemHeight);
                nowItem = this.getValue();
                this.slideItems();
            }
            this.trigger('change:value', nowItem, prevItem);
            

        },
        getValue: function () {
            var index = this.curIndex;
            index = index % this.datasource.length;
            if (index < 0) {
                index += this.datasource.length;
            }
            return this.datasource[index];
        },
        _getIndexByValue: function (value) {
            var widget = this;
            var ds = widget.get('datasource');
            var curIndex = null;
            ds.forEach(function (item, index) {
                var v = item.value == null ? item : item.value;
                if (v == value) {
                    curIndex = index;
                    return false;
                }
            });
            return curIndex;
        },
        /**
         * 重绘组件，重新init,然后调用自身的渲染
         * @param  {[type]} ds [description]
         * @return {[type]}    [description]
         */
        repaint: function (ds) {
            // this.setDataSource(ds);
            this.init();
            this.render();
        },
        /**
         * 设置数据源并且重绘组件
         * @param {[type]} ds [description]
         */
        setDataSource: function (ds) {
            
            this.set('datasource', ds);
            this.datasource = ds;
            var list = $(this.container).find('[data-role=list-wrap]');
            list.remove();
            this.repaint();
        },

        _getElementHtml: function (data) {
            data = data || this.datasource;
            
            // debugger
            var html = Template(this.get('template') || SelectItemListTpl, {
                list: data,
                uiClass: this.getClassName(),
                itemClass: this.getClassName('item'),
                listClass: this.getClassName('list')
            });
            
            var firstElement = null;
            // debugger
            if (this.container.children.length > 0) {
                firstElement = this.container.children[0];
            }
            if (firstElement != null) {
                this.container.insertAdjacentHTML('afterBegin', html);
            }
            else {
                this.container.innerHTML = html;
            }
            
        },
        render: function () {
            
            this.container = this.container.length ? this.container[0] : this.container;

            var ds = this._getData();
            this._getElementHtml(ds);
            
            this._initProp();
            this._initUi();



            var value = this.get('value');
            if (value != null) {
                this.setValue(value);
            }
            if (!this.hasRenderEvent) {
                this.renderEvent();
                this.hasRenderEvent = true;    
            }
            
        },
        _initUi: function () {
            // debugger
            if (this.infinite) {
                this._transitionTime();
                this.scrollItems();
            }
            else {
                this._translate(0, this.initOffset);

                for (var i = 0; i < this.itemList.length; i++) {
                    var item = this.itemList[i];
                    item.style['position'] = 'static';
                }
                this.slideItems();
            }
            
            this.container.style['overflow'] = 'hidden';
        },
        _initProp: function () {
            
            this.itemList = this.container.querySelectorAll('[data-role=list-item]');

            
            
            var item = this.itemList.length > 0 ? this.itemList[0] : null;
            
            this.wrapperHeight = this.container.clientHeight;
            


            this.itemHeight = item ? item.offsetHeight : 0;
            this.itemLength = this.itemList.length;
            
            if (this.itemHeight <= 0) {
                throw new Error(item + '的高度不能为0，请确保组件的容器已经渲染到文档中');
            }
            this.itemListContainer = this.container.querySelector('[data-role=list]');
            this.containerHeight = this.get('height') || this.itemHeight * this.itemLength;
            

            //如果容器的高度比数据的渲染后的高度高，那么直接也直接采用滑动的方式,将infinite设置为false
            // if (this.containerHeight < this.itemListContainer.offsetHeight) {
            //     this.infinite = false;
            // }
            if (!this.infinite) {
                
                this.initOffset = Math.floor(this.displayCount / 2) * this.itemHeight;
                this.limitOffset = this.initOffset - this.itemHeight * (this.itemLength - 1);
            }
            
            this.enable = !!!this.get('disable');
            // console.log('this.enable = ' + this.enable);
            this.x = 0;
            this.y = 0;
            this.endTime = 0;
            this.directionX = 0;
            this.directionY = 0;

            this.translatez = 'translateZ(0px)';
            // console.log(this.itemHeight);

        },
        destroy: function () {
            
            this.container.removeEventListener('touchstart', this._start);
            
            this.container.removeEventListener('touchmove', this._move);
            this.container.removeEventListener('touchend', this._end);

            this.container.innerHTML = '';

            SelectItemList.superClass.destroy.call(this);
        }
    });
    if (typeof module != 'undefined' && module.exports) {
        module.exports = SelectItemList;
    }
}());

    })( module.exports , module , __context );
    __context.____MODULES[ "4b85e486420da56e43a447d5502ff2ab" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ef916c98239cf68cd9d1055cce3260d5" ,
        filename : "select.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["select"] = "<div class=\"{{uiClass}} yo-select {{extraClass}}\">\n    {{#each list as section}}\n    <div class=\"{{itemClass}} yo-select-item\" data-role=\"item\">\n        <!-- container  select-item-->\n        {{#if section.tag}}\n        <span class=\"{{tagClass}} yo-select-item-tag\">{{section.tag}}</span>\n        {{/if}}\n        \n    </div>\n    {{/each}}\n    <div class=\"mask\" data-role=\"mask\"></div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["select"];

    })( module.exports , module , __context );
    __context.____MODULES[ "ef916c98239cf68cd9d1055cce3260d5" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9e2a49d3be88fca42f0cc661aff2c35d" ,
        filename : "select.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    
 ;(function () {

    /**
     * datasource like
     * [
     *     {vale: value, text:text}
     * ]
     */
   
    //depandance Widget
    //
    var Widget =__context.____MODULES['727699dca154f9ef72d5e879dadfb5a5'];
    var SelectItemList =__context.____MODULES['4b85e486420da56e43a447d5502ff2ab'];
    var SelectTpl =__context.____MODULES['ef916c98239cf68cd9d1055cce3260d5'];
    var Template =__context.____MODULES['9e11d69af7743de93f8c257f13101434'];
    var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];


    var Select = Widget.extend({
 
        options: {
            type: 'select',
            showline: true,//是否显示参考线
            displayCount: 5,
            datasource: [
                {
                    key: '',
                    tag: '',
                    datasource: []

                },
                {
                    key: '',
                    tag: '',
                    datasource: []

                }
            ],
            extraClass: '',
            template: SelectTpl,
            value: {},
            infinite: true,
            onchangevalue: function(key, value, pvalue) {

            }
            
        },
        //空方法，子类区覆盖
        renderEvent: function () {
            

        },
        
        init: function () {
            this.datasource = this.get('datasource') || [];
            
            this._widgetMap = this.get('_widgetMap') || {};


        },
        /**
         * 设置select的值
         * @param {String} key   select列的索引
         * 
         * @param {Object | String} value 需要设置的值
         */
        setValue: function (key, value) {
            var ctrl = this._widgetMap[_getChildCtrlName(key)];
            if (ctrl && ctrl instanceof SelectItemList) {
                
                ctrl.setValue(value);
            }
        },
        /**
         * 设置select列的数据源
         * @param {String} key   select列的索引
         * @param {Array} ds  新的数据源
         */
        setDataSource: function (key, ds) {
            // debugger
            var ctrl = this._widgetMap[_getChildCtrlName(key)];
            if (ctrl && ctrl instanceof SelectItemList) {
                // console.log('setValue 了');
                ctrl.setDataSource(ds);
            }
        },
        /**
         * 获取当前列的值
         * @param  {String} key 列的索引
         * @return {Object | String}    该列对应的当前值
         */
        getValue: function (key) {
            
            var value = {};
        
            for (var ctrlKey in this._widgetMap) {
                if (this._widgetMap.hasOwnProperty(ctrlKey)) {
                    var curKey = _getKeyName(ctrlKey);
                    var ctrl = this._widgetMap[ctrlKey];
                    if (!key || key === curKey) {
                        value[curKey] = ctrl.getValue();    
                    }
                    
                }
            }    
            
            return value;

        },
        /**
         * 解析模板
         * @param  {String} tpl 待解析的模板
         * @return {String}     解析后的模板
         */
        parseTemplate: function (tpl) {
            var data = this.datasource;
            
            
            var html = Template(tpl || SelectTpl, {
                list: data,
                uiClass: this.getClassName(),
                itemClass: this.getClassName('item'),
                tagClass: this.getClassName('item-tag'),
                extraClass: this.get('extraClass') ? this.getClassName(this.get('extraClass')) : ''
            });
            return html;
        },
        
        
        /**
         * 初始化子组件，并且设置当前组件的样式
         */
        render: function () {
            
            Select.superClass.render.call(this);

            this.initProp();

            this.initUi();

            var valueObj = this.get('value');

            if (!$.isEmptyObject(valueObj)) {
                for (var key in valueObj) {
                    if (valueObj.hasOwnProperty(key)) {
                        this.setValue(key, valueObj[key]);
                    }
                }
            }
            this.renderEvent();
        },
        /**
         * 设置select组件遮罩的样式
         */
        initUi: function () {
            
            
            
            if (!this.mask.length || (this.mask[0] == null)) {
                return;
            }
            // var str = '-webkit-linear-gradient(top,rgba(255,255,255,1),rgba(255,255,255,.3) {{part1}}%,rgba(255,255,255,.3) {{part1}}%,transparent {{part2}}%,rgba(255,255,255,.3) {{part2}}%,rgba(255,255,255,1));';
            var str = '-webkit-linear-gradient(top, rgb(255, 255, 255), ' +
                    'rgba(255, 255, 255, .2) {{part1}}%, ' +
                    'transparent {{part1}}%, transparent {{part2}}%, ' +
                    'rgba(255, 255, 255, 0.298039) {{part2}}%, rgb(255, 255, 255))';
            var displayCount = this.get('displayCount') || 5;
            var part1 = 100 * (displayCount - 1) / 2 / displayCount;
            var part2 = 100 - part1;
            str = str.replace(/\{\{part1\}\}/g, part1);
            str = str.replace(/\{\{part2\}\}/g, part2);
            // console.log(str);
            this.mask.css('background', str);
        },
        
        initProp: function () {
            
            var widget = this;
            this.sectionItemListDom = this.widgetEl[0].querySelectorAll('[data-role=item]');
            this.mask = $(this.widgetEl).find('[data-role=mask]');
            
            for (var i = 0; i < this.sectionItemListDom.length; i++) {
                (function (dom, index) {
                    // debugger
                    var options = {
                        showline: false,
                        container: dom,
                        displayCount: widget.get('displayCount') || 3,
                        infinite: !!widget.get('infinite'),
                        onchangevalue: function (value, prevValue) {
                            // console.log(widget._event);
                            
                            widget.trigger('change:value', widget.datasource[index].key, value, prevValue);
                        }
                    };
                    if (widget.get('itemTemplate')) {
                        options.template = widget.get('itemTemplate');
                    }
                    $.extend(options, widget.datasource[index]);

                    widget._widgetMap[_getChildCtrlName(widget.datasource[index].key)] = new SelectItemList (
                    
                        options
                    );
                    var ctrl = widget._widgetMap[_getChildCtrlName(widget.datasource[index].key)];
                    ctrl.render();

                } (this.sectionItemListDom[i], i));
                
            }
            
        }
        
    });
    /**
     * 生成内部的子控件的名称
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    function _getChildCtrlName(name) {
        return 'section_' + name;
    }
    /**
     * 获得控件的原始名字
     * @param  {[type]} ctrlName [description]
     * @return {[type]}          [description]
     */
    function _getKeyName(ctrlName) {
        var index = ctrlName.indexOf('_');
        if ( index !== -1) {
            return ctrlName.substr(index+1);
        }
    }
    module.exports = Select;
}());

    })( module.exports , module , __context );
    __context.____MODULES[ "9e2a49d3be88fca42f0cc661aff2c35d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "60921ac181e1be142cd0c089366b8a3e" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['9e2a49d3be88fca42f0cc661aff2c35d'];


    })( module.exports , module , __context );
    __context.____MODULES[ "60921ac181e1be142cd0c089366b8a3e" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "5e67968c3f3df464bde2f4b04a423f30" ,
        filename : "calendar.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["calendar"] = "<div class=\"{{uiClass}} yo-calendar yo-select {{extraClass}}\">\n    {{#each list as section}}\n    <div class=\"{{itemClass}} yo-select-item\" data-role=\"item\">\n        <!-- container  select-item-->\n        {{#if section.tag}}\n        <span class=\"{{tagClass}} yo-select-item-tag\">{{section.tag}}</span>\n        {{/if}}\n    </div>\n    {{/each}}\n    <div class=\"mask\" data-role=\"mask\"></div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["calendar"];

    })( module.exports , module , __context );
    __context.____MODULES[ "5e67968c3f3df464bde2f4b04a423f30" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "de071b66e142bb4e1debc3df8142e2e9" ,
        filename : "base.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    QApp.Kami = window.Kami = {};
window.kamiData = window.kamiData || {};
QApp.util.createStyle([
    '.kami-header {position: relative; width: 100%; height: 40px;line-height: 40px}',
    '.kami-header .ar {right: 10px;}',
    '.kami-header .al {left: 10px;}',
    '.kami-header .btn {position: absolute; top: 0; font-size: 12px;color: #419bf9;}',
    '.kami-header .title {text-align: center;}',
    '.kami-content {position: absolute; top: 40px; left: 0; right: 0; bottom: 0}'
].join(''));


    })( module.exports , module , __context );
    __context.____MODULES[ "de071b66e142bb4e1debc3df8142e2e9" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4326416a2bb9829a6bb5c91ccbd1794d" ,
        filename : "calendar.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**********************************************
// QApp.showWidget('popAvailable', {
//     dateRange: ['2015-10', '2035-06'],
//     now: '2015-10',
//     onComplete:function(v){
//         console.log(v)
//         // v.year.text
//         // v.month.text
//     }
// });
**********************************************/
    /**
     * datasource like
     * [
     *     {vale: value, text:text}
     * ]
     */

    //depandance Select
    //
    var Select =__context.____MODULES['60921ac181e1be142cd0c089366b8a3e'];
    var Widget =__context.____MODULES['727699dca154f9ef72d5e879dadfb5a5'];
    var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];
    var CalendarTpl =__context.____MODULES['5e67968c3f3df464bde2f4b04a423f30'];
    var MONTH = {
        TWO: 1
    };

    var Calendar = Widget.extend({
        options: {
            type: 'calendar',
            displayCount: 5,
            template: CalendarTpl,
            dateRange: [],//两个日期[2014-11-01,2015-12-31]
            now: null,
            infinite: false,//默认使用不循环的
            value: {
            }
        },

        init: function () {
            this.datasource = [
                {
                    key: 'year',
                    tag: '年',
                    datasource: []
                },{
                    key: 'month',
                    tag: '月',
                    datasource: [

                    ]

                }
            ];

            var now = this.get('now') || new Date();
            now = parseDate(now);
            this.now = new Date(now.getTime());

            this.dateRange = this.get('dateRange') || [];

            if (this.dateRange.length <= 0) {
                this.dateRange.push(new Date(now.getTime()));

                var future = new Date(now.setFullYear(now.getFullYear() + 10));
                this.dateRange.push(future);
            }
            if (typeof this.dateRange[0] == 'string'
                || typeof this.dateRange[0] == 'number') {
                for (var i = 0;i < this.dateRange.length; i++) {
                    this.dateRange[i] = parseDate(this.dateRange[i]);
                }
            }
            // this.now = this.get('now');
            if (!this.now || $.isEmptyObject(this.now)) {
                this.now = new Date();
            }
            if (typeof this.now == 'string') {
                this.now = parseDate(this.now);
            }
            if (this.now < this.dateRange[0] || this.now > this.dateRange[1]) {
                alert('now is not valid, now is must between dateRange');
                return;
            }

            var value = {
                year: this.now.getFullYear(),
                month: this.now.getMonth(),
                date: this.now.getDate()
            };

            this.datasource[0].datasource = _getYearDs(this.dateRange);
            this.datasource[1].datasource = _getMonthDs(this.dateRange, this.now, this.now.getFullYear());
            this.set('value', value);
        },
        getValue: function() {
            return this.innerSelect.getValue();
        },
        render: function () {

            this._initUi();
            this.innerSelect.render();
        },
        _initUi: function () {
            var widget = this;
            this.innerSelect = this._widgetMap['select'] = new Select({
                template: widget.get('template'),
                displayCount: widget.get('displayCount'),
                datasource: widget.datasource,
                infinite: !!widget.get('infinite'),
                value: widget.get('value'),
                container: widget.get('container'),
                showline: true,//是否显示参考线
                onchangevalue: function (key, curItem, prevItem) {
                    widget._changeValue(key, curItem, prevItem);
                }
            });

            this.widgetEl = this.innerSelect.widgetEl;
            this.widgetEl.addClass(this.getClassName());
        },
        /**
         * 日历支持设置value
         * 必须同时设置年月日，因为确保年月日在有效的范围内
         * @param {[type]} valueObj [description]
         */
        setNow: function (now) {


            var _now = parseDate(now);

            if (_now <= this.dateRange[1] && _now >= this.dateRange[0]) {
                var year = _now.getFullYear();
                var month = _now.getMonth();
                var date = _now.getDate();

                this.innerSelect.setValue(Calendar.YEAR, year);
                this.innerSelect.setValue(Calendar.MONTH, month);
                this.innerSelect.setValue(Calendar.DAY, date);
            }
            else {
                throw new Error('the now time parsed is not valid');
            }
        },
        /**
         * 获取当前时间
         * @return {Date} 返回当前calendar对应的时间
         *
         */
        getNow: function () {
            var valueObj = this.getValue();
            var now = [];
            now.push(valueObj.year.value);
            now.push(1 + valueObj.month.value);
            now.push(valueObj.date.value);
            return Date.parse(now.join('-'));
        },
        /**
         * value change时的回调
         * @param  {String} key      calendar 列的索引
         * @param  {Object} curItem  当前被选中的项
         * @param  {Object} prevItem 之前被选中的项
         */
        _changeValue: function (key, curItem, prevItem) {
            // console.log('chagnevalue');
            // debugger
            if (key === 'year') {
                var year = curItem.value;
                var prevYear = prevItem.value;
                var month = this.innerSelect.getValue('month').month.value;


                var ds = _getMonthDs(this.dateRange, this.now, year);
                this.innerSelect.setDataSource('month', ds);


                month = this.innerSelect.getValue('month').month.value;
                ds = _getDateDs(this.dateRange, this.now, year, month);
                this.innerSelect.setDataSource('date', ds);


            }
            else if (key === 'month') {

                var year = this.innerSelect.getValue('year').year.value;
                var month = curItem.value;

                var ds = _getDateDs(this.dateRange, this.now, year, month);
                this.innerSelect.setDataSource('date', ds);
            }
            else {
                // return
            }
            // console.log(this.getValue());
        }
    });

    /**
     * 常量key
     *
     * @type {String}
     */
    Calendar.YEAR = 'year';
    Calendar.MONTH = 'month';
    Calendar.DAY = 'date';


    function parseDate(str) {
        try {
            if (typeof str == 'string') {
                return new Date(Date.parse(str));
            }
            else if (typeof str == 'number') {
                return new Date(str);
            }
            else {
                return str;
            }

        }
        catch (e) {
            throw new Error((e.msg || '') + 'date formate is not support now!!');
        }
    }
    function _getYearDs(dateRange) {
        var result = [];
        var beginYear = dateRange[0].getFullYear();
        var endYear = dateRange[1].getFullYear();
        for (var i = beginYear; i <= endYear; i++) {
            result.push({
                text: i,
                value: i
            });
        }
        return result;

    }

    function _getMonthDs(dateRange,curDate, year) {
        // debugger

        var result = [];
        var beginYear = dateRange[0].getFullYear();
        var endYear = dateRange[1].getFullYear();
        var beginMonth = null;
        var endMonth = null;
        // debugger

        if (year < beginYear) {
            beginMonth = dateRange[0].getMonth();
            endMonth = 11;
        }
        else if (year >= beginYear && year <= endYear) {
            if (year == beginYear) {
                if (year == endYear) {
                    beginMonth = dateRange[0].getMonth();
                    endMonth = dateRange[1].getMonth();
                }
                else {
                    beginMonth = dateRange[0].getMonth();
                    endMonth = 11;
                }
            }
            else if (year > beginYear) {
                if (year == endYear) {
                    beginMonth = 0;
                    endMonth = dateRange[1].getMonth();
                }
                else {
                    beginMonth = 0;
                    endMonth = 11;
                }
            }
            else {
                beginMonth = 0;
                endMonth = 11;
            }
        }
        else {
            beginMonth = 0;
            endMonth = dateRange[1].getMonth();
        }
        for(var i = beginMonth; i <= endMonth; i++) {
            result.push({
                text: i+1,
                value: i
            });
        }
        return result;
    }
    function _getDateDs(dateRange, curDate, year, month) {
        // debugger

        var result = [];
        var beginDate = null;
        var endDate = null;

        var beginYear = dateRange[0].getFullYear();
        var endYear = dateRange[1].getFullYear();

        var beginMonth = dateRange[0].getMonth();
        var endMonth = dateRange[1].getMonth();

        var days = _getDays(month, year);



        // debugger
        if (curDate < dateRange[0]) {
            beginDate = dateRange[0].getDate();
            endDate = days;
        }
        else if (curDate >= dateRange[0] && curDate <= dateRange[1]) {
            if (year == beginYear && month == beginMonth) {

                if( year == endYear && month == endMonth) {

                    beginDate = dateRange[0].getDate();
                    endDate = dateRange[1].getDate();

                }
                else {//< endYear
                    beginDate = dateRange[0].getDate();
                    endDate = days;
                }


            }
            else if (year == beginYear && month > beginMonth) {
                if (year == endYear && month == endMonth) {
                    beginDate = 1;
                    endDate = dateRange[1].getDate();
                }
                else {
                    beginDate = 1;
                    endDate = days;
                }
            }
            else if (year > beginYear && year < endYear) {
                beginDate = 1;
                endDate = days;
            }
            else if (year == endYear && month < endMonth) {
                beginDate = 1;
                endDate = days;
            }
            else if (year == endYear && month == endMonth){
                beginDate = 1;
                endDate = dateRange[1].getDate();
            }
        }
        else {
            beginDate = 1;
            endDate = dateRange[1].getDate();
        }
        for(var i = beginDate; i <= endDate; i++) {
            result.push({
                text: i,
                value: i
            });
        }
        return result;
    }
    function _getDays(month, year) {

        var now = new Date();
        month = month == null ? (now.getMonth()) : month;
        year = year == null ? (now.getFullYear()) : year;
        switch (month) {
        case 0:
        case 2:
        case 4:
        case 6:
        case 7:
        case 9:
        case 11:
            return 31;
        case 1:
            if ((year % 4) === 0) {
                return 29;
            }
            else {
                return 28;
            }
            break;
        default:
            return 30;

        }
    }
/////////////////////////////////////////////Adapter//////////////////////////////
__context.____MODULES['de071b66e142bb4e1debc3df8142e2e9'];

var QApp = window.QApp,
    _ = QApp.util;

var template = [
    '<div class="kami-header">',
    '<div class="btn ar">RIGHT</div>',
    '<div class="title">TITLE</div>',
    '<div class="btn al">CANCEL</div>',
    '</div>',
    '<div class="kami-content content">',
    '</div>'
].join('');

var DEFAULT_OPT = {
    dialogTemplate: template,
    router: true,
    popAni: 'actionSheet',
    barClass: 'popAvailable',
    title: '选择有效期',
    leftBtn: '取消',
    rightBtn: '确定',
    distance: 200,
    height: 200
};

DEFAULT_OPT.dateRange =  [],


QApp.addWidget('popAvailable', function(element, opt, view) {

    opt = opt || {};
    if (opt.popAni === 'popup' && opt.router === void 0) {
        opt.router = false;
    }

    var options = _.extend({}, DEFAULT_OPT, opt),
        open = (options.router && options.router !== 'false') ? QApp.router.open : QApp.showView,
        viewName = 'pop-calender';
    var tpl = options.dialogTemplate || template;
    QApp.defineView(viewName, {
        html: tpl.replace('RIGHT', options.rightBtn).replace('CANCEL', options.leftBtn).replace('TITLE', options.title),
        styles: _.extend({}, {backgroundColor: 'white'}, options.styles),
        ready: function() {
            var me = this;
            if (options.barClass) {
                _.addClass(me.root.querySelector('.kami-header'), options.barClass);
            }

            var calender = new Calendar(_.extend({}, options, {
                container: me.root.querySelector('.content'),
                dateRange: (opt.startDay && opt.endDay) ? [opt.startDay, opt.endDay] : (options.dateRange || []),
                now: opt.now || (new Date())
            }));

            calender.render();

            _.addEvent(me.root.querySelector('.al'), 'tap', function() {
                me.hide();
            });

            _.addEvent(me.root.querySelector('.ar'), 'tap', function() {
                me.trigger('callback', calender.getValue());
                me.hide();
            });

            me.on('destroy', function() {
                if (calender) {
                    calender.destroy();
                    calender = null;
                }
            });
        },
    });

    return open(viewName, _.extend({}, options, {
        param: options.param,
        ani: _.extend({}, options, {
            name: options.popAni
        }),
        onComplete: function(value) {

            value.year.text  = value.year.text.toString().slice(2);
            value.month.text = value.month.text.toString().replace(/^(\d)$/,'0$1');

            if (_.isFunction(options.onComplete)) {
                options.onComplete(value);
            }
            if (element) {
                _.dispatchEvent(element, options.callbackEvent || 'callback', value);
            }
        }
    }), element);
}, 'tap');

module.exports = {
    setOption: function(opt) {
        _.extend(DEFAULT_OPT, opt);
    }
};


    })( module.exports , module , __context );
    __context.____MODULES[ "4326416a2bb9829a6bb5c91ccbd1794d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e3db554a754df2770a450036fdbc5e81" ,
        filename : "cardAlert.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['de071b66e142bb4e1debc3df8142e2e9'];
var Dialog =__context.____MODULES['1940106703ae84aadcf797b941220e74'];
var $      =__context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];
var dialog = null;
var cardAlert = {
    show: function (opt) {

        if (dialog == null) {
            var header = null;
            if (opt && opt.title) {
                header = {
                    title: opt.title
                };
            }
            //kami自动清除了header，补回来
           if (opt && opt.header && header) {
               for(var k in opt.header){
                   header[k] = opt.header[k];
               }
           }
           var content = "";
           if (opt && opt.pic) {
               content += '<img src='+opt.pic+' width=150 height=89 >';
           }
            var _opt = {
                content: content+'<div class="text">'+((opt && opt.content) || '网络错误')+'</div>',
                extraClass:'yo-dialog-bindcard ' + (opt && opt.extraClass || ''),
                // template: (opt && opt.template) || null,
                footer: {
                    okBtn: {
                        text: (opt && opt.okText) || (opt && opt.error && '确认')|| '知道了'
                    }
                },

                onok: function () {

                    if (opt && opt.onok) {
                        opt.onok.call(cardAlert, function() {
                            cardAlert.hide();
                        });
                    }
                    else {
                        cardAlert.hide();
                    }

                },

                oncancel: function () {

                    if (opt && opt.oncancel) {
                        opt.oncancel.call(cardAlert, function() {
                            cardAlert.hide();
                        });
                    }
                    else {
                        cardAlert.hide();
                    }

                }
            };
            header && (_opt.header = header);
            (opt && opt.template) && (_opt.template = opt.template);
            (opt && opt.cancelText ) && (_opt.footer.cancelBtn = {text:opt.cancelText});

            dialog = new Dialog(_opt);

            if(dialog){
                var img = $("img",dialog.widgetEl[0]);
                if(img.length){
                    img.on('load',function() {
                        dialog.show();
                    });
                }else{
                    dialog.show();
                }
            }


        }
        else if (dialog.visiable) {
            return;
        }
        else {
            dialog.show();
        }
    },
    hide: function () {
        if (!!dialog) {
            setTimeout(function() {
                dialog.hide();
                dialog.destroy();
                dialog = null;
            },200);
        }
    },
    getDlg: function() {
        return dialog;
    }
};

var QApp = window.QApp,
    _ = QApp.util;

var list = [];

function addId(id) {
    list.push(id);
}

function removeId(id) {
    list.splice(list.indexOf(id), 1);
}

QApp.Kami = QApp.Kami || {};

QApp.Kami.hasDialog = function() {
    return !!list.length;
};

QApp.addWidget('cardAlert', function (element, opt, view) {

    var id = setTimeout('1');

    addId(id);

    cardAlert.show(_.extend({}, {
        onok: function () {
            if (_.isFunction(opt.onComplete)) {
                opt.onComplete();
                this.hide();
            }
            else {
                this.hide();
            }

            removeId(id);
        },
        oncancel:function () {
            this.hide();
            removeId(id);
        }
    },
    opt));
    if(view) {
        if(_.isFunction(view.on)) {
            view.on('hide',function(e) {
                if(dialog) {
                    dialog.hide();
                    dialog = null;
                }
            })
        }
    }

}, 'tap');

module.exports = cardAlert;


    })( module.exports , module , __context );
    __context.____MODULES[ "e3db554a754df2770a450036fdbc5e81" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "3e72a4b2cfb05a1ef0a88842a9647f72" ,
        filename : "msg-alert.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["msg-alert"] = "<!-- 请输入手机验证码 start  -->\n<div class=\"yo-dialog\" >\n    <header class=\"hd\">\n        <h2 class=\"title\">{{header.title}}</h2>\n        <span class=\"affirm\" >\n            <i class=\"yo-ico ico-close\" data-role=\"close\">&#xf077;</i>\n        </span>\n    </header>\n    <div class=\"bd m-validation\" >\n        <p class=\"tip\">短信已发送至{{content}}</p>\n        <div class=\"valid\">\n            <input type=\"tel\" class=\"smscode\" data-role=\"input\" maxlength=\"6\"/>\n            <div class=\"yo-btn yo-btn-resend\" data-role=\"timer\">60s后重发</div>\n        </div>\n    </div>\n</div>\n<!-- 请输入手机验证码 end -->\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["msg-alert"];

    })( module.exports , module , __context );
    __context.____MODULES[ "3e72a4b2cfb05a1ef0a88842a9647f72" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6552dbc77fee89e7ca3b910b88df2c08" ,
        filename : "msgAlert.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**********************************************
// QApp.showWidget("msgAlert",{
//     sendMsg:function(){
//         alert('发短信吧');
//     },
//     validate:function(value){
//         var dlg = this;
//         alert('验证去吧');
//         setTimeout(function(){
//             dlg.fail(callback);
//         },10);
//         setTimeout(function(){
//             dlg.ok();
//         },20);
//     },
//     phone:'13810547993'
// });
**********************************************/
__context.____MODULES['de071b66e142bb4e1debc3df8142e2e9'];
var template =__context.____MODULES['3e72a4b2cfb05a1ef0a88842a9647f72'];
var Dialog =__context.____MODULES['1940106703ae84aadcf797b941220e74'];
var $      =__context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];
var dialog = null;
var inter  = null;
var timer  = 60;
var phone  = "";
var msgAlert = {
    show: function (opt) {

        if (dialog == null) {
            var header = null;
                header = { title: '请输入短信验证码'}
                phone  = opt.phone||'';
            var _opt = {
                content: ((opt && opt.phone) || ''),
                extraClass:'yo-alert-msg ' + (opt && opt.extraClass || ''),
                template: (opt && opt.template) || template,

                onok: function () {

                    if (opt && opt.onok) {
                        opt.onok.call(msgAlert, function() {
                            msgAlert.hide();
                        });
                    }
                    else {
                        msgAlert.hide();
                    }

                },

                oncancel: function () {

                    if (opt && opt.oncancel) {
                        opt.oncancel.call(msgAlert, function() {
                            msgAlert.hide();
                        });
                    }
                    else {
                        msgAlert.hide();
                    }

                }
            };
            header && (_opt.header = header);
            (opt && opt.template) && (_opt.template = opt.template);

            dialog = new Dialog(_opt);

            dialog.show();
            _timer.call(this,opt);
            _input.call(this,opt);

        }
        else if (dialog.visiable) {
            return;
        }
        else {
            dialog.show();
            _timer.call(this,opt);
            _input.call(this,opt);
        }
    },
    hide: function () {
        setTimeout(function() {
            if (!!dialog) {
                dialog.hide();
                dialog.destroy();
                dialog = null;
            }
            removeInter();
        },200)
    },
    ok:function(){
        this.hide();
    },
    invisible:function() {
        var _w = dialog.widgetEl[0];
        var _i = _w.querySelector('[data-role=input]');
        _i.blur();
        dialog.hide();
    },
    fail:function(callback){

        callback.bind(this)();

        // 隐藏框，下面的注释实现了就注释这个,后来发现要花钱还是改了
        // this.hide();
        // 摇头动画，后端不给力不能实现，等实现了再解注释
        // var _w = dialog.widgetEl[0];
        //     _w.className += 'ani shake';
        //
        // if(text){
        //     var _t  = _w.querySelector('[data-role=timer]');
        //     var _i  = _w.querySelector('[data-role=input]');
        //     var tip = _w.querySelector('.tip');
        //         tip.innerHTML = text;
        //
        //         removeInter();
        //         _t.innerHTML  = '重新获取';
        //         _t.className  = _t.className.replace('resend','getcode');
        //         _t.disabled   = false;
        //         _t.onclick    = __callback;
        //         function __callback(){
        //             _timer.call(this);
        //             _i.value = "";
        //             tip.innerHTML = "短信已发送至"+phone;
        //         }
        // }
        //
        // setTimeout(__dropClass,1000);
        // function __dropClass(){
        //     _w.className = _w.className.replace('ani shake','');
        // };
    },
    getDlg: function() {
        return dialog;
    }
};

function _timer(opt){
    inter  = setInterval(__countDown,1000);
    var _w = dialog.widgetEl[0];
    var _t = _w.querySelector('[data-role=timer]');
        _t.innerHTML  = '60s后重发';
        _t.disabled   = true;
        _t.className  = _t.className.replace('getcode','resend');
        _t.onclick    = null;

    var _i  = _w.querySelector('[data-role=input]');

    function __countDown(){
        if(timer--){
            _t.innerHTML  = timer+'s后重发';
        }else{
            timer = 60;
            removeInter();
            _t.innerHTML  = '重新获取';
            _t.className  = _t.className.replace('resend','getcode');
            _t.disabled   = false;
            _t.onclick    = __callback;
        }
    };
    function __callback(){
        _i.value = "";
        _timer(opt);
        if(opt && opt.sendMsg){
            opt.sendMsg();
        }
    };
};

function _input(opt){
    var _d = this
    var _w = dialog.widgetEl[0];
    var _i = _w.querySelector('[data-role=input]');
    if(opt && opt.sendMsg){
        _d.validate = opt.validate;
    }
    _i.oninput = __oninput
    function __oninput(e){
        var target = e.target;
        var value  = target.value;
        var regX   = /^\d+$/;
        var reg    = /^\d*$/;
        if(value.length<6){
            if(!reg.test(value)){
                _i.value = value.slice(0,-1);
            }
        }else{
            if(regX.test(value)){
                _d.validate(value);
            }else{
                _i.value = value.slice(0,-1);
            }
        }
    };
};

var QApp = window.QApp,
    _ = QApp.util;

var list = [];

function addId(id) {
    list.push(id);
}

function removeId(id) {
    list.splice(list.indexOf(id), 1);
}

function removeInter() {
    if(inter){
        clearInterval(inter);
        inter = null;
        timer = 60;
    }
};

QApp.Kami = QApp.Kami || {};

QApp.Kami.hasDialog = function() {
    return !!list.length;
};

QApp.addWidget('msgAlert', function (element, opt, view) {

    var id = setTimeout('1');

    addId(id);

    msgAlert.show(_.extend({}, {
        onok: function () {
            if (_.isFunction(opt.onComplete)) {
                opt.onComplete();
                this.hide();
            }
            else {
                this.hide();
            }

            removeId(id);
        },
        oncancel:function () {
            this.hide();
            removeId(id);
        }
    },
    opt));

    if(view) {
        if(_.isFunction(view.on)) {
            view.on('hide',function(e) {
                if(dialog) {
                    dialog.hide();
                    dialog = null;
                }
            })
        }
    }

}, 'tap');

module.exports = msgAlert;


    })( module.exports , module , __context );
    __context.____MODULES[ "6552dbc77fee89e7ca3b910b88df2c08" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "d07193740bc8cd9218c13f01ebd5f54a" ,
        filename : "slidermenu.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * 滑动菜单项
 * @author  sharon.li<xuan.li@qunar.com>
 * @type {[type]}
 */
var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];
var Base =__context.____MODULES['ba335bae023b1e48c033d17d911cf60a'];

var DIRECTION = {
    LEFT: -1,
    RIGHT: 1 
};

var SliderMenu = Base.extend({

    options: {
        container: document.body,
        menuItemTag: 'slideMenuItem',
        menuActionTag: 'slideMenuAction',
        menuContentTag: 'slideMenuCnt',
        direction: DIRECTION.LEFT,
        unit: 'px',//默认transform的单位
        ontap: function () {},
        use3d: true,
        cancleTapBubble: false,
        allowance: 50,
        disabled: false,
        exclusive: true,//是否全局open互斥，默认为false不互斥
        lockY: false,
        width: null//允许滑动的宽度，如果不传则为ation节点的宽
    },
    _setX: function (el, x) {
        

        var str = 'translateX(' + x + 'px )';
        if (this.get('use3d')) {
            str += this.translatez;
        }
        el.style['-webkit-transform'] = str;
        // console.log('str=' + str);
        el.x = x;
      
    },
    
    _getX: function (el) {
        
        // debugger
        var transform = el.style['transform'] || el.style['-webkit-transform'];
        
        var match = transform.match(/translateX\(([\-\.0-9]+)px\)/);
        var y = 0;
        if (match && match.length > 1) {
            y = match[1];
        }
        y = parseInt(y, 10);
        return y;
    },
    _renderEvent: function () {
        
        var widget = this;

        this.container.on('tap', this._getTag(this.menuActionTag), function (e) {


            
            if (!!widget.cancleTapBubble) {
                e.stopPropagation();
            }
            widget.trigger('tap', e.target);

            return false;
        });
        
        this.container.on(
            'tap',
            this._getTag(this.menuContentTag),
            function (e) {
                // console.log('widget.waitingTap=' + widget.waitingTap);
                var el = this;
                if (el.isOpen || widget.waitingTap) {
                    e.stopPropagation();

                    return false;
                }
                

                
            }
        );
        

        var tag = this._getTag(this.menuContentTag);

        var start = function (e) {
            

            e.preventDefault();

            if (widget.disabled) {
                return;
            }
            
            //如果是exclusive的设置，那么先关闭其他节点
            if (widget.exclusive && widget.curEl != null) {
                widget.waitingTap = true;
                widget.closeAll();
                return;
            }
            widget.waitingTap = false;

            // e.stopPropagation();
            if (widget._isInProcess) {
                return;
            }

            // console.log('slidermenu start');


            var el = this;//e.target;

            el.countPoint = 0;
            var point = e.touches ? e.touches[0] : e;

            el.startX    = point.pageX;
            el.startY    = point.pageY;

            el.pointX = el.startX;
            el.pointY = el.startY;

            el.distX      = 0;
            el.distY      = 0;

            el.x = widget._getX(el);
            
            el.lockY = false;
            // console.log('el.x=' + el.x);

            el.endTime = el.startTime = new Date().getTime();
            el.classList.remove('transition');
            widget._isInProcess  = true;

            // console.log('start');
        };
        
 

        var move = function (e) {

            e.preventDefault();

            if (widget.disabled) {
                return;
            }
            if (!widget._isInProcess) {
                return;
            }
            // e.stopPropagation();
            // console.log('slidermenu move');

            var el = this;//e.target;
            var point = e.touches ? e.touches[0] : e;
            var deltaX = point.pageX - el.pointX;
            var deltaY = point.pageY - el.pointY;
            // console.log('deltaY=' + deltaY, 'deltaX=' + deltaX);
            el.deltaX = deltaX;            
            el.deltaY = deltaY;

            var newX = el.x + deltaX;

            el.distX += deltaX;
            el.distY += deltaY;


            var absDistX        = Math.abs(el.distX);
            var absDistY        = Math.abs(el.distY);

            //由于可能和pagelist合作时，节点没了，所以默认给initX一个初始值
            //
            //
            
            //根据最初的5像素来判断方向，如果是y方向，那么直接return不做滚动处理
            //
            if (absDistX < 30) { 
                if (absDistY > absDistX / 3) {
                
                    el.lockY = true;//是Y方向 
                }
            }
            else {
                //
            }
            //pagelist在滚动的时候如果将slidermenu设置为falseslidermenu也就不触发了
            //
            if (el.lockY || widget.lockY) {
                return;
            }
            
            // debugger
            
            
           

            var initX = el.initX === undefined ? 0 : el.initX;
            // console.log('deltaX=' + deltaX,
            //     'newX=' + newX,
            //     'el.x=' + el.x,
            //     'maxStep' + widget.direction * widget.maxSlideWidth
            // );
            if (widget.direction === DIRECTION.LEFT) {
                


                if (newX < initX && 
                    newX > initX + widget.direction * widget.maxSlideWidth) {
                    
                    widget._setX(el, newX);
                }
                else {
                    //do nothing
                }
            }
            else {
                if (newX > initX &&
                    newX < initX + widget.direction * widget.maxSlideWidth) {

                    
                    widget._setX(el, newX);
                }
                else {
                    //do nothing
                }
            }
            el.pointX = point.pageX;
            el.pointY = point.pageY;
            
        };


        var end = function (e) {
            if (widget.disabled) {
                return;
            }
            // debugger
            var el = this;//e.target;
            // if (el.lockY) {
            //     el.lockY = false;
            //     return;
            // }
            var point = e.changedTouches ? e.changedTouches[0] : e;

            el.endTime = new Date().getTime();
            //finalX是节点上的最终偏移记录和initX相对应
            el.finalX = widget._getX(el);
            el.endX = point.pageX;
            el.endY = point.pageY;

            
            

            var initX = el.initX === undefined ? widget.defaultInitX : el.initX;
            var distanceX = el.finalX - initX;
            //总的滑动方向
            var slideDirection = distanceX > 0 ? 1 : -1;
            var instanceSliderDirection = el.endX - el.startX;
            // console.log('slideDirection=%s, distanceX=%s', slideDirection, distanceX);

            // console.log('Math.abs(distanceX)=' + Math.abs(distanceX));
            // if (el.lockY) {
            //     el.lockY = false;
            //     // return;
            // }


            if (widget.direction == DIRECTION.LEFT) {//向左边滑动触发

                //如果滑动方向与允许触发的滑动方向相反，那么只要有便宜就恢复最初状态
                //方向相同根据allowance来判断设置open状态
                //
                
                if (instanceSliderDirection * widget.direction < 0) {
                    widget.setOpen(el, false);
                }
                else {
                    if (Math.abs(distanceX) > widget.allowance) {//最后做判断是否需要移动
                
                        if (slideDirection < 0) {
                            
                            widget.setOpen(el, true);
                        }
                        else {
                            widget.setOpen(el, false);
                        }
                        
                    }
                    else {//不需要动
                        
                        widget.setOpen(el, false);
                    }
                }

                
            }
            else {
                if (instanceSliderDirection * widget.direction < 0) {
                    widget.setOpen(el, false);
                }
                else {
                    if (Math.abs(distanceX) > widget.allowance) {
                        if (slideDirection < 0) {
                            widget.setOpen(el, false);
                            
                        }
                        else {
                            widget.setOpen(el, true);
                        }

                    }
                    else {
                        
                        widget.setOpen(el, false);
                    }
                }
                
            }
            el.lockY = false;
            widget._isInProcess = false;
            

        };

        this._itemTouchStart = start;
        this._itemTouchMove = move;
        this._itemTouchEnd = end;

        this.container.on('touchstart', tag, this._itemTouchStart);
        this.container.on('touchmove',  tag, this._itemTouchMove);
        this.container.on('touchend',  tag, this._itemTouchEnd);
        this.container.on('touchcancel',  tag, this._itemTouchEnd);
    },
    setLockY: function (lockY) {
        this.lockY = !!lockY;
    },
    /**
     * 设置组件的disabled状态
     * @param {Boolean} disabled 是否为disabled状态
     */
    setDisabled: function (disabled) {
        this.disabled = !!disabled;
    },
    /**
     * 返回组件是否为disabled状态
     * @return {Boolean} 组件的是否为disabled状态
     */
    getDisabled: function () {
        return this.disabled;
    },
    /**
     * 获取组件的item是否打开
     * @param  {HTMLElement} el 需要判断的节点
     * @return {Boolean}    获取节点或者组件的open状态
     */
    getOpen: function (el) {
        var widget = this;
        if (el === undefined) {
            
            el = widget.itemCntList[0];
        }
        var dataRole = el.getAttribute('data-role');
        if (dataRole.indexOf(widget.menuContentTag) === -1) {
            console.log('invalid el, el data-role attribute must contain' + widget.menuContentTag);
            return;
        }

        //【TODO】吧，感觉也不太需要
    },
    /**
     * 关闭所有打开的节点
     * @return {[type]} [description]
     */
    closeAll: function () {
        var widget = this;
        var _itemCntList = this.container.find(this._getTag(this.menuContentTag));
        for (var i = 0; i < _itemCntList.length; i++) {
            var itemCnt = _itemCntList[i];
            
            (function (el, open) {
                widget.setOpen(el, open);
            } (itemCnt, false));

        }
            
    },
    /**
     * 设置当前el状态是否是打开关闭状态
     * @param {Boolean} open 是否关闭状态
     */
    setOpen: function (el, open) {
        var widget = this;

        //disable state can not be set open or close;
        if (widget.disabled) {
            return;
        }
        //
        if (typeof el === 'Boolean') {
            open = el;
            el = widget.itemCntList[0];
        }

        //invalid el
        var dataRole = el.getAttribute('data-role');
        if (dataRole.indexOf(widget.menuContentTag) === -1) {
            console.log('invalid el, el data-role attribute must contain' + widget.menuContentTag);
            return;
        }
        open = !!open;
        
        var initX = el.initX === undefined ? widget.defaultInitX : el.initX;
        // var distanceX = el.finalX - el.initX;
        //总的滑动方向
        // var slideDirection = distanceX > 0 ? 1 : -1;
        var slideDirection = null;

        if (open) {

            if (widget.direction === DIRECTION.LEFT) {
                slideDirection = -1;
            }
            else {
                slideDirection = 1;
            }
            var newX = initX + slideDirection * widget.maxSlideWidth;
            el.classList.add('transition');
            widget._setX(el, newX);

            // alert(el.style.border);
            //hack 让他强制去画
            // el.style.border = '1px solid #fff';
            var a = el && el.offsetHeight;
            el.isOpen = true;

            if (widget.exclusive) {
                widget.curEl = el;    
            }
            
            // alert(newX + '|' + widget._getX(el));
        }
        else {
            
            var newX = initX;
            el.classList.add('transition');
            widget._setX(el, newX);
            // el.style.border = 'none';
            el.isOpen = false;
            if (widget.exclusive) {
                widget.curEl = null;
            }
            
        }
        widget.trigger('open', el, open);
        el.lockY = false;
    },
    _getTag: function (tag) {
        
        return '[data-role=' + tag + ']';
    },
    
    _translate : function (x, y) {
        x = (x !== undefined ? x : 0);
        y = (y !== undefined ? y : 0);
        this.x = x;
        this.y = y;
        var style = '';
        style += 'translate(' + x + this.unit + ',' + y + ')';
        if (this.use3d) {
            style += ' translateZ(0)';
        }
        return style;
    },
    
    initialize: function (config) {
        SliderMenu.superClass.initialize.call(this, config);
        this.init();
    },
    
    _destroyEvent: function () {
        this.container.off();
    },

    init: function () {
        
        if (!this._init) {
            this.container = $(this.get('container') || document.body);
            this.menuItemTag = this.get('menuItemTag') || 'slideMenuItem';
            this.menuActionTag = this.get('menuActionTag') || 'slideMenuAction';
            this.menuContentTag = this.get('menuContentTag') || 'menuContentTag';
            this.use3d = !!this.get('use3d');
            this.unit = this.get('unit') || 'px';
            this.direction = this.get('direction');
            this.translatez = 'translateZ(0px)';
            this.cancleTapBubble = !!this.get('cancleTapBubble');

            var _allowance = parseInt(this.get('allowance'), 10);
            this.allowance = _allowance.toString() == 'NaN' ? 50 : Math.abs(_allowance);
            
            this.exclusive = !!this.get('exclusive');
            this.disabled = !!this.get('disabled');
            this.lockY = !!this.get('lockY');
            this._init = true;
            this.curOpenElList = [];
        }
        
    },
    render: function () {
        
        this._initProp();
        

        this._renderEvent();
        this.trigger('ready');
    },
    _initProp: function () {
        var widget = this;
        var width = this.get('width') || null;
        this.itemActionList = this.container.find(this._getTag(this.menuActionTag));
        this.itemCntList = this.container.find(this._getTag(this.menuContentTag));
        //默认就去第一个itemList的宽度
        //所以如果当前sliderMenu的宽度不统一，那么用户可以创建多个slideMenu
        
        this.maxSlideWidth = (width == null) ? this.itemActionList.offset().width : width;
        this.itemCntList.forEach(function (item, i) {
            item.initX = widget._getX(item);
            item.setAttribute('initX', item.initX);
        });
        //取默认第一个item的translatex为默认的initX，如果传入的HTML结构中
        //每个dom节点的translateX不一样，那么要么初始化多个sliderMenu要么
        //统一所有节点的translateX
        if (this.itemCntList.length) {
            widget.defaultInitX = widget._getX(this.itemCntList[0]);
            
        }
        else {
            widget.defaultInitX = 0;
        }
    },
    destroy: function () {
        this._destroyEvent();
        SliderMenu.superClass.destroy.call(this);
    }
});


module.exports = SliderMenu;

    })( module.exports , module , __context );
    __context.____MODULES[ "d07193740bc8cd9218c13f01ebd5f54a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "dcf35076387fa842ad1b70f4d38ffeca" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['d07193740bc8cd9218c13f01ebd5f54a'];


    })( module.exports , module , __context );
    __context.____MODULES[ "dcf35076387fa842ad1b70f4d38ffeca" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e61e0348c0573d87f0a84d687e22fc4c" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["slidermenu"] = __context.____MODULES['dcf35076387fa842ad1b70f4d38ffeca'];
module.exports = obj["slidermenu"];

    })( module.exports , module , __context );
    __context.____MODULES[ "e61e0348c0573d87f0a84d687e22fc4c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "95a5e032abb8ca75dc8b19dcaebd6928" ,
        filename : "slider.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['de071b66e142bb4e1debc3df8142e2e9'];

var QApp = window.QApp,
    _ = QApp.util,
    SliderMenu = QApp.Kami.SliderMenu =__context.____MODULES['e61e0348c0573d87f0a84d687e22fc4c'];


var DEFAULT_OPT = {
};

var sliderCache  = null;


QApp.addWidget('slider', function(n,element, opt) {

    opt = opt || {};

    [].forEach.call(element,_forEach);
    function _forEach(el) {
        var inner   = el.innerHTML;

        var action  = ['<div data-role="slideMenuAction" class="action">',
                            '<div action="del">删除</div>',
                      '</div>'].join('');
        el.innerHTML= ['<div data-role="slideMenuCnt" class="front">',
                            inner,
                       '</div>',
                            action].join('');

        el.dataset["role"] = "slideMenuItem";
    };

    sliderCache = new SliderMenu(_.extend({
        container:"[data-role=slideMenuItem]"
    }, DEFAULT_OPT, opt));
    sliderCache.render();

    QApp.Kami.sliderCache = sliderCache;
});

module.exports = sliderCache;


    })( module.exports , module , __context );
    __context.____MODULES[ "95a5e032abb8ca75dc8b19dcaebd6928" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c601f16c271e293c5ea6b6108617f2c5" ,
        filename : "panel.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["panel"] = "<div>\n    <div data-role=\"scroller\">\n        <div data-role=\"body\"></div>\n    </div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["panel"];

    })( module.exports , module , __context );
    __context.____MODULES[ "c601f16c271e293c5ea6b6108617f2c5" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "04529342a29eaf1d7d058615384474c1" ,
        filename : "panel-refresh.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["panel-refresh"] = "<div style=\"position: absolute; text-align: center; width: 100%; height: 40px; line-height: 40px; top: -40px;\">\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico\">&#xf07b;</i>\n        <div class=\"text\">下拉可以刷新</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico\">&#xf079;</i>\n        <div class=\"text\">释放立即更新</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-loading\">&#xf089;</i>\n        <div class=\"text\">努力加载中...</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-succ\">&#xf078;</i>\n        <div class=\"text\">加载成功</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-fail\">&#xf077;</i>\n        <div class=\"text\">加载失败</div>\n    </div>\n</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["panel-refresh"];

    })( module.exports , module , __context );
    __context.____MODULES[ "04529342a29eaf1d7d058615384474c1" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "2e3673ff7223e51f34f27d5f080bf748" ,
        filename : "panel-loadmore.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["panel-loadmore"] = "<div style=\"position: absolute; text-align: center; height: 40px; line-height: 40px; width: 100%; bottom: -40px;\">\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-loading\">&#xf089;</i>\n        <div class=\"text\">正在加载...</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <div class=\"text\">没有更多了...</div>\n    </div>\n</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["panel-loadmore"];

    })( module.exports , module , __context );
    __context.____MODULES[ "2e3673ff7223e51f34f27d5f080bf748" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "f6be349820a2bd53eaa2dae14ab72ac7" ,
        filename : "panel.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * @description 面板组件，支持横向纵向滑动，以及下拉刷新和加载更多
 * @author zxiao <jiuhu.zh@gmail.com>
 * @date 2015/5/17
 */

var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];
var Widget =__context.____MODULES['727699dca154f9ef72d5e879dadfb5a5'];
var Template =__context.____MODULES['9e11d69af7743de93f8c257f13101434'];
var PanelTpl =__context.____MODULES['c601f16c271e293c5ea6b6108617f2c5'];
var RefreshTpl =__context.____MODULES['04529342a29eaf1d7d058615384474c1'];
var LoadmoreTpl =__context.____MODULES['2e3673ff7223e51f34f27d5f080bf748'];

// 动画定时器
var rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };

// 默认不阻止浏览器默认行为的控件
var Reg = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;

var Panel = Widget.extend({
    options: {
        type: 'panel',
        // X轴是否滚动，默认为false
        scrollX: false,
        // Y轴是否滚动，默认为true
        scrollY: true,
        // 动画的效果，默认为true使用transition, false使用js动画
        isTransition: true,
        // 当容器内的内容的高度小于容器高度时，是否允许滚动，默认为false
        scrollLock: false,
        // 阻止浏览器默认事件
        preventDefault: true,
        // 阻止touch事件冒泡
        stopPropagation: false,
        // 是否支持锁定Y轴滚动
        canLockY: false,
        // 可调整大小
        resizable: true,
        // 刷新激活高度，一般等于刷新容器的高度
        refreshActiveY: 40,
        // 加载更多激活高度，设置成负数可以提前刷新，正数往下拉更多才刷新
        loadmoreActiveY: 0,
        // 加载更多容器高度，如果自定义了加载更多模板并且改变了高度，需要配置此参数
        loadmoreContY: 40,
        // 刷新结果显示时间，0为不显示刷新结果直接弹回，不等于0会显示刷新成功或刷新失败提示后再弹回
        refreshResultDelay: 0,
        // 是否启用刷新功能
        useRefresh: false,
        // 是否启用加载更多功能
        useLoadmore: false,

        // 组件模板
        template: PanelTpl,
        // 刷新数据提示模板
        refreshTpl: RefreshTpl,
        // 加载更多提示提示模板
        loadmoreTpl: LoadmoreTpl,

        // 刷新事件，该接口必须调用Panel.refresh()方法通知Panel数据已加载
        onRefresh: function(pageNum) {},
        // 加载更多中，该接口必须调用Panel.loadMore()方法通知Panel数据已加载
        onLoadMore: function(pageNum) {},
        // 渲染完成后
        onReady: function() {},

        // panel点击事件
        onTap: function(e) {},
        onBeforeStart: function(e) {},
        onBeforeMove: function(e) {},
        onScroll: function(translateX, translateY, stopAnimate) {},

        // 切换下拉刷新图标
        onAfterMove: function(translateY) {
            translateY > 0 && this.get('useRefresh') && !this._refreshing && this._changeRefreshStatus(translateY);
            this._moveWhenLoad = this._refreshing || this._loadmoreing;
        },

        // 下拉刷新触发判断
        onBeforeEnd: function(e) {
            if(this.get('useRefresh') && !this._loadmoreing && this._translateY >= this.get('refreshActiveY')) {
                if(this._refreshing) {
                    this.scrollTo(0, this.get('refreshActiveY'), 300);
                } else {
                    this._refreshInit();
                }
                return false;
            }

            return true;
        },

        // 加载更多触发判断
        onScroll: function(translateX, translateY) {
            if(this._refreshing || this._loadmoreing) return;

            if(this.get('useLoadmore') && this._canLoadmore) {
                // 激活加载更多的translateY，负数
                var activeY = this._maxY - this.get('loadmoreActiveY');
                translateY < 0 && translateY < activeY && this._loadMoreInit();
            }
        },

        events: {
            'touchstart': '_touchStart',
            'touchmove': '_touchMove',
            'touchend': '_touchEnd',
            'touchcancel': '_touchEnd',
            'webkitTransitionEnd [data-role=scroller]': '_transitionEnd',
            'transitionEnd [data-role=scroller]': '_transitionEnd'
        }
    },

    init: function() {
        this._initPrivate();
    },

    render: function() {
        Panel.superClass.render.call(this);
        this._scroller = this.widgetEl.find('[data-role="scroller"]');
        this._body = this.widgetEl.find('[data-role="body"]');
        this._createDragIcon();

        var self = this;
        this.widgetEl.on('tap', function(e) {
            !self._stopAnimate && !self._lockScrollY && self.trigger('tap', e);
            self._stopAnimate = false;
        });

        this.trigger('ready');
        return this;
    },

    destroy: function() {
        Panel.superClass.destroy.call(this);
    },

    /**
     * 重新计算滚动区域，容器高度发生变化后调用
     *
     */
    resize: function() {
        if(this.get('scrollX')) {
            this._panelWidth = +this.widgetEl[0].clientWidth;
            var scrollerWidth = this._scroller[0].scrollWidth;
            this._maxX = this._panelWidth - scrollerWidth;
            // 滑动容器宽度不满外层容器宽度时，是否需要滑动
            if(this._maxX >= 0) {
                if(this.get('scrollLock')) {
                    this._canScroll = false;
                } else {
                    this._canScroll = true;
                    this._maxX = 0;
                }
            } else {
                this._canScroll = true;
            }
        } else if(this.get('scrollY')) {
            this._panelHeight = +this.widgetEl[0].clientHeight;
            var otherHeight = 0;// 其他容器高度
            // 容器里如果有其他非滚动元素，计算最大滑动高度时去掉这些元素的高度
            var child = this.widgetEl.children();
            if(child.length > 1) {
                child.forEach(function(item){
                    item.getAttribute('data-role') != 'scroller' && (otherHeight += (+item.offsetHeight));
                });
            }
            var scrollerHeight = this._scroller[0].clientHeight;
            this._maxY = this._panelHeight - scrollerHeight - otherHeight;
            // 滑动容器高度不满外层容器高度时，是否需要滑动
            if(this._maxY >= 0) {
                if(this.get('scrollLock')) {
                    this._canScroll = false;
                } else {
                    this._canScroll = true;
                    this._maxY = 0;
                }
            } else {
                this._canScroll = true;
            }
        }
    },

    /**
     * 渲染panel
     *
     * @param html panel的内容
     */
    html: function(html) {
        this._body.html(html);
        this.resize();
    },

    /**
     * 添加panel
     *
     * @param html panel的内容
     */
    append: function(html) {
        this._body.append(html);
        this.resize();
    },

    /**
     * 是否允许加载更多
     *
     * @param result
     */
    setCanLoadmore: function(result) {
        this._canLoadmore = result;
    },

    /**
     * 滑动
     *
     * @param translateX
     * @param translateY
     * @param time transition-duration 过渡效果需要多少毫秒
     * @param effect transition-timing-function 过渡效果的速度曲线
     * @private
     */
    scrollTo: function(translateX, translateY, time, effect) {
        if(this.get('isTransition')) {
            effect = effect || 'cubic-bezier(0.1, 0.57, 0.1, 1)';
            setTransitionTimingFunc(this._scroller, effect);
            setTransitionTime(this._scroller, time);
            this._translate(translateX, translateY);
        } else {
            effect || (effect = function (k) {
                return Math.sqrt( 1 - ( --k * k ) );
            });
            if(time) {
                this._animate(translateX, translateY, time, effect);
            } else {
                this._translate(translateX, translateY);
            }
        }
        this._translateX = translateX;
        this._translateY = translateY;
    },

    // 停止动画
    stopAnimate: function() {
        var result = this._isAnimating;
        if(this._isAnimating) {
            this._isAnimating = false;
            this._stopAnimate = true;
            if(this.get('scrollX')) {
                this._translateX = getTranslateX(this._scroller);
                this.scrollTo(this._translateX, 0, 0);
            } else if(this.get('scrollY')) {
                this._translateY = getTranslateY(this._scroller);
                this.scrollTo(0, this._translateY, 0);
            }
        }
        return result;
    },

    /**
     * 模拟刷新操作
     */
    simulateRefresh: function() {
        var self = this;
        var refreshActiveY = this.get('refreshActiveY');
        this.scrollTo(0, refreshActiveY, 300);
        this._changeRefreshStatus(refreshActiveY);
        setTimeout(function() {
            self._refreshInit();
        }, 300);
    },

    /**
     * 刷新
     *
     * @param html 加载到的html
     * @param isFail 加载是否成功，如果加载数据碰到异常才设置成false，否则默认都为true
     */
    refresh: function(html, isFail) {
        this._loadEl.hide();
        if(!isFail) {
            this._pageNum = 1;
            this.html(html);
        }
        this._endmoreEl && this._endmoreEl.hide();

        var self = this, delay = this.get('refreshResultDelay');
        var resultEl = isFail ? self._failEl : self._successEl;

        delay && resultEl.show();

        setTimeout(function() {
            delay && resultEl.hide();

            var time = 0;
            // 滑动到原点
            if(!self._moveWhenLoad || (self._moveWhenLoad && self._translateY > 0)) {
                time = 300;
                self.scrollTo(0, 0, time);
            }

            setTimeout(function() {
                self._dragEl.show();
                self._refreshing = false;
                self._moveWhenLoad = false;
            }, time);

        }, delay);
    },

    /**
     * 加载更多
     *
     * @param html 加载到的html
     * @param loadFail 加载失败，如果加载数据碰到异常才设置成true
     */
    loadMore: function(html, isFail) {
        var isMoreData = html && html.length;
        this._maxY += this.get('loadmoreContY');
        this._loadmoreEl.hide();
        if(!isFail) {
            if(isMoreData) {
                this._pageNum++;
                this.append(html);
            } else {// 加载不到更多数据
                this._endmoreEl.show();
            }
        }

        var self = this,
            delay = isMoreData ? 0 : 500,
            dist = isMoreData ? self._translateY - 20 : self._maxY;
        setTimeout(function() {
            if(isMoreData) {
                !self._moveWhenLoad && self.scrollTo(0, dist, 300);
            } else {
                self.scrollTo(0, dist, 300);
            }
            setTimeout(function() {
                self._loadmoreing = false;
                self._canLoadmore = isMoreData || isFail;
                self._moveWhenLoad = false;
            }, 300);
        }, delay);
    },

    /**
     * 获取滚动方向
     */
    getOrientation: function() {
        return this._orientation;
    },

    /**
     * 获取页码
     */
    getPageNum: function() {
        return this._pageNum;
    },

    // 滑动超出最大范围，回弹到终点
    _resetPosition: function () {
        // 超出刷新激活高度后回弹到激活高度,而不是0
        if(this._refreshing && this._translateY == this.get('refreshActiveY')) {
            return false;
        } else if(this._loadmoreing && this._translateY == this._maxY - this.get('loadmoreContY')) {
            return false;
        }

        if(this.get('scrollX')) {
            var translateX = this._translateX;
            if(this._canScroll) {
                translateX = translateX > 0 ? 0 : translateX < this._maxX ? this._maxX : translateX;
            }
            if(translateX == this._translateX) {
                return false;
            }
            this._orientation = translateX < 0 ? 'left': 'right';
            this.scrollTo(translateX, 0, 600);
        } else if(this.get('scrollY')){
            var translateY = this._translateY;
            if(this._canScroll) {
                translateY = translateY > 0 ? 0 : translateY < this._maxY ? this._maxY : translateY;
            }
            if(translateY == this._translateY) {
                return false;
            }
            this._orientation = translateY < 0 ? 'up': 'down';
            this.scrollTo(0, translateY, 600);
        }

        return this._moveWhenLoad = true;
    },


    // 初始化私有属性
    _initPrivate: function() {
        this._scroller = null; // 滑动容器
        this._body = null; // panel容器
        this._panelWidth = 0; // 列表宽度
        this._panelHeight = 0; // 列表高度

        this._startY = 0; // 开始滑动时的pageY
        this._lastY = 0; // 上一次滑动事件的pageY
        this._distY = 0; // 一次滑动事件的总距离
        this._translateY = 0; // 当前纵向滑动的总距离
        this._maxY = 0; // 最大纵向滑动距离
        this._lockScrollY = false; // 是否锁定Y轴滚动

        this._startX = 0; // 开始滑动时的pageX
        this._lastX = 0; // 上一次滑动事件的pagex
        this._distX = 0; // 一次横向滑动事件的总距离
        this._translateX = 0; // 当前横向滑动的总距离
        this._maxX = 0; // 最大横向滑动距离

        this._orientation = ''; // 列表滑动方向（与手势滑动方向相反） up || down
        this._startTime = 0; // 开始滑动时间
        this._endTime = 0; // 结束滑动时间
        this._isMoving = false; // 是否滑动中
        this._isAnimating = false; // 是否动画中
        this._canScroll = true; //是否可以滑动
        this._stopAnimate = false; // 本次点击是否阻止了动画效果（transition || requrestAnimationFrame）

        this._cancelMove = false; // 取消滑动，目前只有一种情况，当pageY小于0
        // TODO 增加支持两个手指滑动的功能
        this._initiated = false; // 是否初始化（touchstart是否正常执行了，主要用来解决多点触发滑动的判断）

        this._refreshing = false; // 刷新中
        this._loadmoreing = false; // 加载更多中
        this._pageNum = 1; // 当前页码

        this._dragEl = null; // 下拉刷新
        this._endEl = null; // 释放更新
        this._loadEl = null; // 加载中
        this._successEl = null; // 加载成功
        this._failEl = null; // 加载失败
        this._loadmoreEl = null; // 加载更多
        this._endmoreEl = null; // 没有更多

        // 是否可以加载更多，下面条件成立时，_canLoadmore都等于false
        // useLoadmore == false || 加载不到更多数据
        this._canLoadmore = this.get('useLoadmore');

        // 刷新或加载更多时，是否发生了滑动。如果没有滑动，会有默认滚动动作
        this._moveWhenLoad = false;
    },

    // 初始化参数，停止正在进行的动画
    _touchStart: function(e) {

        var target = e.target;
        this.get('preventDefault') && !Reg.test(target.tagName) && e.preventDefault();
        this.get('stopPropagation') && e.stopPropagation();

        if(this._initiated) return;

        this.trigger('beforestart', e);

        setTransitionTime(this._scroller);
        this._isMoving = false;
        this._startTime = +new Date();
        this._stopAnimate = false;
        this.stopAnimate();

        // 目前只允许滚动一个方向
        if(this.get('scrollY')) {
            this._startY = this._translateY;
            this._distY = 0;
            this._lastY = e.touches[0].pageY;

            this._lastX = e.touches[0].pageX;
            this._lockScrollY = false;
            this._cancelMove = false;
            this._initiated = true;
        } else if(this.get('scrollX')) {
            this._startX = this._translateX;
            this._distX = 0;
            this._lastX = e.touches[0].pageX;

            this._lockScrollY = true;
            this._cancelMove = false;
            this._initiated = true;
        } else {
            this._initiated = false;
        }
    },

    _touchMove: function(e) {
        this.get('preventDefault') && e.preventDefault();
        this.get('stopPropagation') && e.stopPropagation();

        if(!this._initiated) return;

        if(!this.trigger('beforemove', e)) {
            this._initiated = false;
            return;
        };

        if(this.get('scrollY')) {
            var translateY,
                timestamp = +new Date(),
                currY = e.touches[0].pageY,
                offsetY = currY - this._lastY;

            this._distY += offsetY;

            // 当滑动超出屏幕，自动触发touchend事件
            if(currY < 0) {
                this._initiated = false;
                if(this._cancelMove) {
                    return;
                }
                this._cancelMove = true;
                this._touchEnd(e);
                return;
            }

            if(this.get('canLockY')) {
                // 横向滚动超过比例，锁定纵向滚动
                if(this._lockScrollY) {
                    this._initiated = false;
                    return;
                }
                var currX = e.touches[0].pageX;
                var offsetX = currX - this._lastX;
                if(Math.abs(this._distY) < 30 && Math.abs(offsetX) / 3 > Math.abs(this._distY)) {
                    this._lockScrollY = true;
                    this._initiated = false;
                    return;
                }
            }

            // 当前时间大于上一次滑动的结束时间300毫秒，并且滑动距离不超过10像素，不触发move
            // 大于300毫秒的判断是为了能够处理手指在屏幕上快速搓动的效果
            if ( timestamp - this._endTime > 300 && Math.abs(this._distY) < 10 ) {
                return;
            }

            this._orientation = offsetY > 0 ? 'up': 'down';
            !this._canScroll && (offsetY = 0);
            translateY = this._translateY + offsetY;
            // 超出滑动容器范围，减少滑动高度
            if ( translateY > 0 || translateY < this._maxY) {
                translateY = this._translateY + offsetY / 3;
            }

            this._isMoving = true;
            this._translate(0, translateY);
            this._translateY = translateY;
            this._lastY = currY;
            if(timestamp - this._startTime > 300) {
                this._startTime = timestamp;
                this._startY = this._translateY;
            }
            this.trigger('aftermove', translateY);
        } else if(this.get('scrollX')) {
            var translateX,
                timestamp = +new Date(),
                currX = e.touches[0].pageX,
                offsetX = currX - this._lastX;

            this._distX += offsetX;

            // 当前时间大于上一次滑动的结束时间300毫秒，并且滑动距离不超过10像素，不触发move
            // 大于300毫秒的判断是为了能够处理手指在屏幕上快速搓动的效果
            if ( timestamp - this._endTime > 300 && Math.abs(this._distX) < 10 ) {
                return;
            }

            this._orientation = offsetX > 0 ? 'left': 'right';
            !this._canScroll && (offsetX = 0);
            translateX = this._translateX + offsetX;
            // 超出滑动容器范围，减少滑动高度
            if ( translateX > 0 || translateX < this._maxX) {
                translateX = this._translateX + offsetX / 3;
            }

            this._isMoving = true;
            this._translate(translateX, 0);
            this._translateX = translateX;
            this._lastX = currX;
            if(timestamp - this._startTime > 300) {
                this._startTime = timestamp;
                this._startX = this._translateX;
            }
            this.trigger('aftermove', translateX);
        }
    },

    _touchEnd: function(e) {
        var target = e.target;

        this.get('preventDefault') && !Reg.test(target.tagName) && e.preventDefault();
        this.get('stopPropagation') && e.stopPropagation();

        this._initiated = false;
        this._endTime = +new Date();
        var duration = this._endTime - this._startTime;

        if(!this.trigger('beforeend', e)) {
            return;
        };

        // 1. 判断是否滑动回弹，回弹则return
        if(this._resetPosition()) {
            return;
        }

        // 2. 滑动到目标位置
        this.scrollTo(this._translateX, this._translateY);

        // 3. 没有滚动，并且没有还在惯性滑动中，才触发点击事件
        if(!this._isMoving ) {
            return;
        }

        // 4. 是否有惯性滑动，有则滑动到计算后的位置
        this._isMoving = false;
        if (duration < 300 && this._canScroll) {
            var result;
            if(this.get('scrollX')) {
                result = momentum(this._translateX, this._startX, duration, this._maxX, this._panelWidth);
                var newX = result.destination;
                if (newX != this._translateX ) {
                    var effect = null;
                    if(newX > 0 || newX < this._maxX) {
                        // 惯性滑动中超出边界回弹回来，切换动画效果函数
                        if(this.get('isTransition')) {
                            effect = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        } else {
                            effect = function (k) {
                                return k * ( 2 - k );
                            };
                        }
                    }
                    this.scrollTo(newX, 0, result.duration, effect);
                }
            } else if(this.get('scrollY')){
                result = momentum(this._translateY, this._startY, duration, this._maxY, this._panelHeight);
                var newY = result.destination;
                if (newY != this._translateY ) {
                    var effect = null;
                    if(newY > 0 || newY < this._maxY) {
                        // 惯性滑动中超出边界回弹回来，切换动画效果函数
                        if(this.get('isTransition')) {
                            effect = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        } else {
                            effect = function (k) {
                                return k * ( 2 - k );
                            };
                        }
                    }
                    this.scrollTo(0, newY, result.duration, effect);
                }
            }
            this._isAnimating = true;
        }
    },

    _transitionEnd: function(e) {
        if ( e.target != this._scroller[0] ) {
            return;
        }
        setTransitionTime(this._scroller);
        this._isAnimating = false;
        this._resetPosition();
    },

    _animate: function(translateX, translateY, time, effect) {
        var self = this,
            startX = this._translateX,
            startY = this._translateY,
            startTime = +new Date(),
            destTime = startTime + time;

        function step () {
            var now = +new Date(),
                newX, newY,
                easing;

            if ( now >= destTime ) {
                self._isAnimating = false;
                self._translate(translateX, translateY);
                self._translateX = translateX;
                self._translateY = translateY;
                self._resetPosition();
                return;
            }

            now = ( now - startTime ) / time;
            easing = effect(now);
            if(self.get('scrollX')) {
                newX = ( translateX - startX ) * easing + startX;
                self._translateX = newX;
                self._translate(newX, 0);
            } else if(self.get('scrollY')) {
                newY = ( translateY - startY ) * easing + startY;
                self._translateY = newY;
                self._translate(0, newY);
            }

            if ( self._isAnimating ) {
                rAF(step);
            }
        }
        this._isAnimating = true;
        step();
    },

    _translate: function(translateX, translateY) {
        this._scroller[0].style.webkitTransform = 'translate(' + translateX + 'px, ' + translateY + 'px) translateZ(0)';
        this._scroller[0].style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) translateZ(0)';
        this.trigger('scroll', translateX, translateY, this._stopAnimate);
    },

    // 创建刷新和加载更多的操作图标
    _createDragIcon: function() {
        if(this.get('useRefresh')) {
            var rh = this.get('refreshActiveY');
            var refreshContainer = $(this.get('refreshTpl'));
            refreshContainer.css({height: rh + 'px', lineHeight: rh + 'px', top: -rh}).appendTo(this._scroller);

            var child = refreshContainer.children();
            this._dragEl = child[0] && $(child[0]).show();
            this._endEl = child[1] && $(child[1]).hide();
            this._loadEl = child[2] && $(child[2]).hide();
            this._successEl = child[3] && $(child[3]).hide();
            this._failEl = child[4] && $(child[4]).hide();

            this._dragIcon = $(this._dragEl.children()[0]);
            this._endIcon = $(this._endEl.children()[0]);
            this._changeRefreshAnimate('down');
        }
        if(this.get('useLoadmore')) {
            var mh = this.get('loadmoreContY');
            var moreContainer = this._moreCont = $(this.get('loadmoreTpl'));
            moreContainer.css({height: mh + 'px', lineHeight: mh + 'px', bottom: -mh}).appendTo(this._scroller);

            var child = moreContainer.children();
            this._loadmoreEl = child[0] && $(child[0]).hide();
            this._endmoreEl = child[1] && $(child[1]).hide();
        }
    },


    // 改变刷新的显示状态（下拉刷新 or 释放更新）
    _changeRefreshStatus: function(translateY) {
        var activeY = this.get('refreshActiveY');

        if(translateY >= activeY) {
            if(this._dragEl[0].style.display != "none") {
                this._dragEl.hide();
                this._endEl.show();
                this._changeRefreshAnimate('up');
            }
        } else if(translateY < activeY && translateY > 0) {
            if(this._dragEl[0].style.display == "none") {
                this._dragEl.show();
                this._endEl.hide();
                this._changeRefreshAnimate('down');
            }
        }
    },

    // 改变刷新的动画效果, direction : up || down
    _changeRefreshAnimate: function(direction) {
        if(direction == 'up') {
            iconAnimate(this._dragIcon, 'addClass', true);
            iconAnimate(this._endIcon, 'removeClass');
        } else {
            iconAnimate(this._dragIcon, 'removeClass');
            iconAnimate(this._endIcon, 'addClass', false);
        }
    },

    _refreshInit: function() {
        this._refreshing = true;
        this._dragEl.hide();
        this._endEl.hide();
        this._loadEl.show();
        this._changeRefreshAnimate('down');
        this.scrollTo(0, this.get('refreshActiveY'), 200);

        var self = this;
        setTimeout(function() {
            self.trigger('refresh', this._pageNum);
        }, 300);
    },
    _loadMoreInit: function() {
        this._loadmoreing = true;
        this._loadmoreEl.show();
        this._endmoreEl.hide();
        this._maxY -= this.get('loadmoreContY');
        this.trigger('loadmore', this._pageNum);
    },
    _reset: function() {
        if(this.get('useRefresh')) {
            this._dragEl.show();
            this._endEl.hide();
            this._loadEl.hide();
            if(this.get('refreshResultDelay')) {
                this._successEl.hide();
                this._failEl.hide();
            }
        }
        if(this.get('useLoadmore')) {
            this._loadmoreEl.hide();
            this._endmoreEl.hide();
        }
    }
});

// 滑动惯性计算
function momentum(current, start, time, lowerMargin, wrapperSize, deceleration) {
    var distance = current - start,
        speed = Math.abs(distance) / time,
        destination,
        duration;

    // 低版本安卓，降低惯性滑动速度
    var defaultDeceleration = 0.0006;
    $.os.android && $.os.version < '4.4' && (defaultDeceleration = 0.006);

    deceleration = deceleration === undefined ? defaultDeceleration : deceleration;

    destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
    duration = speed / deceleration;

    if ( destination < lowerMargin ) {
        destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
    } else if ( destination > 0 ) {
        destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
    }

    return {
        destination: Math.round(destination),
        duration: duration
    };
};

function setTransitionTime(elem, time) {
    time = time || 0;
    elem[0].style.webkitTransitionDuration = time + 'ms';
    elem[0].style.transitionDuration = time + 'ms';
}
function setTransitionTimingFunc(elem, effect) {
    elem[0].style.webkitTransitionTimingFunction = effect;
    elem[0].style.transitionTimingFunction = effect;
}

// 获取元素的translateX
function getTranslateX(elem) {
    var matrix = window.getComputedStyle(elem[0], null);
    var transform = matrix['webkitTransform'] || matrix['transform'];
    var split = transform.split(')')[0].split(', ');
    return Math.round(+(split[12] || split[4]));
}

// 获取元素的translateY
function getTranslateY(elem) {
    var matrix = window.getComputedStyle(elem[0], null);
    var transform = matrix['webkitTransform'] || matrix['transform'];
    var split = transform.split(')')[0].split(', ');
    return Math.round(+(split[13] || split[5]));
}

/**
 * 添加下拉刷新和释放更新的动画
 *
 * @param elem 元素
 * @param action 操作，add || remove
 * @param positive 正负
 */
function iconAnimate(elem, action, positive) {
    var style = action == 'addClass' ? (positive ? 'rotate(180deg)' : 'rotate(-180deg)') : '';
    elem[0].style.webkitTransform = style;
    elem[0].style.transform = style;
}

module.exports = Panel;


    })( module.exports , module , __context );
    __context.____MODULES[ "f6be349820a2bd53eaa2dae14ab72ac7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b4be5b794797bf26c48616b528b60831" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['f6be349820a2bd53eaa2dae14ab72ac7']

    })( module.exports , module , __context );
    __context.____MODULES[ "b4be5b794797bf26c48616b528b60831" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c2d3f4768a0011f9ccb778703432f254" ,
        filename : "panel.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['de071b66e142bb4e1debc3df8142e2e9'];

var Panel =__context.____MODULES['b4be5b794797bf26c48616b528b60831'];
var panel = null;
var scrollPanel = {
    render: function (opt) {

            panel = new Panel(opt);
            panel.render();
    }
};

var QApp = window.QApp,
    _ = QApp.util;

QApp.Kami = QApp.Kami || {};


QApp.addWidget('scrollPanel', function (element, opt) {

    scrollPanel.render(_.extend({}, {
        container:element
    },opt));

},true);


    })( module.exports , module , __context );
    __context.____MODULES[ "c2d3f4768a0011f9ccb778703432f254" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "423d87bf44ba942ab6cede3ad80759d7" ,
        filename : "loading.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["loading"] = "<div class=\"yo-loading\"><div class=\"inner\" data-role=\"inner\"><i class=\"yo-ico\"></i>{{content}}</div></div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["loading"];

    })( module.exports , module , __context );
    __context.____MODULES[ "423d87bf44ba942ab6cede3ad80759d7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "eafc4df7eb6f350db7ed5eb355f59922" ,
        filename : "loading.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * 全局的loading
 * @type {[type]}
 */


var Overlay =__context.____MODULES['d79271f5e1db960ae5a5827a5ebf276d'];
var LoadingTpl =__context.____MODULES['423d87bf44ba942ab6cede3ad80759d7'];
var $ =__context.____MODULES['897499f6c44f901ecc6fd2b84da5b878'];
var loading = null;

var stopMove = function () {
    return false;
};
var DEFAULT_OPT = {
    hasMask: false,
    content: '',
    force: false,
    type: 'loading',
    maskOffset: [0, 0],
    onaftershow: function () {
        this.container.on('touchmove', stopMove);
    },
    onafterhide: function () {
        this.container.off('touchmove', stopMove);
    }
};
var KamiLoading = {
    show: function (opt) {
        var _opt = {};
        $.extend(_opt, DEFAULT_OPT, opt);
        if (loading == null || !loading._isInit) {


            var template = _opt && _opt.template;
            if (!template) {
                template = LoadingTpl.replace('{{content}}', _opt.content || '');
                _opt.template = template;
            }
            
            loading = new Overlay(_opt);
            var maskOffset = (_opt && _opt.maskOffset) || [0, 0];

            $(loading.widgetEl).css('top', (0 + maskOffset[0]) + 'px');
            $(loading.widgetEl).css('position', 'absolute');
            $(loading.widgetEl).css('bottom', (0 + maskOffset[1]) + 'px');

            loading.show();
        }
        else if (!!_opt.force) {
            loading.destroy();
            KamiLoading.show(_opt);
        }
        else {
            loading.show();    
        }
        
    },
    hide: function () {
        loading.hide && loading.hide();
    },
    destroy: function () {
        loading.destroy && loading.destroy();
    }
};
module.exports = KamiLoading;



    })( module.exports , module , __context );
    __context.____MODULES[ "eafc4df7eb6f350db7ed5eb355f59922" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "666925dc0895fb555b9b4baaa7ed7ae0" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['eafc4df7eb6f350db7ed5eb355f59922']

    })( module.exports , module , __context );
    __context.____MODULES[ "666925dc0895fb555b9b4baaa7ed7ae0" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "92ed855f56e3501facbc6eac56b949b0" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["loading"] = __context.____MODULES['666925dc0895fb555b9b4baaa7ed7ae0'];
module.exports = obj["loading"];

    })( module.exports , module , __context );
    __context.____MODULES[ "92ed855f56e3501facbc6eac56b949b0" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9dac193de1362a3274188a9f8ae24032" ,
        filename : "loading.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var Loading = QApp.Kami.loading =__context.____MODULES['92ed855f56e3501facbc6eac56b949b0'];
var $ =__context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];
var riot = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];

var DEFAULT_OPT = {
    template:'<camel-loading class="yo-flex flex" loading="yo-loading-upper" fill="#fff" ></camel-loading>',
    extraClass:''
};

var KamiLoading = {
    show: function(opt) {
        Loading.show($.extend({},DEFAULT_OPT,opt));
        riot.mount('camel-loading');
    },
    hide: function() {
        Loading.hide();
    }
}

module.exports = KamiLoading;


    })( module.exports , module , __context );
    __context.____MODULES[ "9dac193de1362a3274188a9f8ae24032" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "f7ea1c5486486d577c45173268a3a792" ,
        filename : "index.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["index"] = "<yo-header class=\"yo-header m-header\"></yo-header>\n<yo-error if=\"{error}\" class=\"m-error flex\"></yo-error>\n<div hide=\"{error}\" class=\"flex yo-flex\" node-type=\"wrapper\"></div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["index"];

    })( module.exports , module , __context );
    __context.____MODULES[ "f7ea1c5486486d577c45173268a3a792" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "61713304e8f1d53a77de7a3b21040ee2" ,
        filename : "boundcard.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["boundcard"] = "<div class=\"yo-list list-group\">\n    <label class=\"item item-input border-top\" node-type=\"nameCase\" if={userName}>\n        <span class=\"mark\">姓名</span>\n        <input type=\"text\" class=\"yo-input flex namecolor margin-left\" value={userName} node-type=\"userName\" readonly />\n        <span class=\"yo-ico m-ico-config pd\" action-type=\"userName-popup\">&#xf0f6;</span>\n    </label>\n    <label class=\"item item-input {border-top:!userName}\" node-type=\"nameCase\" if={identityCardNo}>\n        <span class=\"mark\">身份证</span>\n        <input type=\"text\" class=\"yo-input flex namecolor\" value={identityCardNo} node-type=\"identityCardNo\" readonly />\n    </label>\n    <label class=\"item item-input {border-top:!userName && !identityCardNo}\" node-type=\"cardBorder\">\n        <span class=\"mark\">卡号</span>\n        <input type=\"tel\" class=\"yo-input flex margin-left cardNo\" placeholder=\"请输入银行卡号\" value=\"{cardNo}\" node-type=\"cardNo\" action-type=\"card-import\" />\n        <span class=\"yo-ico clearCardNo pd\" action-type=\"clearCardNo\" style=\"display:none;\">&#xf093;</span>\n    </label>\n</div>\n<span class=\"tip-banner\">去哪儿网保证您的信息与资金安全</span>\n<input type=\"button\" value=\"下一步\" class=\"yo-btn btn-next\" action-type=\"next\" node-type=\"next\" />\n<div class=\"yo-list-bindcard  margin-top {isReveal:!bindCardRule.length}\">\n    <div class=\"bar\"></div>\n    <div class=\"title\"><span>绑卡规则</span></div>\n    <div class=\"rules\">\n        <div each=\"{ bindCardRule , i in bindCardRule }\" class=\"rule\">\n            <div class=\"index\">{i+1+\".\"}</div>{bindCardRule}</div>\n    </div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["boundcard"];

    })( module.exports , module , __context );
    __context.____MODULES[ "61713304e8f1d53a77de7a3b21040ee2" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9f54b8c48ae22ae4f5d52780788bef3b" ,
        filename : "yo-header.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["yo-header"] = "<h2 class=\"title\">{text}</h2>\n<span class=\"regret yo-ico\" action-type=\"{left}\">{icon}</span>\n<span class=\"affirm\" action-type=\"{right}\" if=\"{affirm}\">{affirm}</span>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["yo-header"];

    })( module.exports , module , __context );
    __context.____MODULES[ "9f54b8c48ae22ae4f5d52780788bef3b" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a707d2fafba8acb2df475d59add98ccf" ,
        filename : "yo-header.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var headerStr = __context.____MODULES['9f54b8c48ae22ae4f5d52780788bef3b'];

riot.tag("yo-header",headerStr,_headerStr);

function _headerStr(opts){
    this.text   = opts.title || "绑定银行卡";
    this.icon   = opts.icon  || "\uf07d" ;
    this.left   = opts.left  || "left";
    this.affirm = opts.affirm;
    this.right  = opts.right || "right";
}


    })( module.exports , module , __context );
    __context.____MODULES[ "a707d2fafba8acb2df475d59add98ccf" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e9eb9dd9aab7aefba798a046aa237a6d" ,
        filename : "yo-error.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["yo-error"] = "<div class=\"yo-error\">\n    <section class=\"m-nodata\">\n        <p class=\"info\">{ content }</p>\n    </section>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["yo-error"];

    })( module.exports , module , __context );
    __context.____MODULES[ "e9eb9dd9aab7aefba798a046aa237a6d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1a01fde20fceccaa502f7cf0bc828821" ,
        filename : "error.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var tpl  =__context.____MODULES['e9eb9dd9aab7aefba798a046aa237a6d'];

riot.tag('yo-error',tpl,function(opt){
    this.content = opt.content || "您的访问信息有错哦";
});


    })( module.exports , module , __context );
    __context.____MODULES[ "1a01fde20fceccaa502f7cf0bc828821" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1358606e3eed4246ebf0ef4a7e217298" ,
        filename : "tag.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot      = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var index     = __context.____MODULES['61713304e8f1d53a77de7a3b21040ee2'];
var headerStr = __context.____MODULES['a707d2fafba8acb2df475d59add98ccf'];
var errorStr  = __context.____MODULES['1a01fde20fceccaa502f7cf0bc828821'];
var html      = __context.____MODULES['f7ea1c5486486d577c45173268a3a792'];
var $         = __context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];

riot.tag("bindcard",index,_index);
riot.tag("yo-bindcard-index",html,_html);
riot.tag("raw","",_raw);

function _index(opts){
    var bindCardRule = opts.bindCardRule;
    if (typeof bindCardRule === "string") {
        try {
            bindCardRule = JSON.parse(bindCardRule);
        } catch (e) {}
    }

    this.userName     = opts.userName;
    this.bindCardRule = bindCardRule;
    this.identityCardNo = opts.identityCardNo;

    this.on("mount",function() {
        var cardNo = $('.cardNo',this.root);
        cardNo.focus();
    });
};
function _raw(opts){
    this.root.innerHTML = opts.content;
}

function _html(opts){
    this.error = opts.error;
}


    })( module.exports , module , __context );
    __context.____MODULES[ "1358606e3eed4246ebf0ef4a7e217298" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "721988a3f039c82e9b46f50a6e199b4c" ,
        filename : "currency.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    Number.prototype.toFixed = function( n ) {
    return (+(this * Math.pow( 10, n  )) / Math.pow(10, n)).toString();
};

module.exports = {
    /*
     * 浮点数省略的小数位数；
     * 默认 2 位;
     */
    DELTA: 2,
    /*
     * 加法计算
     * 支持多个浮点型数据计算
     * param: 1 ... n
     * return: number;
     */
    add: function(){
        var me = this;
        var params = Array.prototype.slice.call(arguments);
        var len = params.length, fst = 0;
        var docalc = (function(idx){
            if(idx < 0){
                return fst;
            }
            fst = params[idx] + arguments.callee(idx - 1);
            return fst;
        })(len - 1)
        return me._parse(docalc);
    },

    /* 
     * 减法计算
     * 支持多个浮点型数据计算
     * param: 1 ... n
     * return: number;
     */
    subtract: function(){
        var me = this;
        var params = Array.prototype.slice.call(arguments);
        var len = params.length, fst = 0;
        var docalc = (function(idx){
            if(idx == len -1){
                return params[idx];
            }
            fst = params[idx] - arguments.callee(idx + 1);
            return fst;
        })(0);
        return me._parse(docalc);
    },

    /*
     * 将浮点型数字转换保留两位小数；
     * 整数部分用逗号分割
     */
    format: function(num){
        return num;
    },

    toString: function(num, radix){
        var me = this;
        var delta = radix || me.DELTA;
        var nNum = num;
        var dotStr = '';
        var dotIdx = -1;
        var len = 0;

        try{
            //nNum = num.toFixed(this.DELTA);
            nNum = me._parse(nNum, radix).toString();

            //补零；
            nNum = me._addZero(nNum, delta);
        } finally {
            return nNum;
        }
    },

    toPercentage: function (n, radix) {
        return this.toString(n * 100, radix) + '%';
    },

    // 手续费计算，统一采用进1法，包括外卡手续费、支付宝手续费等
    // 处理方法是从小数第六位开始，逢非零位进一，保留两位非零小数，与后端保持一致;
    trimFloat: function(num){
        try{
            var numStrArr = num.toString().match(/(\d*).(\d{0,6})/);
            var IntNum = numStrArr[1];
            var f1 = numStrArr[2];//获取小数部分;
            if(f1 && f1.length > 0){
                var f3;
                if(f1.length > 2) {//只计算小数位数，从3位到6位的数字；两位以内，不做处理；
                    f2 = f1.match(/^(\d{2})(\d{0,4})/);
                    f3 = (+ f2[2] > 0) ? (+ f2[1] + 1) * 0.01 : (+ f2[1]) * 0.01;
                    num = + IntNum + f3;
                }else{//0.1 ， 0.01
                    num = + (IntNum + '.' + f1);
                }
            }
        }catch(err){
        }finally{
            return num;
        }
    },

    roundFloat: function(num, len) {
        try {
            len = len ? len : 2;
            var digit = Math.pow(10,len);
            num = Math.round(num * digit) / digit;
        } catch (err) {
        } finally {
            return num;
        }
    },

    // 四舍五入，用于通常情况下非手续费计算，手续费计算使用trimFloat
    _parse: function (num, radix) {
        var digit = Math.pow(10, radix || this.DELTA);
        return Math.round(num * digit) / digit;
    },

    _addZero: function(num, radix) {
        var dotIdx = num.indexOf('.');
        // 判断是否有小数；
        // 没有小数
        if (dotIdx < 0 && radix > 0) {
            num += '.';
            for (var i = radix; i > 0; i--) {
                num += '0';
            }
        } else {
            len = num.length;
            dotStr = num.slice(dotIdx + 1); // 小数部分
            for (var i = radix - dotStr.length; i > 0; i--) {
                num += '0';
            }
        }
        return num;
    }
};

    })( module.exports , module , __context );
    __context.____MODULES[ "721988a3f039c82e9b46f50a6e199b4c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "33767a82ae0cc07b7804e4d4382a501f" ,
        filename : "function.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var Currency = __context.____MODULES['721988a3f039c82e9b46f50a6e199b4c'];

module.exports = {
	validSetBtnStatus:function(reg, val, btn, self){
		(reg.test && reg.test(val)) ?
	        _.removeClass(self.find(btn)[0], 'yo-btn-disabled') :
	        _.addClass(self.find(btn)[0], 'yo-btn-disabled');
	},
	currencyFormat:function(num){
		num = + num;
		num = isNaN(+num) ? 0: Math.round((num * 100))/100;
		return Currency.toString(num, 2);
	},
	formatDate: function(num){
        return num < 10 ? "0" + num : num
    },
	timeFormat:function(time){
		var date = new Date(isNaN(+time)? time: +time);
		isNaN(date.getTime()) && (date = new Date());
		return  date.getFullYear() + 
				"-" + this.formatDate(date.getMonth() + 1) +
				"-" + this.formatDate(date.getDate()) + 
			    " " + this.formatDate(date.getHours()) + 
			    ":" + this.formatDate(date.getMinutes());
	}
}

    })( module.exports , module , __context );
    __context.____MODULES[ "33767a82ae0cc07b7804e4d4382a501f" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "73776b0290301974345d9aab3581db65" ,
        filename : "url.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var baseUrl ="/mobile/h5/asset/";
module.exports = {
	queryBalance: 			baseUrl + "balance/queryMemberBalanceApi.htm", //账户余额查询
	queryWithDraw: 			baseUrl + "withDraw/queryWithDrawApi.htm", //提现记录
	queryUserCardInfo: 		baseUrl + "card/queryUserCardInfoApi.htm", //查绑卡信息
	getWithdrawAmount: 		baseUrl + "balance/getWithDrawAmountApi.htm", //提现金额计算
	queryCardType: 			baseUrl + "card/queryCardTypeApi.htm", //查询卡类型
	withDrawSendSms: 		baseUrl + "withDraw/withDrawSendSmsApi.htm", //提交请求发送验证码
	verifySmsAndwithDraw: 	baseUrl + "withDraw/verifySmsAndwithDrawApi.htm", //手机验证码提交提现请求
	queryFrozenDetail: 		baseUrl + "returnCash/queryFrozenDetailApi.htm", //冻结详情
	getCoupons:             "/mobile/h5/qGold/queryDescByUid.htm",//获取红包
	fundSettings: 			"/mobile/h5/member/asset/balance/fundSettingsApi.htm",//余额自动转基金设定信息
	inWhiteList:			"/mobile/h5/member/asset/balance/inWhiteListApi.htm",//是否在白名单内
	submitUserAuthApi:      "/mobile/h5/member/asset/balance/submitUserAuthApi.htm",//提交用户实名信息
	submitAuthVCode:        "/mobile/h5/member/asset/balance/submitAuthVCodeApi.htm",//提交实名验证码
	submitSettings: 		"/mobile/h5/member/asset/balance/submitSettingsApi.htm",//提交自动转入设定信息
	getConsumePointsDetail: "/mobile/h5/qGold/getConsumePointsDetail.htm",//获取积分兑换页信息
	consumePointsOK:        "/mobile/h5/qGold/checkConsumePointsOK.htm",//判断兑换是否成功
	wlRecharge:             "/mobile/member/asset/balance/wlRecharge.htm",  //跳转收银台后端接口（后端进行跳转）
	bindCardPage:           "/mobile/h5/member/bindCard/bindCardPage.htm",//输入卡号页设定
	bindCardQueryApi:       "/mobile/h5/member/bindCard/bindCardQueryApi.htm",//提交卡号页
	bindCardVCodeApi:       "/mobile/h5/member/bindCard/bindCardVCodeApi.htm",//绑卡页获取验证码
	bindCardAuthApi:        "/mobile/h5/member/bindCard/bindCardAuthApi.htm",//发送验证码
	bindCardPageNoHMAC:     "/mobile/h5/member/bindCard/bindCardPageNoHMAC.htm",
	queryUserBindCardList:  "/mobile/h5/asset/card/queryUserBindCardList.htm"    
}


    })( module.exports , module , __context );
    __context.____MODULES[ "73776b0290301974345d9aab3581db65" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "3e132a762655388f849f29eb015a8e4c" ,
        filename : "urlParse.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var urlParse = {
    getQueryObj: function() {
        var self = this;

        if (!self.queryObj) {
            var queryStr = window.location.search.slice(1),
                queryArr = queryStr ? queryStr.split('&') : [];
            var queryObj = {};

            for (var i = 0, len = queryArr.length; i < len; i++) {
                var tempArr = queryArr[i].split('=');
                var k = tempArr[0], v = tempArr[1];
                queryObj[k] = v;
            }
            self.queryObj = queryObj;
        }

        return self.queryObj;
    }
};

module.exports = urlParse;

    })( module.exports , module , __context );
    __context.____MODULES[ "3e132a762655388f849f29eb015a8e4c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b2753b78a28b9da81f5166acfba6dcde" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var func = __context.____MODULES['33767a82ae0cc07b7804e4d4382a501f'],
	url = __context.____MODULES['73776b0290301974345d9aab3581db65'],
    urlParse = __context.____MODULES['3e132a762655388f849f29eb015a8e4c'];

module.exports = {
	func: func,
	url: url,
    urlParse: urlParse
}

    })( module.exports , module , __context );
    __context.____MODULES[ "b2753b78a28b9da81f5166acfba6dcde" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4dbde7f0796a94e291b34db9c0650f11" ,
        filename : "bind.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    initPage : _initPage,
    getDomData : _getDomData,
    getUrlData : _getUrlData,
    cardLayout : _cardLayout,
    renderPage : _renderPage,
    submitCardNo : _submitCardNo,
    openView : _openView,
    btn      : _btn
};

var riot = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var _    = QApp.util;
var Utils = __context.____MODULES['b2753b78a28b9da81f5166acfba6dcde'];
var Panel = __context.____MODULES['c2d3f4768a0011f9ccb778703432f254'];
var $ = __context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];

function _initPage(){
    var self = this;
    self.renderPage();
};

function _renderPage(){
    var self=this;
    riot.mount("yo-header",{});
    riot.mount("yo-bindcard-index",{error:false});

    if(self.param.from == "list"){
        self.getDomData();
    }else{
        self.getUrlData();
    }
}

function _submitCardNo(){
    var self = this;
    var domData = self.domData;
    var cardNo =  self.find("cardNo")[0].value.replace(/\s/g, "");
    var paramData  = {
        cardNo         : cardNo,
        userId         : domData.userId,
        extraJson      : domData.extraJson,
        bindCardDealNo : domData.bindCardDealNo,
        isObtainCoupon : domData.isObtainCoupon
    };
    var request = {
        url:Utils.url.bindCardQueryApi,
        args:paramData,
        method:"post"
    }
    var _ajax = self.ajax(request);
    _ajax.done(_ajaxOK);
    _ajax.fail(_ajaxFail);
    _ajax.all(_ajaxAll);

    function _ajaxOK(res){
        if(res.status == 0){
            var data = res.data;

            if(domData.isObtainCoupon == 1 && data.couponFlag == 0 ){
                var Opts = {};
                Opts.content = data.displayMsg;
                Opts.onok       = function(){
                    var dlg = this;
                    dlg.hide();
                }
                QApp.showWidget("cardAlert",Opts,self);
            }else if(data.amount != ""){
                var Opts = {};
                Opts.content = data.displayMsg;
                Opts.cancelText = "取消";
                Opts.okText     = "确定";
                Opts.onok       = function(){
                    var dlg = this;
                    dlg.hide();
                    self.openView(data);
                }
                QApp.showWidget("cardAlert",Opts,self);
            }else{
                self.openView(data);
            }

        }else{
            _ajaxFail(res.message);
        }
    };
    function _ajaxFail(msg){
        QApp.showWidget("tips",{
            content : msg || "网络错误，请稍后再试"
        })
    };
    function _ajaxAll(){
        if(Kami.loading) {
            Kami.loading.hide();
        }
    };
}

function _cardLayout(BankNo){//银行卡输入格式化
    var self = this;
    var BankNo = self.find('cardNo')[0];
    if (BankNo.value == "") return;
    var account = new String(BankNo.value);
    account = account.substring(0, 23); /*帐号的总数, 包括空格在内 */
    var reg = "[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}";
    if (account.match(reg) == null) {
        var accountNumeric = accountChar = "";
        var i;
        for (i = 0; i < account.length; i++) {
            accountChar = account.substr(i, 1);
            if (!isNaN(accountChar) && (accountChar != " ")) {
                accountNumeric = accountNumeric + accountChar;
            };
        }
        account = "";
        for (i = 0; i < accountNumeric.length; i++) {
            for (j = 1; j < accountNumeric.length; j++) {
                if (i == 4 * j) { //4的倍数位后面加空格
                    account = account + " ";
                }
            }
            account = account + accountNumeric.substr(i, 1);
        }
    } else {
        account = " " + account.substring(1, 5) + " " + account.substring(6, 10) + " " + account.substring(14, 18) + "-" + account.substring(18, 25);
    }
    if (account != BankNo.value) {
        BankNo.value = account;
    }
};

function _getDomData(){
    var self = this;
    var param =self.param.data;
    self.page = param;
    var request = {
        url:Utils.url.bindCardPageNoHMAC,
        args:param,
        method:"post"
    };
    var _Paramajax = self.ajax(request);
    _Paramajax.done(_ParamajaxOK);
    _Paramajax.fail(_ParamajaxFail);
    function _ParamajaxOK(res){
        var data = res.data;
        self.domData = data;
        if(res.status == 0){
                var riotOpts = param;
                self.title = param.title;
                _makepanel(self);
                _btn(self);
        }else{
            _ParamajaxFail(res.message);
        }
    }
    function _ParamajaxFail(msg){
        QApp.showWidget("tips",{
            content :msg || "网络错误，请稍后再试"
        })
    }
}

function _getUrlData(){
    var self   = this;
    var search = window.location.search;

    if(search == ""){
        riot.mount("yo-bindcard-index",{error:true,ok:true});
        riot.mount("yo-header",self.page);
    }else{
        var param  = _.queryToJson(search.split("?")[1],true);
        self.page = param;
        var request= {
            url : Utils.url.bindCardPage,
            args: param,
            method : "post"
        };
        var _urlAjax = self.ajax(request);
        _urlAjax.done(_urlAjaxOK);
        _urlAjax.fail(_urlAjaxFail);

        function _urlAjaxOK(res){
            var data = res.data;
            self.domData = data;
            if(res.status == 0){
                var riotOpts = param;
                self.title = param.title;
                _makepanel(self);
                _btn(self);
            }else{
                _urlAjaxFail(res.message);
            }
        }
        function _urlAjaxFail(msg){
            QApp.showWidget("tips",{
                content :msg || "网络错误，请稍后再试"
            })
        }
    }
}

function _openView(data){
    var self = this;
    var cardNo =  self.find("cardNo")[0].value.replace(/\s/g, "");
    var domData = self.domData;
    try{
        data.agreement = JSON.parse(data.agreement);
    }catch(e) {
        data.agreement = {list:[]};
    }
    QApp.router.goto("bindcard.cardauth",{
        param:{
            cardNo         : cardNo,
            cardType       : data.cardType,
            title          : self.title,
            identityCardNo : domData.identityCardNo,
            agreement      : data.agreement,
            authItems      : data.authItems,
            amount         : data.amount,
            bankCode       : data.bankCode,
            tppCode        : data.tppCode,
            bindCardDealNo : domData.bindCardDealNo,
            pmCode         : data.pmCode,
            userId         : domData.userId,
            bankName       : data.bankName
        },
        ani:'moveEnter'
    })
}

function _makepanel(self) {
    var panelOpts = {};
    panelOpts.onReady    = function(){//为页面加panel页面过长时滚动
        var panelHTML='<bindcard class="account-attest"></bindcard>'
        this.html(panelHTML);
        riot.mount("bindcard",self.page)
        this.resize();
    }
    panelOpts.extraClass = "flex";
    QApp.showWidget("scrollPanel",self.find("wrapper")[0],panelOpts);
};

function _btn(self){
    var cardNoLen = self.find("cardNo")[0].value.replace(/\s/g, "").length; //控制buton置灰和高亮
    var next = self.find("next")[0];
    if(cardNoLen < 12){
        next.setAttribute("action-type","");
        _.addClass(next,"yo-btn-gray");
    } else {
        next.setAttribute("action-type","next");
        _.removeClass(next,"yo-btn-gray");
    }
}


    })( module.exports , module , __context );
    __context.____MODULES[ "4dbde7f0796a94e291b34db9c0650f11" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "074db5ccf73fd2903df721dba96577bf" ,
        filename : "QunarAPI.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * @author: jiuhu
 * @date: 15/5/6
 */
 
(function(global, factory) {
    if ( typeof define === "function") { // AMD || CMD
        if(define.amd) {
            define(function() {
                return factory();
            });
        } else if(define.cmd) {
            define(function(require, exports, module) {
                module.exports = factory();
            });
        }
    } else if( typeof module === "object" && typeof module.exports === "object" ) { // commonJS
        module.exports = factory();
    } else { // global
        global.QunarAPI = factory();
    }
}(typeof window !== "undefined" ? window : this, function() {

    'use strict';

    var QunarAPI = {};
    var win = window;
    var doc = win.document;
    var ua = win.navigator.userAgent;
    // config的配置信息
    var configOptions = {};
    // 在bridge还没ready时，调用API时会先被缓存起来，等ready后再触发
    var cache = [];
    // 缓冲错误回调方法
    var errorCallbackCache = [];
    // 默认配置
    var defaultOptions = {
        wechatApiUrl: 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js'
    };
    var name2KeyMap = {};
    var key2NameMap = {};
    // sniffer
    var browser = (function() {
        if(/MicroMessenger/i.test(ua)) {
            return {wechat: true, version: ''};
        } else if(/Qunar/i.test(ua)) {
            return {qunar: true, version: ''};
        } else {
            return {h5: true, version: ''};
        }
    })();

    // 实现本身一次事件监听，方式使用者在ready之前调用api方法无效
    if(browser.qunar) {
        doc.addEventListener('WebViewJavascriptBridgeReady', function() {
            callbackQueue();
        });
    }

    var hooks = {
        'api':{
            'openWebView':function(){
                isFunction(this.onViewBack) && QunarAPI.hy.onceReceiveData({success:this.onViewBack});
            }
        },
        'bridge':{
            'method':function(key){
                return API.share.wechat[key] || API.share.hy[key] ? 'invoke' : '';
            }
        }
    };

    // 参数过滤，适配器
    var paramHandler = {
        checkJsApi: function(param){
            var map = name2KeyMap;
            var successCb = param.success;

            // 记录QunarAPI对于的key值
            var listClone = param.jsApiList.slice(0);

            // 根据map,生成新的list
            param.jsApiList = listClone.map(function(key){
                return map[key] || key;
            });

            param.success = function(res){
                var obj = {};
                // 根据初始jsApiList，生成对应的对象
                listClone.forEach(function(key){
                    // 获取map有记录的name，否则认为不支持
                    var name = map[key];
                    obj[key] = res[name] || false;
                });
                isFunction(successCb) && successCb.call(null, obj)
            }
            return param;
        },
        log: function( msg ){
            if( isString(msg) ){
                var param = {
                    message: msg
                }
                return param;
            }
            return msg;
            
        }
    };

    function isFunction (obj) {
        return typeof obj === 'function';
    };

    function isString (string) {
        return Object.prototype.toString.call(string) === "[object String]";
    };

    function domReady( callback ){
        var readyRep = /complete|loaded|interactive/;

        if (readyRep.test(document.readyState) && document.body) {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                callback();
            }, false);
        }
    };

    // 注册接口
    function batchRegisterAPI(api, namespace) {
        for(var key in api) {
            QunarAPI.register(key, api[key], namespace);
        }
    };

    function callbackQueue(){
        if(cache.length > 0){
            cache.forEach(function(item) {
                QunarAPI.invoke(item.key, item.callback, item.param);
            });
            cache = [];
        }
    }

    function errorHandler(res){
        if(errorCallbackCache.length > 0){
            errorCallbackCache.forEach(function(callback) {
                callback(res);
            });
        }
    }

    // 宿主环境适配
    function adapter() {
        // load wechat api
        if(browser.wechat) {
            var head = doc.getElementsByTagName('head')[0];
            var script = doc.createElement('script');
            script.setAttribute('src', defaultOptions.wechatApiUrl);
            head.appendChild(script);
            script.onload = function() {
                for(var key in wx) {
                    QunarAPI[key] = wx[key];
                }
                //添加通用分享方法
                QunarAPI['onMenuShare'] = function(param){
                    for(var key in API.share.wechat) {
                        QunarAPI[key](param);
                    }
                }
                QunarAPI.isReady = true;
                cache.forEach(function(item) {
                    QunarAPI[item.key](item.param);
                });
                cache = [];
            };
        } else if(browser.qunar) {
            // 添加onInitData
            QunarAPI.hy.onInitData = function(param) {
                QunarAPI.hy.getInitData({
                    success: function(data) {
                        isFunction(param.success) && param.success(data);
                    }
                });
            };

            // 添加bridge判断
            domReady(function(){
                // 600ms 后，还没有ready，说明bridge注入失败
                setTimeout(function(){
                    if(!QunarAPI.bridge){
                        // 触发错误
                        errorHandler( {
                            ret: false,
                            errcode: -1,
                            errmsg: "bridge注入失败"
                        } );
                    }
                }, 600)
            })
        }
    };

    function doResult(key, param, name){
        if(!param) {
            console.error('Parameters are not allowed to be empty!');
            return;
        }

        // 处理param
        if(paramHandler[name]){
            param = paramHandler[name](param);
        }

        var successCb = param.success,
            failCb = param.fail,
            completeCb = param.complete;

        var callback = function(data) {
            configOptions.debug && console.log(data);
            var args = Array.prototype.slice.call(arguments, 0);

            // data有两种数据，一种是带状态的数据，一种是无状态的数据
            // { ret: true, data: {} }
            // {  }

            if(!data || typeof data.ret === 'undefined') {
                // response不存在或者ret未定义，认为成功
                // success
                isFunction(successCb) && successCb.apply(null, args);
                hooks.api[name] && hooks.api[name].call(param, data || {});
            }else if(data.ret){
                // response不为空，且ret为true，认为成功，真正的数据为data.data
                args[0] = data.data;
                isFunction(successCb) && successCb.apply(null, args);
                hooks.api[name] && hooks.api[name].call(param, data.data || {});
            }else {
                isFunction(failCb) && failCb.apply(null, args);
            }
            isFunction(completeCb) && completeCb.apply(null, args);

            /*
             * 针对invoke分享接口，只能监听一次问题
             * 回调发起后，重新监听
             */

            if(browser.qunar && data.errcode != -1 && hooks.bridge.method(name)){
                QunarAPI.invoke(key, callback, param, name);
            }
        };

        QunarAPI.invoke(key, callback, param, name);
    };

    var API = {
        // 通用API
        common: {
            /** 图像接口 */
            chooseImage: 'chooseImage', // 拍照或从手机相册中选图
            previewImage: 'previewImage', // 预览图片
            uploadImage: 'uploadImage', // 上传图片
            downloadImage: 'downloadImage', // 下载图片

            /** 设备信息接口 */
            getNetworkType: 'network.getType', // 获取网络状态
            openLocation: 'openLocation', // 使用微信内置地图查看位置
            getLocation: 'geolocation.getCurrentPosition', // 获取地理位置

            /** 界面操作接口 */
            closeWindow: 'webview.back', // 关闭当前网页窗口
            hideOptionMenu: 'hideOptionMenu', // 隐藏右上角菜单
            showOptionMenu: 'showOptionMenu', // 显示右上角菜单
            hideMenuItems: 'hideMenuItems', // 批量隐藏功能按钮
            showMenuItems: 'showMenuItems', // 批量显示功能按钮
            hideAllNonBaseMenuItem: 'hideAllNonBaseMenuItem', // 隐藏所有非基础按钮
            showAllNonBaseMenuItem: 'showAllNonBaseMenuItem', // 显示所有功能按钮

            /** 扫一扫接口 */
            scanQRCode: 'scanQRCode', // 调起扫一扫

            /** 其他接口 */
            checkJsApi: 'checkJsApi' // 判断当前客户端版本是否支持指定JS
        },

        share: {
            wechat: {
                onMenuShareTimeline: 'onMenuShareTimeline',
                onMenuShareAppMessage: 'onMenuShareAppMessage'
                //onMenuShareQQ: 'onMenuShareQQ'  // QQ需要签入SDK目前大客户端不支持
            },
            hy: {
                onMenuShareWeiboApp: 'onMenuShareWeiboApp',
                onMenuShareSMS: 'onMenuShareSMS',
                onMenuShareEmail: 'onMenuShareEmail',
                onMenuShare: 'onMenuShare'
            }
        },

        // HYAPI
        hy: {
            /**独有API**/
            // webView接口
            openWebView: 'webview.open', // 打开新的webview
            closeWebView: 'webview.back', // 关闭webview
            setWebViewAttr: 'webview.attribute', // 设置webview属性
            getInitData: 'webview.getInitData',

            // webView事件
            onShow: 'webview.onShow',
            onHide: 'webview.onHide',
            onReceiveData: 'webview.onReceiveData',
            onceReceiveData: 'webview.onReceiveData',
            onCloseWebView: 'webview.targetClosed', // 监听WebView关闭事件
            onceCloseWebView: 'webview.targetClosed', // 监听WebView关闭事件

            // 以下三个接口不推荐使用，后续会删除
            onBeforeShow: 'webview.onBeforeShow',
            onBeforeHide: 'webview.onBeforeHide',
            onDestroy: 'webview.onDestroy',

            // 导航接口
            navRefresh: 'navigation.refresh', // 刷新导航条

            // 导航事件
            onNavClick: 'navigation.click', // 监听导航条点击事件

            /*主动分享*/
            shareTimeline: 'shareTimeline',
            shareAppMessage: 'sendAppMessage',
            shareWeiboApp: 'shareWeiboApp',
            shareSMS: 'shareSMS',
            shareEmail: 'shareEmail',

            // 唤起share dialog框
            showShareItems: "doShare",

            // 设备信息
            getDeviceInfo: 'native.getDeviceInfo', // 获取设备信息

            login: 'login.start', // 登录

            log: 'debug.log', // debug
            uelog: 'hy.uelog' // uelog

            // syncLogin: 'syncLogin', // 同步 Login Cookie 到客户端
            // getIDs: 'getIDs',  //合并到getDeviceInfo，获取 PID、GID、UID

            // refreshname: 'webview.refreshname'
        },

        // H5API
        h5: {
            getLocation: function(cb, param) {
                if(navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(param.success, param.fail, {
                        enableHighAccuracy: param.enableHighAccuracy || true,
                        timeout: param.timeout || 5000
                    });
                } else {
                    cb({
                        ret: false,
                        errcode: -1,
                        errmsg: 'Geolocation is not supported!'
                    });
                }
            },

            login: function(cb, param){
                var data, loginUrl, p, str = "";
                loginUrl = "http://user.qunar.com/mobile/login.jsp";
                data = {
                    ret: param.ret || encodeURIComponent(location.href),
                    goback: param.goback || "",
                    backUrl: param.backUrl || ""
                };
                for(p in data){
                    if(data.hasOwnProperty(p) && data[p] !== ""){
                        str += p + "=" + data[p]
                    }
                }
                location.href = loginUrl + "?" + str;
            },

            checkJsApi: function(cb, param){
                var jsApiList = param.jsApiList || [];
                var obj = {}, name;
                jsApiList.forEach(function(key){
                    name = key2NameMap[key];
                    obj[key] = !!API.h5[name];
                })
                cb( obj );
            },

            notSupport: function(cb, param, key, name) {
                if(!isFunction(cb)) return;
                cb({
                    ret: false,
                    errcode: -1,
                    errmsg: '浏览器环境下不支持"' + name+ '"接口调用'
                });
            }
        }
    };

    QunarAPI = {
        version: '1.0.9',
        isReady: false,
        bridge: null,
        sniff: browser,
        ready: function(callback) {
            var self = this;
            if(browser.qunar) {
                doc.addEventListener('WebViewJavascriptBridgeReady', function(e) {
                    self.isReady = true;
                    self.bridge = e.bridge;
                    isFunction(callback) && callback.call(self);
                    // 执行队列里的api方法
                    callbackQueue();
                });
            } else if(browser.h5){
                self.isReady = true;
                isFunction(callback) && callback.call(self);
            }
        },
        // 通过config接口注入权限验证配置
        config: function(opt) {
            doResult('config', configOptions = opt);
        },
        error: function(callback){
            if( isFunction(callback) ){
                errorCallbackCache.push(callback);
            }
        },
        invoke: function (key, callback, param, name) {
            if(!isFunction(callback)) return;

            if(QunarAPI.isReady) {
                if (browser.qunar) {
                    name = name || key;
                    var method = 'invoke';
                    if(name.indexOf('once') === 0) {
                        method = 'once';
                    } else if(name.indexOf('on') === 0) {
                        method = 'on';
                    }
                    this.bridge[ hooks.bridge.method(name) || method](key, callback, param);
                } else if(browser.wechat) {
                    this[key] && this[key](param);
                } else if(browser.h5){
                    API.h5[API.h5[name] ? name : 'notSupport'](callback, param, key, name);
                }
            } else {
                cache.push({key: key, callback: callback, param: param});
            }
        },
        /**
         * 自定义接口
         * @param  {String} name      接口名称
         * @param  {String} key       bridge
         * @param  {String} namespace 命名空间，业务方建议使用自己的命名空间
         */
        register: function (name, key, namespace) {
            var self = this, ns = this;
            namespace && (self[namespace] ? (ns = self[namespace]) : (ns = self[namespace] = {}));
            
            // 记录被注册的name
            name2KeyMap[name] = key;
            key2NameMap[key] = name;
            
            // self[name] = // 所有方法注册到QunarAPI，减少差异记录
            ns[name] = function(param){
                doResult(key, param, name);
            };
        }
    };
    
    batchRegisterAPI(API.share.wechat);
    batchRegisterAPI(API.share.hy);
    batchRegisterAPI(API.common);
    batchRegisterAPI(API.hy, 'hy');
    adapter();
    return QunarAPI;
}));

    })( module.exports , module , __context );
    __context.____MODULES[ "074db5ccf73fd2903df721dba96577bf" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e40338c22954d82670dedba25594be89" ,
        filename : "uaJudge.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = function() {//read ua to decide which scheme to use
    var ua = window.navigator.userAgent.toLowerCase();

    if(/.*micromessenger.*/.test(ua))   return "micromessenger";
    if(/.*qunariphonepro.*/.test(ua))   return "qunariphonepro";
    if(/.*qunariphonelife.*/.test(ua))  return "qunariphonelife";
    if(/.*qunariphone.*/.test(ua))      return "qunariphone";
    if(/.*qunaraphonelife.*/.test(ua))  return "qunaraphonelife";
    if(/.*qunaraphone.*/.test(ua))      return "qunaraphone";
    if(/.*iphone.*/.test(ua))              return "iphone";
    if(/.*android.*/.test(ua))          return "aphone";
    if(/.*linux.*/.test(ua))             return "aphone";

    return "";
}


    })( module.exports , module , __context );
    __context.____MODULES[ "e40338c22954d82670dedba25594be89" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "61223c240af244fdea0367df42d56666" ,
        filename : "qapp.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    (function(){

    "use strict";

	//=======================================================================
	//             _________       _          _________    __________
	//           / ________ /    /   \       |  _____  |  |  _____  |
	//          / /      / /    / / \ \      | |     | |  | |     | |
	//         / /  Q   / /    / / A \ \     | |  P  | |  | |  P  | |
	//        / /  __  / /    / /_____\ \    | |_____| |  | |_____| |
	//       / /___\ \/ /    /  _______  \   |  _______|  |  _______|
	//      /________  /    / /         \ \  | |          | |
	//               \_\   /_/           \_\ |_|          |_|
	//
	// QApp Mobile Framework
	// Copyright (c) 2014-2015 Edwon Lim and other contributors in Qunar Hotel FE Mobile Team.
	// WebSite: http://ued.qunar.com/mobile/qapp/
	//
	// 去哪儿酒店移动组荣誉出品，Created By 林洋
	//
	// qapp.js 0.4.7 build at 2015-11-09 By Edwon.lim (adwon.lin@qunar.com)
	//======================================================================
	
	/**
	 * QApp 版本
	 *
	 * @category Base
	 * @property QApp.version
	 * @type {String}
	 * @value "0.4.7"
	 */
	var QApp = {
	        version: '0.4.7'
	    },
	    _packages = QApp._packages = {}; // 存放 package
	
	// 预赋值，利于压缩
	var win = window,
	    doc = document,
	    TRUE = true,
	    FALSE = false,
	    NULL = null,
	    UNDEFINED = void 0;
	
	// 定义包
	function define(space, factory) {
	    _packages[space] = factory();
	}
	
	// 引用包 require
	// 为了避免和 fekit 冲突，所以不用 require
	function r(space) {
	    return _packages[space];
	}
	
	// 标签列表
	var Tags = {
	    app: 'qapp-app',
	    view: 'qapp-view',
	    widget: 'qapp-widget',
	    role: 'qapp-role'
	};
	
	

	/* ================================== 全局配置 ================================== */
	var Config = {
	    type: 'touch',          // 类型
	    indexView: 'index',   // 默认的首屏 View
	    animate: TRUE,        // 是否动画
	    defaultAnimate: 'moveEnter',   // 默认的动画
	    autoInit: TRUE,       // 是否自动初始化视图
	    hashRouter: TRUE,     // 是否开启 hash router
	    hashSupport: {
	        all: TRUE,        // 是否默认全部
	        exist: [],        // 白名单
	        except: []        // 黑名单
	    },
	    customRoot: TRUE,     // 是否使用自定义的 Root
	    appRoot: NULL,        // Root 节点
	    screen: {
	        rotate: FALSE,    // 是否支持屏幕旋转
	        largeChange: TRUE // 检测屏幕变大
	    },
	    gesture: {
	        open: TRUE,       // 是否开启手势
	        ctrl: TRUE,       // 是否开启手势控制 (在 View 切换时，禁用手势)
	        longTap: TRUE ,   // 长按是否触发 Tap 事件
	        autoBlur: TRUE    // 自动控制元素失去焦点
	    },
	    root: {               // Root 节点位置和大小配置
	        top: 0,
	        right: 0,
	        bottom: 0,
	        left: 0
	    },
	    logLevel: 1          // 日志等级
	};
	

	/**
	 * 环境嗅探
	 *
	 * @property QApp.sniff
	 * @type {Object}
	 * @category Sniff
	 * @value {os: 'ios', ios: true, android: false, iphone: true, ipad: false, ipod: false, imobile: true, osVersion: '8.1.2', osVersionN: 8, pixelRatio: 2, retina: true, pc: false}
	 */
	var _sniff = (function() {
	    var sniff = {}; // 结果
	
	    var ua = navigator.userAgent,
	        platform = navigator.platform,
	        android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),  // 匹配 android
	        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),            // 匹配 ipad
	        ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),         // 匹配 ipod
	        iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);        // 匹配 iphone
	
	    sniff.ios = sniff.android = sniff.iphone = sniff.ipad = sniff.ipod = FALSE;
	
	    /**
	     * Android 设备嗅探
	     *
	     * @property QApp.sniff.android
	     * @type {Boolean}
	     * @category Sniff
	     */
	    if (android) {
	        sniff.os = 'android';
	        sniff.osVersion = android[2];
	        sniff.android = TRUE;
	    }
	
	    /**
	     * iOS 设备嗅探
	     *
	     * @property QApp.sniff.ios
	     * @type {Boolean}
	     * @category Sniff
	     */
	    if (ipad || iphone || ipod) {
	        sniff.os = 'ios';
	        sniff.ios = TRUE;
	    }
	
	    /**
	     * iPhone 设备嗅探
	     *
	     * @property QApp.sniff.iphone
	     * @type {Boolean}
	     * @category Sniff
	     */
	    if (iphone) {
	        sniff.osVersion = iphone[2].replace(/_/g, '.');
	        sniff.iphone = TRUE;
	        sniff.imobile = TRUE;
	    }
	
	    /**
	     * iPad 设备嗅探
	     *
	     * @property QApp.sniff.ipad
	     * @type {Boolean}
	     * @category Sniff
	     */
	    if (ipad) {
	        sniff.osVersion = ipad[2].replace(/_/g, '.');
	        sniff.ipad = TRUE;
	    }
	
	    /**
	     * iPod 设备嗅探
	     *
	     * @property QApp.sniff.ipod
	     * @type {Boolean}
	     * @category Sniff
	     */
	    if (ipod) {
	        sniff.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : NULL;
	        sniff.ipod = TRUE;
	        sniff.imobile = TRUE;
	    }
	
	    /**
	     * imobile 设备嗅探
	     *
	     * @property QApp.sniff.imobile
	     * @type {Boolean}
	     * @category Sniff
	     */
	
	    /**
	     * ios 设备嗅探
	     *
	     * @property QApp.sniff.ios
	     * @type {Boolean}
	     * @category Sniff
	     */
	
	    // iOS 8+ changed UA
	    if (sniff.ios && sniff.osVersion && ua.indexOf('Version/') >= 0) {
	        if (sniff.osVersion.split('.')[0] === '10') {
	            sniff.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
	        }
	    }
	
	    /**
	     * osVersion 设备版本
	     *
	     * @property QApp.sniff.osVersion
	     * @type {String}
	     * @category Sniff
	     * @value '8.1.2'
	     */
	
	    /**
	     * osVersionN 设备版本
	     *
	     * @property QApp.sniff.osVersionN
	     * @type {Number}
	     * @category Sniff
	     * @value 8
	     */
	
	    if (sniff.osVersion) {
	        sniff.osVersionN = parseInt(sniff.osVersion.match(/\d+\.?\d*/)[0]);
	    }
	
	    /**
	     * 像素比率
	     *
	     * @property QApp.sniff.pixelRatio
	     * @type {Number}
	     * @category Sniff
	     * @value 2
	     */
	    sniff.pixelRatio = win.devicePixelRatio || 1;
	
	    /**
	     * 高清屏判断
	     *
	     * @property QApp.sniff.retina
	     * @type {Boolean}
	     * @category Sniff
	     */
	    sniff.retina = sniff.pixelRatio >= 2;
	
	    /**
	     * 判断是否在pc上模拟
	     *
	     * @property QApp.sniff.pc
	     * @type {Boolean}
	     * @category Sniff
	     */
	    sniff.pc = platform.indexOf('Mac') === 0 || platform.indexOf('Win') === 0 || (platform.indexOf('linux') === 0 && !sniff.android);
	
	    return sniff;
	})();
	

	/* ================================== 工具部分 ================================== */
	var __object__ = Object.prototype,
	    __array__ = Array.prototype,
	    toString = __object__.toString,
	    slice = __array__.slice,
	    readyReg = /complete|loaded|interactive/,  // 页面 ready 时的状态
	    elementReg = /Element$/,                   // 节点类型正则
	    svgReg = /^\[object SVG\w*Element\]$/,     // SVG判定
	    whiteSpace = ' ',                          // className 分隔符
	    curId = 1,                                 // id 初始值
	    curZIndex = 1000;                          // zIndex 初始值
	
	// 元素 Bool 属性
	var bools = "autofocus,autoplay,async,allowTransparency,checked,controls,declare,disabled,defer,defaultChecked,defaultSelected,contentEditable,isMap,loop,multiple,noHref,noResize,noShade,open,readOnly,selected",
	    boolMap = {};
	
	bools.replace(/\w+/g, function (name) {
	    boolMap[name.toLowerCase()] = name;
	});
	
	// 检测 css 支持
	var vendors = ['Webkit', '', 'Moz', 'O'],
	    testEl = doc.createElement('div'),
	    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
	    transformAttr = '',
	    prefix = '', eventPrefix;
	
	vendors.every(function (vendor) {
	    if (testEl.style[vendor + 'TransitionProperty'] !== UNDEFINED) {
	        if (vendor) {
	            prefix = '-' + vendor.toLowerCase() + '-';
	        }
	        eventPrefix = vendor.toLowerCase();
	        return FALSE;
	    }
	});
	
	testEl = NULL;
	
	transformAttr = prefix + 'transform';
	
	function _noop() {} // 空方法
	
	// 获取 obj 的 key 列表
	function keys(obj) {
	    var ret = [],
	        key;
	    for (key in obj) {
	        ret.push(key);
	    }
	    return ret;
	}
	
	// 类型判断
	var class2type = {
	    '[object HTMLDocument]': 'Document',
	    '[object HTMLCollection]': 'NodeList',
	    '[object StaticNodeList]': 'NodeList',
	    '[object IXMLDOMNodeList]': 'NodeList',
	    '[object DOMWindow]': 'Window',
	    '[object global]': 'Window',
	    'null': 'Null',
	    'NaN': 'NaN',
	    'undefined': 'Undefined'
	};
	
	'Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,Null,Undefined'
	    .replace(/\w+/ig, function (value) {
	        class2type['[object ' + value + ']'] = value;
	    });
	
	
	/**
	 * 类型判断
	 *
	 * @method QApp.util.is
	 * @category Util-Fn
	 * @param {Any} obj 要判断的对象
	 * @param {String=} match 匹配的类型
	 * @return {String|Boolean} 如果match参数存在，则返回是否匹配，如果不存在，则返回类型
	 */
	function getType(obj, match) {
	    var rs = class2type[(obj === NULL || obj !== obj) ? obj :
	            toString.call(obj)] ||
	        (obj && obj.nodeName) || '#';
	    if (obj === UNDEFINED) {
	        rs = 'Undefined';
	    } else if (rs.charAt(0) === '#') {
	        if (obj == obj.document && obj.document != obj) {
	            rs = 'Window';
	        } else if (obj.nodeType === 9) {
	            rs = 'Document';
	        } else if (obj.callee) {
	            rs = 'Arguments';
	        } else if (isFinite(obj.length) && obj.item) {
	            rs = 'NodeList';
	        } else {
	            rs = toString.call(obj).slice(8, -1);
	        }
	    }
	    if (match) {
	        return match === rs;
	    }
	    return rs;
	}
	
	function _isObject(source) {
	    return getType(source, 'Object');
	}
	
	function _isArray(source) {
	    return getType(source, 'Array');
	}
	
	function _isString(source) {
	    return getType(source, 'String');
	}
	
	function _isFunction(source) {
	    return getType(source, 'Function');
	}
	
	function _isElement(obj) {
	    if (obj && obj.nodeType === 1) {       //先过滤最简单的
	        if (obj instanceof Node){          //如果是IE9,则判定其是否Node的实例
	            return TRUE;                   //由于obj可能是来自另一个文档对象，因此不能轻易返回false
	        }
	        return elementReg.test(toString.call(obj));
	    }
	    return FALSE;
	}
	
	function _isNumber(source) {
	    return getType(source, 'Number');
	}
	
	function _isPlainObject(source) {
	    return getType(source, 'Object') && Object.getPrototypeOf(source) === __object__;
	}
	
	function _isEmptyObject(source) {
	    try {
	        return  JSON.stringify(source) === "{}";
	    } catch (e) {
	        return FLASE;
	    }
	}
	
	/**
	 * 扩展
	 *
	 * @method QApp.util.extend
	 * @category Util-Fn
	 * @param {boolen} deep true表示深拷贝，false表示浅拷贝，默认没有此参数
	 * @param {Any} target 需要扩展的对象
	 * @return {Object} 扩展后的对象
	 * @example
	 *    var obj1, obj2, obj3, //定义变量
	 *        deep; //定义一个布尔值
	 *    QApp.util.extend(true, {}, obj1, obj2, obj3); //深拷贝，obj1, obj2, obj3的属性重新生成后放到{}上
	 *
	 *    var obj1, obj2, obj3,//定义变量
	 *        deep;//定义一个布尔值
	 *    QApp.util.extend(obj1, obj2, obj3); //浅拷贝，obj2，obj3的属性被复制到obj1上
	 */
	// extend
	function extend(target, source, deep) {
	    var key;
	    for (key in source) {
	        if (deep && (_isPlainObject(source[key]) || _isArray(source[key]))) {
	            if (_isPlainObject(source[key]) && !_isPlainObject(target[key])) {
	                target[key] = {};
	            }
	            if (_isArray(source[key]) && !_isArray(target[key])) {
	                target[key] = [];
	            }
	            extend(target[key], source[key], deep);
	        } else if (source[key] !== UNDEFINED) {
	            target[key] = source[key];
	        }
	    }
	}
	
	function _extend(target) {
	    var deep,
	        args = slice.call(arguments, 1);
	    if (typeof target == 'boolean') {
	        deep = target;
	        target = args.shift();
	    }
	    args.forEach(function (arg) {
	        extend(target, arg, deep);
	    });
	    return target;
	}
	
	/**
	 * 遍历对象
	 *
	 * @method QApp.util.each
	 * @category Util-Fn
	 * @param {Object} obj 遍历的对象
	 * @param {Function} fn 回调
	 * @example
	 *    var people = {name: 'xiaoming'};
	 *    function fn(obj, key, item){};
	 *    QApp.util.each(obj, fn); //遍历对象，执行函数fn
	 */
	// each
	function _each(obj, fn) {
	    var key;
	    for (key in obj) {
	        fn.call(obj, key, obj[key]);
	    }
	}
	
	/**
	 * 数组化
	 *
	 * @method QApp.util.makeArray
	 * @category Util-Fn
	 * @param {Any} iteration 需要转换的变量
	 * @return {Array|Boolean} 结果数组，如果转化不成功，则返回 false
	 * @example
	 *    //定义一个类数组对象
	 *    var likeArray = {
	 *        0: param1,
	 *        1: param2,
	 *        2: param3,
	 *        length: 3
	 *    };
	 *
	 *    QApp.util.makeArray(likeArray); //返回一个数组，值为(length-1)下标逆序下标数组
	 */
	// MakeArray
	function _makeArray(iterable) {
	    if (!iterable)
	        return FALSE;
	    var n = iterable.length;
	    if (n === (n >>> 0)) {
	        try {
	            return slice.call(iterable);
	        } catch (e) {
	        }
	    }
	    return FALSE;
	}
	
	/**
	 * 延时封装
	 *
	 * @method QApp.util.delay
	 * @category Util-Fn
	 * @param {Function} func 方法
	 * @param {Number} [delay] 延时时间，默认值为0
	 * @return {Number} Timeout的ID
	 * @example
	 *    var time = 1000;
	 *    function fn(){}
	 *    QApp.util.delay(fn, time); // 延迟1s执行函数
	 */
	// Delay
	function _delay(func, delay) {
	    return win.setTimeout(func, delay || 0);
	}
	
	/**
	 * 数组映射对象
	 *
	 * @method QApp.util.associate
	 * @category Util-Fn
	 * @param {Array} arrVal 数组数
	 * @param {Array} arrKey key数组
	 * @return {Object} 对象数据
	 * @example
	 *    //对象属性值数组
	 *    var arrValues = [val1, val2, val3];
	 *    //对象属性名数组
	 *    var arrKeys = [key1, key2, key3];
	 *
	 *    QApp.util.associate(arrValues, arrKeys); // {key1: val1, key2: val2, key3: val3}
	 */
	// Associate
	function _associate(arrVal, arrKey) {
	    var obj = {}, i = 0;
	    for (; i < arrKey.length; i++) {
	        obj[arrKey[i]] = arrVal[i];
	    }
	    return obj;
	}
	
	/**
	 * 对象映射数组
	 *
	 * @method QApp.util.mapping
	 * @category Util-Fn
	 * @param {Object} obj 对象数据
	 * @param {Array} arrKey key数组
	 * @return {Array}  数组数据
	 * @example
	 *    var obj = {
	 *        key1: value1,
	 *        key2: value2,
	 *        key3: value3
	 *    };
	 *    //想要输出对象值的属性数组
	 *    var arrKeys = [key1, key3];
	 *
	 *    QApp.util.mapping(obj, arrKeys);//返回[value1, value3]
	 */
	// Mapping
	function _mapping(obj, arrKey) {
	    var arrVal = [], i = 0;
	    for (; i < arrKey.length; i++) {
	        arrVal[i] = obj[arrKey[i]];
	    }
	    return arrVal;
	}
	
	/**
	 * 获取唯一id
	 *
	 * @method QApp.util.getUniqueID
	 * @category Util-Fn
	 * @return {Number} 唯一的id
	 * @example
	 *    var variable = QApp.util.getUniqueID; //获取到唯一id
	 */
	// UniqueID
	function _getUniqueID() {
	    return curId ++;
	}
	
	/**
	 * 获取自增 z-index
	 *
	 * @method QApp.util.getZIndex
	 * @category Util-Fn
	 * @return {Number} 获取的 z-index
	 * @example
	 *    QApp.util.getZIndex();//获取自增z-index，最小值是1001
	 */
	// zIndex
	function _getZIndex() {
	    return curZIndex++;
	}
	
	/**
	 * 驼峰化
	 *
	 * @method QApp.util.camelCase
	 * @category Util-Fn
	 * @param {String} str 需要转化的字符串
	 * @return {String} 转化后的字符串
	 * @example
	 *    var str = "div-element"; // 定义一个通过 "-" 或 "/" 分割的变量
	 *    QApp.util.camelCase(str);   // 返回divElement
	 */
	// parseString
	function _camelCase(str) {
	    return str.replace(/[-_][^-_]/g, function (match) {
	        return match.charAt(1).toUpperCase();
	    });
	}
	
	/**
	 * 连接化
	 *
	 * @method QApp.util.dasherize
	 * @category Util-Fn
	 * @param {String} str 需要转化的字符串
	 * @return {String} 转化后的字符串
	 * @example
	 *    // 声明一个值为驼峰形式的字符串
	 *    var str = "divElement";
	 *    QApp.util.dasherize(str);  // 返回以 "-" 连接的字符串，div-element
	 */
	// dasherize
	function _dasherize(str) {
	    return str.replace(/([a-z\d])([A-Z])/g, '$1-$2')
	        .replace(/\_/g, '-').toLowerCase();
	}
	
	/**
	 * 清空对象
	 *
	 * @method QApp.util.empty
	 * @category Util-Fn
	 * @param {Object} obj 要清空的对象
	 * @example
	 *    //定义一个对象
	 *    var programmer = {
	 *        name: "missy",
	 *        age: 22
	 *    };
	 *    QApp.util.empty(programmer);//无返回值，对象属性值将被清空。programmer {name:null, age:null}
	 */
	// empty
	function _empty(obj) {
	    var key;
	    for (key in obj) {
	        obj[key] = NULL;
	    }
	}
	
	/**
	 * 对象判空
	 *
	 * @method QApp.util.isNull
	 * @category Util-Fn
	 * @param {Object} obj 要判空的对象
	 * @return {Boolean} 判空结果
	 */
	// isNull
	function _isNull(obj) {
	    return obj === UNDEFINED || obj === NULL;
	}
	
	/**
	 * json数据转换成查询字符串
	 *
	 * @method QApp.util.jsonToQuery
	 * @category Util-Fn
	 * @param {JSON} json 数据
	 * @param {Any} [isEncode] 是否被编码
	 * @return {String} 结果字符串
	 */
	// jsonToQuery
	function encodeFormat(data, isEncode) {
	    data = (data === NULL ? '' : data).toString().trim();
	    return isEncode ? encodeURIComponent(data) : data;
	}
	
	function _jsonToQuery(json, isEncode){
	    var qs = [], k, i, len;
	    for (k in json) {
	        if (_isNull(json[k])) {
	            qs = qs.concat(k);
	        } else if (_isArray(json[k])) {
	            for (i = 0, len = json[k].length; i < len; i++) {
	                if (!_isFunction(json[k][i])) {
	                    qs.push(k + "=" + encodeFormat(json[k][i], isEncode));
	                }
	            }
	        } else if(!_isFunction(json[k]) && (json[k] !== NULL && json[k] !== UNDEFINED)){
	            qs.push(k + "=" + encodeFormat(json[k], isEncode));
	        }
	    }
	    return qs.join('&');
	}
	
	/**
	 * 查询字符串转换成json数据
	 *
	 * @method QApp.util.queryToJson
	 * @category Util-Fn
	 * @param {String} data 数据
	 * @param {Any} [isDecode] 是否被编码
	 * @return {Object} 结果对象
	 */
	// queryToJson
	
	function decodeFormat(data, isDecode){
	    return _isNull(data) ? data : isDecode ? decodeURIComponent(data) : data;
	}
	
	function _queryToJson(qs, isDecode){
	    var qList = qs.trim().split("&"),
	        json = {},
	        i = 0,
	        len = qList.length;
	
	    for (; i < len; i++) {
	        if (qList[i]) {
	            var hash = qList[i].split("="),
	                key = hash[0],
	                value = hash[1];
	            if (!(key in json)) {
	                // 如果缓存堆栈中没有这个数据，则直接存储
	                json[key] = decodeFormat(value, isDecode);
	            } else {
	                // 如果堆栈中已经存在这个数据，则转换成数组存储
	                json[key] = [].concat(json[key], decodeFormat(value, isDecode));
	            }
	        }
	    }
	    return json;
	}
	
	// custEvent
	function _once(func) {
	    var ran = FALSE,
	        memo;
	    return function () {
	        if (ran) return memo;
	        ran = TRUE;
	        memo = func.apply(this, arguments);
	        func = NULL;
	        return memo;
	    };
	}
	
	var triggerEvents = function (events, args) {
	    var ev,
	        i = -1,
	        l = events.length,
	        ret = 1;
	    while (++i < l && ret) {
	        ev = events[i];
	        ret &= (ev.callback.apply(ev.ctx, args) !== false);
	    }
	    return !!ret;
	};
	
	var CustEvent = {
	    on: function (name, callback, context) {
	        this._events = this._events || {};
	        this._events[name] = this._events[name] || [];
	        var events = this._events[name];
	        events.push({
	            callback: callback,
	            context: context,
	            ctx: context || this
	        });
	        return this;
	    },
	    once: function (name, callback, context) {
	        var self = this;
	        var once = _once(function () {
	            self.off(name, once);
	            callback.apply(this, arguments);
	        });
	        once._callback = callback;
	        return this.on(name, once, context);
	    },
	    off: function (name, callback, context) {
	        if (!this._events) return this;
	        var retain, ev, events, names, i, l, j, k;
	        if (!name && !callback && !context) {
	            this._events = UNDEFINED;
	            return this;
	        }
	        names = name ? [name] : keys(this._events);
	        for (i = 0, l = names.length; i < l; i++) {
	            name = names[i];
	            events = this._events[name];
	            if (events) {
	                this._events[name] = retain = [];
	                if (callback || context) {
	                    for (j = 0, k = events.length; j < k; j++) {
	                        ev = events[j];
	                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
	                            (context && context !== ev.context)) {
	                            retain.push(ev);
	                        }
	                    }
	                }
	                if (!retain.length) delete this._events[name];
	            }
	        }
	        return this;
	    },
	    trigger: function (name) {
	        if (!this._events) return this;
	        var args = slice.call(arguments, 1),
	            events = this._events[name],
	            allEvents = this._events.all,
	            ret = 1;
	        if (events) {
	            ret &= triggerEvents(events, args);
	        }
	        if (allEvents && ret) {
	            ret &= triggerEvents(allEvents, args);
	        }
	        return !!ret;
	    }
	};
	
	function _createEventManager() {
	    var EM = function () {
	    };
	    _extend(EM.prototype, CustEvent);
	    return new EM();
	}
	
	// Deferred
	function Deferred() {
	
	    var status = 'pending',
	        ret,
	        isStart = FALSE,
	        startFn,
	        that = {},
	        events = (function () {
	            var binds = {
	                resolve: [],
	                reject: [],
	                notify: []
	            };
	            return {
	                add: function (type, fn) {
	                    binds[type].push(fn);
	                },
	                remove: function (type, fn) {
	                    var index = binds[type].indexOf(fn);
	                    if (index > -1) {
	                        binds[type].splice(index, 1);
	                    }
	                },
	                clear: function(type) {
	                    binds[type].length = 0;
	                },
	                fire: function (type, args) {
	                    binds[type].forEach(function (fn) {
	                        fn.apply(NULL, args);
	                    });
	                },
	                destroy: function () {
	                    binds.resolve.length = 0;
	                    binds.reject.length = 0;
	                    binds.notify.length = 0;
	                }
	            };
	        })();
	
	    function bind(onResolved, onRejected, onProgressed) {
	        if (_isFunction(startFn) && !isStart) {
	            isStart = TRUE;
	            startFn(that);
	        }
	        if (_isFunction(onResolved)) {
	            if (status === 'resolved') {
	                onResolved.apply(NULL, ret);
	            } else if (status === 'pending') {
	                events.add('resolve', onResolved);
	            }
	        }
	        if (_isFunction(onRejected)) {
	            if (status === 'rejected') {
	                onRejected.apply(NULL, ret);
	            } else if (status === 'pending') {
	                events.add('reject', onRejected);
	            }
	        }
	        if (_isFunction(onProgressed)) {
	            events.add('notify', onProgressed);
	        }
	    }
	
	    that.enabled = TRUE;
	
	    that.all = function (onResolvedOrRejected) {
	        bind(onResolvedOrRejected, onResolvedOrRejected);
	        return that;
	    };
	
	    that.done = function (onResolved) {
	        bind(onResolved);
	        return that;
	    };
	
	    that.fail = function (onRejected) {
	        bind(NULL, onRejected);
	        return that;
	    };
	
	    that.progress = function (onProgressed) {
	        bind(NULL, NULL, onProgressed);
	        return that;
	    };
	
	    that.unProgress = function (onProgressed) {
	        events.remove('notify', onProgressed);
	        return that;
	    };
	
	    that.then = function (onResolved, onRejected, onProgressed) {
	        bind(onResolved, onRejected, onProgressed);
	        return that;
	    };
	
	    that.resolve = function () {
	        if (status === 'pending') {
	            status = 'resolved';
	            ret = slice.call(arguments);
	            events.fire('resolve', ret);
	        }
	        return that;
	    };
	
	    that.reject = function () {
	        if (status === 'pending') {
	            status = 'rejected';
	            ret = slice.call(arguments);
	            events.fire('reject', ret);
	        }
	        return that;
	    };
	
	    that.notify = function () {
	        events.fire('notify', slice.call(arguments));
	        return that;
	    };
	
	    that.state = function () {
	        return status;
	    };
	
	    that.startWith = function (fn) {
	        startFn = fn;
	        return that;
	    };
	
	    that.destroy = function () {
	        that.enabled = FALSE;
	        that.notify('destroy');
	        status = NULL;
	        ret = NULL;
	        isStart = NULL;
	        startFn = NULL;
	        that.destroy = function(){};
	        that = NULL;
	        events.destroy();
	        events = NULL;
	    };
	
	    return that;
	}
	
	/**
	 * 异步串行
	 *
	 * @method QApp.util.queue
	 * @category Util-Fn
	 * @param {Array<Deferred>} list Deferred 列表
	 * @param {Array<String>} keys 结果映射
	 * @param {Boolean} dynamic 是否支持动态添加
	 * @return {Deferred} 异步对象
	 */
	// Queue
	function _queue(list, keys, dynamic) {
	    var deferred = new Deferred(),
	        queue = dynamic ? list : list.slice(0),
	        ret = [],
	        index = -1,
	        getKey = function (index) {
	            getKey = (keys && keys.length) ? function (index) {
	                return keys[index];
	            } : function (index) {
	                return index;
	            };
	            return getKey(index);
	        },
	        next = function () {
	            index++;
	            var pro = queue.shift();
	            if (pro && _isFunction(pro.all)) {
	                pro.all(function (data) {
	                    deferred.notify(getKey(index), data, list);
	                    ret[index] = data;
	                    next();
	                });
	            } else if (pro) {
	                if (_isFunction(pro)) {
	                    var p = pro(ret[index - 1], ret);
	                    if (p && _isFunction(p.all)) {
	                        p.all(function (data) {
	                            deferred.notify(getKey(index), data, list);
	                            ret[index] = data;
	                            next();
	                        });
	                    } else {
	                        deferred.notify(getKey(index), p, list);
	                        ret[index] = p;
	                        next();
	                    }
	                } else {
	                    deferred.notify(getKey(index), pro, list);
	                    ret[index] = pro;
	                    next();
	                }
	            } else {
	                if (keys && keys.length) {
	                    ret = _associate(ret, keys);
	                }
	                deferred.resolve.call(NULL, ret);
	            }
	        };
	
	    return deferred.startWith(next);
	}
	
	/**
	 * 异步并行
	 *
	 * @method QApp.util.parallel
	 * @category Util-Fn
	 * @param {Array<Deferred>} list Deferred 列表
	 * @param {Array<String>} [keys] 结果映射
	 * @return {Deferred} 异步对象
	 */
	// Parallel
	function _parallel(list, keys) {
	    var deferred = new Deferred(),
	        queue = list.slice(0),
	        ret = [],
	        num = 0,
	        check = function () {
	            if (num === queue.length) {
	                if (keys && keys.length) {
	                    ret = _associate(ret, keys);
	                }
	                deferred.resolve.call(NULL, ret);
	            }
	        },
	        start = function () {
	            queue.forEach(function (pro, index) {
	                if (pro && _isFunction(pro.all)) {
	                    ret[index] = UNDEFINED;
	                    pro.all(function (data) {
	                        ret[index] = data;
	                        num++;
	                        check();
	                    });
	                } else {
	                    ret[index] = pro;
	                    num++;
	                }
	            });
	            check();
	        };
	
	    return deferred.startWith(start);
	}
	
	// Dom
	
	/**
	 * Ready
	 *
	 * @method QApp.util.ready
	 * @category Util-Dom
	 * @param {Function} callback 回调函数
	 * @example
	 *    QApp.util.ready(function(){});
	 */
	// ready
	function _ready(callback) {
	    if (readyReg.test(doc.readyState) && doc.body) {
	        callback();
	    } else {
	        _addEvent(doc, 'DOMContentLoaded', function () {
	            callback();
	        }, FALSE);
	    }
	}
	
	/**
	 * 节点构造
	 *
	 * @method QApp.util.builder
	 * @category Util-Dom
	 * @param {String} html html片段
	 */
	function _builder(html) {
	
	    var frame, children,
	        toCreate = 'div';
	
	    [['li', 'ul'], ['tr', 'tbody'], ['td', 'tr'], ['th', 'tr'], ['tbody', 'table'], ['option', 'select']].some(function (item) {
	        if (html.indexOf('<' + item[0]) === 0) {
	            toCreate = item[1];
	            return TRUE;
	        }
	    });
	
	    frame = doc.createElement(toCreate);
	    frame.innerHTML = html;
	    children = _makeArray(frame.children);
	    frame = doc.createDocumentFragment();
	
	    children.forEach(function (node) {
	        frame.appendChild(node);
	    });
	
	    return {
	        box: frame,
	        children: children
	    };
	}
	
	/**
	 * 节点添加
	 *
	 * @method QApp.util.appendNodes
	 * @category Util-Dom
	 * @param {Element} node 目标节点
	 * @param {Element|Array<Element>} elements 节点或节点数组
	 * @example
	 *    // 为 el 添加子节点
	 *    var el = document.getElementById('demo'),
	 *        nodes = [document.createTextNode("1"), document.createTextNode("2")];
	 *    QApp.util.appendNodes(el, nodes);
	 *    QApp.util.appendNodes(el, nodes);
	 */
	function _appendNodes(node, elements) {
	    elements = [].concat(elements);
	    elements.forEach(function (element) {
	        node.appendChild(element);
	    });
	}
	
	/**
	 * 节点插入
	 *
	 * @method QApp.util.insertElement
	 * @category Util-Dom
	 * @param {Element} node 节点
	 * @param {Element} element 新节点
	 * @param {String} [where] 插入位置
	 * @return {Element} 新节点
	 * @example
	 *    var node = document.getElementById('demo'),
	 *        el = document.createElement('p');
	 *    el.innerHTML = 'text';
	 *    QApp.util.insertElement(node, el, 'beforebegin'); // 将node开始前插入el
	 *    QApp.util.insertElement(node, el, 'afterbegin'); // 将node开始后插入el
	 *    QApp.util.insertElement(node, el, 'beforeend'); // 将node结束前插入el
	 *    QApp.util.insertElement(node, el, 'afterend'); // 将node结束后插入el
	 *    QApp.util.insertElement(node, el); // 缺省默认为'beforeend'
	 */
	function _insertElement(node, element, where) {
	    where = where ? where.toLowerCase() : "beforeend";
	    switch (where) {
	        case "beforebegin":
	            node.parentNode.insertBefore(element, node);
	            break;
	        case "afterbegin":
	            node.insertBefore(element, node.firstChild);
	            break;
	        case "beforeend":
	            node.appendChild(element);
	            break;
	        case "afterend":
	            if (node.nextSibling) {
	                node.parentNode.insertBefore(element, node.nextSibling);
	            } else {
	                node.parentNode.appendChild(element);
	            }
	            break;
	    }
	    return element;
	}
	
	/**
	 * 删除节点
	 *
	 * @method QApp.util.removeNode
	 * @category Util-Dom
	 * @param {Element} node 被删除的节点
	 * @example
	 *    var el = document.getElementById('demo');
	 *    QApp.util.removeNode(el);
	 */
	function _removeNode(node) {
	    if (node && node.parentNode) {
	        node.parentNode.removeChild(node);
	    }
	}
	
	/**
	 * 获取或设置节点属性值
	 *
	 * @method QApp.util.attr
	 * @category Util-Dom
	 * @param {Element} node 目标节点
	 * @param {{String|Object}} attrName 类型为String时，当两个参数时获取节点属性，当三个参数时修改节点属性；类型为Object时，按照健值对修改节点属性
	 * @return {String} 节点的属性值
	 * @example
	 *    var el = document.getElementById('demo'),
	 *        attrKey = 'id', // 属性名
	 *        attrVal1 = 'new-value', // 属性值
	 *        attrVal2 = 'other-value',
	 *        attr = { // 属性对象
	 *           'id': 'new-value'
	 *        };
	 *    QApp.util.attr(el, attrKey, attrVal1); // 增加属性
	 *    QApp.util.attr(el, attrKey, attrVal2); // 修改属性
	 *    QApp.util.attr(el, attrKey, null);     // 删除属性
	 *    QApp.util.attr(el, attr);              // 利用object方式修改属性
	 */
	function setAttr(node, attrName, value) {
	    var toRemove = (value === FALSE) || (value === null) || (value === void 0);
	    var bool = boolMap[attrName];
	    if (typeof node[bool] === "boolean") {
	        node[bool] = !!value;     //布尔属性必须使用el.xxx = true|false方式设值
	        if (!value) {            //如果为false, IE全系列下相当于setAttribute(xxx,''),会影响到样式,需要进一步处理
	            toRemove = TRUE;
	        }
	    }
	    if (toRemove) {
	        return node.removeAttribute(attrName);
	    }
	    // SVG只能使用setAttribute(xxx, yyy), VML只能使用elem.xxx = yyy ,HTML的固有属性必须elem.xxx = yyy
	    var isInnate = svgReg.test(node) ? FALSE : attrName in node.cloneNode(FALSE);
	    if (isInnate) {
	        node[attrName] = value;
	    } else {
	        node.setAttribute(attrName, value);
	    }
	}
	
	function _attr(node, attrName) {
	    if (_isString(attrName)) {
	        if (arguments.length > 2) {
	            setAttr(node, attrName, arguments[2]);
	        } else {
	            return node.getAttribute(attrName);
	        }
	    } else {
	        _each(attrName, function (key, value) {
	            setAttr(node, key, value);
	        });
	    }
	}
	
	/**
	 * 获取或设置节点样式
	 *
	 * @method QApp.util.css
	 * @category Util-Dom
	 * @param {Element} node 目标节点
	 * @param {{String|Object}} property 类型为String时，当两个参数时获取节点样式，当三个参数时修改节点样式；类型为Object时，按照健值对修改样式
	 * @param {String} [value] 设定的值
	 * @return {String} 节点的样式值
	 * @example
	 *    var el = document.getElementById('demo'),
	 *        attr1 = 'background-color',
	 *        value1 = 'red',
	 *        attr2 = 'borderColor',
	 *        value2 = 'blue',
	 *        attr3 = 'translateY',
	 *        value3 = '20px',
	 *        obj = {
	 *            "translateX": "20px",
	 *            "scaleX": 2
	 *        };
	 *    QApp.util.css(el, attr1, value1); // 增加行内样式属性
	 *    QApp.util.css(el, attr2, value2); // 增加行内样式属性
	 *    QApp.util.css(el, attr2, value2); // 增加行内样式属性
	 *    QApp.util.css(el, attr3, value3); // 增加行内样式属性
	 *    QApp.util.css(el, obj); // 增加行内样式属性
	 *    QApp.util.css(el, attr2, null); // 删除行内样式属性
	 *    QApp.util.css(el, attr1, value2); // 更改行内样式属性
	 *    QApp.util.css(el, attr1); // 查找行内样式属性
	 */
	function _css(node, property) {
	    if (node && node.style) {
	        if (_isString(property)) {
	            if (arguments.length > 2) {
	                var value = arguments[2];
	                if (supportedTransforms.test(property)) {
	                    node.style[transformAttr] = property + '(' + value + ')';
	                } else {
	                    property = _camelCase(property);
	                    if (value || value === 0) {
	                        node.style[property] = value;
	                    } else {
	                        node.style.removeProperty(property);
	                    }
	                }
	            } else {
	                var styles = win.getComputedStyle(node, NULL),
	                    ret;
	                if (styles) {
	                    ret = styles[_camelCase(property)];
	                }
	                return ret;
	            }
	        } else {
	            var styleList = [],
	                transforms = '';
	            _each(property, function (key, value) {
	                if (supportedTransforms.test(key)) {
	                    transforms += key + '(' + value + ') ';
	                } else {
	                    styleList.push(_dasherize(key) + ':' + value);
	                }
	            });
	            if (transforms.length) {
	                styleList.push(_dasherize(transformAttr) + ':' + transforms);
	            }
	            node.style.cssText += ';' + styleList.join(';') + ';';
	        }
	    }
	}
	
	/**
	 * 删除样式
	 *
	 * @method QApp.util.removeStyle
	 * @category Util-Dom
	 * @param {Element} node 节点
	 * @param {String|Array} names 样式名称
	 * @example
	 *     var el = document.getElementById('demo');
	 *     el.style.display = 'none';
	 *     QApp.util.removeStyle(el, 'display');
	 */
	function _removeStyle(node, names) {
	    if (node && node.style) {
	        [].concat(names).forEach(function (name) {
	            node.style.removeProperty(name);
	            node.style.removeProperty(prefix + name);
	        });
	    }
	}
	
	/**
	 * 事件修复
	 *
	 * @method QApp.util.fixEvent
	 * @category Util-Dom
	 * @param {Event} event 事件
	 * @return {Event} 修复后的事件
	 * @example
	 *    var el = document.getElementById('demo'),
	 *        type = 'click',//事件类型
	 *        useCapture = false;//是否冒泡
	 *    QApp.util.addEvent(el, type, function(e){
	 *       var event = QApp.util.fixEvent(e);//事件修复
	 *    }, useCapture);
	 */
	function _fixEvent(event) {
	
	    if(!event.target){
	        event.target = event.srcElement || document;
	    }
	
	    // Safari
	    if (event.target.nodeType == 3) {
	        event.target = event.target.parentNode;
	    }
	
	    //fix pageX & pageY
	    if(event.pageX === NULL && event.clientX !== NULL){
	        var html = doc.documentElement,
	            body = doc.body;
	
	        event.pageX = event.clientX + (html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || body && body.clientLeft || 0);
	        event.pageY = event.clientY + (html.scrollTop  || body && body.scrollTop  || 0) - (html.clientTop  || body && body.clientTop  || 0);
	    }
	
	    return event;
	}
	
	/**
	 * 事件绑定
	 *
	 * @method QApp.util.addEvent
	 * @category Util-Dom
	 * @param {Element} node 节点
	 * @param {String} type 事件名
	 * @param {Function} listener 事件处理函数
	 * @param {Any} [useCapture] 事件处理阶段，默认是 false
	 * @example
	 *    // 监听 el 的 click 事件
	 *    var el = document.getElementById('demo'),
	 *        type = 'click', //事件类型
	 *        fn = function(){}, //回调函数
	 *        useCapture = false; //是否冒泡
	 *    QApp.util.addEvent(el, type, fn, useCapture);
	 */
	function _addEvent(node, type, listener, useCapture) {
	    node.addEventListener(type, listener, !!useCapture);
	}
	
	/**
	 * 解除绑定事件
	 *
	 * @method QApp.util.removeEvent
	 * @category Util-Dom
	 * @param {Element} node 目标节点
	 * @param {String} type 事件名
	 * @param {Function} listener 事件处理函数
	 * @example
	 *    var el = document.getElementById('demo'),
	 *        type = 'click',
	 *        fn = function(){},
	 *        useCapture = false;
	 *    QApp.util.addEvent(el, type, fn, useCapture);
	 *    QApp.util.removeEvent(el, type, fn);
	 */
	function _removeEvent(node, type, listener) {
	    node.removeEventListener(type, listener);
	}
	
	/**
	 * 事件触发
	 *
	 * @method QApp.util.dispatchEvent
	 * @category Util-Dom
	 * @param {Element} node 目标节点
	 * @param {String} type 事件名
	 * @param {Any} args 附加参数
	 */
	// dispatchEvent
	function _dispatchEvent(node, type, args) {
	    var event = doc.createEvent("Events");
	    event.initEvent(type, true, true);
	    _extend(event, args);
	    node.dispatchEvent(event);
	}
	
	/**
	 * 添加类名
	 *
	 * @method QApp.util.addClass
	 * @category Util-Dom
	 * @param {Element} node 节点
	 * @param {String} className 类名
	 * @example
	 *    // 为 el 新增一个 className 为 new-class
	 *    var el = document.getElementById('demo');
	 *    QApp.util.addClass(el, 'new-class');
	 */
	// addClass
	function _addClass(node, className) {
	    node.className = (node.className + whiteSpace + className).split(/\s+/).filter(function (item, index, source) {
	        return source.lastIndexOf(item) === index;
	    }).join(whiteSpace);
	}
	
	/**
	 * 移除元素指定类名
	 *
	 * @method QApp.util.removeClass
	 * @category Util-Dom
	 * @param {Element} node 节点
	 * @param {String} className 类名
	 * @example
	 *    var el = document.getElementById('demo');
	 *    QApp.util.removeClass(el, 'color');
	 */
	// removeClass
	function _removeClass(node, className) {
	    className = whiteSpace + className.replace(/\s+/g, whiteSpace) + whiteSpace;
	
	    node.className = node.className.split(/\s+/).filter(function (originClassName) {
	        return className.indexOf(whiteSpace + originClassName + whiteSpace) === -1;
	    }).join(whiteSpace);
	}
	
	/**
	 * 动态创建样式
	 *
	 * @method QApp.util.createStyle
	 * @category Util-Dom
	 * @param {String} cssText 样式字符串
	 */
	// createStyle
	function _createStyle(cssText) {
	    var style = doc.createElement('style');
	    style.type = 'text/css';
	    style.innerHTML = cssText;
	    doc.querySelector('head').appendChild(style);
	}
	
	/**
	 * 包含判定
	 *
	 * @method QApp.util.contains
	 * @category Util-Dom
	 * @param {Element} a 节点
	 * @param {Element} b 节点
	 * @return {Boolean} true表示a包含b；false表示a不包含b
	 */
	// contains
	var _contains = doc.compareDocumentPosition ? function (a, b) {
	    return !!(a.compareDocumentPosition(b) & 16);
	} : function (a, b) {
	    return a !== b && (a.contains ? a.contains(b) : TRUE);
	};
	
	/**
	 * 节点聚焦
	 *
	 * @method QApp.util.focus
	 * @category Util-Dom
	 * @param {Element} element 节点
	 */
	// focus
	function _focus(element) {
	    var length;
	
	    // 兼容 ios7 问题
	    if (_sniff.ios && element.setSelectionRange && element.type.indexOf('date') !== 0 && element.type !== 'time' && element.type !== 'month') {
	        length = element.value.length;
	        element.setSelectionRange(length, length);
	    } else {
	        element.focus();
	    }
	}
	
	/**
	 * 指定节点内的焦点元素失焦
	 *
	 * @method QApp.util.blur
	 * @category Util-Dom
	 * @param {Element} [container] 容器节点
	 */
	// blur
	function _blur(container) {
	    var el = doc.activeElement;
	    container = container || doc.body;
	    if (el && _contains(container, el) && _isFunction(el.blur)) {
	        el.blur();
	    }
	}
	
	/**
	 * 获取元素的尺寸
	 *
	 * @method QApp.util.size
	 * @category Util-Dom
	 * @param {Any} any 要获取尺寸的对象
	 */
	// size
	function docSize(doc) {
	    function getWidthOrHeight(clientProp) {
	        var docEl = doc.documentElement,
	            body = doc.body;
	        return Math.max(
	            body["scroll" + clientProp],
	            docEl["scroll" + clientProp],
	            body["offset" + clientProp],
	            docEl["offset" + clientProp],
	            docEl["client" + clientProp]
	        );
	    }
	
	    return {
	        width: getWidthOrHeight('Width'),
	        height: getWidthOrHeight('Height')
	    };
	}
	
	function winSize(win) {
	    function getWidthOrHeight(clientProp) {
	        return win.document.documentElement["client" + clientProp];
	    }
	
	    return {
	        width: getWidthOrHeight('Width'),
	        height: getWidthOrHeight('Height')
	    };
	}
	
	function _size(any) {
	    var type = getType(any),
	        ret;
	    switch (type) {
	        case 'Document':
	            ret = docSize(any);
	            break;
	        case 'Window':
	            ret = winSize(any);
	            break;
	        default:
	            ret = {
	                width: parseInt(_css(any, 'width'), 10),
	                height: parseInt(_css(any, 'height'), 10)
	            };
	    }
	
	    return ret;
	}
	
	/**
	 * 获取位置
	 *
	 * @method QApp.util.position
	 * @category Util-Dom
	 * @param {Element} el 获取位置的节点
	 * @return {Object} 包括 top 和 left 两个数值
	 */
	// position
	function generalPosition(el) {
	    var box = el.getBoundingClientRect(),
	        body = el.ownerDocument.body,
	        docEl = el.ownerDocument.documentElement,
	        scrollTop = Math.max(win.pageYOffset || 0, docEl.scrollTop, body.scrollTop),
	        scrollLeft = Math.max(win.pageXOffset || 0, docEl.scrollLeft, body.scrollLeft),
	        clientTop = docEl.clientTop || body.clientTop || 0,
	        clientLeft = docEl.clientLeft || body.clientLeft || 0;
	
	    return {
	        left: box.left + scrollLeft - clientLeft,
	        top: box.top + scrollTop - clientTop
	    };
	}
	
	function diff(pos, bPos) {
	    return {
	        left: pos.left - bPos.left,
	        top: pos.top - bPos.top
	    };
	}
	
	function _position(el) {
	    if (!_contains(el.ownerDocument.body, el)) {
	        return {
	            top: NaN,
	            left: NaN
	        };
	    }
	
	    return arguments.length > 1 ?
	        diff(generalPosition(el), generalPosition(arguments[1])) :
	        generalPosition(el);
	}
	
	/**
	 * 获取节点自定义数据
	 *
	 * @method QApp.util.dataSet
	 * @category Util-Dom
	 * @param {Element} node 目标节点
	 * @return {Object} 包含自定义数据的对象
	 */
	// dataSet
	function _dataSet(node) {
	    var ret = {};
	    if (node) {
	        if (node.dataset) {
	            _extend(ret, node.dataset);
	        } else {
	            var attrs = node.attributes;
	            for (var i = 0, l = attrs.length; i < l; i ++) {
	                var name = attrs[i].name,
	                    value = attrs[i].value;
	                if (name.indexOf('data-') === 0) {
	                    name = _camelCase(name.substring(5));
	                    ret[name] = value;
	                }
	            }
	        }
	    }
	    return ret;
	}
	
	// 其他
	
	/**
	 * 将函数应用于view
	 *
	 * @method QApp.util.apply
	 * @category Util-Fn
	 * @param {Function} callback 方法
	 * @param {Object} view 视图
	 * @param {Any} args 参数
	 * @return {Any} 函数执行结果
	 */
	// apply
	function _apply(callback, view, args) {
	    if (_isFunction(callback)) {
	        return callback.apply(view, _makeArray(args) || []);
	    }
	}
	
	
	/**
	 * 获取回调函数
	 *
	 * @method QApp.util.getCallback
	 * @category Util-Fn
	 * @param {Any} args 回调函数
	 * @return {Function} 回调函数
	 */
	// getCallback
	function _getCallback(args) {
	    var fn = _noop;
	    args = _makeArray(args);
	    if (args) {
	        args.some(function(arg) {
	           if (_isFunction(arg)) {
	               fn = arg;
	               return TRUE;
	           }
	        });
	    }
	    return fn;
	}
	

	/**
	 * 轻触事件
	 *
	 * @event Gesture:tap
	 * @category Gesture
	 * @core
	 * @explain
	 * 对于每个事件，事件对象里都有以下属性：`screenX`， `screenY`， `clientX`， `clientY`， `pageX`， `pageY`。
	 *
	 * * 轻触 ：`tap`
	 * * 双轻触 ：`doubletap`
	 * * 长按 ：`press`、`pressend`
	 * * 触摸 ：`feel`
	 *
	 * tap / doubletap / press / feel 触按事件
	 *
	 * * 用户触碰屏幕，并且位移距离小于 **10**，则会判定为触按事件。
	 * * 用户开始触碰屏幕和结束触碰直接时差小于 **200ms** ，则会被判定为tap事件，反之被判定为press事件。
	 * * tap和press事件 *不会被同时触发* 。
	 * * 如果两次tap事件的时间差小于 **500ms**，则会被判定为doubletap事件。
	 * * doubletap事件和tap事件 *会同时触发*，doubletap会在第二次tap事件 *之前* 触发。
	 * * feel即触即触发，和tap、press并行。
	 */
	
	/**
	 * 双轻触事件
	 *
	 * @event Gesture:doubletap
	 * @category Gesture
	 * @explain
	 * 说明详见 [Gesture:tap说明](#Gesture-tap)
	 */
	
	/**
	 * 长按事件
	 *
	 * @event Gesture:press
	 * @category Gesture
	 * @explain
	 * 说明详见 [Gesture:tap说明](#Gesture-tap)
	 */
	
	/**
	 * 长按结束事件
	 *
	 * @event Gesture:pressend
	 * @category Gesture
	 * @explain
	 * 说明详见 [Gesture:tap说明](#Gesture-tap)
	 */
	
	/**
	 * 触摸事件
	 *
	 * @event Gesture:feel
	 * @category Gesture
	 * @explain
	 * 说明详见 [Gesture:tap说明](#Gesture-tap)
	 */
	
	/**
	 * 滑动事件
	 *
	 * @event Gesture:pan
	 * @category Gesture
	 * @explain
	 * 对于每个事件，事件对象里都有以下属性：`screenX`， `screenY`， `clientX`， `clientY`， `pageX`， `pageY`。
	 *
	 * * 轻滑 ：`flick`  | 拓展属性：`offsetX`、`offsetY`、`speedX`、`speedY`、`duration`、`degree`、`directions`
	 * * 滑动 ：`pan`、`panend` | 扩展属性：`offsetX`、`offsetY`、`degree`、`directions` | `panend` 包含扩展属性： `speedX`、`speedY`、`duration`
	 *
	 * flick / pan 滑动事件
	 *
	 * * 用户点击屏幕，并且位移距离大于 **10**，则会判定为滑动事件。
	 * * 用户开始触碰屏幕和结束触碰直接时差小于 **300ms** ，则会被判定为flick事件。
	 * * flick和press事件 *会被同时触发* 。
	 * * flick会在pressend事件 *之后* 触发。
	 * * degree属性基准为水平向右坐标轴，顺时针方向，单位是 **角度**。
	 * * directions为滑动方向，为一个 *数组*：
	 * * 元素值为：`up`、`down`、`left`、`right`；
	 * * 第一个元素为 **主方向**，第二个元素是 **副方向**；
	 * * 当实际方向与主方向的夹角小于 **15度** 时，不存在副方向。
	 */
	
	/**
	 * 滑动结束事件
	 *
	 * @event Gesture:panend
	 * @category Gesture
	 * @explain
	 * 说明详见 [Gesture:pan说明](#Gesture-pan)
	 */
	
	/**
	 * 轻滑事件
	 *
	 * @event Gesture:flick
	 * @category Gesture
	 * @explain
	 * 说明详见 [Gesture:pan说明](#Gesture-pan)
	 */
	
	var Gesture = (function () {
	
	    var TOUCHKEYS = [
	            'screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY'
	        ],
	        TAP_TIMEOUT = 200, // tap 判定时间
	        ALLOW_LONG_TAP = FALSE, // 允许长按
	        PAN_DISTANCE = 10, // 判定 pan 的位移偏移量
	        DIRECTION_DEG = 15, // 判断方向的角度
	        FLICK_TIMEOUT = 300, // 判断 flick 的延时
	        FLICK_DIS = 100; // flick 距离
	
	    var gesture,
	        curElement,
	        curId,
	        lastId,
	        lastTime = 0,
	        trackingClick,
	        clickElement,
	        cancelNextClick = FALSE,
	        running = TRUE;
	
	    // 重置
	    function reset() {
	        gesture = NULL;
	        curElement = NULL;
	        curId = NULL;
	    }
	
	    // 复制 touch 对象上的有用属性到固定对象上
	    function mixTouchAttr(target, source) {
	        if (source) {
	            TOUCHKEYS.forEach(function (key) {
	                target[key] = source[key];
	            });
	        }
	        return target;
	    }
	
	    // 查找对应id的touch
	    function findTouch(touches) {
	        return _makeArray(touches).filter(function (touch) {
	            return touch.identifier === curId;
	        })[0];
	    }
	
	    // 计算距离
	    function computeDistance(offsetX, offsetY) {
	        return Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
	    }
	
	    // 计算角度
	    function computeDegree(offsetX, offsetY) {
	        var degree = Math.atan2(offsetY, offsetX) / Math.PI * 180;
	        return degree < 0 ? degree + 360 : degree;
	    }
	
	    // 获取方向
	    function getDirection(offsetX, offsetY) {
	        var ret = [],
	            absX = Math.abs(offsetX),
	            absY = Math.abs(offsetY),
	            proportion = Math.tan(DIRECTION_DEG / 180 * Math.PI),
	            transverse = absX > absY;
	
	        if (absX > 0 || absY > 0) {
	            ret.push(transverse ? offsetX > 0 ? 'right' : 'left' : offsetY > 0 ? 'down' : 'up');
	            if (transverse && absY / absX > proportion) {
	                ret.push(offsetY > 0 ? 'down' : 'up');
	            } else if (!transverse && absX / absY > proportion) {
	                ret.push(offsetX > 0 ? 'right' : 'left');
	            }
	        }
	
	        return ret;
	    }
	
	    // 检测是否需要原生 click
	    function needsClick(target) {
	        switch (target.nodeName.toLowerCase()) {
	            case 'button':
	            case 'select':
	            case 'textarea':
	                if (target.disabled) {
	                    return TRUE;
	                }
	                break;
	            case 'input':
	                // IOS6 pad 上选择文件，如果不是原生的click，弹出的选择界面尺寸错误
	                if ((_sniff.ipad && _sniff.osVersionN === 6 && target.type === 'file') || target.disabled) {
	                    return TRUE;
	                }
	                break;
	            case 'label':
	            case 'iframe':
	            case 'video':
	                return TRUE;
	        }
	
	        return (/\bneedsclick\b/).test(target.className);
	    }
	
	    // 检测是否需要 focus
	    function needsFocus(target) {
	        switch (target.nodeName.toLowerCase()) {
	            case 'textarea':
	                return TRUE;
	            case 'select':
	                return !_sniff.android;
	            case 'input':
	                switch (target.type) {
	                    case 'button':
	                    case 'checkbox':
	                    case 'file':
	                    case 'image':
	                    case 'radio':
	                    case 'submit':
	                        return FALSE;
	                }
	                return !target.disabled && !target.readOnly;
	            default:
	                return (/\bneedsfocus\b/).test(target.className);
	        }
	    }
	
	    // 选择触发的事件
	    function determineEventType(target) {
	        // 安卓chrome浏览器上，模拟的 click 事件不能让 select 打开，故使用 mousedown 事件
	        if (_sniff.android && target.nodeName.toLowerCase() === 'select') {
	            return 'mousedown';
	        }
	
	        return 'click';
	    }
	
	    // 发送 click 事件
	    function sendClick(target, touch) {
	        var clickEvent;
	
	        // 某些安卓设备必须先移除焦点，之后模拟的click事件才能让新元素获取焦点
	        if (doc.activeElement && doc.activeElement !== target) {
	            doc.activeElement.blur();
	        }
	
	        clickEvent = doc.createEvent('MouseEvents');
	        clickEvent.initMouseEvent(determineEventType(target), TRUE, TRUE, win, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, FALSE, FALSE, FALSE, FALSE, 0, NULL);
	        clickEvent.forwardedTouchEvent = TRUE;
	        if (running) {
	            target.dispatchEvent(clickEvent);
	        }
	    }
	
	    //  寻找 label 对应的元素
	    function findControl(labelElement) {
	
	        // HTML5 新属性
	        if (labelElement.control !== UNDEFINED) {
	            return labelElement.control;
	        }
	
	        // 通过 htmlFor
	        if (labelElement.htmlFor) {
	            return doc.getElementById(labelElement.htmlFor);
	        }
	
	        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	    }
	
	    // 创建事件
	    function createEvent(type) {
	        var event = doc.createEvent("HTMLEvents");
	        event.initEvent(type, TRUE, TRUE);
	        return event;
	    }
	
	    // 构造 pan / flick / panend 事件
	    function createPanEvent(type, offsetX, offsetY, touch, duration) {
	        var ev = createEvent(type);
	        ev.offsetX = offsetX;
	        ev.offsetY = offsetY;
	        ev.degree = computeDegree(offsetX, offsetY);
	        ev.directions = getDirection(offsetX, offsetY);
	        if (duration) {
	            ev.duration = duration;
	            ev.speedX = ev.offsetX / duration;
	            ev.speedY = ev.offsetY / duration;
	        }
	        return mixTouchAttr(ev, touch);
	    }
	
	    // 分析 Move
	    function analysisMove(event, touch) {
	        var startTouch = gesture.origin,
	            offsetX = touch.clientX - startTouch.clientX,
	            offsetY = touch.clientY - startTouch.clientY;
	
	        if (gesture.status === 'tapping' || gesture.status === 'pressing') {
	            if (computeDistance(offsetX, offsetY) > PAN_DISTANCE) {
	                gesture.status = 'panning'; // 更改状态
	                trackingClick = FALSE; // 取消跟踪 click
	                clickElement = NULL;
	                gesture.startMoveTime = event.timeStamp; // 记录移动开始的时间
	                clearTimeout(gesture.handler);
	                gesture.handler = NULL;
	                trigger(createPanEvent('pan', offsetX, offsetY, touch));
	            }
	        } else if (gesture.status === 'panning') {
	            trigger(createPanEvent('pan', offsetX, offsetY, touch));
	        }
	    }
	
	    // 分析 End
	    function analysisEnd(event, touch) {
	        if (gesture.handler) {
	            clearTimeout(gesture.handler);
	            gesture.handler = NULL;
	        }
	        if (gesture.status === 'panning') {
	            var startTouch = gesture.origin,
	                offsetX = touch.clientX - startTouch.clientX,
	                offsetY = touch.clientY - startTouch.clientY,
	                duration = event.timeStamp - gesture.startMoveTime;
	            trigger(createPanEvent('panend', offsetX, offsetY, touch, duration));
	            // 判断是否是快速移动
	            if (duration < FLICK_TIMEOUT && computeDistance(offsetX, offsetY) > FLICK_DIS) {
	                trigger(createPanEvent('flick', offsetX, offsetY, touch, duration));
	            }
	        } else {
	            if (gesture.status === 'tapping') {
	                trigger(mixTouchAttr(createEvent('tap'), touch));
	            } else if (gesture.status === 'pressing') {
	                trigger(mixTouchAttr(createEvent('pressend'), touch));
	                if (ALLOW_LONG_TAP) {
	                    trigger(mixTouchAttr(createEvent('tap'), touch));
	                }
	            }
	        }
	    }
	
	
	    // 触发事件
	    function trigger(event) {
	        if (running && curElement) {
	            curElement.dispatchEvent(event);
	        }
	    }
	
	    function onTouchStart(event) {
	
	        var touch, selection,
	            changedTouches = event.changedTouches,
	            timestamp = event.timeStamp;
	
	        // 如果两次 touch 事件过快，则，直接阻止默认行为
	        if (timestamp - lastTime < TAP_TIMEOUT) {
	            event.preventDefault();
	            return FALSE;
	        }
	
	        // 忽略多指操作
	        if (changedTouches.length > 1) {
	            return TRUE;
	        }
	
	        touch = changedTouches[0];
	
	        if (touch) {
	            curElement = event.target;
	            curId = touch.identifier;
	            gesture = {
	                origin: mixTouchAttr({}, touch),
	                timestamp: timestamp,
	                status: 'tapping',
	                handler: setTimeout(function () {
	                    gesture.status = 'pressing';
	                    trigger(mixTouchAttr(createEvent('press'), gesture.origin));
	                    clearTimeout(gesture.handler);
	                    gesture.handler = NULL;
	                }, TAP_TIMEOUT)
	            };
	
	            if (!_sniff.pc) {
	                // Fast Click 判定部分
	                // 排除 ios 上的一些特殊情况
	                if (_sniff.ios) {
	                    // 判断是否是点击文字，进行选择等操作，如果是，不需要模拟click
	                    selection = win.getSelection();
	                    if (selection.rangeCount && !selection.isCollapsed) {
	                        return TRUE;
	                    }
	
	                    // 当 alert 或 confirm 时，点击其他地方，会触发touch事件，id相同，此事件应该被忽略
	                    if (curId === lastId) {
	                        event.preventDefault();
	                        return FALSE;
	                    }
	
	                    lastId = curId;
	
	                    //TODO updateScrollParent
	
	                }
	
	                // 开始跟踪 click
	                trackingClick = TRUE;
	                clickElement = curElement;
	            }
	
	        }
	
	        return TRUE;
	    }
	
	    function onTouchMove(event) {
	        var touch = findTouch(event.changedTouches);
	
	        if (touch && gesture) {
	            analysisMove(event, touch);
	        }
	
	        return TRUE;
	    }
	
	    function onTouchEnd(event) {
	        var touch = findTouch(event.changedTouches),
	            timestamp = event.timeStamp,
	            tagName, forElement, startTime;
	
	        if (touch && gesture) {
	            analysisEnd(event, touch);
	
	            startTime = gesture.timestamp;
	
	            reset();
	
	            // if (!_sniff.pc) { // 支持pc模拟器，和手机一致
	
	                if (trackingClick) {
	
	                    // 触击过快，阻止下一次 click
	                    if (timestamp - lastTime < TAP_TIMEOUT) {
	                        cancelNextClick = TRUE;
	                        return TRUE;
	                    }
	
	                    if (timestamp - startTime > TAP_TIMEOUT) {
	                        return TRUE;
	                    }
	
	                    cancelNextClick = FALSE;
	                    lastTime = timestamp;
	
	                    tagName = clickElement.nodeName.toLowerCase();
	                    // 如果是 label， 则模拟 focus 其相关的元素
	                    if (tagName === 'label') {
	                        forElement = findControl(clickElement);
	                        if (forElement) {
	                            _focus(forElement);
	
	                            if (_sniff.android) {
	                                return FALSE;
	                            }
	
	                            clickElement = forElement;
	                        }
	                    } else if (needsFocus(clickElement)) {
	                        if (timestamp - startTime > 100 || (_sniff.ios && win.top !== win && tagName === 'input')) {
	                            clickElement = NULL;
	                            return FALSE;
	                        }
	
	                        _focus(clickElement);
	                        sendClick(clickElement, touch);
	
	                        if (!_sniff.ios || tagName !== 'select') {
	                            clickElement = NULL;
	                            event.preventDefault();
	                        }
	
	                        return FALSE;
	                    }
	
	                    if (!needsClick(clickElement)) {
	                        event.preventDefault();
	                        sendClick(clickElement, touch);
	                    }
	
	                    return FALSE;
	                }
	            // }
	        }
	
	        return TRUE;
	    }
	
	    function onTouchCancel(event) {
	        var touch = findTouch(event.changedTouches);
	
	        if (touch && gesture) {
	            clickElement = NULL;
	            analysisEnd(event, touch);
	            reset();
	        }
	
	        return TRUE;
	    }
	
	    function onMouse(event) {
	        if (!clickElement) {
	            return TRUE;
	        }
	
	        if (event.forwardedTouchEvent) {
	            return TRUE;
	        }
	
	        if (!event.cancelable) {
	            return TRUE;
	        }
	
	        if (!needsClick(clickElement) || cancelNextClick) {
	            if (event.stopImmediatePropagation) {
	                event.stopImmediatePropagation();
	            } else {
	                event.propagationStopped = TRUE;
	            }
	            event.stopPropagation();
	            event.preventDefault();
	            return FALSE;
	        }
	
	        return TRUE;
	    }
	
	    function onClick(event) {
	        var permitted;
	
	        if (trackingClick) {
	            clickElement = NULL;
	            trackingClick = FALSE;
	            return TRUE;
	        }
	
	        if (event.target.type === 'submit' && event.detail === 0) {
	            return TRUE;
	        }
	
	        permitted = onMouse(event);
	
	        if (!permitted) {
	            clickElement = NULL;
	        }
	
	        return permitted;
	    }
	
	    _ready(function () {
	        var body = doc.body;
	
	        if (!Config.gesture || Config.gesture.open !== false) {
	
	            if (!_sniff.pc) {
	
	                if (_sniff.android) {
	                    _addEvent(body, 'moveover', onMouse, TRUE);
	                    _addEvent(body, 'mousedown', onMouse, TRUE);
	                    _addEvent(body, 'mouseup', onMouse, TRUE);
	                }
	
	                _addEvent(body, 'click', onClick, TRUE);
	            }
	
	            _addEvent(body, 'touchstart', onTouchStart, TRUE);
	            _addEvent(body, 'touchmove', onTouchMove, TRUE);
	            _addEvent(body, 'touchend', onTouchEnd, TRUE);
	            _addEvent(body, 'touchcancel', onTouchCancel, TRUE);
	        }
	    });
	
	    return {
	        allowLongTap: function () {
	            ALLOW_LONG_TAP = TRUE;
	        },
	        on: function() {
	            running = TRUE;
	        },
	        off: function() {
	            running = FALSE;
	        }
	    };
	
	})();
	

	/**
	 * 动画
	 *
	 * @method QApp.util.animate
	 * @category Util-Fn
	 * @param {Element} el 执行动画的元素
	 * @param {Object} props 更改的属性
	 * @param {Number} [duration] 持续时间
	 * @param {String} [ease] 动画曲线
	 * @param {Number} [delay] 延迟时间
	 * @return {Deferred} Deferred对象
	 * @example
	 *     // 修改 ele 的 transform 属性，实现动画（推荐）
	 *     var ele_transform = document.createElement("div");
	 *     QApp.util.animate(ele_transform, {transform: "translate(50%, 0)"}, 500);
	 *
	 *     // 修改 ele 的 left，实现动画
	 *     var ele_left = document.createElement("div");
	 *     QApp.util.animate(ele_left, {left: "50%", position: "absolute"}, 500);
	 */
	var _animate = (function () {
	    var DURATION = 200,
	        TIMEOUT_DELAY = 25,
	        EASE = 'linear';
	
	    var transitionProperty, transitionDuration, transitionTiming, transitionDelay;
	
	    transitionProperty = prefix + 'transition-property';
	    transitionDuration = prefix + 'transition-duration';
	    transitionDelay = prefix + 'transition-delay';
	    transitionTiming = prefix + 'transition-timing-function';
	
	    function setParentStyle(el) {
	        var parentNode = el.parentNode;
	        if (parentNode) {
	            _css(parentNode, {
	                'transform-style': 'preserve-3d',
	                'backface-visibility': 'hidden'
	            });
	        }
	    }
	
	    function resetParentStyle(el) {
	        var parentNode = el.parentNode;
	        _removeStyle(parentNode, ['transform-style', 'backface-visibility']);
	    }
	
	    return function (el, props, duration, ease, delay) {
	        var argsLength = arguments.length,
	            endEvent = eventPrefix + 'TransitionEnd',
	            cssValues = {},
	            cssProperties = [],
	            transforms = '';
	
	        if (argsLength < 3) {
	            duration = DURATION;
	        }
	
	        if (argsLength < 4) {
	            ease = EASE;
	        }
	
	        if (argsLength < 5) {
	            delay = 0;
	        }
	
	        _each(props, function (key, value) {
	            if (supportedTransforms.test(key)) {
	                transforms += key + '(' + value + ') ';
	            } else {
	                cssValues[key] = value;
	            }
	            cssProperties.push(_dasherize(key));
	        });
	
	        if (transforms) {
	            cssValues[transformAttr] = transforms;
	            cssProperties.push(transformAttr);
	        }
	
	        if (duration > 0) {
	            cssValues[transitionProperty] = cssProperties.join(', ');
	            cssValues[transitionDuration] = duration / 1000 + 's';
	            cssValues[transitionDelay] = delay / 1000 + 's';
	            cssValues[transitionTiming] = ease;
	        }
	
	        var that = new Deferred();
	        var fired = FALSE;
	
	        function callback(event) {
	            if (event) {
	                if (event.target !== el) {
	                    return;
	                }
	            }
	            _removeEvent(el, endEvent, callback);
	            fired = TRUE;
	            _delay(function () {
	                if (transforms) {
	                    resetParentStyle(el);
	                }
	                _removeStyle(el, 'transition');
	                that.resolve();
	            });
	        }
	
	        if (duration > 0) {
	            _addEvent(el, endEvent, callback, FALSE);
	
	            // 兼容不支持的情况
	            _delay(function () {
	                if (!fired) {
	                    callback();
	                }
	            }, duration + delay + TIMEOUT_DELAY * 2);
	        }
	
	        _delay(function () {
	            if (transforms) {
	                setParentStyle(el);
	            }
	
	            _css(el, cssValues);
	
	            that.notify('start');
	        }, TIMEOUT_DELAY);
	
	        if (duration <= 0) {
	            _delay(callback);
	        }
	
	        return that;
	    };
	})();
	

	var checkContains = function (list, el) {
	    for (var i = 0, len = list.length; i < len; i += 1) {
	        if (_contains(list[i], el)) {
	            return TRUE;
	        }
	    }
	    return FALSE;
	};
	
	function _delegatedEvent(actEl, expEls, tag) {
	    if (!expEls) {
	        expEls = [];
	    }
	    expEls = [].concat(expEls);
	    var evtList = {},
	        bindEvent = function (evt) {
	            var el = evt.target,
	                type = evt.type;
	            doDelegated(el, type, evt);
	        },
	        actionTag = tag || 'action-type';
	
	    function doDelegated(el, type, evt) {
	        var actionType = NULL;
	
	        function checkBuble() {
	            var tg = el,
	                data = _dataSet(tg);
	            if (evtList[type] && evtList[type][actionType]) {
	                return evtList[type][actionType]({
	                    'evt': evt,
	                    'el': tg,
	                    'box': actEl,
	                    'data': data
	                }, data);
	            } else {
	                return TRUE;
	            }
	        }
	
	        if (checkContains(expEls, el)) {
	            return FALSE;
	        } else if (!_contains(actEl, el)) {
	            return FALSE;
	        } else {
	            while (el && el !== actEl) {
	                if (el.nodeType === 1) {
	                    actionType = el.getAttribute(actionTag);
	                    if (actionType && checkBuble() === FALSE) {
	                        break;
	                    }
	                }
	                el = el.parentNode;
	            }
	
	        }
	    }
	
	    var that = {};
	
	    that.add = function (funcName, evtType, process, useCapture) {
	        if (!evtList[evtType]) {
	            evtList[evtType] = {};
	            _addEvent(actEl, evtType, bindEvent, !!useCapture);
	        }
	        var ns = evtList[evtType];
	        ns[funcName] = process;
	    };
	
	    that.remove = function (funcName, evtType) {
	        if (evtList[evtType]) {
	            delete evtList[evtType][funcName];
	            if (_isEmptyObject(evtList[evtType])) {
	                delete evtList[evtType];
	                _removeEvent(actEl, evtType, bindEvent);
	            }
	        }
	    };
	
	    that.pushExcept = function (el) {
	        expEls.push(el);
	    };
	
	    that.removeExcept = function (el) {
	        if (!el) {
	            expEls = [];
	        } else {
	            for (var i = 0, len = expEls.length; i < len; i += 1) {
	                if (expEls[i] === el) {
	                    expEls.splice(i, 1);
	                }
	            }
	        }
	
	    };
	
	    that.clearExcept = function () {
	        expEls = [];
	    };
	
	    that.fireAction = function (actionType, evtType, evt, params) {
	        var data = {};
	        if (params && params.data) {
	            data = params.data;
	        }
	        if (evtList[evtType] && evtList[evtType][actionType]) {
	            evtList[evtType][actionType]({
	                'evt': evt,
	                'el': NULL,
	                'box': actEl,
	                'data': data,
	                'fireFrom': 'fireAction'
	            }, data);
	        }
	    };
	
	    that.fireInject = function (dom, evtType, evt) {
	        var actionType = dom.getAttribute(actionTag),
	            dataSet = _dataSet(dom);
	        if (actionType && evtList[evtType] && evtList[evtType][actionType]) {
	            evtList[evtType][actionType]({
	                'evt': evt,
	                'el': dom,
	                'box': actEl,
	                'data': dataSet,
	                'fireFrom': 'fireInject'
	            }, dataSet);
	        }
	    };
	
	
	    that.fireDom = function (dom, evtType, evt) {
	        doDelegated(dom, evtType, evt || {});
	    };
	
	    that.destroy = function () {
	        for (var k in evtList) {
	            for (var l in evtList[k]) {
	                delete evtList[k][l];
	            }
	            delete evtList[k];
	            _removeEvent(actEl, k, bindEvent);
	        }
	    };
	
	    return that;
	}

	var URL_REG = /(\w+):\/\/\/?([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(\?[^#]*)?(#.*)?/i,
	    URL_MAP = ['url', 'protocol', 'hostname', 'port', 'path', 'name', 'query', 'hash'];
	
	function _parseURL(str, decode) {
	    var scope = _associate(URL_REG.exec(str) || [], URL_MAP);
	
	    scope.query = scope.query ? _queryToJson(scope.query.substring(1), decode) : {};
	
	    scope.hash = scope.hash ? _queryToJson(scope.hash.substring(1), decode) : {};
	
	    scope.getQuery = function(key) {
	        return scope.query[key];
	    };
	
	    scope.getHash = function(key) {
	        return scope.hash[key];
	    };
	
	    scope.setQuery = function(key, value) {
	        if (value === UNDEFINED) {
	            scope.query[key] = NULL;
	        } else {
	            scope.query[key] = value;
	        }
	        return scope;
	    };
	
	    scope.setHash = function(key, value) {
	        if (value === UNDEFINED) {
	            scope.hash[key] = NULL;
	        } else {
	            scope.hash[key] = value;
	        }
	        return scope;
	    };
	
	    scope.toUrl = function(encode) {
	        var url = scope.protocol + '://',
	            query = _jsonToQuery(scope.query, encode),
	            hash = _jsonToQuery(scope.hash, encode);
	        if (scope.protocol && scope.protocol.toLowerCase() === 'file') {
	            url += '/';
	        }
	        return url +
	            scope.hostname +
	            (scope.port || '') +
	            scope.path +
	            (scope.name || '') +
	            (query ? '?' + query : '') +
	            (hash ? '#' + hash : '');
	    };
	
	    return scope;
	}
	
	/// Loader
	var LOADER_OPT = {
	    charset: 'UTF-8',
	    timeout: 30 * 1000,
	    onComplete: NULL,
	    onTimeout: NULL,
	    onFail: NULL
	};
	
	var headEL = doc.getElementsByTagName('head')[0];
	
	function bindEvent(el, deferred, timeout) {
	    var requestTimeout;
	
	    headEL.insertBefore(el, headEL.firstChild);
	
	    if (timeout) {
	        requestTimeout = _delay(function() {
	            el.onload = NULL;
	            _removeNode(el);
	            deferred.reject({type : 'Timeout'});
	        }, timeout);
	    }
	
	    el.onload = function() {
	        if (requestTimeout) {
	            clearTimeout(requestTimeout);
	        }
	        el.onload = NULL;
	        el.onerror = NULL;
	        deferred.resolve();
	    };
	
	    el.onerror = function() {
	        if (requestTimeout) {
	            clearTimeout(requestTimeout);
	        }
	        _removeNode(el);
	        el.onload = NULL;
	        el.onerror = NULL;
	        deferred.reject({type : 'Error'});
	    };
	}
	
	var Manager = {
	    script : function(url, options) {
	        var deferred = new Deferred(),
	            charset = options.charset,
	            timeout = options.timeout,
	            el = doc.createElement('script');
	        el.type = 'text/javascript';
	        el.charset = charset;
	        return deferred.startWith(function() {
	            deferred.notify('element', el);
	            bindEvent(el, deferred, timeout);
	            el.src = url;
	        });
	    },
	    style : function(url, options) {
	        var deferred = new Deferred(),
	            charset = options.charset,
	            timeout = options.timeout,
	            el = doc.createElement('link');
	        el.type = 'text/css';
	        el.charset = charset;
	        el.rel = 'stylesheet';
	        return deferred.startWith(function() {
	            bindEvent(el, deferred, timeout);
	            el.href = url;
	        });
	    },
	    image : function(url, options) {
	        var deferred = new Deferred(),
	            img = new Image(),
	            timeout = options.timeout,
	            timer = NULL;
	        img.onload = function() {
	            img.onload = NULL;
	            img.onerror = NULL;
	            if (timer) {
	                clearTimeout(timer);
	            }
	            deferred.resolve(img);
	        };
	        img.onerror = function() {
	            img.onload = NULL;
	            img.onerror = NULL;
	            if (timer) {
	                clearTimeout(timer);
	            }
	            deferred.reject({type : 'Error'});
	        };
	        if (timeout) {
	            timer = _delay(function() {
	                img.onload = NULL;
	                img.onerror = NULL;
	                if (timer) {
	                    clearTimeout(timer);
	                }
	                deferred.reject({type : 'Timeout'});
	            }, timeout);
	        }
	        return deferred.startWith(function() {
	            img.src = url;
	        });
	    }
	};
	
	function _loader(type, url, options) {
	    var opt = _extend({}, LOADER_OPT, options),
	        deferred = Manager[type] && Manager[type](url, opt);
	
	    if (deferred && (opt.onComplete || opt.onFail || opt.onTimeout)) {
	        deferred.then(opt.onComplete, function(reason) {
	            if (reason.type === 'Timeout' && _isFunction(opt.onTimeout)) {
	                opt.onTimeout(reason);
	            }
	            if (reason.type === 'Error' && _isFunction(opt.onFail)) {
	                opt.onFail(reason);
	            }
	        });
	    }
	
	    return deferred;
	}

	var supportsOrientationChange = "onorientationchange" in win,
	    // orientationEvent = supportsOrientationChange ? "orientationchange" : "resize",
	    orientationEvent = "resize", // 由于 orientationchange 在安卓机器上有兼容性问题，所以统一用 resize
	    _orientation = _createEventManager(),
	    getOrientation = function(size) {
	        return size.width > size.height ? 'landscape' : 'portrait';
	    };
	
	_orientation.get = function() {
	    return getOrientation(_size(win));
	};
	
	_ready(function() {
	    var curSize = _size(win);
	    win.addEventListener(orientationEvent, function() {
	        var size = _size(win);
	        if (curSize.width !== size.width && curSize.height !== size.height) {
	            curSize = size;
	            _orientation.trigger('change', {
	                type: orientationEvent,
	                width: size.width,
	                height: size.height,
	                orientation: getOrientation(size)
	            });
	        }
	    });
	});

	var LOGGER_TYPES = ['info', 'debug', 'warn', 'error'];
	
	function _logger(type, args) {
	    console[type].apply(console, ['[' + type.toUpperCase() + ']'].concat(_makeArray(args)));
	}
	
	LOGGER_TYPES.forEach(function(type, index) {
	   _logger[type] = function() {
	       if (index >= Config.logLevel) {
	           _logger(type, arguments);
	       }
	   };
	});
	
	// query 配置
	
	var logLevel = _parseURL(location.href).query.logLevel;
	
	if (logLevel) {
	    Config.logLevel = parseInt(logLevel);
	}
	

	define('fetchNode', function () {
	
	    function resolveNode(deferred) {
	        deferred.resolve();
	    }
	
	    return function (view) {
	        var options = view.options;
	
	        return new Deferred().startWith(function (that) {
	            if (options.html || _isFunction(options.fetch)) {
	                if (options.html) {
	                    resolveNode(that);
	                } else if (options.fetch.length) { // function(resolve) {}
	                    options.fetch.call(view, function (node) {
	                        options.html = node || '';
	                        resolveNode(that);
	                    });
	                } else {
	                    options.html = options.fetch.call(view) || '';
	                    resolveNode(that);
	                }
	            } else {
	                options.html = '';
	                resolveNode(that);
	            }
	        });
	    };
	});
	

	define('display', function() {
	    return {
	        show: function (container, startCss, endCss, duration) {
	            var me = this;
	            if (me.isShow) {
	                _css(me.root, _extend({
	                    width: '100%',
	                    height: '100%',
	                    zIndex: _getZIndex()
	                }, endCss || startCss));
	                me.trigger('refresh');
	            } else {
	                me.once('completed', function () {
	                    _css(me.root, _extend({
	                        width: '100%',
	                        height: '100%',
	                        zIndex: _getZIndex()
	                    }, startCss));
	                    me.trigger('beforeShow');
	                    if (Config.animate && endCss) {
	                        _animate(me.root, endCss, duration).done(function () {
	                            me.trigger('show');
	                        });
	                    } else {
	                        _css(me.root, endCss || {});
	                        me.trigger('show');
	                    }
	                });
	                me.renderTo(_isElement(container) ? container : Config.appRoot);
	            }
	            return me;
	        },
	        hide: function () {
	            var me = this;
	            if (me.isShow) {
	                me.trigger('beforeHide');
	                me.trigger('hide');
	            }
	            return me;
	        }
	    };
	});

	define('pluginM', function () {
	
	    var plugins = QApp._plugins = {},
	        globalPlugins = [];
	
	    return {
	        /**
	         * 增加插件
	         *
	         * @method QApp.plugin.add
	         * @category Plugin
	         * @alias QApp.addPlugin
	         * @core
	         * @param {String|Array<String>} name 插件名
	         * @param {Object} options 默认配置
	         * @param {Function} [adapter] 适配器
	         * @example
	         * QApp.addPlugin('some', someOpt, function(view, opt) {
	         *      view.someAttr = someValue;
	         *      return SomeObject;
	         * });
	         * @explain
	         * `plugin` 可以通过监听生命周期事件来进行相关行为，也可以复写或增加视图的方法。
	         */
	        add: function (key, options, adapter) {
	            var names = [].concat(key);
	            names.forEach(function (name) {
	                if (!plugins[name]) {
	                    plugins[name] = {
	                        options: options,
	                        adapter: adapter
	                    };
	                } else {
	                    //WARN 'Plugin "' + name + '" already exist.'
	                }
	            });
	        },
	        /**
	         * 检测插件是否存在
	         *
	         * @method QApp.plugin.exists
	         * @category Plugin
	         * @param {String} name 插件名
	         * @return {Boolean} flag 是否存在
	         */
	        exists: function (name) {
	            return !!plugins[name];
	        },
	        /**
	         * 获取插件当前配置
	         *
	         * @method QApp.plugin.get
	         * @category Plugin
	         * @param {String} name 插件名
	         * @return {Object} options 当前配置
	         */
	        get: function (name) {
	            return plugins[name];
	        },
	        /**
	         * 设置插件当前配置
	         *
	         * @method QApp.plugin.setOpt
	         * @category Plugin
	         * @param {String} name 插件名
	         * @param {Object} options 配置
	         * @explain
	         * 以 `extend` 的方式
	         */
	        setOpt: function (name, options) {
	            if (plugins[name]) {
	                _extend(TRUE, plugins[name].options, options);
	            }
	        },
	        /**
	         * 获取全局插件列表
	         *
	         * @method QApp.plugin.getGlobal
	         * @category Plugin
	         * @alias QApp.configPlugin
	         * @return {Array} plugins 全局插件列表
	         */
	        getGlobal: function () {
	            return globalPlugins;
	        },
	        /**
	         * 设置全局插件
	         *
	         * @method QApp.plugin.setGlobal
	         * @category Plugin
	         * @alias QApp.setGlobalPlugins
	         * @param {String|Array<String>} gPlugins 插件或列表
	         * @explain
	         * 内部逻辑是 `concat` 操作
	         */
	        setGlobal: function (gPlugins) {
	            globalPlugins = globalPlugins.concat(gPlugins);
	        }
	    };
	});
	

	define('widgetM', function () {
	
	    var widgets = QApp._widgets = {};
	
	    return {
	        /**
	         * 添加组件
	         *
	         * @method QApp.widget.add
	         * @category Widget
	         * @alias QApp.addWidget
	         * @core
	         * @param {String} name 组件名
	         * @param {Function} adapter 适配器
	         * @param {Boolean|String} [isEvent] 是否由事件触发
	         * @example
	         * QApp.addWidget('some', function(element, opt, view) {
	         *      todoSomething();
	         * })
	         * @explain
	         * `isEvent` 是 `true` 或者是 事件名 (`tap`) 时为触发式组件，反之为渲染式组件
	         */
	        add: function (name, adapter, isEvent) {
	            widgets[name] = {
	                eventName: isEvent && (_isString(isEvent) ? isEvent : 'tap'),
	                adapter: adapter
	            };
	        },
	        /**
	         * 检查组件是否存在
	         *
	         * @method QApp.widget.exists
	         * @category Widget
	         * @param {String} name 组件名
	         * @return {Boolean} flag 是否存在
	         */
	        exists: function (name) {
	            return !!widgets[name];
	        },
	        isEvent: function (name) {
	            return !!widgets[name].eventName;
	        },
	        /**
	         * 获取组件当前配置
	         *
	         * @method QApp.widget.get
	         * @category Widget
	         * @param {String} name 组件名
	         * @return {Object} options 当前组件配置
	         */
	        get: function (name) {
	            return widgets[name];
	        },
	        /**
	         * 显示组件
	         *
	         * @method QApp.widget.show
	         * @category Widget
	         * @alias QApp.showWidget
	         * @core
	         * @param {String} name 组件名
	         * @param {Element} [el] 节点
	         * @param {Object} options 配置
	         * @param {View} [view] 关联的视图
	         * @return {Any} obj 组件返回的对象
	         * @example
	         * var widget = QApp.showWidget('searchlist', {
	         *    onComplete: function() {
	         *          todoSomething();
	         *    }
	         * });
	         * @explain
	         * 所需参数和返回的对象由组件的适配器决定
	         */
	        show: function (name, el, options, view) {
	            if (widgets[name]) {
	                if (_isElement(el)) {
	                    return widgets[name].adapter(el, options, view);
	                } else {
	                    return widgets[name].adapter(NULL, el, options);
	                }
	            }
	        }
	    };
	
	});
	

	define('module', function () {
	
	    var $pluginM = r('pluginM'),
	        $viewM;
	
	    // 默认配置
	    var DEFAULT_OPT = {
	        name: NULL,         // 名称
	        defaultTag: NULL,   // 默认 tag
	        container: NULL,    // 渲染的位置
	        renderAll: FALSE,   // 是否都渲染
	        ready: NULL,        // ready 回调
	        views: [],          // 包含的 views
	        plugins: [],        // 插件配置
	        renderEvent: TRUE
	    };
	
	    // 渲染 View
	    function renderView(name, param, module, isShow) {
	
	        return new Deferred().startWith(function (that) {
	            $viewM.get(name, function (view) {
	                if (that.enabled) {
	                    if (view) {
	                        var cb = function (type) {
	                            if (type === 'destroy') {
	                                view.destroy();
	                                view = NULL;
	                                that.reject();
	                            }
	                        };
	
	                        view.parentModule = module;
	                        view.parentView = module.parentView;
	                        view.on('loadStart', function () {
	                            view.mergeParam(param);
	                            view.initialShow = !!isShow;
	                        });
	                        view.on('completed', function () {
	                            that.resolve(view);
	                        });
	                        view.renderTo(module.container);
	                        view.on('destroy', function () {
	                            view = NULL;
	                        });
	
	                        that.progress(cb);
	                        that.all(function () {
	                            that.unProgress(cb);
	                        });
	                    } else {
	                        that.resolve(NULL);
	                    }
	                }
	            });
	        });
	    }
	
	    // 处理 View
	    function handleView(module, parentViewIndex) {
	        var views = module.options.views;
	        views.forEach(function (view, index) {
	            if (_isString(view)) {
	                views[index] = view = {
	                    tag: view,
	                    name: view,
	                    param: {}
	                };
	            }
	            if (view.name.indexOf(':') === -1 && parentViewIndex) {
	                view.name += ':' + parentViewIndex;
	            }
	            module.addView(view.tag, view.name, view.param);
	        });
	    }
	
	    // 处理 Plugin
	    function handlePlugin(module) {
	        module.options.plugins.forEach(function (plugin) {
	            var name = typeof plugin === 'string' ? plugin : plugin.name,
	                options = plugin.options || {};
	            if ($pluginM.exists(name)) {
	                module.plugins[name] = ($pluginM.get(name))(module, options, Config);
	            }
	        });
	    }
	
	    // 充值 View 样式
	    function resetViewStyle(view) {
	        if (view && view.options && view.options.styles) {
	            _css(view.root, view.options.styles);
	        }
	    }
	
	    // Module 对象
	    function Module(options, parentViewIndex) {
	        var me = this;
	
	        me.options = _extend(TRUE, {}, DEFAULT_OPT, options);
	        me.param = {};
	        me.isReady = FALSE;
	        me.container = NULL;
	        me.curTag = me.options.defaultTag || NULL;
	        me.tagList = [];
	        me.parentView = NULL;
	        me.views = {};
	        me.plugins = {};
	
	        me.renderAll = me.options.renderAll;
	        me.renderDefers = [];
	
	        me.renderAllDefer = NULL;
	        me.renderOneDefer = NULL;
	
	        me.pushMessageTimer = NULL;
	
	        //INFO '[Module] 新建模块', me.name, '标签列表', me.tagList
	        handleView(me, parentViewIndex);
	        handlePlugin(me);
	    }
	
	    _extend(Module.prototype, {
	        renderTo: function (container) {
	            var me = this,
	                renderEvent = me.options.renderEvent,
	                curView;
	            me.container = container;
	            if (me.renderAll) {
	                me.renderAllDefers = _queue(me.renderDefers, me.tagList).done(function () {
	                    me.trigger('loaded');
	                }).progress(function (tag, view) {
	                    if (view) {
	                        if (renderEvent) {
	                            view.trigger('beforeShow');
	                        }
	                        me.views[tag].entity = view;
	                        if (renderEvent) {
	                            view.trigger('show');
	                        }
	                        if (tag != me.curTag) {
	                            _css(view.root, 'display', 'none');
	                        }
	                    }
	                });
	            } else if (me.curTag) {
	                curView = me.views[me.curTag];
	                if (curView) {
	                    me.renderOneDefer = renderView(curView.name, curView.param, me, TRUE).done(function (view) {
	                        if (renderEvent) {
	                            view.trigger('beforeShow');
	                        }
	                        curView.entity = view;
	                        if (renderEvent) {
	                            view.trigger('show');
	                        }
	                        me.trigger('loaded');
	                    });
	                }
	            } else {
	                me.trigger('loaded');
	            }
	            if (!me.isReady) {
	                me.isReady = TRUE;
	                me.trigger('ready');
	                _apply(me.options.ready, me);
	            }
	        },
	        mergeParam: function (newParam) {
	            var me = this,
	                viewOpt;
	            _extend(TRUE, me.param, newParam);
	            if (me.curTag && me.views[me.curTag]) {
	                viewOpt = me.views[me.curTag];
	                $viewM.get(viewOpt.name, viewOpt.param).invoke('mergeParam', me.param);
	            }
	        },
	        addView: function (tag, name, param) {
	            var me = this;
	            tag = tag || name;
	            if (me.renderAll && !me.curTag) {
	                me.curTag = tag;
	            }
	            me.views[tag] = {
	                name: name,
	                param: param
	            };
	            me.tagList.push(tag);
	            if (me.renderAll) {
	                me.renderDefers.push(renderView(name, param, me, me.curTag === tag));
	            }
	        },
	        /**
	         * 切换视图
	         *
	         * @prototype Module.prototype.launch
	         * @category Class:Module
	         * @type {Function}
	         * @param {String} tag 视图标签
	         * @param {Object} param 参数
	         */
	        launch: function (tag, param) {
	            var me = this,
	                curView = me.views[me.curTag],
	                nextView = me.views[tag],
	                curEntity, nextEntity;
	
	            //INFO '[Module] 切换标签', tag
	            if (me.renderOneDefer) {
	                me.renderOneDefer.destroy();
	                me.renderOneDefer = NULL;
	            }
	
	            if (nextView) {
	                curEntity = curView && curView.entity;
	                nextEntity = nextView.entity;
	                if (me.curTag === tag && curEntity) {
	                    curEntity.mergeParam(_extend({}, me.param, param));
	                    curEntity.trigger('refresh');
	                } else {
	                    if (me.renderAll) {
	                        nextEntity.mergeParam(_extend({}, me.param, param));
	                        if (curEntity) {
	                            _css(curEntity.root, 'display', 'none');
	                        }
	                        _removeStyle(nextEntity.root, ['visibility', 'display']);
	                        resetViewStyle(nextEntity);
	                        nextEntity.notify('actived');
	                        if (curEntity) {
	                            curEntity.notify('deactived');
	                        }
	                        me.curTag = tag;
	                        me.trigger('launch', tag, param);
	                    } else {
	                        if (curEntity) {
	                            curEntity.trigger('beforeHide');
	                        }
	                        nextEntity = nextView.entity = NULL;
	                        me.renderOneDefer = renderView(nextView.name, _extend({}, nextView.param, me.param, param), me).done(function (view) {
	                            if (view) {
	                                nextEntity = nextView.entity = view;
	                                nextEntity.mergeParam(_extend({}, me.param, param));
	                                nextEntity.trigger('beforeShow');
	                                if (curEntity) {
	                                    _css(curEntity.root, 'display', 'none');
	                                }
	                                _removeStyle(nextEntity.root, ['visibility', 'display']);
	                                resetViewStyle(nextEntity);
	                                if (curEntity) {
	                                    curEntity.trigger('hide');
	                                }
	                                nextEntity.trigger('show');
	                                if (curEntity) {
	                                    curEntity.destroy();
	                                    curView.entity = NULL;
	                                }
	                                me.trigger('launch', tag, param);
	                            }
	                        }).fail(function () {
	                            if (curEntity) {
	                                curEntity.destroy();
	                                curView.entity = NULL;
	                            }
	                        });
	                    }
	                    me.curTag = tag;
	                }
	            }
	        },
	        getCurViewOpt: function () {
	            return this.views[this.curTag];
	        },
	        getCurView: function () {
	            var me = this,
	                tag = me.curTag,
	                views = me.views;
	            return tag && views[tag] ? views[tag].entity : NULL;
	        },
	        pushMessage: function (type, message) {
	            var me = this;
	            if (me.curTag) {
	                if (me.views[me.curTag].entity) {
	                    me.views[me.curTag].entity.trigger(type, message);
	                } else {
	                    (me.renderOneDefer || me.renderAllDefer).done(function () {
	                        if (me.views[me.curTag].entity) {
	                            me.views[me.curTag].entity.trigger(type, message);
	                        }
	                    });
	                }
	            }
	        },
	        destroy: function () {
	            var me = this;
	
	            _each(me.views, function (tag, viewOpt) {
	                if (viewOpt.entity && viewOpt.entity.destroy) {
	                    viewOpt.entity.destroy();
	                }
	                viewOpt.entity = NULL;
	            });
	
	            me.tagList.length = 0;
	
	            me.renderDefers.forEach(function (deferred) {
	                deferred.destroy();
	            });
	
	            me.renderDefers.length = 0;
	
	            if (me.renderAllDefer) {
	                me.renderAllDefer.destroy();
	            }
	
	            if (me.renderOneDefer) {
	                me.renderOneDefer.destroy();
	            }
	
	            clearTimeout(me.pushMessageTimer);
	
	            _each(me.plugins, function(key, plugin) {
	                if (plugin && _isFunction(plugin.destroy)) {
	                    plugin.destroy();
	                }
	            });
	
	            _empty(me);
	
	            me.destroyed = TRUE;
	        }
	    }, CustEvent);
	
	    // 注入 ViewManager
	    Module.inject = function (Manager) {
	        $viewM = Manager;
	    };
	
	    return Module;
	
	});
	
	/**
	 * 切换事件
	 *
	 * @event Module:launch
	 * @category Class:Module
	 */
	

	/* ================================== View ================================== */
	define('view', function () {
	
	    var Module = r('module'),
	        $fetchNode = r('fetchNode'),
	        $pluginM = r('pluginM'),
	        $widgetM = r('widgetM'),
	        $display = r('display');
	
	    var RENDER_TIMEOUT = 10;
	
	    var DEFAULT_OPT = {
	        init: {},
	        html: NULL,
	        fetch: NULL,
	        classNames: [],
	        attrs: {},
	        styles: {},
	        destroyDom: TRUE,
	        supportHash: TRUE,
	        ready: NULL,
	        modules: [],
	        subViews: [],
	        plugins: [],
	        bindEvents: {},
	        extra: {}
	    };
	
	    function createRoot() {
	        return doc.createElement(Tags.view);
	    }
	
	    function initialize(view) {
	        var init = view.options.init;
	        _each(init, function (key, value) {
	            //INFO '[View] 初始化', key, '在视图', view.name, '上, 值为', value
	            view[key] = _isFunction(value) ? value.bind(view) : value;
	        });
	    }
	
	    function bindEvents(view) {
	        _each(view.options.bindEvents, function(eventName, process) {
	            if (_isFunction(process)) {
	                //INFO '[View] 绑定事件', eventName, '在视图', view.name, '上, 回调为', process
	                view.on(eventName, process.bind(view));
	            }
	        });
	    }
	
	    function handleModule(view, viewIndex) {
	        var options = view.options,
	            module;
	        options.subViews.forEach(function (item) {
	            options.modules.unshift({
	                name: item.name + '-module',
	                defaultTag: 'index',
	                container: item.container,
	                ready: NULL,
	                views: [{
	                    tag: 'index',
	                    name: item.name,
	                    param: item.param
	                }],
	                plugins: [],
	                renderEvent: item.renderEvent
	            });
	        });
	        options.modules.forEach(function (moduleOpt) {
	            view.hasModule = TRUE;
	            module = new Module(moduleOpt, viewIndex);
	            module.parentView = view;
	            view.modules[moduleOpt.name] = module;
	        });
	    }
	
	    function handlePlugin(view) {
	        var addPlugins = $pluginM.getGlobal();
	
	        addPlugins.concat(view.options.plugins).forEach(function (plugin) {
	            var name = _isString(plugin) ? plugin : plugin.name,
	                options = plugin.options || view.options[_camelCase(name) + 'Options'] || {},
	                pluginOpt = $pluginM.get(name),
	                opt;
	            if (pluginOpt && _isFunction(pluginOpt.adapter)) {
	                //INFO '[View] 添加插件', name, '配置', options, '在视图', view.name
	                opt = _isFunction(options) ? options : _extend(TRUE, {}, pluginOpt.options, options);
	                view.plugins[name] = (pluginOpt.adapter)(view, opt, Config);
	            }
	        });
	    }
	
	    function getParam(el, name) {
	        var options = {
	            param: {}
	        };
	
	        _each(_dataSet(el), function (key, value) {
	            if (!key.indexOf(name)) {
	                var attrName = key.substring(name.length).replace(/\w/i, function (letter) {
	                    return letter.toLowerCase();
	                });
	                if (!attrName.indexOf('param')) {
	                    options.param[
	                        attrName.substring(5).replace(/\w/i, function (letter) {
	                            return letter.toLowerCase();
	                        })
	                        ] = value;
	                } else {
	                    options[attrName] = value;
	                }
	            }
	        });
	        return options;
	    }
	
	    function handleWidget(view, container) {
	        container =  (_isString(container) ? view.root.querySelector(container) : container) || view.root;
	        _makeArray(
	            container.querySelectorAll('[' + Tags.widget + ']')
	        ).forEach(function (el) {
	                var name = _attr(el, Tags.widget),
	                    widget, eventName, bindFunc, adapter, options;
	                if ($widgetM.exists(name)) {
	                    eventName = $widgetM.get(name).eventName;
	                    adapter = $widgetM.get(name).adapter;
	
	                    bindFunc = function () {
	                        options = getParam(el, name);
	                        widget = adapter(el, options, view);
	                        if (options.id) {
	                            view.widgets[options.id] = widget;
	                        }
	                    };
	
	                    if ($widgetM.isEvent(name)) {
	                        options = getParam(el, name);
	                        eventName = options.eventType || eventName;
	
	                        _addEvent(el, eventName, bindFunc, FALSE);
	                        view.on('destroy', function () {
	                            _removeEvent(el, eventName, bindFunc);
	                        });
	                    } else {
	                        if (view.isReady) {
	                            bindFunc();
	                        } else {
	                            view.on('ready', function () {
	                                bindFunc();
	                            });
	                        }
	                    }
	
	                    view.on('destroy', function () {
	                        if (widget && _isFunction(widget.destroy)) {
	                            widget.destroy();
	                        }
	                        widget = NULL;
	                        adapter = NULL;
	                        options = NULL;
	                        bindFunc = NULL;
	                    });
	                }
	            });
	    }
	
	    function doReady(view) {
	        view.isReady = TRUE;
	        view.trigger('ready');
	        _apply(view.options.ready, view);
	        view.trigger('completed');
	    }
	
	    function getViewIndex(name) {
	        return name.split('-')[0].split(':')[1];
	    }
	
	    function View(options) {
	        var me = this;
	
	        me.options = _extend(TRUE, {}, DEFAULT_OPT, options);
	        me.name = me.options.name || ('view-' + _getUniqueID());
	        //INFO '[View] 创建视图', me.name
	        /**
	         * 容器
	         *
	         * @property View.container
	         * @category Class:View
	         * @type {Element}
	         */
	        me.container = NULL;
	        /**
	         * 是否已经ready
	         *
	         * @property View.isReady
	         * @category Class:View
	         * @type {Boolean}
	         */
	        me.isReady = FALSE;
	        /**
	         * 是否显示
	         *
	         * @property View.isShow
	         * @category Class:View
	         * @type {Boolean}
	         */
	        me.isShow = FALSE;
	        me.locked = FALSE;
	        /**
	         * 根节点
	         *
	         * @property View.root
	         * @category Class:View
	         * @type {Element}
	         */
	        me.root = NULL;
	        me.nodes = NULL;
	        /**
	         * 参数
	         *
	         * @property View.param
	         * @category Class:View
	         * @type {Element}
	         */
	        me.param = {};
	        /**
	         * 父模块
	         *
	         * @property View.parentModule
	         * @category Class:View
	         * @type {Module}
	         */
	        me.parentModule = NULL;
	        /**
	         * 父视图
	         *
	         * @property View.parentView
	         * @category Class:View
	         * @type {View}
	         */
	        me.parentView = NULL;
	        /**
	         * 是否存在模块
	         *
	         * @property View.hasModule
	         * @category Class:View
	         * @type {Boolean}
	         */
	        me.hasModule = FALSE;
	        /**
	         * 模块映射
	         *
	         * @property View.modules
	         * @category Class:View
	         * @type {Object<String, Module>}
	         */
	        me.modules = {};
	        /**
	         * 插件映射
	         *
	         * @property View.plugins
	         * @category Class:View
	         * @type {Object<String, Plugin>}
	         */
	        me.plugins = {};
	        /**
	         * 组件映射
	         *
	         * @property View.widgets
	         * @category Class:View
	         * @type {Object<String, Widget>}
	         */
	        me.widgets = {};
	        /**
	         * 扩展配置
	         *
	         * @property View.extra
	         * @category Class:View
	         * @type {Object}
	         */
	        me.extra = _extend({}, me.options.extra);
	
	        me.renderEventTimer = NULL;
	        me.renderDeferred = new Deferred();
	
	        me.moduleDeferreds = [];
	        me.modulParallelDeferred = NULL;
	
	        //INFO '[View] 开始初始化视图', me.name
	        initialize(me);
	        //INFO '[View] 开始绑定事件', me.name
	        bindEvents(me);
	        //INFO '[View] 开始处理模块', me.name
	        handleModule(me, getViewIndex(me.name));
	        //INFO '[View] 开始处理插件', me.name
	        handlePlugin(me);
	
	        me.on('show', function() {
	           me.isShow = TRUE;
	        });
	
	        me.on('hide', function() {
	            me.isShow = FALSE;
	        });
	    }
	
	    _extend(View.prototype, CustEvent, {
	        /**
	         * 渲染到容器中
	         *
	         * @prototype View.prototype.renderTo
	         * @category Class:View
	         * @private
	         * @type {Function}
	         * @param {Element} container 渲染到的容器
	         * @return {View} view 视图实例
	         */
	        renderTo: function (container) {
	            var me = this;
	            //INFO '[View] 渲染视图', me.name, '容器', container
	            if (!me.locked) {
	                me.locked = TRUE;
	                me.container = container;
	                if (!me.isReady) {
	                    me.root = createRoot();
	                    _attr(me.root, 'qapp-name', me.name);
	                    _addClass(me.root, me.options.classNames.join(' '));
	                    _attr(me.root, me.options.attrs);
	                    _css(me.root, me.options.styles);
	                    me.trigger('loadStart');
	                    $fetchNode(me).done(function () {
	                        me.html = me.options.html;
	                        me.trigger('loadEnd');
	                        me.container.appendChild(me.root);
	                        me.renderHTML().done(function () {
	                            me.trigger('rendered');
	                            if (me.hasModule) {
	                                _each(me.modules, function (key, module) {
	                                    me.moduleDeferreds.push(new Deferred().startWith(function (that) {
	                                        module.once('loaded', function () {
	                                            that.resolve();
	                                        });
	                                        module.renderTo(
	                                            (module.options.container && me.root.querySelector(module.options.container)) || me.root
	                                        );
	                                    }));
	                                });
	                                me.modulParallelDeferred = _parallel(me.moduleDeferreds).done(function () {
	                                    me.trigger('loaded');
	                                    me.locked = FALSE;
	                                    doReady(me);
	                                });
	                            } else {
	                                me.trigger('loaded');
	                                me.locked = FALSE;
	                                doReady(me);
	                            }
	                        });
	                    });
	                } else {
	                    me.trigger('rendered');
	                    me.container.appendChild(me.root);
	                    me.trigger('loaded');
	                    me.locked = FALSE;
	                    me.trigger('completed');
	                }
	            }
	            return me;
	        },
	        /**
	         * 渲染HTML
	         *
	         * @prototype View.prototype.renderHTML
	         * @category Class:View
	         * @private
	         * @type {Function}
	         * @param {String} html html模板
	         * @return {Deferred} deferred 异步对象
	         */
	        renderHTML: function (html) {
	            var me = this,
	                deferred = me.renderDeferred,
	                cb = function (e) {
	                    if (me.renderEventTimer) {
	                        clearTimeout(me.renderEventTimer);
	                        me.renderEventTimer = NULL;
	                    }
	                    me.renderEventTimer = _delay(function () {
	                        if (me.root) {
	                            deferred.resolve();
	                        }
	                    }, RENDER_TIMEOUT);
	                };
	
	            me.html = html || me.html;
	            me.nodes = _builder(me.html).children;
	
	            if (me.nodes.length) {
	                _addEvent(me.root, 'DOMNodeInserted', cb, FALSE);
	                _appendNodes(me.root, me.nodes);
	                deferred.done(function () {
	                    _removeEvent(me.root, 'DOMNodeInserted', cb);
	                    handleWidget(me);
	                });
	                me.renderEventTimer = _delay(function () {
	                    if (me.root) {
	                        deferred.resolve();
	                    }
	                }, RENDER_TIMEOUT);
	            } else {
	                if (me.root) {
	                    handleWidget(me);
	                    deferred.resolve();
	                }
	            }
	            return deferred;
	        },
	        staticBuild: function(root) {
	            var me = this;
	            //INFO '[View] 静态构建', me.name
	            if (root && _isElement(root)) {
	                me.trigger('loadStart');
	                me.html = root.innerHTML || '';
	                me.trigger('loadEnd');
	                me.container = root.parentNode || root;
	                me.root = root;
	                _attr(me.root, 'qapp-name', me.name);
	                _addClass(me.root, me.options.classNames.join(' '));
	                _attr(me.root, me.options.attrs);
	                _css(me.root, me.options.styles);
	                me.nodes = _makeArray(root.children) || [];
	                handleWidget(me);
	                me.trigger('rendered');
	                me.trigger('loaded');
	                doReady(me);
	                me.trigger('completed');
	                me.trigger('beforeShow');
	                me.trigger('show');
	                me.trigger('actived');
	            }
	            return me;
	        },
	        /**
	         * 显示
	         *
	         * @prototype View.prototype.show
	         * @category Class:View
	         * @type {Function}
	         * @param {Element} container 渲染到的节点
	         * @param {Object} [startCss] 开始的样式
	         * @param {Object} [endCss] 结束的样式
	         * @param {Number} [duration] 持续时间，默认 200
	         * @return {View} view 当前视图实例
	         * @explain
	         * * 动画插件会复写此方法。
	         * * *QApp.open* 和 *QApp.show* 会自动调用此方法
	         */
	        show: $display.show,
	        /**
	         * 隐藏
	         *
	         * @prototype View.prototype.hide
	         * @category Class:View
	         * @type {Function}
	         * @return {View} view 当前视图实例
	         * @explain
	         * * 动画插件会复写此方法
	         * * *QApp.open* 和 *QApp.show* 会复写此方法
	         */
	        hide: $display.hide,
	        /**
	         * 关闭
	         *
	         * @prototype View.prototype.close
	         * @category Class:View
	         * @type {Function}
	         * @return {View} view 当前视图实例
	         * @explain
	         * * 动画插件会复写此方法
	         * * *QApp.open* 和 *QApp.show* 会复写此方法
	         */
	        close: $display.hide,
	        /**
	         * Merge 参数
	         *
	         * @prototype View.prototype.mergeParam
	         * @category Class:View
	         * @private
	         * @type {Function}
	         * @param {Object} newParam 新参数
	         * @return {View} view 当前视图实例
	         */
	        mergeParam: function (newParam) {
	            var me = this;
	            //INFO '[View] Merge 参数在视图', me.name, '上，新参数为', newParam
	            _extend(TRUE, me.param, newParam);
	            _each(me.modules, function (key, module) {
	                module.mergeParam(me.param);
	            });
	            return me;
	        },
	        /**
	         * 获取子视图
	         *
	         * @prototype View.prototype.getInnerView
	         * @category Class:View
	         * @type {Function}
	         * @param {String} name 视图名
	         * @return {View} view 子视图实例
	         */
	        getInnerView: function (name) {
	            var me = this,
	                key, viewOpt;
	            if (name) {
	                for (key in me.modules) {
	                    viewOpt = me.modules[key].getCurViewOpt();
	                    if (viewOpt.entity && viewOpt.name === name) {
	                        return viewOpt.entity;
	                    }
	                }
	            }
	            return NULL;
	        },
	        fn: function (name) {
	            var me = this;
	            return function () {
	                return _isFunction(me[name]) ?
	                    me[name].apply(this, _makeArray(arguments)) :
	                    NULL;
	            };
	        },
	
	        /**
	         * 绑定事件
	         *
	         * @prototype View.prototype.on
	         * @category Class:View
	         * @type {Function}
	         * @param {String} name 事件名
	         * @param {Function} listener 监听的回调
	         * @return {View} view 当前视图实例
	         */
	
	        /**
	         * 绑定事件（只监听一次）
	         *
	         * @prototype View.prototype.once
	         * @category Class:View
	         * @type {Function}
	         * @param {String} name 事件名
	         * @param {Function} listener 监听的回调
	         * @return {View} view 当前视图实例
	         */
	
	        /**
	         * 取消绑定事件
	         *
	         * @prototype View.prototype.off
	         * @category Class:View
	         * @type {Function}
	         * @param {String} [name] 事件名
	         * @param {Function} [listener] 监听的回调
	         * @return {View} view 当前视图实例
	         * @explain
	         * listener 不给出，则取消绑定此次事件名所有绑定的回调
	         * name 不给出，则取消所有绑定的事件
	         */
	
	        /**
	         * 触发事件
	         *
	         * @prototype View.prototype.trigger
	         * @category Class:View
	         * @type {Function}
	         * @param {String} name 事件名
	         * @param {Object} data 数据
	         * @return {View} view 当前视图实例
	         */
	
	        /**
	         * 绑定事件
	         *
	         * @prototype View.prototype.frontOn
	         * @category Class:View
	         * @type {Function}
	         * @param {String} name 事件名
	         * @param {Function} listener 监听的回调
	         * @return {View} view 当前视图实例
	         */
	        frontOn: function(name, listener) {
	            var me = this,
	                events = me._events[name] = me._events[name] || [];
	            events.unshift({
	                callback: listener,
	                ctx: me
	            });
	            return me;
	        },
	        /**
	         * 派发事件
	         *
	         * @prototype View.prototype.dispatch
	         * @category Class:View
	         * @type {Function}
	         * @param {String} name 事件名
	         * @param {Object} data 数据
	         * @explain
	         * 其父祖级视图也会接收到此事件（向外冒泡）
	         */
	        dispatch: function () {
	            var me = this,
	                parentView = me.parentView,
	                args = _makeArray(arguments);
	            //INFO '[View] 视图', me.name, '事件派发', args
	            if (me.trigger.apply(me, args) && parentView) {
	                if (parentView.isReady && !parentView.locked) {
	                    parentView.trigger.apply(parentView, args);
	                } else {
	                    parentView.on('completed', function () {
	                        parentView.trigger.apply(parentView, args);
	                    });
	                }
	            }
	        },
	        /**
	         * 通知事件
	         *
	         * @prototype View.prototype.notify
	         * @category Class:View
	         * @type {Function}
	         * @param {String} name 事件名
	         * @param {Object} data 数据
	         * @explain
	         * 其子孙级视图也会接收到此事件（向内冒泡）
	         */
	        notify: function () {
	            var me = this,
	                args = _makeArray(arguments),
	                subView;
	            //INFO '[View] 视图', me.name, '事件通知', args
	            if (me.trigger.apply(me, args) && me.hasModule) {
	                _each(me.modules, function (key, module) {
	                    subView = module.getCurView();
	                    if (subView) {
	                        subView.notify.apply(subView, args);
	                    }
	                });
	            }
	        },
	        /**
	         * 扫描并渲染组件
	         *
	         * @prototype View.prototype.scanWidget
	         * @category Class:View
	         * @type {Function}
	         * @param {Element} container 节点
	         */
	        scanWidget: function(container) {
	            handleWidget(this, container);
	        },
	        /**
	         * 显示组件
	         *
	         * @method View.prototype.showWidget
	         * @category Class:View
	         * @core
	         * @param {String} name 组件名
	         * @param {Element} [el] 节点
	         * @param {Object} options 配置
	         * @return {Any} obj 组件返回的对象
	         * @example
	         * var widget = View.showWidget('searchlist', {
	         *    onComplete: function() {
	         *          todoSomething();
	         *    }
	         * });
	         * @explain
	         * 所需参数和返回的对象由组件的适配器决定
	         */
	        showWidget: function (name, el, options) {
	            if (widgets[name]) {
	                if (_isElement(el)) {
	                    return widgets[name].adapter(el, options, this);
	                } else {
	                    return widgets[name].adapter(NULL, el, options, this);
	                }
	            }
	        },
	        /**
	         * 销毁视图
	         *
	         * @prototype View.prototype.destroy
	         * @category Class:View
	         * @private
	         * @type {Function}
	         * @explain
	         * 一般不需用户调用
	         */
	        destroy: function () {
	            //INFO '[View] 销毁视图:', this.name
	            var me = this;
	            if (me.options.destroyDom) {
	                _removeNode(me.root);
	            }
	
	            clearTimeout(me.renderEventTimer);
	
	            if (me.renderDeferred) {
	                me.renderDeferred.destroy();
	            }
	
	            if (me.hasModule) {
	                me.moduleDeferreds.forEach(function (deferred) {
	                    deferred.destroy();
	                });
	                me.moduleDeferreds.length = 0;
	                if (me.modulParallelDeferred) {
	                    me.modulParallelDeferred.destroy();
	                }
	            }
	
	            _each(me.modules, function (key, module) {
	                module.destroy();
	            });
	
	            _each(me.plugins, function(key, plugin) {
	                if (plugin && _isFunction(plugin.destroy)) {
	                    plugin.destroy();
	                }
	            });
	
	            _each(me.widgets, function(key, widget) {
	                if (widget && _isFunction(widget.destroy)) {
	                    widget.destroy();
	                }
	            });
	
	            me.trigger('destroy');
	            me.off();
	
	            _empty(me);
	
	            me.destroyed = TRUE;
	
	            return me;
	        }
	    });
	
	    return View;
	});
	
	/**
	 * 将要开始显示
	 *
	 * @event View:beforeShow
	 * @category Event:View
	 */
	
	/**
	 * 显示
	 *
	 * @event View:show
	 * @category Event:View
	 * @core
	 * @explain
	 * 业务逻辑推荐在这里开始执行，类似ajax的逻辑，会影响动画效率。
	 * 只有视图第一次显示时，才触发此事件。
	 */
	
	/**
	 * 将要开始隐藏
	 *
	 * @event View:beforeHide
	 * @category Event:View
	 */
	
	/**
	 * 隐藏
	 *
	 * @event View:hide
	 * @category Event:View
	 */
	
	/**
	 * 接收到数据
	 *
	 * @event View:receiveData
	 * @category Event:View
	 * @core
	 * @param {String} view 来源的视图名，例 view
	 * @param {String} name 带索引的视图名, 例 view:1
	 * @param {Object} [data] 携带的数据
	 * @example
	 * view.bind('receiveData', function(data) {
	 *     execute(data); //TODO 处理data
	 * });
	 * @explain
	 * 使用 [QApp.open](#QApp-router-open) 时，数据回溯，建议使用此事件接收。
	 */
	
	/**
	 * 被激活
	 *
	 * @event View:actived
	 * @category Event:View
	 * @core
	 * @explain
	 * 视图每次展现都会触发此事件
	 */
	
	/**
	 * 被取消激活
	 *
	 * @event View:deactived
	 * @category Event:View
	 */
	
	/**
	 * 销毁
	 *
	 * @event View:destroy
	 * @category Event:View
	 * @explain
	 * 一般用于销毁时，自动销毁用户创建的一些对象或者终止正在进行中的逻辑
	 */
	

	define('taskQ', function () {
	
	    var messageCenter = _createEventManager(),
	        curTasks = NULL,
	        timeout = 500;
	
	    function createQueue(tasks) {
	        QApp.trigger('running', TRUE);
	        _queue(tasks, [], TRUE).done(function() {
	            curTasks.forEach(function(task) {
	                if (task && _isFunction(task.destroy)) {
	                    task.destroy();
	                }
	            });
	            curTasks = NULL;
	            QApp.trigger('running', FALSE);
	        }).progress(function() {
	            messageCenter.trigger('ev');
	        });
	    }
	
	    var taskQueue = {
	        push: function(defer) {
	            if (curTasks) {
	                curTasks.push(defer);
	            } else {
	                curTasks = [defer];
	                createQueue(curTasks);
	            }
	        },
	        pushTask: function(task) {
	            taskQueue.push(new Deferred().startWith(function(that) {
	                try {
	                    task(that);
	                } catch(e) {}
	                _delay(function() {
	                    if (that && _isFunction(that.resolve)) {
	                        that.resolve();
	                    }
	                }, timeout);
	            }));
	        },
	        addListener: function(fn) {
	            messageCenter.on('ev', fn);
	        }
	    };
	
	    return taskQueue;
	});

	define('viewM', function() {
	
	    var View = r('view'),
	        Module = r('module'),
	        $taskQueue = r('taskQ');
	
	    var optionsMap = QApp._viewOptionsMap = {},
	        viewMap = QApp._viewMap = {};
	
	    function throwNoViewError(name) {
	        //WARN '没有找到相应视图', name
	    }
	
	    function getRealName(name) {
	        return name.split(':')[0];
	    }
	
	    function getView(name, index, callback) {
	        var view;
	        if (viewMap[name] && viewMap[name][index]) {
	            callback(viewMap[name][index]);
	        } else if (optionsMap[name]) {
	            view = viewMap[name][index] = new View(_extend({
	                name: name + ':' + index
	            }, optionsMap[name]));
	            view.on('destroy', function () {
	                viewMap[name][index] = NULL;
	            });
	            callback(view);
	        } else {
	            throwNoViewError(name);
	        }
	    }
	
	    function getViewSync(name, index) {
	        var view = NULL;
	        if (viewMap[name] && viewMap[name][index]) {
	            view = viewMap[name][index];
	        } else if (optionsMap[name]) {
	            view = viewMap[name][index] = new View(_extend({
	                name: name + ':' + index
	            },optionsMap[name]));
	            view.on('destroy', function () {
	                viewMap[name][index] = NULL;
	            });
	        } else {
	            throwNoViewError(name);
	        }
	        return view;
	    }
	
	    function getNameAndIndex(key) {
	        var values = key.split(':');
	        return {
	            name: values[0],
	            index: values[1] || 0
	        };
	    }
	
	    function bindEvents(view, options) {
	        _each(options, function(key, value) {
	            if (key.indexOf('on') === 0 && _isFunction(value) && key != 'onComplete') {
	                view.on(key.substring(2).replace(/\w/, function (a) {
	                    return a.toLowerCase();
	                }), value);
	            }
	        });
	    }
	
	    function getOptions(args) {
	        return _extend.apply(NULL, [TRUE, {}].concat(_makeArray(args).map(function (item) {
	            return _isString(item) ? optionsMap[item] || {} : item;
	        })));
	    }
	
	    var Manager = {
	        /**
	         * 定义视图
	         *
	         * @method QApp.view.define
	         * @category View
	         * @core
	         * @alias QApp.defineView
	         * @param {String} name 视图名
	         * @param {Object} options 配置
	         * @example
	         *     QApp.defineView('view', {
	         *        // 模板
	         *        html: '',
	         *        // 给视图根节点添加的样式
	         *        classNames: ['class1', 'class2'],
	         *        // 给视图根节点添加的属性
	         *        attrs: {
	         *            'data-some': 'qunar'
	         *        },
	         *        // 给视图根节点添加的样式
	         *        styles: {
	         *            'background-color': 'red'
	         *        },
	         *        // 给视图实例添加属性和方法
	         *        init: {
	         *            someValue: null,
	         *            doSomething: function() {
	         *            }
	         *        },
	         *        // 插件配置
	         *        plugins: ['plugin1', {
	         *            name: 'plugin2',
	         *            options: {
	         *            }
	         *        }],
	         *        // 嵌套配置
	         *        modules: [{
	         *            // 名称
	         *            name: 'module',
	         *            // 默认 tag
	         *            defaultTag: 'someView',
	         *            // 渲染的位置
	         *            container: '.module-container',
	         *            // 包含视图配置，如果是 {string} 则，tag = view = 此 string
	         *            views: ['someView1', {
	         *                 tag: 'someName2',
	         *                 view: 'someView2'
	         *            }],
	         *        }],
	         *        // 视图生命周期事件绑定
	         *        bindEvents: {
	         *            'show': function() {
	         *                // this 指向视图实例
	         *            }
	         *        },
	         *        // 视图创建完成的回调
	         *        ready: function() {
	         *            // this 指向视图实例
	         *        }
	         *     });
	         *
	         */
	        define: function (name) {
	            if (_isString(name)) {
	                optionsMap[name] = getOptions(arguments);
	                viewMap[name] = [];
	            }
	        },
	        /**
	         * 取消定义视图
	         *
	         * @method QApp.view.undefine
	         * @category View
	         * @param {String} name 视图名
	         */
	        undefine: function (name) {
	            if (_isString(name)) {
	                optionsMap[name] = NULL;
	            }
	        },
	        /**
	         * 获取视图定义的配置
	         *
	         * @method QApp.view.getOptions
	         * @category View
	         * @param {String} name 视图名
	         * @return {Object} options 配置
	         */
	        getOptions: function(name) {
	            return optionsMap[name];
	        },
	        /**
	         * 创建视图实例
	         *
	         * @method QApp.view.create
	         * @category View
	         * @param {Object} options 视图配置
	         * @return {View} view 视图实例
	         */
	        create: function () {
	            var entity = new View(getOptions(arguments)),
	                name = entity.name;
	            if (name) {
	                var opt = getNameAndIndex(name);
	                viewMap[opt.name][opt.index] = entity;
	                entity.on('destroy', function() {
	                    viewMap[opt.name][opt.index] = NULL;
	                });
	            }
	            return entity;
	        },
	        structure: function(viewName, options) {
	            options = options || {};
	            options.ani = _isString(options.ani) ? {name : options.ani} : options.ani || {};
	
	            var opt = _extend(TRUE, {}, Manager.getOptions(viewName.split(":")[0])),
	                type = options.ani.name || Config.defaultAnimate;
	
	            opt.name = viewName;
	
	            opt.init = opt.init || {};
	            opt.init.param = options.param || {};
	            opt.styles = _extend(opt.styles || {}, options.styles);
	            opt.classNames = (opt.classNames || []).concat(options.classNames);
	            if (type) {
	                opt.plugins = (opt.plugins || []).concat([{
	                    name: type,
	                    options: _extend({}, Manager.getExtraOption(viewName, type), options.ani)
	                }]);
	            }
	
	            var entity = Manager.create(opt);
	
	            entity.param = _extend({}, options.param);
	
	            bindEvents(entity, options);
	
	            entity.complete = function(data) {
	                if (_isFunction(options.onComplete)) {
	                    options.onComplete.call(entity, data);
	                }
	            };
	
	            // 兼容原形式
	            entity.on('callback', entity.complete);
	
	            return entity;
	        },
	        build: function(root) {
	            var options = getOptions(_makeArray(arguments).slice(1)),
	                view;
	            if (root && _isElement(root)) {
	                options.name = _attr(root, 'qapp-name');
	                view = new View(options);
	                view.staticBuild(root);
	            }
	            return view;
	        },
	        /**
	         * 显示视图
	         *
	         * @method QApp.view.show
	         * @category View
	         * @core
	         * @alias QApp.show
	         * @param {String} name 视图名
	         * @param {Object} options 视图配置
	         * @return {View} view 视图实例
	         * @example
	         * QApp.show('view', {
	         *     param: {
	         *         x: 1,
	         *         y: 2
	         *     },
	         *     ani: 'actionSheet',
	         *     onComplete: function(data) {
	         *     }
	         * });
	         * @explain
	         * *show* 主要用于视图内的组件类的内容展示，类似于PC端的弹层。
	         */
	        show: function(viewName, options) {
	            var args = _makeArray(arguments);
	            //DEBUG 'Show Arguments: ', args
	            var view = Manager.structure(viewName, options);
	            $taskQueue.pushTask(function(that) {
	                view.once('show', function() {
	                    that.resolve();
	                });
	                // 隐藏即销毁
	                view.once('hide', function() {
	                    _delay(function() {
	                        if (_isFunction(view.destroy)) {
	                            view.destroy();
	                        }
	                    });
	                });
	                view.show.apply(view, args.slice(2));
	            });
	            return view;
	        },
	        /**
	         * 查看视图是否定义
	         *
	         * @method QApp.view.exists
	         * @category View
	         * @alias QApp.existsView
	         * @param {String} name 视图名
	         * @return {Boolean} flag 是否存在
	         */
	        exists: function (name) {
	            return !!optionsMap[name];
	        },
	        /**
	         * 获取视图实例（异步）
	         *
	         * @method QApp.view.get
	         * @category View
	         * @alias QApp.getView
	         * @param {String} name 视图名
	         * @param {Function} callback 回调
	         * @example
	         * QApp.getView('someView', function(view) {
	         *      // view
	         * });
	         */
	        get: function (key, callback) {
	            var opt = {}, that;
	            if (_isString(key)) {
	                opt = getNameAndIndex(key);
	            }
	            if (_isFunction(callback)) {
	                getView(opt.name, opt.index, function (view) {
	                    callback(view);
	                });
	            } else {
	                that = {
	                    invoke: function () {
	                        var args = _makeArray(arguments),
	                            funcName = args.shift();
	                        getView(opt.name, opt.index, function (view) {
	                            _apply(view[funcName], view, args);
	                        });
	                        return that;
	                    },
	                    pushMessage: function (type, message) {
	                        var view = viewMap[opt.name] && viewMap[opt.name][opt.index];
	                        if (view) {
	                            view.trigger(type, message);
	                        }
	                        return that;
	                    }
	                };
	
	                return that;
	            }
	        },
	        /**
	         * 获取视图实例（同步）
	         *
	         * @method QApp.view.getSync
	         * @category View
	         * @alias QApp.getViewSync
	         * @param {String} name 视图名
	         * @return {View} view 视图实例
	         */
	        getSync: function(key) {
	            var opt = {}, values;
	            if (_isString(key)) {
	                values = key.split(':');
	                opt = {
	                    name: values[0],
	                    index: values[1] || 0
	                };
	            }
	            return getViewSync(opt.name, opt.index);
	        },
	        getExtraOption: function (name, key) {
	            var extra,
	                options = optionsMap[getRealName(name)];
	            if (options) {
	                extra = (options.extra && options.extra[Config.type]) || options.extra || {};
	                return extra[key];
	            }
	        },
	        getHashParams: function(name) {
	            var options = optionsMap[getRealName(name)];
	            return options ? options.hashParams || [] : [];
	        },
	        getRealName: getRealName
	    };
	
	    Module.inject(Manager);
	
	    return Manager;
	
	});
	

	define('viewQ', function () {
	
	    var $display = r('display'),
	        $taskQueue = r('taskQ'),
	        $viewM = r('viewM'),
	        $router;
	
	    var decStack = [],
	        pushTask = $taskQueue.pushTask,
	        getRealName = $viewM.getRealName;
	
	    function getMinZIndex() {
	        var dec = decStack[0],
	            zIndex;
	        if (dec && dec.root) {
	            zIndex = parseInt(_css(dec.root, 'z-index'));
	        }
	        return (zIndex || _getZIndex()) - 1;
	    }
	
	    function getLast() {
	        if (decStack.length) {
	            return decStack[decStack.length - 1];
	        }
	    }
	
	    function findByName(name) {
	        var l = decStack.length,
	            i;
	        for (i = l - 1; i > -1; i --) {
	            if (decStack[i].name == name) {
	                return i;
	            }
	        }
	        return -1;
	    }
	
	    function fixName(name) {
	        if (name.indexOf(':new') > -1) {
	            return name.replace(':new', ':' + _getUniqueID());
	        } else {
	            for (var i = 0, l = decStack.length; i< l; i ++) {
	                if (name == decStack[i].name.split(':')[0]) {
	                    return false;
	                }
	            }
	            return name;
	        }
	    }
	
	    function run(dec, type, launch, arg, callback) {
	        type = type || 'show';
	        pushTask(function(that) {
	            dec.on(type.replace('_', ''), function() {
	                _delay(function() {
	                    that.resolve().done(callback);
	                });
	            });
	            if (_isFunction(launch)) {
	                launch();
	            } else {
	                dec[type](arg);
	                if (type.indexOf('hide') > -1 && !arg) {
	                    that.resolve();
	                }
	            }
	        });
	    }
	
	    function hideRun(dec) {
	        run(dec, '_hide', function () {
	            $display.hide.call(dec);
	        });
	    }
	
	    function execute(dec) {
	        var _hide = dec.hide,
	            _close = dec.close,
	            activedEvents = dec._events.actived = dec._events.actived || [];
	
	        // 在业务前绑定，事件
	        activedEvents.unshift({
	            callback: function() {
	                viewQueue.preView = viewQueue.curView;
	                viewQueue.curView = dec.name;
	            },
	            ctx: dec
	        });
	
	        dec.once('hide', function() {
	            var index = decStack.indexOf(dec);
	            if (index > -1) {
	                decStack.splice(index, 1);
	                _delay(function() {
	                    if (_isFunction(dec.destroy)) {
	                        dec.destroy();
	                    }
	                });
	            }
	        });
	
	        dec.hide = dec._hide = function(immediately) {
	            if (immediately === TRUE) {
	                _hide.call(dec);
	            } else {
	                pushTask(function (that) {
	                    dec.once('hide', function () {
	                        _delay(that.resolve);
	                    });
	                    _hide.call(dec);
	                });
	            }
	        };
	
	        dec.close = dec._close = function(immediately) {
	            if (immediately === FALSE) {
	                _close.call(dec);
	            } else {
	                pushTask(function (that) {
	                    dec.once('hide', function () {
	                        _delay(that.resolve);
	                    });
	                    _close.call(dec);
	                });
	            }
	        };
	    }
	
	    var viewQueue = {
	        curView: NULL,
	        preView: NULL,
	        add: function(name, options, atBottom, callback) {
	            pushTask(function(that) {
	                //INFO '[ViewQueue] 增加视图', name, '配置', options, '是否从底部渲染', !!atBottom
	                name = fixName(name);
	                var _callback = _isFunction(callback) ? callback : _noop;
	                if (name) {
	                    if ($viewM.exists(getRealName(name))) {
	                        viewQueue[atBottom ? 'unshift' : 'push']($viewM.structure(name, options), _callback);
	                        that.resolve();
	                    } else {
	                        //WARN 'Do Not Found View'
	                        that.resolve().done(_callback);
	                    }
	                } else {
	                    //WARN 'Do Not Show Same View.'
	                    that.resolve().done(_callback);
	                }
	            });
	        },
	        push: function(dec, callback) {
	            execute(dec);
	            dec.once('show', function() {
	                var lastDec = getLast();
	                _delay(function() {
	                    dec.notify('actived');
	                    if (lastDec) {
	                        lastDec.notify('deactived');
	                    }
	                });
	                decStack.push(dec);
	            });
	            run(dec, 'show', NULL, FALSE, function() {
	                callback(dec);
	            });
	        },
	        unshift: function(dec, callback) {
	            execute(dec);
	            dec.once('show', function() {
	                decStack.unshift(dec);
	                if (decStack.length === 1) {
	                    _delay(function() {
	                        dec.notify('actived');
	                    });
	                }
	            });
	            dec.on('beforeShow', function() {
	                dec.initialShow = FALSE;
	                _css(dec.root, 'z-index', getMinZIndex() - 1);
	            });
	            run(dec, 'show', function() {
	                dec.show(TRUE);
	            }, FALSE,  function() {
	                callback(dec);
	            });
	        },
	        pop: function(num, data, callback) {
	            var dec = getLast();
	            if (num === UNDEFINED) {
	                num = 1;
	            }
	            if (dec && num > 0) {
	                var process = function(immediately) {
	                    var l = decStack.length,
	                        begin = l - num,
	                        i;
	                    if (begin >= 0) {
	                        for (i = begin; i < l - 1; i++) {
	                            hideRun(decStack[i]);
	                        }
	                    }
	                    if (begin > 0 && num > 0) {
	                        dec.once('hide', function () {
	                            var prevDec = decStack[begin - 1];
	                            if (prevDec) {
	                                if (data && data.data) {
	                                    prevDec.notify('receiveData', data);
	                                }
	                                prevDec.notify('actived');
	                            }
	                        });
	                    }
	                    run(dec, '_hide', NULL, immediately, callback);
	                };
	
	                pushTask(function (that) {
	                    if (num < decStack.length) {
	                        process(TRUE);
	                    } else if (num == decStack.length) {
	                        if (getRealName(decStack[0].name) !== Config.indexView) {
	                            viewQueue.add(Config.indexView, {}, TRUE);
	                            pushTask(function (that) {
	                                process(FALSE);
	                                that.resolve();
	                            });
	                        } else if (decStack.length > 1) {
	                            num = decStack.length - 1;
	                            process(TRUE);
	                        }
	                    }
	                    that.resolve();
	                });
	            }
	        },
	        remove: function(name, param, callback) {
	            pushTask(function(that) {
	                var index = findByName(name);
	                if (index > -1) {
	                    viewQueue.pop(decStack.length - index, param, callback);
	                }
	                that.resolve();
	            });
	        },
	        backTo: function(name, param, query, callback) {
	            //INFO '[ViewQueue] 回退到视图:', name, '参数', param, 'Hash参数', query
	            pushTask(function(that) {
	                var index = findByName(name),
	                    len = decStack.length;
	                //INFO '[ViewQueue] 视图索引', index
	                if (index === -1) {
	                    //INFO '[ViewQueue] 渲染视图', getRealName(name)
	                    viewQueue.add(getRealName(name), {
	                        param: query
	                    }, TRUE, function(view) {
	                        $router._reset(view);
	                        //INFO '[ViewQueue] 渲染完成，回退'
	                        viewQueue.pop(len, param, callback);
	                    });
	                } else {
	                    //INFO '[ViewQueue] 直接回退'
	                    len = decStack.length - index - 1;
	                    viewQueue.pop(len, param, callback);
	                }
	                that.resolve();
	            });
	        },
	        refresh: function(data) {
	            var dec = getLast();
	            if (dec) {
	                dec.notify('receiveData', data);
	            }
	        },
	        clear: function(param, callback) {
	            pushTask(function(that) {
	                viewQueue.pop(decStack.length, param, callback);
	                that.resolve();
	            });
	        },
	        inject: function(router) {
	            $router = router;
	        }
	    };
	
	    return viewQueue;
	
	});
	

	define('history', function () {
	
	    var $viewM = r('viewM');
	
	    var location = win.location,
	        history = win.history,
	        sessionStorage = win.sessionStorage,
	        sessionSupport = !!sessionStorage, // 支持sessionStorage情况
	        historyStorage = sessionSupport ? win.sessionStorage : win.localStorage, // 历史纪录存储
	        useHash = TRUE,   // 是否开启 Hash
	        hashSupport = NULL,   // Hash 支持情况情况
	        h5Mode = !!(history.pushState),  // h5 模式
	        hashChangeEvent = h5Mode ? 'popstate' : 'hashchange', // 监听的事件
	        localKeyPrefix = 'QAPP_HISTORY_', // 存储的前缀
	        localKeyId = 0, // 本地存储的id
	        localKey = '', // 本地历史存储的 key = localKeyPrefix + localKeyId
	        historyHashId = '_history',
	        localHistory = [], // 本地历史
	        historyIndex = 0, // 历史索引
	        virtualHistory = [], // 虚拟历史
	        eventManager = _createEventManager(), // 事件管理
	        getRealName = $viewM.getRealName, // 获取 realname
	        paramList = [],// Param List
	        basePath = (function () {
	            var path = location.href,
	                index = path.indexOf('#');
	            if (index > -1) {
	                path = path.slice(0, index);
	            }
	            return path;
	        })(), // 页面基础 Url
	        curHash, // 当前的Hash
	        infoCache; // info 缓存
	
	    // fix Name
	    function fixName(name) {
	        if (name.length > 2 && name.lastIndexOf(':0') == name.length - 2) {
	            return name.substring(0, name.length - 2);
	        }
	        return name;
	    }
	
	    // 是否支持hash
	    function supportHash(view) {
	        view = getRealName(view);
	        var viewOpt = $viewM.getOptions(view);
	        // 视图配置不支持hash
	        if (!viewOpt || viewOpt.supportHash === FALSE) {
	            return FALSE;
	        }
	        // all时排定排除
	        if (hashSupport.all && hashSupport.except.indexOf(view) > -1) {
	            return FALSE;
	        }
	        // 非all时判定存在
	        if (!hashSupport.all && hashSupport.exist.indexOf(view) === -1) {
	            return FALSE;
	        }
	        return TRUE;
	    }
	
	    // 获取数组最后一个元素
	    function getLast(list) {
	        return list[list.length - 1];
	    }
	
	    // 触发事件
	    function pushMessage(type, data) {
	        eventManager.trigger('change', {
	            type: type,
	            data: _extend(TRUE, {}, data)
	        });
	    }
	
	    // 初始化 本地历史
	    function initLocalHistory() {
	        var data = {},
	            curInfo = analyzeHash();
	
	        // 开头为 __ 为特殊的跳转视图，不做历史纪录的判定
	        if (curInfo.view && curInfo.view.indexOf('__')) {
	
	            if (sessionSupport) {
	                //INFO '[History] 使用 sessionStorage 存储历史记录'
	                localKey = historyHashId;
	            } else {
	                //INFO '[History] 使用 Hash 储存历史纪录'
	                if (curInfo.query[historyHashId]) {
	                    localKeyId = curInfo.query[historyHashId];
	                    localKey = localKeyPrefix + localKeyId;
	                } else {
	                    do {
	                        localKeyId = _getUniqueID();
	                        localKey = localKeyPrefix + localKeyId;
	                    } while (historyStorage[localKey]);
	                    setInfo(curInfo, TRUE);
	                }
	                //INFO '[History] Hash 历史 ID:', localKeyId
	            }
	
	            try {
	                data = JSON.parse(historyStorage.getItem(localKey)) || {};
	            } catch (e) {
	            }
	
	            if (data.basePath == basePath) {
	                localHistory = _makeArray(data.history);
	                historyIndex = data.index;
	                // 判断历史是否和页面显示一直，如果不一致，清空
	                if (localHistory[historyIndex] !== curInfo.view) {
	                    localHistory = [];
	                    historyIndex = 0;
	                    historyStorage.removeItem(localKey);
	                }
	            }
	
	            if (!localHistory.length) {
	                localHistory.push(curInfo.view);
	            }
	
	            //INFO '[History] 当前历史纪录', JSON.stringify(localHistory)
	
	        }
	    }
	
	
	    // 存储历史
	    function saveHistory() {
	        //INFO '[History] 存储历史: ', JSON.stringify(localHistory), '索引位置', historyIndex
	        try {
	            historyStorage.setItem(localKey, JSON.stringify({
	                basePath: basePath,
	                history: localHistory,
	                index: historyIndex
	            }));
	        } catch (e) {
	        }
	    }
	
	    // 更改历史
	    function setHistory(view, replace) {
	        if (replace) {
	            localHistory[historyIndex] = view;
	        } else {
	            historyIndex++;
	            localHistory = localHistory.slice(0, historyIndex);
	            localHistory.push(view);
	        }
	        saveHistory();
	    }
	
	    // 获取 Hash
	    // 以 # 开头，以 # 结尾
	    function getHash() {
	        var path = location.hash,
	            index = path.indexOf('#'),
	            endIndex;
	        path = index > -1 ? path.slice(index + 1) : '';
	        endIndex = path.indexOf('#');
	        if (endIndex > -1) {
	            path = path.slice(0, endIndex);
	        }
	        return path;
	    }
	
	    // 设置 hash
	    function setHash(hash, replace) {
	        var path = basePath + '#' + hash + '#';
	        curHash = hash;
	        if (h5Mode) {
	            history[(replace ? 'replace' : 'push') + 'State']({
	                path: path
	            }, doc.title, path);
	        } else {
	            if (replace) {
	                location.replace(path);
	            } else {
	                location.href = path;
	            }
	        }
	    }
	
	    // 获取 路由信息
	    function analyzeHash(hash) {
	        hash = hash || getHash();
	        var vq = hash.split('?'),
	            view = fixName(vq[0]) || Config.indexView,
	            query = _queryToJson(vq[1] || '', TRUE);
	
	        return {
	            view: view,
	            query: query
	        };
	    }
	
	    // 获取 路由信息
	    function getInfo() {
	        if (infoCache) {
	            return infoCache;
	        }
	        infoCache = useHash ? (function () {
	            var info = analyzeHash();
	            info[historyHashId] = UNDEFINED;
	            return info;
	        })() : getLast(virtualHistory);
	        return infoCache;
	    }
	
	    // 设置 路由信息
	    function setInfo(info, replace) {
	        info = info || {};
	
	        var view = info.view || Config.indexView,
	            query = info.query || {},
	            curInfo = getInfo(),
	            queryString;
	
	        replace = replace || view == curInfo.view;
	
	        infoCache = NULL;
	
	        if (useHash) {
	            if (!sessionSupport) {
	                // 增加 History ID
	                query[historyHashId] = localKeyId;
	            }
	
	            queryString = _jsonToQuery(query, TRUE);
	
	            setHash(view + (queryString ? '?' + queryString : ''), replace);
	            setHistory(view, replace);
	        } else {
	            var newInfo = {
	                view: view,
	                query: query
	            };
	            if (replace) {
	                virtualHistory[virtualHistory.length - 1] = newInfo;
	            } else {
	                virtualHistory.push(newInfo);
	            }
	        }
	    }
	
	    // 处理事件
	    function execHash(hash) {
	        var info = hash ? analyzeHash(hash) : getInfo(),
	            curView = info.view,
	            index = localHistory.indexOf(curView),
	            num;
	
	        // 如果在本地找不到相应的，则是做新开视图
	        if (index === -1) {
	            setHistory(curView);
	            pushMessage('forward', {
	                info: info
	            });
	        } else {
	            num = index - historyIndex;
	            historyIndex = index;
	
	            if (num < 0) {
	                // 回退
	                if (!supportHash(info.view)) {
	                    history.back();
	                } else {
	                    pushMessage('back', {
	                        info: info,
	                        param: paramList.shift()
	                    });
	                }
	            } else if (num === 0) {
	                // 刷新
	                pushMessage('refresh', {
	                    info: info
	                });
	            } else if (num === 1) {
	                // 前进一级
	                if (!supportHash(info.view)) {
	                    history.go(historyIndex < localHistory.length - 1 ? 1 : -1);
	                } else {
	                    pushMessage('forward', {
	                        info: info
	                    });
	                }
	            } else {
	                // 前进多级，直接刷新
	                _delay(function() {
	                    location.reload();
	                });
	            }
	            saveHistory();
	        }
	    }
	
	    // 开始监听
	    function startListen() {
	        win.addEventListener(hashChangeEvent, function () {
	            if (curHash !== getHash()) {
	                curHash = getHash();
	                infoCache = NULL;
	                execHash();
	            }
	        });
	    }
	
	    var History = {
	        basePath: basePath,
	        start: function (flag) {
	            var info;
	            useHash = !!flag;
	            curHash = getHash();
	            //INFO '[History] 开始初始化History模块, 使用Hash:', useHash, '当前Hash：', curHash
	            if (useHash) {
	                hashSupport = Config.hashSupport;
	                info = getInfo();
	                initLocalHistory();
	                //INFO '[History] 初始化，视图: ', info.view, '参数: ', info.query
	                if (!supportHash(info.view)) {
	                    //INFO '[History] 此视图不支持Hash', info.view
	                    if (historyIndex > 0) {
	                        //INFO '[History] 回退一级'
	                        historyIndex--;
	                        infoCache = NULL;
	                        history.back();
	                        saveHistory();
	                        _delay(function () {
	                            History.start(flag);
	                        }, 100);
	                        return;
	                    } else {
	                        //INFO '[History] 显示主页'
	                        info = {
	                            view : Config.indexView,
	                            query: {}
	                        };
	                        setInfo(info, TRUE);
	                    }
	                }
	
	                pushMessage('init', {
	                    info: getInfo()
	                });
	                startListen();
	            } else {
	                info = {
	                    view: Config.indexView,
	                    query: analyzeHash().query
	                };
	                virtualHistory.push(info);
	                pushMessage('init', {
	                    info: info
	                });
	            }
	        },
	        analyzeHash: analyzeHash,
	        setHashInfo: setInfo,
	        getHashInfo: getInfo,
	        refreshParam: function(obj) {
	            var info = getInfo();
	            //INFO '[History] 刷新Hash参数, 视图:', info.view, '当前参数', info.query, '新参数', obj
	            info.query = _extend(info.query, obj);
	            setInfo(info, TRUE);
	        },
	        back: function (num, param) {
	            //INFO '[History] 历史回退, 回退级数', num, '参数', param
	            var name = getInfo().view,
	                backData = {
	                    view: getRealName(name),
	                    name: name,
	                    data: param
	                };
	            num = num || 1;
	            if (useHash) {
	                paramList.push(backData);
	                if (historyIndex > num - 1) {
	                    history.go(-num);
	                } else {
	                    var indexView = Config.indexView;
	                    if (historyIndex === 0 && indexView === name) {
	                        QApp.trigger('close');
	                        history.go(-1);
	                    } else {
	                        if (historyIndex > 0) {
	                            history.go(-historyIndex);
	                        }
	                        setInfo({
	                            view: indexView
	                        }, TRUE);
	                        pushMessage('home', {
	                            info: getInfo()
	                        });
	                    }
	                }
	            } else {
	                var backToIndex = virtualHistory.length - num;
	                if (backToIndex < 1) {
	                    backToIndex = 1;
	                }
	                virtualHistory = virtualHistory.slice(0, backToIndex);
	                infoCache = NULL;
	                pushMessage('back', {
	                    info: getLast(virtualHistory),
	                    param: backData
	                });
	            }
	         },
	        backTo: function(view, param, allMatch) {
	            var historyList = useHash ? localHistory : virtualHistory.map(function(item) {
	                    return item.view;
	                }),
	                l = useHash ? historyIndex : (historyList.length - 1),
	                i;
	            //INFO '[History] 回退到视图', view, '参数', param, '是否全匹配', allMatch
	            for (i = l; i > -1; i --) {
	                if ((!allMatch && getRealName(historyList[i]) === view) || historyList[i] === view) {
	
	                    if (i === l) {
	                        // 刷新
	                        pushMessage('refresh', {
	                            info: getInfo(),
	                            param: param
	                        });
	                    } else {
	                        History.back(l - i, param);
	                    }
	                    return TRUE;
	                }
	            }
	            return FALSE;
	        },
	        home: function(param) {
	            //INFO '[History] 回退到首页'
	            History.back(useHash ? historyIndex : (virtualHistory.length - 1), param);
	        },
	        exit: function() {
	            //INFO '[History] 退出应用'
	            QApp.trigger('close');
	            if (useHash) {
	                history.go(- historyIndex - 1);
	            } else {
	                history.back();
	            }
	        },
	        onChange: function (fn) {
	            eventManager.on('change', fn);
	        },
	        buildHash: function(info) {
	            var view = info.view,
	                query = info.query,
	                queryString = _jsonToQuery(query, TRUE);
	
	            return basePath + '#' + view + (queryString ? '?' + queryString : '') + '#';
	        }
	    };
	
	    return History;
	
	});

	/* ================================== Router ================================== */
	define('router', function () {
	
	    var $history = r('history'),
	        $viewQueue = r('viewQ'),
	        $viewM = r('viewM');
	
	    var started = FALSE,
	        backReg = /back(\((\d+)\))?/,
	        routerDelegated = _delegatedEvent(doc, [], Tags.role),
	        eventManager = _createEventManager(),
	        openFilters = [],
	        backFilters = [];
	
	    function reset(view) {
	        if (view) {
	            var _complete = view.complete,
	                completeData;
	            view.hide = function (data) {
	                Router.back(1, data || completeData);
	            };
	            view.complete = function (data) {
	                //WARN '使用路由打开，不建议用 complete/onComplete 方式，建议用 receiveData 事件，和 native 贴近'
	                completeData = data;
	                _apply(_complete, view, [data]);
	            };
	        }
	    }
	
	    // 开始历史纪录处理
	    function startHistory(useHash) {
	        $history.onChange(function (data) {
	            var d = data.data,
	                info = d.info,
	                param = d.param,
	                type = data.type;
	
	            //INFO '[Router] 历史纪录事件，类型为：', data.type
	            switch (type) {
	                case 'init':
	                    if (Config.autoInit) {
	                        //INFO '[Router] 初始化视图：', info.view
	                        $viewQueue.add(info.view, {
	                            param: info.query
	                        }, TRUE, function (view) {
	                            reset(view);
	                            eventManager.trigger(type, view);
	                        });
	                    }
	                    break;
	                case 'forward':
	                    //INFO '[Router] 打开视图：', info.view
	                    _delay(function () {
	                        $viewQueue.add(info.view, {
	                            param: info.query
	                        }, FALSE, function(view) {
	                            reset(view);
	                            eventManager.trigger(type, view);
	                        });
	                    }, 100);
	                    break;
	                case 'refresh':
	                    //INFO '[Router] 刷新视图：', info.view
	                    $viewQueue.refresh({
	                        view: $viewM.getRealName(info.view),
	                        name: info.view,
	                        data: param
	                    });
	                    eventManager.trigger(type);
	                    break;
	                case 'back':
	                case 'home':
	                    //INFO '[Router] 回退到视图', info.view
	                    _delay(function () {
	                        $viewQueue.backTo(info.view, param, info.query, function () {
	                            eventManager.trigger(type);
	                        });
	                    }, 100);
	                    break;
	            }
	        });
	        $history.start(useHash);
	    }
	
	    // 绑定自定义锚点
	    function bindAnchor() {
	        routerDelegated.add('router', 'tap', function (e) {
	            var el = e.el,
	                href = _attr(el, 'href'),
	                target = _attr(el, 'target'),
	                param = _queryToJson(_attr(el, 'param') || '', TRUE),
	                info, allMatch,
	                match, vq;
	
	            if (!href.indexOf('#!')) {
	                if (href.indexOf('home') == 2) {
	                    Router.home(param);
	                } else {
	                    href = href.slice(2);
	                    match = href.match(backReg);
	                    if (match) {
	                        Router.back(match[2] || 1, param);
	                    }
	                }
	            } else if (!href.indexOf('#')) {
	                href = href.slice(1);
	                info = $history.analyzeHash(href);
	                if (target === '_blank') {
	                    Router.open(info.view + ':new', {
	                        param: _extend(info.query, param)
	                    });
	                } else {
	                    vq = info.view.split(':');
	                    allMatch = vq.length > 0;
	                    if (vq[1] == '0') {
	                        info.view = vq[0];
	                    }
	                    if (Router.backTo(info.view, param, allMatch) === FALSE) {
	                        Router.open(info.view, {
	                            param: _extend(info.query, param)
	                        });
	                    }
	                }
	            }
	        });
	    }
	
	    function doBackFilter(type) {
	        return function() {
	            var args = _makeArray(arguments);
	            if ((args[1] && args[1].skipFilter) || backFilters.reduce(function (ret, filter) {
	                    return ret && (filter(args) !== FALSE);
	                }, TRUE)) {
	                return _apply($history[type], $history, args);
	            }
	        };
	    }
	
	    var Router = _extend(eventManager, {
	        start: function (useHash) {
	            if (!started) {
	                started = TRUE;
	                startHistory(useHash);
	                bindAnchor();
	                $history.onChange(function(data) {
	                   eventManager.trigger('history', data);
	                });
	            }
	        },
	        /**
	         * 打开视图
	         *
	         * @method QApp.router.open
	         * @alias QApp.open
	         * @category Router
	         * @core
	         * @param {String} name 视图名
	         * @param {Object} [options] 配置
	         * @param {Object} [options.param] 传入参数
	         * @param {String|Object} [options.ani] 动画参数
	         * @param {Function} [callback] 回调
	         * @example
	         * QApp.open('view', {
	         *     param: {
	         *         x: 1,
	         *         y: 2
	         *     },
	         *     ani: 'moveEnter',
	         * });
	         * @explain
	         * *open* 主要用于切换视图，类似于PC端的跳转，近似于App上的切换视图操作。
	         *
	         * 建议使用 [View:receiveData](#View-receiveData) 事件做监听。
	         */
	        open: function (name, options, callback) {
	            var args = _makeArray(arguments);
	            if ((args[1] && args[1].skipFilter) || openFilters.reduce(function (ret, filter) {
	                    return ret && (filter(args) !== FALSE);
	                }, TRUE)) {
	                options = options || {};
	                var param = options.param || {};
	                $viewQueue.add(name, options, !!options.atBottom, function (view) {
	                    if (view) {
	                        reset(view);
	                        $history.setHashInfo({
	                            view: view.name,
	                            query: param
	                        });
	                        _apply(callback, view, [view]);
	                        if (!options.atBottom) { // 当router.open时触发forward事件，如果是indexView，则不触发（indexView会触发init事件）
	                            eventManager.trigger('forward', view);
	                        }
	                    } else {
	                        _apply(callback);
	                    }
	                });
	            }
	        },
	        /**
	         * 回退
	         *
	         * @method QApp.router.back
	         * @category Router
	         * @core
	         * @param {Number} [num] 回退的级数，默认是 1
	         * @param {Object} [param] 参数
	         */
	        back: doBackFilter('back'),
	        /**
	         * 回退到
	         *
	         * @method QApp.router.backTo
	         * @category Router
	         * @core
	         * @param {String} name 视图名
	         * @param {Object} [param] 参数
	         * @return {Boolean} flag 是否回退到
	         */
	        backTo: doBackFilter('backTo'),
	        /**
	         * 回退到首页
	         *
	         * @method QApp.router.home
	         * @category Router
	         * @param {Object} [param] 参数
	         */
	        home: doBackFilter('home'),
	        /**
	         * 跳转到（如果已存在，则回退到，否则新打开）
	         *
	         * @method QApp.router.goto
	         * @category Router
	         * @param {String} name 视图名
	         * @param {Object} [options] 打开视图需要的参数，同 open
	         * @param {Object} [param] 参数
	         */
	        goto: function(view, options, param, allMath) {
	            //INFO '[Router] Goto', view
	            if ($history.backTo(view, param, allMath) === FALSE) {
	                //INFO '[Router] 未返回，新打开视图'
	                Router.open(view, options);
	            }
	        },
	        /**
	         * 退出
	         *
	         * @method QApp.router.exit
	         * @category Router
	         */
	        exit: $history.exit,
	        /**
	         * 刷新参数
	         *
	         * @method QApp.router.refreshParam
	         * @category Router
	         * @param {Object} param 新参数
	         */
	        refreshParam: $history.refreshParam,
	        /**
	         * 添加open过滤器
	         *
	         * @method QApp.router.addOpenFilter
	         * @category Router
	         * @param {Function} filter 新参数
	         */
	        addOpenFilter: function (filter) {
	            if (_isFunction(filter)) {
	                openFilters = openFilters.concat(filter);
	            }
	        },
	        /**
	         * 移除open过滤器
	         *
	         * @method QApp.router.removeOpenFilter
	         * @category Router
	         * @param {Function} filter 新参数
	         */
	        removeOpenFilter: function (filter) {
	            var index = openFilters.indexOf(filter);
	            if (index > -1) {
	                openFilters.splice(index, 1);
	            }
	        },
	        /**
	         * 添加back过滤器
	         *
	         * @method QApp.router.addBackFilter
	         * @category Router
	         * @param {Function} filter 新参数
	         */
	        addBackFilter: function (filter) {
	            if (_isFunction(filter)) {
	                backFilters = backFilters.concat(filter);
	            }
	        },
	        /**
	         * 移除back过滤器
	         *
	         * @method QApp.router.removeBackFilter
	         * @category Router
	         * @param {Function} filter 新参数
	         */
	        removeBackFilter: function (filter) {
	            var index = backFilters.indexOf(filter);
	            if (index > -1) {
	                backFilters.splice(index, 1);
	            }
	        },
	        /**
	         * 获取当前视图名称
	         *
	         * @method QApp.router.getCurViewName
	         * @category Router
	         * @return {String}
	         */
	        getCurViewName: function(whole) {
	            return $viewQueue.curView && (whole ? $viewQueue.curView : $viewM.getRealName($viewQueue.curView));
	        },
	        /**
	         * 获取前一个视图名称
	         *
	         * @method QApp.router.getPreViewName
	         * @category Router
	         * @return {String}
	         */
	        getPreViewName: function(whole) {
	            return $viewQueue.preView && (whole ? $viewQueue.preView : $viewM.getRealName($viewQueue.preView));
	        },
	        _newSite: function () {
	            win.open($history.basePath);
	        },
	        _reset: reset
	    });
	
	    $viewQueue.inject(Router);
	
	    return Router;
	});
	

	var $viewM = r('viewM'),
	    $history = r('history'),
	    $router = r('router'),
	    $pluginM = r('pluginM'),
	    $widgetM = r('widgetM');
	
	var origin = {},
	    openFilters = [],
	    readyDefer = new Deferred(),
	    readyDependenceDefers = [];
	
	function coreReady(fn) {
	    readyDefer.done(fn);
	}
	
	coreReady(function () {
	    // 设置并记录 Root 的位置和大小
	    var de = doc.documentElement,
	        winWidth = de.clientWidth,
	        winHeight = de.clientHeight,
	        appRoot = doc.createElement(Tags.app);
	
	    function refreshSize() {
	        winWidth = de.clientWidth;
	        winHeight = de.clientHeight;
	        _extend(origin , {
	            width: winWidth,
	            height: winHeight,
	            rootWidth: winWidth - Config.root.left - Config.root.right,
	            rootHeight: winHeight - Config.root.top - Config.root.bottom
	        });
	
	        _css(doc.body, 'height', winHeight + 'px');
	
	        _css(appRoot, {
	            height: origin.rootHeight + 'px',
	            width: origin.rootWidth + 'px'
	        });
	    }
	
	    function checkKeyboard() {
	        var curHeight = de.clientHeight;
	        if (curHeight >= winHeight) {
	            if (curHeight > winHeight) {
	                refreshSize();
	            }
	        }
	    }
	
	    _extend(origin , {
	        width: winWidth,
	        height: winHeight,
	        rootTop: Config.root.top,
	        rootLeft: Config.root.left
	    });
	
	    _css(doc.body, 'height', winHeight + 'px');
	
	    if (Config.customRoot) {
	
	        origin.rootWidth = winWidth - Config.root.left - Config.root.right;
	        origin.rootHeight = winHeight - Config.root.top - Config.root.bottom;
	
	        _css(appRoot, {
	            top: origin.rootTop + 'px',
	            left: origin.rootLeft + 'px',
	            height: origin.rootHeight + 'px',
	            width: origin.rootWidth + 'px'
	        });
	
	        _appendNodes(doc.body, appRoot);
	    } else {
	        origin.rootWidth = winWidth;
	        origin.rootHeight = winHeight;
	
	        appRoot = doc.body;
	    }
	
	    QApp.root = Config.appRoot = appRoot;
	
	    $router.start(!!Config.hashRouter);
	
	    if (Config.screen) {
	        if (Config.screen.largeChange) {
	            win.addEventListener('resize', checkKeyboard);
	        }
	        if (Config.screen.rotate) {
	            _orientation.on('change', refreshSize);
	        }
	    }
	
	    if (Config.gesture) {
	        if (Config.gesture.open) {
	            if (Config.gesture.ctrl) {
	                QApp.on('running', function(ret) {
	                    Gesture[ret ? 'off' : 'on']();
	                });
	            }
	            if (Config.gesture.longTap) {
	                QApp.gesture.allowLongTap();
	            }
	            if (Config.gesture.autoBlur) {
	                var focusTags = ['INPUT', 'TEXTAREA'];
	                _addEvent(doc.body, 'touchstart', function(e) {
	                    if (focusTags.indexOf(e.target.tagName.toUpperCase()) === -1) {
	                        _blur();
	                    }
	                });
	            }
	        } else {
	            Gesture.off();
	        }
	    }
	
	
	});
	
	QApp = _extend(QApp, _createEventManager());
	
	// 暴露接口
	_extend(QApp, {
	    /**
	     * 配置
	     *
	     * @method QApp.config
	     * @category Base
	     * @core
	     * @param {Object} conf 配置
	     * @return {Object} config 当前配置
	     * @example
	     * QApp.config({
	     *   // 默认的首屏 View
	     *   indexView: 'index',
	     *   // 默认的动画
	     *   defaultAnimate: 'moveEnter',
	     *   // 是否自动初始化视图
	     *   autoInit: true,
	     *   // 是否开启 hash router
	     *   hashRouter: true,
	     *   hashSupport: {
	     *       // 是否默认全部
	     *       all: true,
	     *       // 白名单
	     *       exist: [],
	     *       // 黑名单
	     *       except: []
	     *   },
	     *   screen: {
	     *       // 是否支持屏幕旋转
	     *       rotate: false,
	     *       // 检测屏幕变大
	     *       largeChange: true
	     *   },
	     *   gesture: {
	     *       // 是否开启手势
	     *       open: true,
	     *       // 是否开启手势控制 (在 View 切换时，禁用手势)
	     *       ctrl: true,
	     *       // 长按是否触发 Tap 事件
	     *       longTap: true,
	     *       // 自动控制元素失去焦点
	     *       autoBlur: true
	     *   },
	     *   // 日志等级
	     *   logLevel: 1
	     * });
	     *
	     */
	    config: function (conf) {
	        var newConf =  _extend(TRUE, Config, conf),
	            plugins = newConf.plugins,
	            globalPlugins = newConf.globalPlugins;
	        if (_isArray(globalPlugins)) {
	            $pluginM.setGlobal(globalPlugins);
	        }
	        if (_isArray(plugins)) {
	            plugins.forEach(function(plugin) {
	                if (plugin && plugins.name) {
	                    $pluginM.setOpt(plugin.name, plugin.options);
	                }
	            });
	        } else if (plugins) {
	            _each(plugins, function(name, options) {
	                if (name) {
	                    $pluginM.setOpt(name, options);
	                }
	            });
	        }
	        return newConf;
	    },
	
	    root: doc.body,
	
	    origin: origin,
	
	    defineView: $viewM.define,
	
	    undefineView: $viewM.undefine,
	
	    createView: $viewM.create,
	
	    buildView: $viewM.build,
	
	    existsView: $viewM.exists,
	
	    getView: $viewM.get,
	
	    getViewSync: $viewM.getSync,
	
	    addPlugin: $pluginM.add,
	
	    configPlugin: $pluginM.setOpt,
	
	    setGlobalPlugins: $pluginM.setGlobal,
	
	    addWidget: $widgetM.add,
	
	    showWidget: $widgetM.show,
	
	    router: $router,
	
	    open: $router.open,
	
	    exit: $router.exit,
	
	    view: $viewM,
	
	    show: $viewM.show,
	
	    showView: $viewM.show,
	    // 兼容老API
	    hash: {
	        getInfo: $history.getHashInfo,
	        setInfo: $history.setHashInfo,
	        analyzeHash: $history.analyzeHash,
	        setParam: $history.refreshParam,
	        build: $history.buildHash
	    },
	
	    sniff: _sniff
	});
	
	// 添加 util
	
	var util = QApp.util = {};
	
	util.ready = _ready;
	
	/**
	 *
	 * 准备完毕回调
	 *
	 * @method QApp.ready
	 * @category Base
	 * @core
	 * @param {Function} listener 回调函数
	 * @example
	 * QApp.ready(function() {
	 *      todoSomething();
	 * })
	 * @explain
	 * `QApp.ready` 不等同于 `Dom Ready`, 但依赖于 `Dom Ready`, 可以通过 [QApp.addReadyDependencies](#QApp-addReadyDependencies) 添加依赖
	 *
	 */
	QApp.ready = coreReady;
	
	/**
	 * 添加准备完毕依赖
	 *
	 * @method QApp.addReadyDependencies
	 * @category Base
	 * @param {Deferred} defer 依赖对象
	 *
	 */
	
	QApp.addReadyDependencies = function(defer) {
	    readyDependenceDefers.push(defer);
	};
	
	util.query = function(selector) {
	    return doc.querySelector(selector);
	};
	
	util.queryAll = function(selector) {
	    return doc.querySelectorAll(selector);
	};
	
	util.is = getType;
	util.isObject = _isObject;
	util.isString = _isString;
	util.isArray = _isArray;
	util.isFunction = _isFunction;
	util.isNumber = _isNumber;
	util.isElement = _isElement;
	util.isPlainObject = _isPlainObject;
	util.isEmptyObject = _isEmptyObject;
	
	util.extend = _extend;
	util.each = _each;
	util.makeArray = _makeArray;
	util.delay = _delay;
	util.associate = _associate;
	util.mapping = _mapping;
	util.camelCase = _camelCase;
	util.dasherize = _dasherize;
	util.empty = _empty;
	util.noop = _noop;
	util.getUniqueID = _getUniqueID;
	util.getZIndex = _getZIndex;
	util.jsonToQuery = _jsonToQuery;
	util.queryToJson = _queryToJson;
	util.parseURL = _parseURL;
	util.loader = _loader;
	
	util.builder = _builder;
	util.appendNodes = _appendNodes;
	util.insertElement = _insertElement;
	util.removeNode = _removeNode;
	util.attr = _attr;
	util.css = _css;
	util.removeStyle = _removeStyle;
	util.addClass = _addClass;
	util.removeClass = _removeClass;
	util.fixEvent = _fixEvent;
	util.addEvent = _addEvent;
	util.removeEvent = _removeEvent;
	util.dispatchEvent = _dispatchEvent;
	util.createStyle = _createStyle;
	util.size = _size;
	util.position = _position;
	util.contains = _contains;
	util.focus = _focus;
	util.blur = _blur;
	util.animate = _animate;
	util.dataSet = _dataSet;
	util.delegatedEvent = _delegatedEvent;
	
	util.CustEvent = util.custEvent = CustEvent;
	
	util.Deferred = util.deferred = Deferred;
	util.queue = _queue;
	util.parallel = _parallel;
	
	util.gesture = QApp.gesture = Gesture;
	
	QApp.logger = util.logger = _logger;
	
	win.QApp = QApp;
	
	// init
	_ready(function() {
	    if (readyDependenceDefers.length) {
	        _parallel(readyDependenceDefers).done(function() {
	            readyDefer.resolve();
	        });
	    } else {
	        readyDefer.resolve();
	    }
	});
	

	(function () {
	
	    var display = 'display',
	        visibility = 'visibility';
	
	    // 0 => 无动画
	    // 1 => translate3d
	    // 2 => translate + translateZ
	    // 3 => 使用 left/top 形式
	    var transType = (function() {
	
	        var ua = navigator.userAgent.toLowerCase();
	
	        // ios 和 安卓上的微信 使用 translate3d
	        if (_sniff.ios || (_sniff.android && ua.indexOf('micromessenger') > -1)) {
	            return 1;
	        }
	
	        // 其他安卓设备 使用 translate + translateZ
	        return 2;
	
	        // 无动画
	        //return 0;
	
	    })();
	
	    function resetDisplay(node) {
	        _removeStyle(node, display);
	    }
	
	    function resetVisibility(node) {
	        _css(node, visibility, '');
	        _removeStyle(node, visibility);
	    }
	
	    function getSizeValue(size) {
	        return (~(size + '').indexOf('%') || ~(size + '').indexOf('px')) ? size : (size + 'px');
	    }
	
	    var getTranslate3dStyle = transType == 1 ? function (x, y, z) {
	        return {
	            translate3d: x + 'px, ' + y + 'px, ' + z + 'px'
	        };
	    } : function (x, y, z) {
	        return {
	            translate: x + 'px, ' + y + 'px',
	            translateZ: z + 'px'
	        };
	    };
	
	    // 统一逻辑
	    function commonHandle(name, view, opt) {
	        view.on('loadEnd', function () {
	            _attr(view.root, 'qapp-ani', name);
	            _css(view.root, visibility, 'hidden');
	        });
	
	        view.on('beforeHide', function () {
	            _blur(view.root);
	        });
	
	        view.on('destroy', function () {
	            view.show = NULL;
	            view.hide = NULL;
	        });
	    }
	
	    /* ================================== MoveEnter 插件 ================================== */
	
	    var MIN_GAP = 10;
	
	    var DEFAULT_OPT = {
	        position: 'right',
	        distance: 0,
	        duration: 200,
	        zIndex: 0
	    };
	
	    var queue = {},
	        moving = FALSE;
	
	    function findViewIndex(curQueue, view) {
	        var curIndex = -1,
	            i, len;
	        for (i = 0, len = curQueue.length; i < len; i++) {
	            if (curQueue[i].view === view) {
	                curIndex = i;
	                break;
	            }
	        }
	        return curIndex;
	    }
	
	    function animateQueue(curQueue, curIndex, duration, horizontal, root) {
	        var dis = 0;
	        return _parallel(curQueue.map(function (item, index) {
	            if (index < curIndex) {
	                item.view.trigger('beforeHide');
	                return _animate(item.view.root, horizontal ? getTranslate3dStyle(item.translate, 0, 0) : getTranslate3dStyle(0, item.translate, 0), duration);
	            } else {
	                dis += item.distance;
	                return _animate(item.view.root, horizontal ? getTranslate3dStyle(dis, 0, 0) : getTranslate3dStyle(0, dis, 0), duration);
	            }
	        }));
	    }
	
	    QApp.addPlugin('moveEnter', DEFAULT_OPT, function (view, opt, config) {
	
	        var startCss = {
	                position: 'absolute',
	                top: 0,
	                zIndex: opt.zIndex || _getZIndex()
	            },
	            simpleShow = config.type.indexOf && config.type.indexOf('pad') === -1,
	            horizontal = opt.position === 'right' || opt.position === 'left',
	            orientationNum = (opt.position === 'right' || opt.position === 'bottom') ? -1 : 1,
	            realDistance,
	            simpleMoving = FALSE,
	            curQueue,
	            panStart = FALSE,
	            panMove = FALSE;
	
	        if (opt.panBack === UNDEFINED) {
	            opt.panBack = config.type === 'app';
	        }
	
	        if (simpleShow) {
	            opt.distance = horizontal ? origin.rootWidth : origin.rootHeight;
	        }
	        realDistance = orientationNum * opt.distance;
	
	        if (!config.animate) {
	            opt.duration = 0;
	        }
	
	        if (simpleShow) {
	            curQueue = [];
	            startCss.width = '100%';
	            startCss.height = '100%';
	        } else {
	            if (!queue[opt.position]) {
	                queue[opt.position] = [];
	            }
	            curQueue = queue[opt.position];
	            startCss[horizontal ? 'height' : 'width'] = '100%';
	        }
	
	        if (opt.panBack && simpleShow && (opt.position === 'right' || opt.position === 'left')) {
	
	            var checkMove = function (e) {
	                if (~e.directions.indexOf(opt.position)) {
	                    return (e.clientX - e.offsetX < MIN_GAP);
	                }
	                return FALSE;
	            };
	
	            var executePan = function(e) {
	                if (panMove) {
	                    _css(view.root, getTranslate3dStyle(e.offsetX, 0, 0));
	                } else if (!panStart) {
	                    panStart = TRUE;
	                    panMove = checkMove(e);
	                }
	            };
	
	            var executePanEnd = function (e) {
	                if (panMove) {
	                    panMove = FALSE;
	                    if (Math.abs(e.offsetX) > Math.abs(opt.distance) / 2) {
	                        view.hide();
	                    } else {
	                        _animate(view.root, getTranslate3dStyle(0, 0, 0), opt.duration / 2).done();
	                    }
	                }
	                panStart = FALSE;
	            };
	
	            view.on('show', function () {
	                _addEvent(view.root, 'pan', executePan);
	                _addEvent(view.root, 'panend', executePanEnd);
	            });
	
	            view.on('hide', function () {
	                _removeEvent(view.root, 'pan', executePan);
	                _removeEvent(view.root, 'panend', executePanEnd);
	            });
	
	            view.on('rendered', function () {
	                var div = doc.createElement('div');
	                div.className = "touch-opacity";
	                _css(div, {
	                    position: 'absolute',
	                    zIndex: '9999',
	                    width: getSizeValue(MIN_GAP),
	                    height: '100%',
	                    backgroundColor: 'rgba(255, 255, 255, 0)'
	                });
	
	                _css(div, opt.position === 'right' ? 'left' : 'right', '0');
	
	                _addClass(view.root, 'shadow');
	                view.root.appendChild(div);
	            });
	        }
	
	        view.on('loaded', function () {
	            if (!opt.distance) {
	                opt.distance = _size(view.root)[horizontal ? 'width' : 'height'];
	            }
	            if (simpleShow) {
	                if (transType === 3) {
	                    if (opt.position === 'bottom') {
	                        startCss.top = getSizeValue(origin.rootHeight);
	                    } else {
	                        startCss[opt.position] = getSizeValue(-opt.distance);
	                    }
	                } else {
	                    if (opt.position === 'bottom') {
	                        startCss.top = getSizeValue(origin.rootHeight - opt.distance);
	                    } else {
	                        startCss[opt.position] = getSizeValue(0);
	                    }
	                    _extend(startCss, horizontal ? getTranslate3dStyle(-orientationNum * opt.distance, 0, 0) : getTranslate3dStyle(0, -orientationNum * opt.distance, 0));
	                }
	            } else {
	                if (opt.position !== 'bottom') {
	                    startCss[opt.position] = getSizeValue(-opt.distance);
	                } else {
	                    startCss.top = getSizeValue(origin.rootHeight);
	                }
	            }
	            _css(view.root, startCss);
	        });
	
	        commonHandle('moveEnter', view, opt);
	
	        view.show = function (preventAnimate) {
	            _blur();
	            if (!moving) {
	                moving = TRUE;
	                simpleMoving = TRUE;
	                var curIndex = findViewIndex(curQueue, view);
	                if (~curIndex) {
	                    animateQueue(curQueue, curIndex, (preventAnimate === TRUE || view.preventAnimate) ? 0 : opt.duration, horizontal).done(function () {
	                        curQueue.splice(0, curIndex).forEach(function (item) {
	                            item.view.trigger('hide');
	                        });
	                        moving = FALSE;
	                        simpleMoving = FALSE;
	                        view.trigger('refresh');
	                    });
	                } else {
	                    view.once('completed', function () {
	                        resetDisplay(view.root);
	                        resetVisibility(view.root);
	                        view.trigger('beforeShow');
	                        curQueue.unshift({
	                            view: view,
	                            distance: simpleShow ? 0 : realDistance,
	                            translate: simpleShow ? -realDistance : 0
	                        });
	                        _delay(function() {
	                            animateQueue(curQueue, 0, (preventAnimate === TRUE || view.preventAnimate) ? 0 : opt.duration, horizontal, view.root).done(function () {
	                                moving = FALSE;
	                                simpleMoving = FALSE;
	                                _removeStyle(view.root, 'transform');
	                                view.trigger('show');
	                            });
	                        });
	                    });
	                    view.renderTo(QApp.root);
	                }
	            }
	            return view;
	        };
	
	        view.hide = function (preventAnimate) {
	            if ((!moving || (simpleShow && !simpleMoving)) && view.isShow) {
	                moving = TRUE;
	                var curIndex = findViewIndex(curQueue, view);
	                animateQueue(curQueue, curIndex + 1, (preventAnimate === TRUE || view.preventAnimate) ? 0 : opt.duration, horizontal).done(function () {
	                    curQueue.splice(0, curIndex + 1).forEach(function (item) {
	                        item.view.trigger('hide');
	                    });
	                    moving = FALSE;
	                });
	            }
	            return view;
	        };
	
	        view.on('destroy', function () {
	            startCss = NULL;
	            curQueue = NULL;
	            view = NULL;
	        });
	
	        return {
	            setOption: function (newOpt) {
	                opt = _extend({}, DEFAULT_OPT, newOpt);
	            }
	        };
	    });
	})();

})();

    })( module.exports , module , __context );
    __context.____MODULES[ "61223c240af244fdea0367df42d56666" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ddb923836814fcf8a947a1715e3a56af" ,
        filename : "closeMe.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var api   = __context.____MODULES['074db5ccf73fd2903df721dba96577bf'];
var ua    = __context.____MODULES['e40338c22954d82670dedba25594be89'];
var QApp  = window.QApp ? window.QApp : __context.____MODULES['61223c240af244fdea0367df42d56666'];

function _closeMe(_from,param){
    api.ready(function() {
        if(_from){
            var _param = {
                param:param
            };
            QApp.router.goto('bindcard.'+_from,_param,param);
        }else{
            if(/qunar/.test(ua())){
                api.hy.closeWebView({});
            }else{
                window.history.go(-1);
            }
        }
    });
};

module.exports = _closeMe;


    })( module.exports , module , __context );
    __context.____MODULES[ "ddb923836814fcf8a947a1715e3a56af" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "071288516a256b2bf8d3e51e9151084d" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    
var loading = __context.____MODULES['9dac193de1362a3274188a9f8ae24032'];
module.exports = {
    back       : _back,
    popup      : _popup,
    next       : _next,
    cardImport : _cardImport,
    clearCardNo: clearCardNo
}

__context.____MODULES['4dbde7f0796a94e291b34db9c0650f11'];
var _            = QApp.util;
var $            = __context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];

function _back(){
    var self    = this;
    var closeMe =__context.____MODULES['ddb923836814fcf8a947a1715e3a56af'];
    var _from   = "";

    if(!$.isEmptyObject(self.param)) {
        _from = self.param.from;
    }

    closeMe(_from);
};

function _cardImport(e){
    var self = this;
    var tag  = $(e.el);
    var cardNoLen = self.find("cardNo")[0].value.replace(/\s/g, "").length;
    var next = self.find("next")[0];
    if(cardNoLen > 11){
        next.setAttribute("action-type","next");
        _.removeClass(next,"yo-btn-gray");
    } else {
        next.setAttribute("action-type","");
        _.addClass(next,"yo-btn-gray");
    }

    //不限定最长卡号；
    // if(cardNo.length > 23){
    //     cardNo = cardNo.slice(0,23);
    //     self.find("cardNo")[0].value = cardNo;
    // }
    //self.cardLayout();
    checkIfshowClearBtn();

    function checkIfshowClearBtn() {
        var value = tag.val();
        var ico   = tag.siblings('.yo-ico');
        if (value) {
            ico.show();
        } else {
            ico.hide();
        }
    };
};

function _popup(){
    var self = this
    var dialogOpts = {};
    dialogOpts.content    ="为保证账户资金安全，只能绑定认证用户本人的银行卡";
    dialogOpts.title      ="持卡人说明";
    QApp.showWidget("cardAlert",dialogOpts,self);
};

function _next(){
    var self = this;
    var cardNo = self.find("cardNo")[0].value.replace(/\s/g, "");
    loading.show({});
    setTimeout(function(){
            self.submitCardNo();
    },500)
};

function clearCardNo(e) {
    var tag = $(e.el);
    var input = tag.siblings('input');
    var next = this.find("next")[0];
    input.val('');
    tag.hide();
    next.setAttribute("action-type","");
    _.addClass(next,"yo-btn-gray");
};


    })( module.exports , module , __context );
    __context.____MODULES[ "071288516a256b2bf8d3e51e9151084d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6fd83bdb0517910643b01f98c2c4467a" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var _            = QApp.util;
var    html      = __context.____MODULES['f7ea1c5486486d577c45173268a3a792'];
var    _riot     = __context.____MODULES['1358606e3eed4246ebf0ef4a7e217298'];
var    riot      = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var _bind        = __context.____MODULES['4dbde7f0796a94e291b34db9c0650f11'];
var _event       = __context.____MODULES['071288516a256b2bf8d3e51e9151084d'];

QApp.defineView("bindcard.boundcard", {
    html: '<yo-bindcard-index class="yo-flex ani fade-in m-index-boundcard"></yo-bindcard-index>',
    plugins: ["alert", "doms", "delegated", "ajax"],
    classNames: ["m-index"],
    init: {
        domData:null,
        getDomData : _on(_bind.getDomData),
        getUrlData : _on(_bind.getUrlData),
        initPage:_on(_bind.initPage),
        cardLayout:_on(_bind.cardLayout),
        submitCardNo:_on(_bind.submitCardNo),
        renderPage:_on(_bind.renderPage),
        openView  : _on(_bind.openView),
        btn : _on(_bind.btn)
    },
    bindActions:{
        "left":_on(_event.back),
        "userName-popup":_on(_event.popup),
        "next":_on(_event.next),
        "card-import:input":_on(_event.cardImport),
        "clearCardNo":_on(_event.clearCardNo)
    },
    bindEvents:{
        "actived" : function(){
            var self = this;
            riot.mount("yo-header",self.page);
            if(self.param.refresh){
                riot.mount("yo-header",self.page);
                riot.mount("bindcard",self.page);
                self.btn(self);
            }
        },
        "hide": function(){
            if (Kami.loading) {
                try {
                    Kami.loading.hide();
                } catch (e) {}
            }
        },
        "show": function(){
            var self=this;
                self.initPage();
        }
    },
    ready:function(){


    }
});
function _on(fn){
    return function(e){
        return fn.call(this,e);
    }
}


    })( module.exports , module , __context );
    __context.____MODULES[ "6fd83bdb0517910643b01f98c2c4467a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "f70054f4c61d2d56cd0d19914b12f548" ,
        filename : "index.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["index"] = "<div class=\"yo-flex cardauth-content\">\n    <yo-header class=\"yo-header m-header dp\"></yo-header>\n    <div class=\"flex yo-flex\" node-type=\"wrapper\"></div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["index"];

    })( module.exports , module , __context );
    __context.____MODULES[ "f70054f4c61d2d56cd0d19914b12f548" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a6923d515a13ebcbbb716912620537a2" ,
        filename : "cardauth.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["cardauth"] = "<div class=\"yo-list yo-list-group\">\n    <div class=\"item item-input {Type.label}\" each=\"{Type,i in Type}\"  if={Type.mark}>\n        <span class=\"mark\">{Type.name}</span>\n            <input type={Type.type} class=\"yo-input flex {Type.class}\" maxlength=\"26\"\n            node-type={Type.nodeType}\n            placeholder={Type.placeholder}\n            value={Type.value}\n            data-name={Type.nodeType}\n            action-type={Type.action}\n             __readonly={Type.readonly}\n             data-content={Type.authItems}\n             if = {Type.input} />\n             <label if = {Type.select} class=\"style-select flex\">\n                 <select node-type=\"identityType\" class=\"idenType\">\n                     <option value=\"身份证\">身份证</option>\n                     <option value=\"护照\">护照</option>\n                     <option value=\"军官证\">军官证</option>\n                 </select>\n                 <span class=\"yo-ico m-ico-config pd\" style=\"  position: absolute; top: 0; right: 0; display: inline-block;\">\n                     &#xf031;\n                 </span>\n             </label>\n\n        <span class=\"yo-ico m-ico-config pd\"\n            action-type=\"popup\"\n            if={Type.popup}\n              data-content={Type.content}\n            data-title={Type.title}\n            data-pic={Type.pic}>&#xf0f6;\n        </span>\n    </div>\n    <div class=\"pact pact-in-cardauth\">同意\n        <span action-type=\"Qpact\">《去哪儿网服务协议》</span><span if={agreement} each=\"{agreement, i in agreement}\" action-type=\"otherProtocol\" node-type=\"proName\"\n             data-content={agreement.url} data-title={agreement.name}>{agreement.name}</span>\n    </div>\n    <input type=\"button\" value=\"确定\" class=\"yo-btn yo-btn-main yo-btn-orangered yo-btn-l confirm\" action-type=\"confirm\" node-type=\"confirm\" />\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["cardauth"];

    })( module.exports , module , __context );
    __context.____MODULES[ "a6923d515a13ebcbbb716912620537a2" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ddf23ee0fa31f196dc20388a70242db4" ,
        filename : "tag.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot      = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var index     = __context.____MODULES['a6923d515a13ebcbbb716912620537a2'];
var headerStr = __context.____MODULES['a707d2fafba8acb2df475d59add98ccf'];

var $ =__context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];

riot.tag("attest",index,_index);

function _index(opts){
    this.bankName       = opts.bankName;
    this.bankCode       = opts.bankCode;
    this.userName       = opts.userName;
    this.cardType       = opts.cardType;
    this.agreement      = opts.agreement?opts.agreement.list:"";
    this.identityCardNo = opts.identityCardNo;
    this.expireYear     = opts.authItems.expireYear;
    this.expireMonth    = opts.authItems.expireMonth;
    this.cvv            = opts.authItems.cvv;
    this.identityType   = opts.authItems.identityType;
    this.mobile         = opts.authItems.mobile;
    this.effectivity    = $.inArray("expireYear",opts.authItems)>-1 &&  $.inArray("expireMonth",opts.authItems)>-1
    this.isCvv          = $.inArray("cvv",opts.authItems)>-1
    this.isIdentityType = $.inArray("identityType",opts.authItems)>-1
    this.isMobile       = $.inArray("mobile",opts.authItems)>-1
    this.identityCode   = $.inArray("identityCode",opts.authItems)>-1
    this.isCardholder   = $.inArray("cardholder",opts.authItems)>-1
    this.Type           = [
        {
            "name" : "卡类型",
            "mark" : this.cardType,
            "nodeType" : "cardType",
            "readonly" : true,
            "value" : this.bankName+" "+this.cardType,
            "class"       : "alignment",
            "input" : true,
            "label"       : "bmt has-border-top",

        },
        {
            "name" : "姓名",
            "mark" : this.isCardholder,
            "nodeType" : "cardholder",
            "placeholder" : "请输入姓名",
            "popup"       : true,
            "content"     : "为保证账户资金安全，只能绑定认证用户本人的银行卡",
            "title"       : "持卡人说明",
            "readonly"    : false,
            "class"       : "userName-ml",
            "label"       : "bmt has-border-top",
            "type"        : "text",
            "value"       : "",
            "authItems"   : "cardholder",
            "action"      : "userName",
            "input" : true
        },
        {
            "name"        : "证件类型",
            "mark"        : false,
            "nodeType"    : "identityType",
            "action"      : "identityType",
            "placeholder" : "请选择证件类型",
            "readonly"    : true,
            "value"       : this.identityType,
            "type"        : "text",
            "label"       : "has-border-top",
            "select"      : true,
            "input"       : false
        },
        {
            "name"        : "身份证",
            "mark"        : this.identityCode,
            "nodeType"    : "identityCode",
            "action"      : "identityCardNo",
            "placeholder" : "持卡人身份证号",
            "label" : "bmt has-border-top",
            "readonly"    : false,
            "type"        : "text",
            "class"       : "alignment",
            "input"       : true
        },
        {
            "name" : "有效期",
            "mark" : this.effectivity,
            "nodeType" : "expire",
            "placeholder" : "月份/年份",
            "class"       : "alignment",
            "readonly"    : false,
            "action" : "expire",
            "readonly" : true,
            "label" : "bmt has-border-top",
            "popup" : true,
            "content" : "打印在信用卡正面卡号下方标准格式为月份在前，年份在后",
            "title" : "有效期说明",
            "pic"  : "//source.qunarzz.com/site/images/pay/member_mobile/bindcard/0.0.1/time.png",
            "input" : true
        },
        {
            "name" : "安全码",
            "mark" : this.isCvv,
            "nodeType" : "cvv",
            "class"       : "alignment",
            "label" : "bmt has-border-top",
            "action" : "cvv",
            "placeholder" : "信用卡背后三位验证码",
            "popup" : true,
            "content" : "信用卡背面后3位数字",
            "title" : "安全码（CVV）说明",
            "pic" : "//source.qunarzz.com/site/images/pay/member_mobile/bindcard/0.0.1/secure.png",
            "type" : "tel",
            "input" : true
        },
        {
            "name" : "手机号",
            "mark" : this.isMobile,
            "nodeType" : "mobile",
            "class"       : "alignment",
            "readonly"    : false,
            "action" : "mobile",
            "placeholder" : "银行号预留手机号",
            "popup" : true,
            "content" : "您需填写办理该卡时所填写的手机号码，如忘记或停用，请联系银行客服处理",
            "title" : "手机号说明",
            "type" : "tel",
            "label" : "bmt has-border-top",
            "input" : true
        }
    ]
}


    })( module.exports , module , __context );
    __context.____MODULES[ "ddf23ee0fa31f196dc20388a70242db4" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "979a1508ed49343f2c622950cb060c15" ,
        filename : "checkUtil.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {

	testCardNo : function(num) {//身份证号验证
	    num = num.toUpperCase();             
	    //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。   
	    if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num))) { 
	        return false; 
	    }
	    //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。 
	    //下面分别分析出生日期和校验位 
	    var len, re; 
	    len = num.length;   
	    if (len == 15) {
	        
	        re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/); 
	        var arrSplit = num.match(re); 

	        //检查生日日期是否正确 
	        var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]); 
	        var bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4])); 
	        
	        if (!bGoodDay) { 
	            return false; 
	        } else {                
	            return 1;
	        }   
	    }
	    
	    if (len == 18) {
	        
	        re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/); 
	        var arrSplit = num.match(re); 

	        //检查生日日期是否正确 
	        var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]); 
	        var bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4])); 

	        if (!bGoodDay) { 
	            return false; 
	        } else { 
	            //检验18位身份证的校验码是否正确。 
	            //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。 
	            var valnum; 
	            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); 
	            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'); 
	            var nTemp = 0, i; 
	            for(i = 0; i < 17; i ++) { 
	                nTemp += num.substr(i, 1) * arrInt[i]; 
	            } 
	            
	            valnum = arrCh[nTemp % 11];
	            if (valnum != num.substr(17, 1)) { 
	                return false; 
	            } 
	            
	            return 1; 
	        } 
	    }
	    
	    return false; 
	},
	testMobileNo : function(str){//手机号码验证
		return /^1[\d]{10}$/.test(str);
	},
	testCreditcard : function(cardNo){//信用卡，储蓄卡验证
		cardNo=cardNo||'';
		var cache = [], cardNoArr= cardNo.split(''),
			temp, cardNoTemp, cardNoArrLen = cardNoArr.length,
			sum = 0, cacheLen;
        /*信用卡校验规则：
        *1、从倒数第二位开始，每相隔一位*2，如果乘积为两位数则数字相加
        *2、得到的乘积与1中未处理的数字相加（除了最后一位），取和向上最近的以0结尾的数字
        *3、用2得到的数字减去2中相加的和，得到的数字等于信用卡最后一位
        */   
        if(cardNoArrLen < 1){
        	return false;
        }
        var lastnumber = cardNoArr[cardNoArrLen-1];
        var cacuIndex = cardNoArrLen - 2;
        var curIndex = cardNoArrLen - 1;
        while(curIndex--){
        	var mod = cacuIndex-curIndex;
			if (mod % 2){
				cache.push(parseInt(cardNoArr[curIndex]));
			} else {
				cardNoTemp = cardNoArr[curIndex] * 2;

				if (cardNoTemp.toString().length == 1) {
					cache.push(cardNoArr[curIndex] * 2);
				} else {
					temp = cardNoTemp.toString().split('');
					cache.push(parseInt(temp[0], 10) + parseInt(temp[1], 10));
				}
			}
        }
		cacheLen = cache.length;
		while(cacheLen--) {
			sum += cache[cacheLen];
		}			
		var ceil = Math.ceil(sum/10) ;            
        return (ceil*10 - sum) ==  lastnumber;
	}
};

    })( module.exports , module , __context );
    __context.____MODULES[ "979a1508ed49343f2c622950cb060c15" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e8c29528feb4d72079802d2c7872329a" ,
        filename : "qafParam.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
*指纹qaf接口数据，主要是b值
*后面可根据需求自行增加
*已增加参数若无特殊需求请勿轻易更改！
*date：2015-12-03
*/

//会员绑卡
var bindcard = {
    b: 9,
    ext: ''
};


module.exports = {
    bindcard: bindcard
}

    })( module.exports , module , __context );
    __context.____MODULES[ "e8c29528feb4d72079802d2c7872329a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c67b0350f2dbdae650aa3691c51acfa9" ,
        filename : "fingerprint.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var qafParam =__context.____MODULES['e8c29528feb4d72079802d2c7872329a'];

function qaf(opts) {
    qafParam.bindcard.ext = opts || "";
    QunarAPI.ready(function () {
        QunarAPI.hy.qaf({
            data: qafParam.bindcard,
            success: function(res) {
                // console.log("qaf-success!");
            },
            fail: function(res) {
                // console.log("qaf-fail!");
            }
        })
    })
}

module.exports = {
    qaf: qaf
};


    })( module.exports , module , __context );
    __context.____MODULES[ "c67b0350f2dbdae650aa3691c51acfa9" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1ef1834e919908301acb6ed3a3ed69df" ,
        filename : "openURL.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    
//true时view会随着打开的url关闭时关闭，默认时为true
var api   = __context.____MODULES['074db5ccf73fd2903df721dba96577bf'];
var ua    = __context.____MODULES['e40338c22954d82670dedba25594be89'];

function _openURL(_url,_close,_title,_nav){
    // @_url:string
    // @_close:
    //     undefined,null,true : closeMe
    //     false     : dontcloseMe
    // @_nav:
    //     undefined,null,true : navibar-normal
    //     false     :  navibar-none !important 如果是有QAPPview的话，在url里面必须加上#view名
    //     "transparent" : navibar-transparent !important 有兼容性问题
    // @_title:
    //     非必须
    var close = true;
    if(typeof _close !== "undefined"){
        if(!_close){
            close = false;
        }
    }

    var nav   = true;
    if(typeof _nav !== "undefined"){
        if(!_nav){
            nav = false;
        }else{
            nav = "transparent";
        }
    }

    api.ready(function() {
        if(/qunar/.test(ua())){
            openView(_url,close,nav,_title);
        }else{
            window.open(_url);
        }
    });
};

function openView(_url,close,nav,title){

        var webViewOpts = {};
        var __hash      = _url.split('?')[1]?_url.split('#')[1]:'';

        if(!nav){
            webViewOpts.type = 'navibar-none';
            switch (__hash) {
                case "":
                    _url += "?webviewtype=nonav";
                    break;
                default:
                    _url+='&webviewtype=nonav'
            }
        }else if(nav == "transparent") {
            webViewOpts.type = 'navibar-transparent';
        }

        if(title){
            webViewOpts.navigation = {
                title:{
                    style: 'text',
                    text: title
                }
            };
        }

        webViewOpts.url  = _url;
        webViewOpts.name = 'AfterBindCardService';

        api.hy.openWebView(webViewOpts);

        if(close){
            closeViewHandler();
        }

        function closeViewHandler(){
            api.hy.onCloseWebView({
                success:function(){
                    api.hy.closeWebView({});
                }
            })
        };
};

module.exports = _openURL;


    })( module.exports , module , __context );
    __context.____MODULES[ "1ef1834e919908301acb6ed3a3ed69df" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "340bacc878d1a3d595c7963a7a1a0c57" ,
        filename : "bind.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports={
    initPage : _initPage,
    renderPage : _renderPage,
    verification : _verification,
    getBindCardVCode : _getBindCardVCode,
    setMsgOpts : _setMsgOpts
}

var riot  = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var _     = QApp.util;
var Utils = __context.____MODULES['b2753b78a28b9da81f5166acfba6dcde'];
var checkUtil  = __context.____MODULES['979a1508ed49343f2c622950cb060c15'];
var fingerprint = __context.____MODULES['c67b0350f2dbdae650aa3691c51acfa9'];
var openURl    = __context.____MODULES['1ef1834e919908301acb6ed3a3ed69df'];
var Panel      = __context.____MODULES['c2d3f4768a0011f9ccb778703432f254'];

function _initPage(){
    var self = this;
    self.renderPage();
};

function _renderPage(){
    var self    = this;
    if(self.param.cardType == "CREDIT"){//根据cardType渲染页面中的卡类型
        self.param.cardType = "信用卡";
    }
    if(self.param.cardType == "DEBIT"){
        self.param.cardType = "储蓄卡";
    }
    _makePanel(self)
}

function _verification(){//页面验证,包括非空校验与卡号校验，当证件类型非身份证时，只做非空校验
    var self = this;
    var mobile = self.find("mobile")[0].value;
    if( self.find("cardholder")[0]){
        var userName  = self.find("cardholder")[0].value;
        if(userName == ""){
            QApp.showWidget("tips",{
                content : "请输入姓名"
            })
            return false
        }
    }
    if(self.find("identityType")[0]){
        if(self.find("identityType")[0].value=="身份证"){
            var identityCardNo = self.find("identityCode")[0].value;
            if(!checkUtil.testCardNo(identityCardNo)){
                QApp.showWidget("tips",{
                    content : "身份证号输入错误"
                })
                return false;
            }
        }
        if(self.find("identityCode")[0].value == ""){
            QApp.showWidget("tips",{
                content:"请输入证件号"
            })
            return false
        }
    }
    if(identityCardNo == ""){
        QApp.showWidget("tips",{
            content : "请输入证件号"
        })
        return false
    }
    if(self.find("expire")[0]){
        var expire = self.find("expire")[0].value;
        if(expire == ""){
            QApp.showWidget("tips",{
                content : "请选择有效期"
            })
            return false
        }
    }
    if(self.find("cvv")[0]){
        var cvv = self.find("cvv")[0].value;
        if(cvv == ""){
            QApp.showWidget("tips",{
                content : "请输入安全码"
            })
            return false
        }
        if(cvv.length<3){
            QApp.showWidget("tips",{
                content : "请输入完整的安全码"
            })
            return false
        }
    }
    if(mobile == ""){
        QApp.showWidget("tips",{
            content : "请输入手机号"
        })
        return false
    }
    if(!checkUtil.testMobileNo(mobile)){
        QApp.showWidget("tips",{
            content : "手机号输入错误"
        })
        return false;
    }
    return true
}

function _getBindCardVCode(){
    var self = this;
    var params = self.param.authItems
    var mobile = self.find("mobile")[0].value
    var VcodeData = {
        bindCardDealNo : self.param.bindCardDealNo,
        mobile         : mobile,
        authItems      : {}
    };
    var authItems = VcodeData.authItems;
    params.forEach(function(e){
        switch (e) {
            case "cardid" :
                authItems[e] = self.param.cardNo;
                break;
            case "expireYear" :
            case "expireMonth" :
                var expireValue = self.find("expire")[0].value;
                authItems.expireYear = expireValue.slice(-2);
                authItems.expireMonth = expireValue.slice(0, 2);
                break;
            case "identityCode" :
            case "cardholder" :
            case "mobile" :
            case "cvv" :
                authItems[e] = self.find(e)[0].value;
                break;
            case "identityType" :
                authItems[e] = "IDENTITYCARD";
                break;
            default : 
                break;
        }
    });
    VcodeData.authItems = JSON.stringify(authItems);
    var request = {
        url : Utils.url.bindCardVCodeApi,
        args : VcodeData,
        method : "post"
    };
    var _ajax = self.ajax(request);
    _ajax.done(_ajaxOK);
    _ajax.fail(_ajaxFail);
    _ajax.all(_ajaxAll);
    function _ajaxOK(res){
        var data = res.data;
        self.data = data;
        if(res.status == 0){
            self.setMsgOpts(request);
        }else{
            _ajaxFail(res.message);
        }
    };

    function _ajaxFail(msg){
        QApp.showWidget("tips",{
            content : msg || "网络错误，请稍后再试"
        })
    };

    function _ajaxAll(){
        if(Kami.loading) {
            Kami.loading.hide();
        }
    };
};

function _makePanel(self){
    var msgOpts = self.param;
    var panelOpts = {};
    panelOpts.onReady = function(){
        var panel = this;
        var panelHTML='<attest class="account-attest dp" style="overflow: hidden;"></attest>'
        this.html(panelHTML);
        riot.mount("attest",msgOpts);
        riot.mount("yo-header",self.param);
        setTimeout(function() {
            panel.resize();
        },20);
    }
    panelOpts.extraClass = "flex";
    QApp.showWidget("scrollPanel",self.find("wrapper")[0],panelOpts);
}

function _setMsgOpts(request){
    var self = this;
    var phone = self.find("mobile")[0].value
    QApp.showWidget("msgAlert",{
        sendMsg:function(){
            self.ajax(request);
        },
        phone:phone.replace(/(\d{3})(\d{4})(\d*)/,"$1****$3"),//为手机号打码，中间四位替换为*号
        validate:function(value){
            var dlg = this;
            var data = self.data;
            var dlgData = {
                authCode : value,
                sequenceNo : data.sequenceNo,
                bindCardDealNo : self.param.bindCardDealNo
            };
            var vcodeRequest = {
                url : Utils.url.bindCardAuthApi,
                args : dlgData,
                method : "post"
            };
            var _vcodeAjax = self.ajax(vcodeRequest);
            _vcodeAjax.done(_vcodeAjaxOK);
            _vcodeAjax.fail(_vcodeAjaxFail);
            function _vcodeAjaxOK(res){
                if(res.status == 0){
                    var data = res.data
                    if(data.successURL != ""){
                        openURl(data.successURL,true)
                    }
                    fingerprint.qaf();
                    QApp.router.goto("bindcard.successbind",{
                        param:{
                            returnURL: data.returnURL,
                            bankName : self.param.bankName,
                            pmCode   : self.param.pmCode,
                            cardNo   : self.param.cardNo.slice(-4)
                        },
                        ani:"moveEnter"
                    })
                    dlg.ok();
                }else{
                    _vcodeAjaxFail(res.message);
                }
            };
            function _vcodeAjaxFail(msg){
                dlg.fail(_failHandler);

                function _failHandler() {
                    var msgAlert = this;
                    msgAlert.invisible();

                    var tipAlertOpt = {
                        okText : "修改信息",
                        cancelText : "重试",
                        content : msg || "网络错误",
                        onok : _changeInfo,
                        oncancel : _retry
                    };
                    setTimeout(function() {
                        QApp.showWidget('cardAlert',tipAlertOpt);
                    },350);

                    function _retry() {
                        var dlg = this;
                        dlg.hide();
                        setTimeout(function() {
                            var _msg = msgAlert.getDlg();
                            var _i   = _msg.widgetEl[0].querySelector('[data-role=input]');
                            _i.value = "";

                            msgAlert.getDlg().show();
                        },200);
                    };

                    function _changeInfo() {
                        var dlg = this;
                        dlg.hide();
                        msgAlert.hide();
                    };
                };
            }
        }
    },self)
}


    })( module.exports , module , __context );
    __context.____MODULES[ "340bacc878d1a3d595c7963a7a1a0c57" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "849981925df8a17e6bb57ddcc578d66d" ,
        filename : "scheme.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var scheme = {

    prefix: function(){

        var ua = window.navigator.userAgent,
            schemeArr = ["qunariphone","qunariphonepro","qunariphonelife","qunaraphone","qunaraphonelife"];
        for(var i=0; i<schemeArr.length; i++){
            if ((ua.toLowerCase()).indexOf(schemeArr[i]) != -1 ) {
            return schemeArr[i];
            }
        }

        return
    }
};

module.exports = scheme;

    })( module.exports , module , __context );
    __context.____MODULES[ "849981925df8a17e6bb57ddcc578d66d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bf09869d73d88b3d9c0466c6b469814c" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    back    : _back,
    confirm : _confirm,
    cvv     : _cvv,
    mobile  : _mobile,
    popup   : _popup,
    expire  : _expire,
    Qpact   : _Qpact,
    userName: _userName,
    otherProtocol : _otherProtocol
}

__context.____MODULES['340bacc878d1a3d595c7963a7a1a0c57'];
var _ = QApp.util;
var openURl    = __context.____MODULES['1ef1834e919908301acb6ed3a3ed69df'];
var scheme = __context.____MODULES['849981925df8a17e6bb57ddcc578d66d'];

function _back(){
    var self = this;
    QApp.router.back();
}

function _confirm(){
    var self = this;
    var loading = __context.____MODULES['9dac193de1362a3274188a9f8ae24032'];
    loading.show({});

    setTimeout(function(){
        var _verOK = self.verification();
        if(_verOK) {
            self.getBindCardVCode();
        }else{
            loading.hide();
        }
    },500)
}

function _userName(){
    var self = this;
    var input = self.find("cardholder")[0];
    var userName = input.value;
    var reg = /^.*(\d)+.*$/;
    if(reg.test(userName)){
        input.value = userName.replace(/\d/g,"");
    }

}

function _popup(e){
    var dialogOpts = {};
    dialogOpts.content = e.data.content;
    dialogOpts.title   = e.data.title;
    dialogOpts.pic     = e.data.pic
    QApp.showWidget("cardAlert",dialogOpts,self);
}

function _expire(){
    var self = this;
    var d    = new Date();
    var year = d.getFullYear();
    var month= d.getMonth();
    var today= year+"-"+(month+1);
    var efficient =year+20+"-"+(month+1);
    QApp.showWidget("popAvailable",{
        dateRange : [today,efficient],
        now:today,
        onComplete:function(v){
            self.find("expire")[0].value = v.month.text+"/"+v.year.text;
        }
    },self)
}

function _cvv(){
    var self = this;
    var cvv  = self.find("cvv")[0];
    _format(cvv, 3);
}

function _mobile(){
    var self = this;
    var mobile = self.find("mobile")[0];
    _format(mobile, 11);
}

function _format (el,index) {
    var reg = /^(\d)*$/;
    var _value = el.value;
    if(!(reg.test(_value))){
        el.value = _value.slice(0,_value.length-1);
    }
    if(_value.length>index){
        el.value = _value.slice(0,index);
    }
}

function _Qpact(){
    var self = this;
    QApp.open("bindcard.protocol",{
        param:{
            agreement:"https://mpkq.qunar.com/fp/commonPayTreaty.jsp",
            title    : "服务协议"
        },
        ani:"moveEnter"
    })
}

function _otherProtocol(e){
    var self = this;
    var proName = self.find("proName")[0]
    var i;
    QApp.open("bindcard.protocol",{
        param:{
            agreement:e.data.content,
            title    :e.data.title
        },
        ani:"moveEnter"
    })
}


    })( module.exports , module , __context );
    __context.____MODULES[ "bf09869d73d88b3d9c0466c6b469814c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8b0775d8cbe4b5f729978a47ba0d0229" ,
        filename : "zepto.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /* Zepto v1.1.3-27-gb9328f1 - zepto event ajax form ie detect data deferred callbacks - zeptojs.com/license */


var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
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
    camelize, uniq,
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
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
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
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

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
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = []
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = document.documentElement.contains(parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

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
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)

;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
      osx = !!ua.match(/\(Macintosh\; Intel /),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      wp = ua.match(/Windows Phone ([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/),
      ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
      webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
      safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    if (wp) os.wp = true, os.version = wp[1]
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]
    if (ie) browser.ie = true, browser.version = ie[1]
    if (safari && (osx || os.ios)) {browser.safari = true; if (osx) browser.version = safari[1]}
    if (webview) browser.webview = true

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)

;(function($){
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
        delete store[names ? camelize(this) : key]
      })
    })
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
      var elements = this.find('*')
      if (methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})(Zepto)

;(function($){
  var slice = Array.prototype.slice

  function Deferred(func) {
    var tuples = [
          // action, add listener, listener list, final state
          [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
          [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
          [ "notify", "progress", $.Callbacks({memory:1}) ]
        ],
        state = "pending",
        promise = {
          state: function() {
            return state
          },
          always: function() {
            deferred.done(arguments).fail(arguments)
            return this
          },
          then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
            var fns = arguments
            return Deferred(function(defer){
              $.each(tuples, function(i, tuple){
                var fn = $.isFunction(fns[i]) && fns[i]
                deferred[tuple[1]](function(){
                  var returned = fn && fn.apply(this, arguments)
                  if (returned && $.isFunction(returned.promise)) {
                    returned.promise()
                      .done(defer.resolve)
                      .fail(defer.reject)
                      .progress(defer.notify)
                  } else {
                    var context = this === promise ? defer.promise() : this,
                        values = fn ? [returned] : arguments
                    defer[tuple[0] + "With"](context, values)
                  }
                })
              })
              fns = null
            }).promise()
          },

          promise: function(obj) {
            return obj != null ? $.extend( obj, promise ) : promise
          }
        },
        deferred = {}

    $.each(tuples, function(i, tuple){
      var list = tuple[2],
          stateString = tuple[3]

      promise[tuple[1]] = list.add

      if (stateString) {
        list.add(function(){
          state = stateString
        }, tuples[i^1][2].disable, tuples[2][2].lock)
      }

      deferred[tuple[0]] = function(){
        deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
        return this
      }
      deferred[tuple[0] + "With"] = list.fireWith
    })

    promise.promise(deferred)
    if (func) func.call(deferred, deferred)
    return deferred
  }

  $.when = function(sub) {
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
        remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
        deferred = remain === 1 ? sub : Deferred(),
        progressValues, progressContexts, resolveContexts,
        updateFn = function(i, ctx, val){
          return function(value){
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
            if (val === progressValues) {
              deferred.notifyWith(ctx, val)
            } else if (!(--remain)) {
              deferred.resolveWith(ctx, val)
            }
          }
        }

    if (len > 1) {
      progressValues = new Array(len)
      progressContexts = new Array(len)
      resolveContexts = new Array(len)
      for ( ; i < len; ++i ) {
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
          resolveValues[i].promise()
            .done(updateFn(i, resolveContexts, resolveValues))
            .fail(deferred.reject)
            .progress(updateFn(i, progressContexts, progressValues))
        } else {
          --remain
        }
      }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
    return deferred.promise()
  }

  $.Deferred = Deferred
})(Zepto)

;(function($){
  // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
  // Option flags:
  //   - once: Callbacks fired at most one time.
  //   - memory: Remember the most recent context and arguments
  //   - stopOnFalse: Cease iterating over callback list
  //   - unique: Permit adding at most one instance of the same callback
  $.Callbacks = function(options) {
    options = $.extend({}, options)

    var memory, // Last fire value (for non-forgettable lists)
        fired,  // Flag to know if list was already fired
        firing, // Flag to know if list is currently firing
        firingStart, // First callback to fire (used internally by add and fireWith)
        firingLength, // End of the loop when firing
        firingIndex, // Index of currently firing callback (modified by remove if needed)
        list = [], // Actual callback list
        stack = !options.once && [], // Stack of fire calls for repeatable lists
        fire = function(data) {
          memory = options.memory && data
          fired = true
          firingIndex = firingStart || 0
          firingStart = 0
          firingLength = list.length
          firing = true
          for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
              memory = false
              break
            }
          }
          firing = false
          if (list) {
            if (stack) stack.length && fire(stack.shift())
            else if (memory) list.length = 0
            else Callbacks.disable()
          }
        },

        Callbacks = {
          add: function() {
            if (list) {
              var start = list.length,
                  add = function(args) {
                    $.each(args, function(_, arg){
                      if (typeof arg === "function") {
                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                      }
                      else if (arg && arg.length && typeof arg !== 'string') add(arg)
                    })
                  }
              add(arguments)
              if (firing) firingLength = list.length
              else if (memory) {
                firingStart = start
                fire(memory)
              }
            }
            return this
          },
          remove: function() {
            if (list) {
              $.each(arguments, function(_, arg){
                var index
                while ((index = $.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1)
                  // Handle firing indexes
                  if (firing) {
                    if (index <= firingLength) --firingLength
                    if (index <= firingIndex) --firingIndex
                  }
                }
              })
            }
            return this
          },
          has: function(fn) {
            return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
          },
          empty: function() {
            firingLength = list.length = 0
            return this
          },
          disable: function() {
            list = stack = memory = undefined
            return this
          },
          disabled: function() {
            return !list
          },
          lock: function() {
            stack = undefined;
            if (!memory) Callbacks.disable()
            return this
          },
          locked: function() {
            return !stack
          },
          fireWith: function(context, args) {
            if (list && (!fired || stack)) {
              args = args || []
              args = [context, args.slice ? args.slice() : args]
              if (firing) stack.push(args)
              else fire(args)
            }
            return this
          },
          fire: function() {
            return Callbacks.fireWith(this, arguments)
          },
          fired: function() {
            return !!fired
          }
        }

    return Callbacks
  }
})(Zepto)

module.exports = Zepto;

    })( module.exports , module , __context );
    __context.____MODULES[ "8b0775d8cbe4b5f729978a47ba0d0229" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8206b695d252b0f34e82cf8994d87259" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var _        = QApp.util;
var html     = __context.____MODULES['f70054f4c61d2d56cd0d19914b12f548'];
var _riot    = __context.____MODULES['ddf23ee0fa31f196dc20388a70242db4'];
var riot     = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var _bind    = __context.____MODULES['340bacc878d1a3d595c7963a7a1a0c57'];
var _event   = __context.____MODULES['bf09869d73d88b3d9c0466c6b469814c'];
var $ = __context.____MODULES['8b0775d8cbe4b5f729978a47ba0d0229'];

QApp.defineView("bindcard.cardauth",{
    html: html,
    plugins: ["alert", "doms", "delegated", "ajax"],
    classNames: ['m-cardauth'],
    init:{
        initPage:_on(_bind.initPage),
        renderPage:_on(_bind.renderPage),
        verification:_on(_bind.verification),
        getBindCardVCode:_on(_bind.getBindCardVCode),
        setMsgOpts : _on(_bind.setMsgOpts)
    },
    bindActions:{
        "left":_on(_event.back),
        "confirm":_on(_event.confirm),
        "cvv:input":_on(_event.cvv),
        "mobile:input":_on(_event.mobile),
        "popup" : _on(_event.popup),
        "expire" : _on(_event.expire),
        "Qpact" : _on(_event.Qpact),
        "otherProtocol" : _on(_event.otherProtocol),
        "userName:input" : _on(_event.userName)
    },
    bindEvents:{
        "actived":function(){
             riot.mount("yo-header",self.param);
        },
        "hide": function() {
            if(Kami.loading) {
                try {
                    Kami.loading.hide();
                } catch (e) {}
            }
        }
    },
    ready:function(){
        var self = this;
        QApp.ready(function(argument) {
            _.addEvent(window, 'resize', function() {
                var height = $(document.body).height();
                height = height + 100;
                var div = $('<div style="height:' + height + 'px;"></div>')
                    .appendTo($(document.body));

                setTimeout(function() {
                    if(div) {
                        div.remove();
                    }
                }, 400);
            });
        })
        self.initPage();
    }
})

function _on(fn){
    return function(e){
        return fn.call(this,e);
    }
}


    })( module.exports , module , __context );
    __context.____MODULES[ "8206b695d252b0f34e82cf8994d87259" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "712dc9f9c2c92425092a281f96597263" ,
        filename : "index.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["index"] = "<div class=\"yo-flex bindcard-successbind\">\n    <yo-header class=\"yo-header m-header\" title=\"绑定成功\" icon=\"&#xf077;\" left=\"close\" ></yo-header>\n    <successbind class=\"success-bind\"></successbind>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["index"];

    })( module.exports , module , __context );
    __context.____MODULES[ "712dc9f9c2c92425092a281f96597263" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "cf6ab9803798ef2cf59fc396c6cc1664" ,
        filename : "successbind.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["successbind"] = "<div class=\"yo-list yo-list-group successbind\">\n    <div class=\"yo-ico nike\">&#xf0ff;</div>\n    <span>成功绑定银行卡</span>\n    <span class=\"card\">{bankName}{pmCode}&nbsp;尾号{cardNo}</span>\n    <input type=\"button\" if={!returnURL} value=\"查看我的银行卡\" class=\"yo-btn yo-btn-main yo-btn-l\" action-type=\"lookcard\"/>\n    <input if={returnURL} type=\"button\" value=\"完成\" class=\"yo-btn yo-btn-main yo-btn-l\"  action-type=\"complete\"/>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["successbind"];

    })( module.exports , module , __context );
    __context.____MODULES[ "cf6ab9803798ef2cf59fc396c6cc1664" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "05d5a1de7367d7c4e3964046051307d6" ,
        filename : "tag.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot      = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var index     = __context.____MODULES['cf6ab9803798ef2cf59fc396c6cc1664'];
var headerStr = __context.____MODULES['a707d2fafba8acb2df475d59add98ccf'];

riot.tag("successbind",index,_index);

function _index(opts){
    this.bankName  = opts.bankName;
    this.pmCode    = opts.pmCode;
    this.cardNo    = opts.cardNo;
    this.returnURL = opts.returnURL;
}


    })( module.exports , module , __context );
    __context.____MODULES[ "05d5a1de7367d7c4e3964046051307d6" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c2d564f206c215077270c435a77b0261" ,
        filename : "bind.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports={
    initPage   : _initPage,
    renderPage : _renderPage
};

var riot = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var _    = QApp.util;

function _initPage(){
    var self = this;
    self.renderPage();
};

function _renderPage(){
    var self = this;
    var riotOpts = self.param;
    riotOpts.cardNo = self.param.cardNo;
    riot.mount("successbind",riotOpts);
    riot.mount("yo-header");
}


    })( module.exports , module , __context );
    __context.____MODULES[ "c2d564f206c215077270c435a77b0261" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6f33a74a6984c32e74a264d7db6507ea" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    complete : _complete,
    lookcard : _lookcard,
    keepbind : _keepbind,
    close    : _close
}

var openURl    = __context.____MODULES['1ef1834e919908301acb6ed3a3ed69df'];
var _          = QApp.util;

function _complete(){
    var self = this;
    var param = self.param;
    openURl(param.returnURL,true);
}

function _keepbind(){
    var self  = this;
    var _goto = {
        param:{
            refresh:true,
            cardNo:self.param.cardNo,
            bankName:self.param.bankName
        },
        ani:"moveEnter"
    };
    var _back = {
        refresh:true,
        from:'successbind',
        cardNo:self.param.cardNo
    };
    try {//会throw一个问题，但是不影响流程
        QApp.router.goto("bindcard.boundcard",_goto,_back);
    } catch (e) {}
}

function _lookcard(){
    var self  = this;
    var _goto = {
        param:{
            refresh:true,
            cardNo:self.param.cardNo,
            bankName:self.param.bankName
        },
        ani:"moveEnter"
    };
    var _back = {
        refresh:true,
        from:'successbind',
        cardNo:self.param.cardNo,
        bankName:self.param.bankName
    };
    try {//会throw一个问题，但是不影响流程
        QApp.router.goto("bindcard.list",_goto,_back);
    } catch (e) {}
}

function _close(){
    var api   = __context.____MODULES['074db5ccf73fd2903df721dba96577bf'];
    api.ready(function() {
        api.hy.closeWebView({});
    });
};


    })( module.exports , module , __context );
    __context.____MODULES[ "6f33a74a6984c32e74a264d7db6507ea" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c4154973643f5570f04455aa3c9619da" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var _            = QApp.util;
var    html         = __context.____MODULES['712dc9f9c2c92425092a281f96597263'];
var    _riot        = __context.____MODULES['05d5a1de7367d7c4e3964046051307d6'];
var    riot         = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var _bind        = __context.____MODULES['c2d564f206c215077270c435a77b0261'];
var _event       = __context.____MODULES['6f33a74a6984c32e74a264d7db6507ea'];

QApp.defineView("bindcard.successbind",{
    html : html,
    plugins : ["alert", "doms", "delegated", "ajax"],
    classNames: ["m-successbind"],
    init : {
        initPage   :_on(_bind.initPage),
        renderPage :_on(_bind.renderPage)
    },
    bindActions : {
        "keepbind" : _on(_event.keepbind),
        "lookcard" : _on(_event.lookcard),
        "complete" : _on(_event.complete),
        "close"    : _on(_event.close)
    },
    bindEvents : {
        "actived" : function(){
            var headerOPts={
                title : " 绑定成功",
                icon  : " ",
                left  : " "
            }
            riot.mount("yo-header",headerOPts);
        }
    },
    ready : function(){
        var self = this;
        self.initPage();
    }
})

function _on(fn){
    return function(e){
        return fn.call(this,e);
    }
}


    })( module.exports , module , __context );
    __context.____MODULES[ "c4154973643f5570f04455aa3c9619da" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "35417eeb4ad8d2504d414bdd54a06bf7" ,
        filename : "bindcard-list-group.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["bindcard-list-group"] = "<div class=\"roll-wrapper\">\n<bindcard-card-list class=\"yo-list yo-list-group\" data=\"{ card }\" ></bindcard-card-list>\n<div class=\"yo-list yo-list-group\">\n    <h2 class=\"label\" if=\"{ card.bandCardList.length }\"></h2>\n    <div action-type=\"{ addAction }\" class=\"item item-active\">\n        <i class=\"yo-ico r45\">{ addIcon }</i>\n        <span class=\"flex\">{ addText }</span>\n        <i class=\"yo-ico\">{ rightIcon }</i>\n    </div>\n</div>\n</div>\n<div class=\"desp\" node-type=\"footer\">去哪儿网担保您的信息与资金安全</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["bindcard-list-group"];

    })( module.exports , module , __context );
    __context.____MODULES[ "35417eeb4ad8d2504d414bdd54a06bf7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6a59baf5c8a91cdf4d5bd7d9002f84ed" ,
        filename : "bindcard-card-list.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["bindcard-card-list"] = "<h2 class=\"label first\"></h2>\n<div each=\"{ bank , i in bank }\" class=\"yo-slidermenu yo-slidermenu-normal item item-active\"\n    action-type=\"card\" node-type=\"card\"\n    data-role=\"slideMenuItem\"\n    data-pbankid=\"{ bank.pbankId }\" data-card=\"{ bank.bankCard }\" data-cardtype=\"{ bank.bandCardType }\">\n    <i class=\"yo-ico\">\n        <img riot-src=\"{ bank.picUrl }\" alt=\"\">\n    </i>\n    <span class=\"flex\">\n        <h2>{ bank.bankName }</h2>\n        <span>尾号{ bank.bankCard.slice(-4) }</span>\n        <span>{ bank.cardType }</span>\n        <span if=\"{ bank.touchidPay }\">{ bank.touchidPay }</span>\n    </span>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["bindcard-card-list"];

    })( module.exports , module , __context );
    __context.____MODULES[ "6a59baf5c8a91cdf4d5bd7d9002f84ed" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "80f70411422d3274ef3f9d945e5627f5" ,
        filename : "index.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["index"] = "<yo-header class=\"yo-header m-header\" title=\"我的银行卡\" affirm=\"{affirm}\"></yo-header>\n<div if=\"{ ok }\"  class=\"flex yo-flex card-panel ani fade-in-up-fast\" node-type=\"wrapper\"></div>\n<yo-error if=\"{ error }\" class=\"flex yo-flex\"></yo-error>\n<camel-loading if=\"{ loading }\" class=\"flex yo-flex\" ></camel-loading>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["index"];

    })( module.exports , module , __context );
    __context.____MODULES[ "80f70411422d3274ef3f9d945e5627f5" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "5cd024e95964e0a41909521035e8fb99" ,
        filename : "camel-loading.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["camel-loading"] = "<svg style=\"display:none;\">\n<g id=\"camel-loading-svg\">\n<rect x=\"0\" y=\"0\" rx=\"1\" ry=\"1\" width=\"50\" height=\"25\" style=\"fill:{fill}\"/>\n<g transform=\"translate(-7 40)\" style=\"fill:{bgcolor};fill-opacity:0.6;\">\n    <g transform=\"rotate(0 32 0)\">\n        <path\n           id=\"camel-bg-svg\"\n           d=\"m 52.537273,0.46644091 c -0.03218,-0.05608 -0.06993,-0.588419 -0.08387,-1.182966 -0.10247,-4.36961621 -2.170941,-9.48140391 -5.361663,-13.25021291 -3.925178,-4.636334 -10.353971,-7.708085 -16.232091,-7.755877 -0.625374,-0.0051 -0.849769,-0.05608 -0.849769,-0.19312 0,-0.141505 0.204009,-0.177813 0.849769,-0.151238 3.184772,0.13106 6.086623,0.842374 8.929584,2.188854 7.537239,3.56978 12.352882,10.6800607 12.996216,19.18887391 0.06397,0.846084 0.0485,1.257658 -0.04728,1.257658 -0.07831,0 -0.168708,-0.04588 -0.200893,-0.101972 z m 2.353842,-0.214388 c 0,-0.277036 -0.05285,-0.308602 -0.42521,-0.253952 -0.319206,0.04685 -0.409771,0.01555 -0.363279,-0.12552 0.03831,-0.116266 0.420812,-0.240064 1.003054,-0.324651 0.886282,-0.128755 0.943633,-0.158511 0.984217,-0.510633 0.02808,-0.24365401 -0.03112,-0.40239401 -0.169953,-0.45566701 -0.117178,-0.04496 -0.213051,-0.166985 -0.213051,-0.271154 0,-0.104168 -0.122366,-0.189397 -0.271926,-0.189397 -0.47398,0 -0.293293,-0.196739 0.374613,-0.40789 0.560051,-0.177053 0.667361,-0.272097 0.813858,-0.720836 0.134354,-0.411542 0.134354,-0.559011 0,-0.723551 -0.495181,-0.6064332 -0.689055,-0.7511172 -0.924116,-0.6896472 -0.139896,0.03658 -0.325281,-0.01894 -0.411967,-0.123391 -0.08668,-0.104451 -0.287781,-0.1949 -0.446877,-0.201 -0.234745,-0.009 -0.20794,-0.04672 0.142202,-0.200088 0.52689,-0.230792 0.632766,-0.386114 0.515358,-0.756037 -0.07589,-0.239114 -0.159345,-0.270067 -0.518638,-0.192368 -1.481174,0.320311 -1.65186,0.320882 -1.65186,0.0055 0,-0.274062 0.44805,-0.476421 1.95083,-0.881077 0.581927,-0.156696 0.589802,-0.166648 0.502047,-0.634418 -0.139175,-0.741865 -0.964787,-2.8126227 -1.651535,-4.1422947 -0.588361,-1.139174 -0.644802,-1.203542 -0.984664,-1.122964 -0.198292,0.04701 -0.452305,0.160543 -0.564475,0.252291 -0.343076,0.280614 -1.441882,0.884368 -1.60951,0.884368 -0.290105,0 -0.162609,-0.253834 0.249881,-0.497498 0.224339,-0.13252 0.408064,-0.334825 0.40828,-0.449567 2.72e-4,-0.11474 0.185679,-0.330987 0.412145,-0.480547 0.332908,-0.219855 0.395894,-0.337014 0.32893,-0.611833 -0.128283,-0.526478 -0.714282,-1.211891 -1.121479,-1.31174 -0.202282,-0.0496 -0.508064,-0.239602 -0.679516,-0.422225 -0.214891,-0.22889 -0.404961,-0.309243 -0.611834,-0.258657 -0.41081,0.100457 -1.233111,-0.629201 -1.117961,-0.992007 0.04462,-0.140579 0.02012,-0.2933 -0.05443,-0.339378 -0.07455,-0.04607 -0.102733,-0.16931 -0.06262,-0.273851 0.120356,-0.313648 -0.355533,-1.137919 -0.824208,-1.427577 -0.275958,-0.170552 -0.724203,-0.282971 -1.209191,-0.303267 -0.423873,-0.01774 -0.771095,-0.065 -0.771606,-0.105024 -5.44e-4,-0.04003 -0.213661,-0.217643 -0.473666,-0.394705 -0.366882,-0.249846 -0.444804,-0.371624 -0.347995,-0.543852 0.08915,-0.158602 0.04686,-0.30506 -0.148212,-0.513303 -0.150126,-0.160258 -0.375505,-0.496766 -0.500845,-0.747796 -0.224563,-0.449751 -1.194376,-1.074431 -1.650322,-1.063013 -0.115019,0.0029 -0.332758,0.201727 -0.483862,0.44188 -0.151105,0.240153 -0.355766,0.436643 -0.454802,0.436643 -0.09904,0 -0.281638,0.196419 -0.405782,0.436486 -0.134202,0.25952 -0.287215,0.39733 -0.377404,0.339908 -0.100896,-0.06423 0.295339,-1.029878 1.183323,-2.883815 1.200197,-2.505771 1.371383,-2.791715 1.695174,-2.831537 0.324703,-0.03993 0.35239,-0.08678 0.281228,-0.475871 -0.04341,-0.237365 -0.02626,-0.514826 0.03812,-0.61658 0.06438,-0.101752 0.08793,-0.296364 0.05233,-0.432471 -0.08485,-0.324462 -0.429494,-0.190936 -0.588822,0.228131 -0.07126,0.187417 -0.233581,0.321364 -0.38945,0.321364 -0.368671,0 -0.482507,0.239641 -0.287193,0.604588 0.185593,0.346783 0.07458,0.602752 -1.673523,3.858506 -0.961477,1.790742 -0.977553,1.810898 -1.381223,1.731713 -0.224633,-0.04406 -0.475657,-0.170117 -0.557831,-0.280117 -0.08217,-0.11 -0.185145,-0.164261 -0.228826,-0.12058 -0.131936,0.131937 -1.049379,-0.227925 -1.049379,-0.411612 0,-0.094 0.244734,-0.772394 0.543852,-1.507535 0.299119,-0.73514 0.543852,-1.410627 0.543852,-1.501084 0,-0.165422 -0.585155,-0.334417 -1.157941,-0.334417 -0.223871,0 -0.332633,0.102282 -0.397587,0.373898 -0.33097,1.383993 -0.785292,2.617289 -0.964158,2.617289 -0.237691,0 -0.242848,-0.06141 -0.05717,-0.680713 0.202201,-0.674394 0.307689,-1.464829 0.290201,-2.174511 -0.01753,-0.71141 -0.373887,-1.112429 -0.873993,-0.983529 -0.431926,0.111326 -0.601685,0.392626 -0.778108,1.289367 -0.0846,0.430027 -0.207672,0.781866 -0.273487,0.781866 -0.06582,0 -0.139216,0.137663 -0.163112,0.305917 -0.03182,0.224084 -0.134373,0.305917 -0.383355,0.305917 -0.26824,0 -0.327905,-0.05734 -0.282983,-0.271926 0.133763,-0.638986 0.0773,-1.631208 -0.09091,-1.597566 -0.09348,0.01869 -0.169954,-0.02719 -0.169954,-0.101972 0,-0.07478 -0.146326,-0.135963 -0.325168,-0.135963 -0.349395,0 -0.398668,0.109819 -0.564272,1.257658 -0.05125,0.355203 -0.148928,0.645824 -0.217067,0.645824 -0.06814,0 -0.182045,0.152959 -0.253123,0.339908 -0.07108,0.186949 -0.230405,0.339908 -0.354059,0.339908 -0.227646,0 -0.220716,-0.430047 0.02976,-1.846737 0.05999,-0.339308 0.01136,-0.460235 -0.255358,-0.634997 -0.268427,-0.175879 -0.39008,-0.18579 -0.656687,-0.0535 -0.268799,0.133375 -0.334855,0.282704 -0.369948,0.836311 -0.0235,0.370671 -0.115272,0.720078 -0.203945,0.776464 -0.235305,0.149625 -0.773057,0.129258 -0.773057,-0.02928 0,-0.07478 0.145174,-0.135963 0.322609,-0.135963 0.289368,0 0.329598,-0.07273 0.390436,-0.70589 0.05306,-0.552219 0.145624,-0.767923 0.425188,-0.990839 0.196548,-0.156723 0.35736,-0.35913 0.35736,-0.449795 0,-0.256467 0.244395,-0.193856 0.332999,0.08531 0.04367,0.137586 0.228229,0.329809 0.410135,0.427163 0.313839,0.167961 0.326481,0.222917 0.247404,1.075483 -0.07436,0.80168 -0.0606,0.879728 0.12772,0.724454 0.116868,-0.09636 0.253715,-0.515441 0.306643,-0.939065 0.156134,-1.249657 0.205425,-1.28087 1.324553,-0.838774 0.363362,0.143542 0.369012,0.163878 0.310341,1.117014 -0.04584,0.744747 -0.02755,0.892552 0.07855,0.634741 0.07607,-0.184838 0.187136,-0.368388 0.246809,-0.407889 0.05967,-0.0395 0.195759,-0.43892 0.302412,-0.887598 0.173529,-0.730013 0.247176,-0.84197 0.700509,-1.064912 0.278626,-0.137022 0.506593,-0.335869 0.506593,-0.44188 0,-0.10601 0.06118,-0.192746 0.135963,-0.192746 0.07478,0 0.135963,0.13824 0.135963,0.307201 0,0.168962 0.113771,0.378255 0.252825,0.465096 0.149103,0.09312 0.292418,0.399376 0.349331,0.74651 l 0.09651,0.58862 0.207163,-0.389738 c 0.196991,-0.370602 0.239983,-0.385383 0.875608,-0.301065 1.2975,0.17212 1.266982,0.07612 0.586796,1.845916 -0.33039,0.859652 -0.600709,1.57201 -0.600709,1.583019 0,0.01101 0.09495,0.05645 0.211006,0.100988 0.127248,0.04883 0.176137,0.02455 0.123164,-0.06116 -0.140891,-0.227965 0.06014,-0.806493 0.280254,-0.806493 0.110745,0 0.194109,-0.04589 0.185253,-0.101973 -0.06389,-0.404597 0.04488,-0.577843 0.362761,-0.577843 0.456902,0 1.148934,0.364777 1.148934,0.605614 0,0.104908 -0.09007,0.280811 -0.200154,0.390895 -0.158978,0.158977 -0.165085,0.229259 -0.02969,0.34163 0.129956,0.107853 0.419729,-0.319169 1.219317,-1.796834 1.028526,-1.900751 1.166591,-2.307051 0.982232,-2.890538 -0.07213,-0.228279 0.01221,-0.369278 0.395934,-0.66196 0.26817,-0.204544 0.487582,-0.449275 0.487582,-0.543848 0,-0.09457 0.107619,-0.200093 0.239154,-0.23449 0.144405,-0.03776 0.550957,-0.698658 1.026173,-1.668156 0.54747,-1.116906 0.830282,-1.562353 0.929156,-1.463479 0.09887,0.09887 -0.06504,0.612139 -0.538532,1.686289 -0.46939,1.064852 -0.670284,1.691862 -0.647216,2.020024 0.0184,0.261728 9.49e-4,0.535518 -0.03869,0.608423 -0.03969,0.0729 -0.07533,0.281713 -0.07922,0.46402 -0.0048,0.224407 -0.13881,0.40292 -0.414956,0.552693 -0.321762,0.174514 -0.616869,0.648435 -1.397604,2.24446 -0.588522,1.203093 -0.939974,2.072974 -0.867009,2.14594 0.07296,0.07297 0.244418,-0.07423 0.422961,-0.363118 0.318556,-0.515436 0.581598,-0.589495 1.159127,-0.326356 0.267721,0.121982 0.38748,0.121982 0.509462,0 0.245357,-0.245358 0.404814,-0.189344 0.310141,0.108944 -0.06164,0.194222 0.04857,0.402167 0.398727,0.752329 0.266155,0.266154 0.485863,0.558357 0.488242,0.649338 0.0024,0.09098 0.08768,0.275336 0.189563,0.409677 0.101881,0.13434 0.155342,0.358581 0.118801,0.498314 -0.09315,0.356221 0.412111,0.648677 1.318868,0.763387 0.411288,0.05203 0.908763,0.175856 1.105499,0.27517 0.58092,0.293253 1.06991,0.97168 1.06991,1.484395 0,0.251578 0.06281,0.496232 0.139568,0.543673 0.07677,0.04744 0.124529,0.158124 0.106145,0.24596 -0.01838,0.08783 0.0771,0.325358 0.212195,0.527828 0.196216,0.294086 0.31997,0.353258 0.615278,0.294197 0.236603,-0.04732 0.429887,-0.0014 0.536994,0.127697 0.09204,0.110897 0.287454,0.170217 0.434265,0.131825 0.168721,-0.04412 0.267545,-0.0015 0.268609,0.11601 0.0027,0.292479 0.873793,0.792131 1.222221,0.701014 0.308808,-0.08075 0.313212,-1.34e-4 0.03982,0.728703 -0.03223,0.08591 0.0067,0.196591 0.08664,0.245959 0.07988,0.04937 0.145232,0.212124 0.145232,0.361683 0,0.14956 0.06162,0.233846 0.136923,0.187303 0.07531,-0.04654 0.174228,0.01259 0.219824,0.13141 0.06061,0.157946 0.129566,0.177303 0.256464,0.07198 0.131901,-0.109468 0.274235,0.01956 0.592929,0.537507 0.230651,0.374854 0.507529,0.89256 0.615286,1.150459 0.161814,0.387276 0.249177,0.45498 0.50183,0.388911 0.244984,-0.06407 0.288651,-0.03503 0.219261,0.145801 -0.06597,0.171925 -0.0084,0.2258 0.240969,0.2258 0.180189,0 0.369465,-0.06771 0.420616,-0.150479 0.06483,-0.104899 0.128405,-0.0946 0.209888,0.034 0.176311,0.278256 0.144232,0.524377 -0.06835,0.524377 -0.247653,0 -0.402998,0.4137293 -0.222948,0.5937803 0.205445,0.205444 0.171627,0.357961 -0.07938,0.357961 -0.239237,0 -0.233613,0.05502 0.138969,1.35963 0.246324,0.862519 0.275232,1.275835 0.08083,1.155686 -0.07477,-0.04622 -0.135963,0.02709 -0.135963,0.162909 0,0.206878 -0.09374,0.239697 -0.577843,0.202294 -0.317813,-0.02455 -0.730802,0.01916 -0.91775,0.09714 -0.279416,0.116558 -0.218926,0.129757 0.339907,0.07417 0.545621,-0.05427 0.741566,-0.01455 0.992639,0.201189 0.302406,0.259854 0.305375,0.283208 0.08915,0.701341 -0.226696,0.438377 -0.130288,0.660371 0.289356,0.666295 0.08111,0.0011 0.311024,0.185632 0.510911,0.4099706 0.219978,0.246888 0.497185,0.407888 0.702289,0.407888 0.438317,0 0.436258,0.241626 -0.0034,0.408816 -0.188291,0.07159 -0.404366,0.299511 -0.48017,0.506497 -0.0758,0.206984 -0.293027,0.504336 -0.482723,0.660779 l -0.344901,0.284442 0.376044,0.446902 0.376042,0.446902 -0.436878,0.39035201 c -0.240283,0.214692 -0.58887,0.390349 -0.774641,0.390349 -0.284649,0 -0.337762,0.06414 -0.337762,0.407889 0,0.22434 -0.06119,0.40789 -0.135963,0.40789 -0.07478,0 -0.135963,-0.142362 -0.135963,-0.31636 z M 52.375799,-12.620001 c 0.13535,-0.149559 0.19072,-0.269981 0.123045,-0.267603 -0.158056,0.0056 -0.598915,0.338672 -0.598915,0.452545 0,0.172666 0.234834,0.0814 0.47587,-0.184942 z m -12.168692,-9.3656 c 0,-0.06606 -0.137662,-0.14997 -0.305916,-0.186461 -0.168254,-0.03649 -0.412988,-0.111352 -0.543853,-0.166359 -0.136781,-0.05749 -0.237935,-0.04084 -0.237935,0.03917 0,0.07655 0.168255,0.200631 0.373898,0.275739 0.481766,0.175955 0.713806,0.18828 0.713806,0.03791 z m 12.782848,15.1871817 c 0.0019,-0.256909 0.145879,-0.370653 0.779895,-0.616091 0.513909,-0.198944 0.82328,-0.255303 0.912372,-0.166212 0.208407,0.208407 -0.08161,0.558793 -0.614802,0.742777 -1.097905,0.378844 -1.079961,0.378186 -1.077465,0.03952 z m -0.345399,-0.936898 c -0.06033,-0.190101 -0.0079,-0.347371 0.160791,-0.482911 0.237366,-0.190638 0.234754,-0.196741 -0.05066,-0.118399 -0.250439,0.06874 -0.33598,-0.0014 -0.509861,-0.417455 -0.114914,-0.275028 -0.208936,-0.522141 -0.208936,-0.54914 0,-0.09175 1.3496,-0.7334817 1.542561,-0.7334817 0.105582,0 0.270906,0.1905727 0.367385,0.4234957 0.141893,0.342558 0.142473,0.476249 0.003,0.699527 -0.148134,0.237199 -0.142092,0.264408 0.04294,0.193401 0.242847,-0.09319 0.559863,0.366297 0.414735,0.601122 -0.103466,0.167411 -1.218048,0.665752 -1.489013,0.665752 -0.10093,0 -0.223773,-0.126861 -0.272985,-0.281911 z m 1.412467,-0.470232 c 0.035,-0.035 0.03814,-0.08805 0.007,-0.117883 -0.09439,-0.09039 -1.076374,0.346156 -1.076374,0.478502 0,0.108864 0.905139,-0.196366 1.06939,-0.360619 z m -0.594482,-0.334004 c 0.04763,-0.07707 -0.007,-0.09986 -0.127939,-0.05344 -0.235545,0.09039 -0.278641,0.187841 -0.08307,0.187841 0.07037,0 0.16532,-0.06048 0.211006,-0.134406 z m -0.156786,-0.358458 c 0.34192,-0.16305 0.445844,-0.287732 0.396645,-0.47587 -0.08019,-0.306643 -0.17513,-0.31363 -0.787115,-0.05793 -0.508269,0.212369 -0.512383,0.218076 -0.388976,0.53967 0.103468,0.269632 0.203282,0.26888 0.779446,-0.0059 z m -1.536718,-0.993253 c -0.159891,-0.2987617 -0.143452,-0.3146177 0.810706,-0.7820207 0.517675,-0.253588 0.640852,-0.271136 0.80038,-0.114034 0.361622,0.35612 -0.136647,0.8416287 -1.100856,1.0726667 -0.282972,0.0678 -0.401352,0.02683 -0.51023,-0.176612 z m 1.490522,-0.5862477 c 0,-0.161594 -0.258822,-0.12202 -0.761239,0.116392 -0.671902,0.318839 -0.566806,0.4642127 0.149406,0.206666 0.336507,-0.121007 0.611833,-0.266383 0.611833,-0.323058 z m -1.960118,-0.326448 c -0.04715,-0.122873 -0.06899,-0.232284 -0.04854,-0.243135 1.184832,-0.62855 1.487709,-0.759021 1.600369,-0.689392 0.296848,0.183462 0.10359,0.448231 -0.579397,0.793791 -0.842105,0.426066 -0.861134,0.428781 -0.972434,0.138736 z\"\n        />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           width=\"100%\"\n           height=\"100%\" />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           transform=\"matrix(-0.99999448,-0.00332237,0.00332237,-0.99999448,61.817607,0.72065512)\"\n           width=\"100%\"\n           height=\"100%\" />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           transform=\"matrix(0.02368043,-0.99971957,0.99971957,0.02368043,30.338939,30.637309)\"\n           width=\"100%\"\n           height=\"100%\" />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           transform=\"matrix(0.01666783,0.99986108,-0.99986108,0.01666783,30.328036,-30.156237)\"\n           width=\"100%\"\n           height=\"100%\" />\n        <animateTransform attributeName=\"transform\" begin=\"0s\" dur=\"30s\" type=\"rotate\" from=\"0 32 0\" to=\"360 32 0\" repeatCount=\"indefinite\"/>\n    </g>\n</g>\n<g transform=\"translate(15 7)\" style=\"fill:{color}\">\n    <path\n       id=\"camel1-svg\"\n       d=\"m 7.1120645,15.742968 c 0,-0.141356 0.080261,-0.306614 0.1783575,-0.367241 0.3900625,-0.241072 0.132766,-0.831519 -0.8026075,-1.841834 -0.5395305,-0.582758 -0.980965,-1.173477 -0.980965,-1.312709 0,-0.139232 0.230657,-0.569939 0.5125715,-0.957126 C 6.750426,10.26008 6.824206,9.898644 6.392691,9.4354675 6.13114,9.1547255 5.82008,9.044045 5.292625,9.044045 4.0763811,9.044045 2.5513803,7.9194505 1.7552163,6.435424 1.6046997,6.154865 1.3237871,5.901559 1.130966,5.8725215 0.08694992,5.7152995 -0.04522895,5.641566 0.0107852,5.247649 0.05482421,4.9379465 0.25952798,4.803909 0.95873955,4.626939 1.449222,4.502798 2.1174305,4.4225375 2.4436475,4.4485815 2.9909712,4.4922765 3.0622256,4.5713935 3.3664537,5.4731875 3.9744838,7.275513 5.0751945,7.5913 6.4878145,6.368686 7.139636,5.8045385 7.454776,5.655257 7.9938965,5.655257 8.525677,5.655257 8.6961995,5.576776 8.768959,5.2985425 8.822452,5.093984 9.012241,4.941828 9.2138995,4.941828 c 0.1934115,0 0.4796715,-0.180587 0.636133,-0.4013035 0.2657095,-0.374832 0.3005665,-0.381029 0.5284125,-0.093947 0.205081,0.2583975 0.329006,0.2752475 0.777972,0.105782 0.414832,-0.1565815 0.656233,-0.147484 1.081502,0.04076 0.47769,0.2114455 0.536096,0.312422 0.458234,0.7922265 -0.07861,0.4843955 0.04027,0.681014 0.998019,1.650731 1.032691,1.045592 1.087254,1.144641 1.087254,1.9736815 0,0.968906 0.294163,1.9962175 0.571602,1.9962175 0.099,0 0.129005,0.132868 0.06669,0.295263 -0.06857,0.178678 0.03564,0.453811 0.263926,0.696805 0.352421,0.375134 0.368836,0.519934 0.249602,2.201739 l -0.127628,1.800196 -0.512095,0 c -0.596631,0 -0.591253,0.0142 -0.245659,-0.648452 0.561499,-1.076624 0.178023,-2.529917 -1.02899,-3.899658 -0.345769,-0.392386 -0.68495,-0.65848 -0.753734,-0.59132 -0.06879,0.06716 -0.181225,0.598422 -0.249867,1.180582 -0.08591,0.728563 -0.260945,1.223496 -0.561593,1.587931 -0.240235,0.291202 -0.677572,0.942194 -0.971862,1.446648 -0.390761,0.669821 -0.643305,0.918145 -0.936375,0.92073 -0.5232,0.0046 -0.50692,-0.191979 0.05991,-0.723389 0.961341,-0.901276 1.539109,-2.820442 1.37575,-4.569818 -0.100867,-1.0801625 -0.122926,-1.1209965 -0.660021,-1.221756 -0.390156,-0.073194 -0.847412,0.031555 -1.5351425,0.351671 -0.5387125,0.250753 -1.111346,0.456698 -1.27252,0.457656 -0.42096,0.0025 -0.460968,0.232339 -0.403919,2.320387 0.02814,1.030013 0.00532,2.213859 -0.050724,2.630769 -0.087335,0.649729 -0.162235,0.758019 -0.524299,0.758019 -0.248881,0 -0.4224095,-0.105581 -0.4224095,-0.25701 z M 7.3759455,12.5666 C 7.306477,12.051594 7.210979,11.565226 7.1637295,11.485784 7.0381275,11.274608 6.5893,11.928368 6.5826655,12.332158 c -0.00485,0.296627 0.6258675,1.170818 0.844762,1.170818 0.041155,0 0.017985,-0.421369 -0.051482,-0.936376 z\"\n      >\n       <animate\n             id=\"frame1\"\n             attributeName=\"display\"\n             values=\"inline;none;none;none;none;none\"\n             keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n             dur=\"1s\"\n             begin=\"0s\"\n             repeatCount=\"indefinite\" />\n    </path>\n    <path\n          id=\"camel2-svg\"\n          d=\"M 7.3178714,15.445942 C 7.5050368,14.694937 7.4709515,13.795226 7.2011665,12.36542 L 6.986861,11.229644 6.4839491,11.812196 c -0.7397701,0.856917 -0.7763682,1.20371 -0.2389533,2.264247 0.4536523,0.89524 0.4596535,0.942332 0.1490325,1.169464 C 5.8808001,15.621189 5.5759305,15.450608 5.5415664,14.768938 5.5245004,14.430396 5.4003351,13.775302 5.2656443,13.313173 5.0440088,12.552734 5.0503878,12.427472 5.3328163,11.994178 6.3993359,10.357953 6.5756539,9.1089201 5.7169372,9.2730743 4.7466199,9.4585621 4.0105416,9.1411042 2.8687515,8.0447011 2.256108,7.4564107 1.7548542,6.8330667 1.7548542,6.6594926 1.7548542,6.3676283 0.88041022,5.9795832 0.21602682,5.976619 -0.11065205,5.9751593 -0.05030538,5.1517832 0.28593702,5.0227549 0.44529549,4.9616033 1.1455409,4.8633993 1.8420379,4.8045236 L 3.108396,4.6974772 3.2214335,5.2626651 c 0.1947674,0.9738367 0.6487406,1.727538 1.1707851,1.943776 0.6616521,0.2740652 1.0763576,0.121924 1.9464919,-0.7141007 0.6110948,-0.5871397 0.8359908,-0.6925682 1.4773597,-0.6925682 0.6086309,0 0.7745172,-0.068764 0.8485149,-0.351732 0.056613,-0.2164893 0.2398841,-0.351732 0.476641,-0.351732 0.236757,0 0.4200278,-0.1352427 0.476641,-0.351732 0.1134526,-0.4338433 0.5016409,-0.4570726 0.7347299,-0.043966 0.139086,0.246505 0.217839,0.2640081 0.395644,0.087933 0.264061,-0.2614931 1.206841,-0.2958395 1.206841,-0.043966 0,0.096726 0.12794,0.175866 0.28431,0.175866 0.202268,0 0.256433,0.106607 0.187702,0.3694331 -0.09957,0.3807549 0.187234,1.2133609 0.417961,1.2133609 0.07153,0 0.413695,0.2836447 0.760372,0.6303216 0.608236,0.6082364 0.910358,1.3385186 1.012475,2.4473333 0.02672,0.2901789 0.200362,0.7016359 0.385861,0.9143479 0.1855,0.212713 0.290996,0.507344 0.234436,0.654736 -0.05769,0.150335 0.08696,0.493542 0.329483,0.781766 C 15.964448,12.403271 16,12.591674 16,14.222761 L 16,16 15.560335,16 c -0.441787,0 -0.613073,-0.399668 -0.263799,-0.615531 0.258636,-0.159846 0.214441,-0.96726 -0.104117,-1.902178 -0.259774,-0.762394 -1.676311,-2.582405 -2.009918,-2.582405 -0.0808,0 -0.196055,0.455053 -0.256116,1.01123 -0.06006,0.556176 -0.199025,1.169508 -0.308807,1.362961 -0.109782,0.193453 -0.308845,0.589151 -0.442362,0.87933 -0.133517,0.290179 -0.316807,0.665019 -0.407312,0.832977 -0.09051,0.167959 -0.164554,0.464733 -0.164554,0.659498 0,0.27622 -0.116059,0.354118 -0.527598,0.354118 -0.582631,0 -0.671984,-0.188835 -0.253638,-0.536031 0.720855,-0.598256 1.189731,-2.607674 1.031564,-4.420874 C 11.735122,9.6839943 11.731382,9.6757886 11.183804,9.5730623 10.79585,9.5002815 10.347795,9.6025836 9.6673567,9.9193056 9.1361691,10.166556 8.5605829,10.369625 8.3882761,10.37057 c -0.1723067,9.5e-4 -0.3495828,0.100643 -0.3939467,0.221551 -0.044364,0.120907 -0.012824,1.288218 0.070089,2.594023 0.082913,1.305805 0.1019093,2.424651 0.042215,2.486324 -0.059695,0.06167 -0.2946184,0.168476 -0.5220527,0.237339 -0.3940805,0.119321 -0.4066166,0.09752 -0.2667087,-0.463865 z\"\n    >\n       <animate\n             id=\"frame2\"\n             attributeName=\"display\"\n             values=\"none;inline;none;none;none;none\"\n             keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n             dur=\"1s\"\n             begin=\"0s\"\n             repeatCount=\"indefinite\" />\n     </path>\n     <path\n           id=\"camel3-svg\"\n           d=\"m 11.694744,15.893439 c 0,-0.05861 0.161653,-0.312069 0.359228,-0.563245 0.197576,-0.251177 0.44296,-0.76764 0.545299,-1.147697 0.199468,-0.74077 0.04948,-2.985451 -0.210214,-3.145949 -0.08501,-0.05254 -0.154555,-0.298474 -0.154555,-0.546528 0,-1.2490252 -0.695963,-1.4316719 -2.4854398,-0.652273 -1.1345943,0.494168 -1.1358967,0.495597 -1.0191106,1.1183 0.064315,0.342925 0.23144,0.844927 0.3713898,1.11556 0.1399497,0.270633 0.254454,0.632018 0.254454,0.803079 0,0.355498 0.2878241,1.32191 0.6513016,2.186843 0.327217,0.778647 0.33612,0.758581 -0.3364431,0.758356 C 9.0970953,15.819687 9.0853682,15.803356 9.0572243,14.965269 9.0371739,14.3682 8.8068602,13.664331 8.2925679,12.628382 7.8877878,11.813025 7.556604,11.064112 7.556604,10.96413 c 0,-0.475265 -0.3345929,-0.09336 -0.5894723,0.672831 -0.1563629,0.470039 -0.4925164,1.37599 -0.7470077,2.013226 -0.2544914,0.637235 -0.4627114,1.386148 -0.4627114,1.664252 0,0.441878 -0.068066,0.505642 -0.5397575,0.505642 -0.2968665,0 -0.5397574,-0.05291 -0.5397574,-0.117579 0,-0.06467 0.194409,-0.530209 0.4320199,-1.034535 0.2376107,-0.504326 0.5166616,-1.402738 0.6201129,-1.996471 0.1034512,-0.593733 0.2834043,-1.50102 0.399896,-2.016193 C 6.4250891,9.3499742 6.3135581,9.1630726 5.2394581,9.1630726 4.4783023,9.1630726 4.225077,9.0632738 3.4795999,8.4694934 2.3897141,7.6013883 2.0536586,7.2235444 1.8163793,6.5994526 1.6728502,6.2219424 1.4367193,6.0542405 0.81430111,5.8877689 0.15656621,5.7118517 0,5.5927101 0,5.2681131 0,4.7350942 0.04357633,4.7174114 1.7167989,4.5714542 L 3.1603568,4.4455309 3.3930449,5.3534319 C 3.5210232,5.8527775 3.8181222,6.4689245 4.0532649,6.7226475 4.7726057,7.4988291 5.5322213,7.3228031 6.9201075,6.0583128 7.1142899,5.8813953 7.5827716,5.6871364 7.9611783,5.6266267 8.3654233,5.5619853 8.7233122,5.378111 8.828904,5.1808112 8.9277464,4.9961222 9.1752761,4.8450131 9.3789696,4.8450131 c 0.2190393,0 0.4087978,-0.1470171 0.4644519,-0.3598383 0.113975,-0.4358409 0.5123125,-0.4700837 0.7397945,-0.063596 0.153922,0.2750439 0.19605,0.2750439 0.58873,0 0.23262,-0.1629331 0.526376,-0.2962422 0.652791,-0.2962422 0.363936,0 0.949522,0.6820918 0.949522,1.1060048 0,0.2323329 0.419889,0.8023275 1.053373,1.4299436 0.971283,0.9622864 1.061256,1.1200064 1.154544,2.0238768 0.06689,0.6480589 0.273567,1.2407685 0.609875,1.7489632 0.350594,0.529784 0.439114,0.791897 0.284808,0.843333 -0.26756,0.08919 -0.298836,0.696767 -0.04397,0.85428 0.288884,0.178541 0.212077,0.761008 -0.29962,2.27216 -0.415472,1.22698 -0.535658,1.416183 -0.899595,1.416183 -0.519205,0 -0.519315,0.004 0.02974,-1.079515 0.586035,-1.156485 0.568232,-1.761628 -0.07808,-2.653829 -0.803258,-1.108866 -0.911479,-1.100906 -0.911479,0.06704 0,1.467271 -0.967797,3.846228 -1.564705,3.846228 -0.227923,0 -0.414406,-0.04795 -0.414406,-0.106561 z\"\n     >\n       <animate\n             id=\"frame3\"\n             attributeName=\"display\"\n             values=\"none;none;inline;none;none;none\"\n             keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n             dur=\"1s\"\n             begin=\"0s\"\n             repeatCount=\"indefinite\" />\n     </path>\n     <path\n        id=\"camel4-svg\"\n        d=\"M 8.7959769,14.733538 C 8.7823709,13.962655 8.6416974,13.173477 8.4364574,12.716637 L 8.0992897,11.966141 7.9316262,12.622825 C 7.8394115,12.984001 7.7056873,13.828309 7.6344617,14.499065 7.5119445,15.65285 7.4771343,15.721823 6.9889944,15.77799 6.4016791,15.845568 6.3706616,15.734011 6.7310637,14.850321 6.8729831,14.50234 7.0314449,13.273019 7.0832012,12.118496 7.2025402,9.4564011 6.9826172,8.9629542 5.5925417,8.7738664 5.096474,8.7063876 4.5281652,8.6057104 4.3296332,8.550139 3.7880973,8.3985568 2.1379694,6.7917174 1.8662797,6.1514073 1.680471,5.7134991 1.4492167,5.5465837 0.81406548,5.3919372 0.12893242,5.2251211 0,5.1208599 0,4.7336426 0,4.336324 0.11518495,4.2524818 0.84430805,4.1190775 1.3086775,4.0341139 2.0169795,3.9496831 2.4183125,3.9314535 3.1424232,3.8985623 3.1505359,3.9060226 3.4781201,4.9059984 3.895193,6.179146 4.3323163,6.6203411 5.2093056,6.6533106 5.7732981,6.6745132 6.0485257,6.539104 6.7434918,5.8985065 7.4356058,5.2605383 7.724319,5.1178647 8.3231936,5.1178647 c 0.5750126,0 0.7539352,-0.080801 0.8309348,-0.375248 0.058037,-0.221935 0.2559221,-0.375248 0.4843416,-0.375248 0.2124165,0 0.476584,-0.1688617 0.587039,-0.3752481 0.240288,-0.4489831 0.750496,-0.4991125 0.750496,-0.073738 0,0.2135636 0.09577,0.2620819 0.328342,0.1663373 0.720327,-0.2965451 0.990415,-0.3092897 1.52643,-0.072027 0.471409,0.2086657 0.542941,0.3271373 0.456995,0.7568685 -0.08426,0.4213047 0.04204,0.6497726 0.729807,1.3201051 1.143179,1.114209 1.40549,1.5840968 1.552296,2.7806783 0.06963,0.5675626 0.216264,1.2924751 0.325848,1.6109161 0.136653,0.397104 0.138925,0.686766 0.0072,0.922089 -0.176098,0.314669 -0.214883,0.299452 -0.467988,-0.183617 -0.387542,-0.739649 -0.571885,-0.301548 -0.300332,0.713757 0.176363,0.659403 0.172812,1.132697 -0.01664,2.2179 -0.341473,1.955965 -0.274035,1.856066 -1.228584,1.81996 -0.934764,-0.03536 -1.039183,-0.214301 -0.475299,-0.814528 0.284272,-0.302594 0.382184,-0.688895 0.407282,-1.606897 0.03651,-1.33541 -0.154678,-1.844834 -0.867715,-2.312035 -0.390874,-0.25611 -0.476679,-0.46085 -0.476679,-1.137407 0,-0.7595531 -0.0436,-0.8346499 -0.548976,-0.9456498 C 11.540584,9.0697376 11.06967,9.1757694 10.327657,9.5151734 9.749393,9.7796771 9.1690775,9.996089 9.0380672,9.996089 c -0.2709452,0 -0.1985999,1.246308 0.082427,1.419992 0.091792,0.05673 0.1668938,0.589424 0.1668938,1.183763 0,0.59434 0.1304728,1.519966 0.2899394,2.056949 C 9.900035,15.743466 9.8335656,16.000084 9.2294095,16 8.8492003,15.999947 8.8166498,15.904837 8.7959769,14.733538 Z\"\n     >\n        <animate\n           id=\"frame4\"\n           attributeName=\"display\"\n           values=\"none;none;none;inline;none;none\"\n           keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n           dur=\"1s\"\n           begin=\"0s\"\n           repeatCount=\"indefinite\" />\n     </path>\n     <path\n        id=\"camel5-svg\"\n        d=\"M 7.1493305,15.450337 C 7.5631556,14.650087 7.5205085,13.34185 7.0672237,12.931633 6.7569062,12.6508 6.6927936,12.311573 6.6480373,10.713674 L 6.5951997,8.8272558 5.8499795,8.7775975 C 5.4401084,8.7502855 4.9088829,8.6839924 4.6694783,8.6302797 4.1226173,8.5075861 2.4960161,7.0038832 1.9099589,6.0792563 1.5757991,5.5520499 1.3419893,5.3799123 0.95713494,5.3777595 0.27262434,5.373931 -0.06953266,5.1308761 0.01178373,4.7062204 0.09008118,4.2973304 1.5580726,3.8549351 2.5746867,3.9338613 3.1545724,3.9788816 3.2382447,4.0624038 3.506212,4.8637148 3.9045618,6.0549132 4.4254237,6.5406054 5.3299645,6.5643233 5.9338164,6.5801574 6.1745259,6.4657743 6.7514541,5.8888461 7.3404186,5.2998816 7.5691837,5.1943074 8.2564263,5.1943074 c 0.6537502,0 0.8292719,-0.072038 0.9078732,-0.3726101 0.057629,-0.2203749 0.2541231,-0.3726101 0.4809368,-0.3726101 0.2109232,0 0.4732337,-0.1676745 0.5829117,-0.3726101 0.238599,-0.4458269 0.74522,-0.4956038 0.74522,-0.07322 0,0.2148251 0.09209,0.2594296 0.326034,0.1579153 0.592919,-0.2572835 1.537017,-0.3218269 1.537017,-0.1050783 0,0.1136783 0.131405,0.2066879 0.292012,0.2066879 0.202907,0 0.25746,0.1088648 0.178779,0.3567664 -0.183804,0.5791162 0.09366,1.3018894 0.621072,1.6178186 0.972378,0.5824775 1.487316,1.4989472 1.62451,2.8912548 0.06994,0.7097724 0.199984,1.3355011 0.288987,1.3905091 0.222574,0.137558 0.205144,1.195853 -0.0197,1.195853 -0.09984,0 -0.326172,-0.272471 -0.502967,-0.605491 -0.467733,-0.881043 -0.557324,-0.182795 -0.09382,0.731169 0.254699,0.502226 0.381726,1.20786 0.430141,2.38944 l 0.0687,1.676745 -0.512339,0.05895 c -0.500627,0.0576 -0.69698,-0.202303 -0.326034,-0.431561 0.294025,-0.181717 0.217118,-1.928111 -0.115807,-2.629696 -0.375807,-0.791955 -0.603838,-0.953458 -0.487588,-0.345335 0.05233,0.273725 -0.109633,0.864282 -0.399523,1.456796 -0.268137,0.548052 -0.487522,1.176737 -0.487522,1.397076 0,0.320927 -0.111179,0.400617 -0.558915,0.400617 -0.677354,0 -0.693447,-0.15782 -0.104577,-1.025569 0.249887,-0.368228 0.550474,-0.960796 0.667972,-1.316819 0.193328,-0.58579 0.15098,-0.784126 -0.445562,-2.086767 C 12.591695,10.59284 12.269432,9.7774115 12.238111,9.5724759 12.15601,9.035273 11.346611,9.0031784 10.382034,9.498878 9.9387594,9.7266782 9.3260954,9.9653093 9.0205583,10.029169 l -0.5555222,0.116109 -0.00339,1.560209 c -0.00312,1.433143 0.036834,1.603273 0.4905408,2.088988 0.2716632,0.290829 0.6279716,0.52878 0.7917961,0.52878 0.1935167,0 0.2978626,0.163163 0.2978626,0.465762 0,0.25617 -0.04743,0.465763 -0.1054003,0.465763 -0.2360649,0 -0.9501023,-0.446888 -1.4316163,-0.895993 l -0.5123388,-0.477854 0,1.059533 C 7.9924876,15.995521 7.9901047,16 7.4287881,16 l -0.5636994,0 0.2842418,-0.549663 z\"\n     >\n     <animate\n        id=\"frame5\"\n        attributeName=\"display\"\n        values=\"none;none;none;none;inline;none\"\n        keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n        dur=\"1s\"\n        begin=\"0s\"\n        repeatCount=\"indefinite\" />\n     </path>\n</g>\n</g>\n</svg>\n<div class=\"yo-loading {loading}\">\n    <span class=\"inner\">\n        <i class=\"yo-ico\"></i>\n        <div class=\"svg\">\n            <svg viewBox=\"10 0 30 25\" class=\"yo-camel\">\n                <use style=\"background:#fff;\" xlink:href=\"#camel-loading-svg\"></use>\n            </svg>\n        </div>\n        <p>{ content }</p>\n    </span>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["camel-loading"];

    })( module.exports , module , __context );
    __context.____MODULES[ "5cd024e95964e0a41909521035e8fb99" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6885a5bf1f2b771eb900d388f09e1071" ,
        filename : "camel-loading.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var tpl  =__context.____MODULES['5cd024e95964e0a41909521035e8fb99'];

riot.tag('camel-loading',tpl,_camel);

function _camel(opts) {
    this.content = opts.content || '加载中...';
    this.bgcolor = opts.bgcolor || '#1ba9ba';
    this.color   = opts.color || '#1ba9ba';
    this.loading = opts.loading || 'yo-loading-camel';
    this.fill    = opts.fill || "#f2f8fb";
    this.id      = opts["svg-id"] || "camel-loading-svg";
};


    })( module.exports , module , __context );
    __context.____MODULES[ "6885a5bf1f2b771eb900d388f09e1071" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ba7d80cc1220cceeb8e387850774f2d3" ,
        filename : "tag.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot      =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var listGroup =__context.____MODULES['35417eeb4ad8d2504d414bdd54a06bf7'];
var cardList  =__context.____MODULES['6a59baf5c8a91cdf4d5bd7d9002f84ed'];
var index     =__context.____MODULES['80f70411422d3274ef3f9d945e5627f5'];

var header =__context.____MODULES['a707d2fafba8acb2df475d59add98ccf'];
__context.____MODULES['1a01fde20fceccaa502f7cf0bc828821'];
__context.____MODULES['6885a5bf1f2b771eb900d388f09e1071'];


riot.tag('bindcard-list-index',index,_index);
var mIndex = null;
function _index(opt) {
    var self = this;
    this.error   = opt.error;
    this.loading = opt.loading;
    this.ok      = !opt.error && !opt.loading;

    this.affirm = ( opt.error || opt.loading )? "": "编辑";

    this.setHead = function (ShowEdit) {
        var header = self.tags["yo-header"];
        if(!ShowEdit) {
            header.affirm = "";
        }else{
            header.affirm = "编辑";
        }
        self.update();
    };
    this.on('mount',function() {
        mIndex = this;
    });
};

riot.tag('bindcard-list-group',listGroup,_listGroup);
function _listGroup(opt) {
    this.addAction = "add";
    this.addIcon   = "\uf068";
    this.addText   = "添加银行卡";
    this.rightIcon = "\uf07f";
    this.card      = opt.data;

    this.on('mount',function() {
        mIndex && mIndex.setHead(opt.data.bandCardList.length);
    });
};

riot.tag('bindcard-card-list',cardList,_cardList);
function _cardList(opt) {
    var _bank = opt.data.bandCardList;

    for(var i = 0; i <= _bank.length; i ++){
        for(item in _bank[i]){
            if(item == "picUrl"){
                _bank[i].picUrl = _bank[i].picUrl.replace(/http:\/\/source.qunar.com/, "https://source.qunarzz.com");
            }
        }
    }

    _bank.forEach(function(_b) {
        for(var key in _b) {
            switch (key) {
                case "cardType":
                    _b[key] = _b[key]==1?"储蓄卡":"信用卡";
                    break;
                case "bandCardType":
                    _b["touchidPay"] = "";
                    if( _b[key]==3 || _b[key]==4 ) {
                        _b["touchidPay"] = "指纹卡";
                    }
                    break;
                case "bankName":
                    _b[key] = _b[key].replace(/\(.*\)/,'');
                    break;
            }
        }
    });

    this.bank = _bank;
};


    })( module.exports , module , __context );
    __context.____MODULES[ "ba7d80cc1220cceeb8e387850774f2d3" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c9be9371565cc04258144148a1034088" ,
        filename : "bind.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    initPage : _init
};

var riot =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var $    =__context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];
var ua   =__context.____MODULES['e40338c22954d82670dedba25594be89'];

function _init() {
    var self = this;
    riot.mount('bindcard-list-index',{loading:true});
    _getCards(function(data) {
        riot.mount('bindcard-list-index');
        _makePanel(data);
    });

    function _getCards(afterGetCards) {
        var ajaxOpts = {};
            ajaxOpts.url    = self.urls.getCards;
        var ajax = self.ajax(ajaxOpts);
            ajax.done(__ajaxOK);
            ajax.fail(__ajaxFail);

        function __ajaxOK(res) {
            if(res.status == 0){
                afterGetCards(res.data.data);
                self.paramCache["busiTypeId"]   = res.data["busiTypeId"];
                self.paramCache["merchantCode"] = res.data["merchantCode"];
            }else{
                __ajaxFail();
            }
        };
        function __ajaxFail() {
            riot.mount('bindcard-list-index',{error:true});
        };
    };

    function _makePanel(data) {
        var panelOpts = {};
        panelOpts.onReady    = _on(_panelReady);
        panelOpts.canLockY   = true;
        panelOpts.extraClass = "flex card-panel";
        QApp.showWidget("scrollPanel",self.find("wrapper")[0],panelOpts);

        function _panelReady() {
            var panel = this;
            var panelHTML='<bindcard-list-group class="yo-list yo-list-group"></bindcard-list-group>';

            panel.html(panelHTML);
            riot.mount("bindcard-list-group",{data:data});

            if(data.bandCardList.length) __makeSlider();

            __marginBottom();
            panel.resize();

            function __makeSlider() {
                var sliderOpts = {};
                    sliderOpts.ontap = _on(__sliderTap);
                QApp.showWidget("slider",self.find("card"),sliderOpts);

                function __sliderTap(e) {
                    var slider = this;
                    var target = $(e).parents("[data-role=slideMenuItem]");

                    self.fireAction('remove','tap',{slider:slider,target:target},e);
                };

                $("[data-role=slideMenuCnt]").on('tap swipe',function(e){
                    var root   = self.root;
                    var affirm = $("[action-type=right]",root);
                    if(affirm.text() == "完成") {
                        affirm.text("编辑");
                    }
                });
            };

            function __marginBottom() {
                var _panelHeight = panel._panelHeight;
                var _rollHeight  = panel._scroller[0].clientHeight;

                if(_panelHeight>_rollHeight) {
                    var footer = self.find("footer")[0];
                    var header = 44;
                    if(/qunariphone/.test(ua())) header += 20;
                    footer.style.marginTop = _panelHeight-_rollHeight-header+"px";
                }else{
                    var addition = 44;
                    if(/qunariphone/.test(ua())) addition += 20;
                    $(panel._scroller[0]).css('height',_rollHeight+addition);
                }
            };
        };
    };
}

function _on(fn) {
    return function(e) {
        return fn.call(this,e);
    }
};


    })( module.exports , module , __context );
    __context.____MODULES[ "c9be9371565cc04258144148a1034088" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bd889a360348d351e259484631948d44" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    remove  : remove,
    edit    : edit,
    add     : add,
    actived : actived,
    close   : close
};

var riot =__context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var $    =__context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];

function remove(e) {
    var self   = this;
    var slider = e.evt.slider;
    var target = e.evt.target;

    _makeDialog(_ajax);

    function _makeDialog(callback) {
        var dialogOpts = {};
        dialogOpts.content    ="下次支付需要填写完整的银行卡信息，您确定删除吗？";
        dialogOpts.cancelText = "取消";
        dialogOpts.okText     = "删除";
        dialogOpts.onok       = __dlgOK;
        dialogOpts.oncancel   = __dlgReg;

        QApp.showWidget("cardAlert",dialogOpts);

        function __dlgOK() {
            var dlg = this;
            dlg.hide();
            callback();
        };

        function __dlgReg() {
            var dlg = this;
            dlg.hide();
        };
    };

    function _ajax() {
        var ajaxOpts = {};
            ajaxOpts.url           = self.urls.removeCard;
            ajaxOpts.method        = "post";
            ajaxOpts.argsType      = "json";
            ajaxOpts.args          = {
                cardNo   : target.data('card'),
                pBankId  : target.data('pbankid'),
                bindType : target.data('cardtype')
            };

        var ajax = self.ajax(ajaxOpts);
            ajax.done(__ajaxOK);
            ajax.fail(__ajaxFail);

        function __ajaxOK(res) {
            if(res.status == 0){
                self.initPage();
            }else{
                __ajaxFail(res.statusmsg);
            }
        };
        function __ajaxFail(err) {

            if(typeof err !== "string"){
                err = "网络错误";
            }

            QApp.showWidget("tips",{content:err});
        };
    };
};

function edit(e) {
    var el     = $(e.el);
    var slider = Kami.sliderCache;

    if(el.text() == "编辑") {
        $('[data-role="slideMenuCnt"]').forEach(function(elem) {
            slider.setOpen(elem,true);
        });
        el.text("完成");
    }else{
        $('[data-role="slideMenuCnt"]').forEach(function(elem) {
            slider.setOpen(elem,false);
        });
        el.text("编辑");
    }
};

function add(e) {
    var self = this;
    var _param = {};
        _param.data = {
            isObtainCoupon : 0,
            cardType       : 'ALL',
            bindCardSource : 'WLPay_bind',
            returnURL      : '',
        };
    $.extend(_param.data,self.paramCache);
    $.extend(_param,self.param,{from:"list"});
    try{//在反复跳转的过程中会throw出错误，但是并不影响js的运行
            QApp.router.goto('bindcard.boundcard',{
                param:_param
                // ,ani:"moveEnter"//动画用css3的淡入
            },_param,function() {
                riot.mount('bindcard-list-index',{loading:true});
            });
    }catch(e){}
};

function close(e) {
    var self    = this;
    var closeMe =__context.____MODULES['ddb923836814fcf8a947a1715e3a56af'];

    closeMe(self.param.from,self.param);
};

function actived(e) {
    var self   = this;
    self.initPage();
};


    })( module.exports , module , __context );
    __context.____MODULES[ "bd889a360348d351e259484631948d44" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "98795bf6270a03fd161e9846ba27312a" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var _            = QApp.util;
var    riot      = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var    _tag      = __context.____MODULES['ba7d80cc1220cceeb8e387850774f2d3'];
var _bind        = __context.____MODULES['c9be9371565cc04258144148a1034088'];
var _event       = __context.____MODULES['bd889a360348d351e259484631948d44'];
var    html      = __context.____MODULES['80f70411422d3274ef3f9d945e5627f5'];

QApp.defineView("bindcard.list", {
    html: "<bindcard-list-index></bindcard-list-index>",
    classNames:['m-list'],
    plugins: ["doms", "delegated", "ajax"],
    init: {
        urls:{
            getCards   : "/mobile/h5/asset/card/queryUserBindCardList.htm",
            removeCard : "/mobile/h5/asset/card/removeUserBindCard.htm"
        },
        initPage:_on(_bind.initPage),
        paramCache:{}
    },
    bindEvents:{
        'actived':_on(_event.actived)
    },
    bindActions:{
        'remove':_on(_event.remove),
        'right':_on(_event.edit),
        'add':_on(_event.add),
        'left':_on(_event.close)
    },
    ready:function(){}
});

function _on(fn){
    return function(e){
        return fn.call(this,e);
    }
}


    })( module.exports , module , __context );
    __context.____MODULES[ "98795bf6270a03fd161e9846ba27312a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b33b32fc3a7cbbd3e2f12df9c97feb93" ,
        filename : "bindpro.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["bindpro"] = "<div class=\"yo-flex bindcard-protocol\">\n    <yo-header class=\"yo-header m-header dp\" style=\"z-index:999;visibility:hidden;\"></yo-header>\n    <protocol class=\"protocol-content dp\"></protocol>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["bindpro"];

    })( module.exports , module , __context );
    __context.____MODULES[ "b33b32fc3a7cbbd3e2f12df9c97feb93" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "78b44a158afc66a01fe76d572eb40b0e" ,
        filename : "protocol.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["protocol"] = "<div class=\"wrapper\">\n    <iframe src=\"{agreement}\"></iframe>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["protocol"];

    })( module.exports , module , __context );
    __context.____MODULES[ "78b44a158afc66a01fe76d572eb40b0e" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "0d5da3e4abbce193c7500f330b381a1b" ,
        filename : "tag.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot      = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var index     = __context.____MODULES['78b44a158afc66a01fe76d572eb40b0e'];

riot.tag("protocol",index,_index);

function _index(opts){
    this.agreement = opts.agreement;
}


    })( module.exports , module , __context );
    __context.____MODULES[ "0d5da3e4abbce193c7500f330b381a1b" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "dbb59776cd550e97025feab8ad0e0ecb" ,
        filename : "bind.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports={
    initPage : _initPage,
    renderPage : _renderPage
};

var riot = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var Panel = __context.____MODULES['c2d3f4768a0011f9ccb778703432f254'];

function _initPage(){
    var self = this;
    self.renderPage();
}

function _renderPage(){
    var self = this;
    var riotOpts = self.param;
    riot.mount("protocol",riotOpts);
    riot.mount("yo-header",self.param);
    var a = document.getElementsByClassName(".wrap_body");
    a.style="display:none";
}


    })( module.exports , module , __context );
    __context.____MODULES[ "dbb59776cd550e97025feab8ad0e0ecb" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "626645e6a81fdc39211676e4e3d8c06f" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    back : _back
};

function _back(){
    var self = this;
    self.hide();
}


    })( module.exports , module , __context );
    __context.____MODULES[ "626645e6a81fdc39211676e4e3d8c06f" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "d9b081afc962083e11dbad5ab77ba940" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var _        = QApp.util;
var html     = __context.____MODULES['b33b32fc3a7cbbd3e2f12df9c97feb93'];
var _riot    = __context.____MODULES['0d5da3e4abbce193c7500f330b381a1b'];
var riot     = __context.____MODULES['f8fe06789b5d8adc0f656022eef1fd51'];
var _bind    = __context.____MODULES['dbb59776cd550e97025feab8ad0e0ecb'];
var _event   = __context.____MODULES['626645e6a81fdc39211676e4e3d8c06f'];
var $        =__context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];

QApp.defineView("bindcard.protocol",{
    html : html,
    plugins: ["alert", "doms", "delegated", "ajax"],
    classNames: ["m-protocol"],
    init : {
        initPage:_on(_bind.initPage),
        renderPage : _on(_bind.renderPage)
    },
    bindActions:{
        "left" : _on(_event.back)
    },
    ready : function(){
        var self = this;
        self.initPage();
    }
})

function _on(fn){
    return function(e){
        return fn.call(this,e);
    }
}


    })( module.exports , module , __context );
    __context.____MODULES[ "d9b081afc962083e11dbad5ab77ba940" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "465ff986500a058412c147261b408fd3" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    //QApp
window.QApp = __context.____MODULES['017476039f552853ecf216957daea213'];
window.QApp.util = __context.____MODULES['f9c4b0992faed28c88a4ede2a56e29c7'];

//Kami
window.Kami = window.Kami || {};
window.Kami._widgetCache = window.Kami._widgetCache || {};
window.Kami.disableTapEvent = true;
window.Kami.KamiTips    = __context.____MODULES['412fdafd4e2b7739c300811c531dafa9'];
window.Kami.KamiAlert   = __context.____MODULES['089ac77de682ff7ac4fc6a86ca7f2431'];
window.Kami.KamiCal     = __context.____MODULES['4326416a2bb9829a6bb5c91ccbd1794d'];
window.Kami.cardAlert   = __context.____MODULES['e3db554a754df2770a450036fdbc5e81'];
window.Kami.msgAlert    = __context.____MODULES['6552dbc77fee89e7ca3b910b88df2c08'];
window.Kami.slider      = __context.____MODULES['95a5e032abb8ca75dc8b19dcaebd6928'];
window.Kami.panel       = __context.____MODULES['c2d3f4768a0011f9ccb778703432f254'];
window.Kami.loading     = __context.____MODULES['9dac193de1362a3274188a9f8ae24032'];

//QunarAPI

//Views
__context.____MODULES['6fd83bdb0517910643b01f98c2c4467a'];
__context.____MODULES['8206b695d252b0f34e82cf8994d87259'];
__context.____MODULES['c4154973643f5570f04455aa3c9619da'];
__context.____MODULES['98795bf6270a03fd161e9846ba27312a'];
__context.____MODULES['d9b081afc962083e11dbad5ab77ba940'];


    })( module.exports , module , __context );
    __context.____MODULES[ "465ff986500a058412c147261b408fd3" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "d0dc75c804e23230ad1fa244c8c431ec" ,
        filename : "tocca.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 *
 * Version: 0.1.7
 * Author: Gianluca Guarini
 * Contact: gianluca.guarini@gmail.com
 * Website: http://www.gianlucaguarini.com/
 * Twitter: @gianlucaguarini
 *
 * Copyright (c) Gianluca Guarini
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 **/

(function(doc, win) {
  'use strict'
  if (typeof doc.createEvent !== 'function') return false // no tap events here
  // helpers
  var useJquery = typeof jQuery !== 'undefined',
    // some helpers borrowed from https://github.com/WebReflection/ie-touch
    msPointerEnabled = !!navigator.pointerEnabled || navigator.msPointerEnabled,
    isTouch = (!!('ontouchstart' in win) && navigator.userAgent.indexOf('PhantomJS') < 0) || msPointerEnabled,
    msEventType = function(type) {
      var lo = type.toLowerCase(),
        ms = 'MS' + type
      return navigator.msPointerEnabled ? ms : lo
    },
    touchevents = {
      touchstart: msEventType('PointerDown') + ' touchstart',
      touchend: msEventType('PointerUp') + ' touchend',
      touchmove: msEventType('PointerMove') + ' touchmove'
    },
    setListener = function(elm, events, callback) {
      var eventsArray = events.split(' '),
        i = eventsArray.length

      while (i--) {
        elm.addEventListener(eventsArray[i], callback, false)
      }
    },
    getPointerEvent = function(event) {
      return event.targetTouches ? event.targetTouches[0] : event
    },
    getTimestamp = function () {
      return new Date().getTime()
    },
    sendEvent = function(elm, eventName, originalEvent, data) {
      var customEvent = doc.createEvent('Event')
      customEvent.originalEvent = originalEvent
      data = data || {}
      data.x = currX
      data.y = currY
      data.distance = data.distance

      // jquery
      if (useJquery) {
        customEvent = $.Event(eventName, {originalEvent: originalEvent})
        jQuery(elm).trigger(customEvent, data)
      }

      // addEventListener
      if (customEvent.initEvent) {
        for (var key in data) {
          customEvent[key] = data[key]
        }
        customEvent.initEvent(eventName, true, true)
        elm.dispatchEvent(customEvent)
      }

      // inline
      if (elm['on' + eventName])
        elm['on' + eventName](customEvent)
    },

    onTouchStart = function(e) {
      var pointer = getPointerEvent(e)
      // caching the current x
      cachedX = currX = pointer.pageX
      // caching the current y
      cachedY = currY = pointer.pageY

      longtapTimer = setTimeout(function() {
          sendEvent(e.target,'longtap', e)
          target= e.target
      }, longtapThreshold);

      timestamp = getTimestamp()
      tapNum++
      // we will use these variables on the touchend events
    },
    onTouchEnd = function(e) {

      var eventsArr = [],
        now = getTimestamp(),
        deltaY = cachedY - currY,
        deltaX = cachedX - currX

      // clear the previous timer in case it was set
      clearTimeout(tapTimer)
      clearTimeout(longtapTimer)

      if (deltaX <= -swipeThreshold)
        eventsArr.push('swiperight')

      if (deltaX >= swipeThreshold)
        eventsArr.push('swipeleft')

      if (deltaY <= -swipeThreshold)
        eventsArr.push('swipedown')

      if (deltaY >= swipeThreshold)
        eventsArr.push('swipeup')

      if (eventsArr.length) {
        for (var i = 0; i < eventsArr.length; i++) {
          var eventName = eventsArr[i]
          sendEvent(e.target, eventName, e, {
            distance: {
              x: Math.abs(deltaX),
              y: Math.abs(deltaY)
            }
          })
        }
      } else {

        if (
          cachedX >= currX - tapPrecision &&
          cachedX <= currX + tapPrecision &&
          cachedY >= currY - tapPrecision &&
          cachedY <= currY + tapPrecision
        ) {
          if((timestamp + tapThreshold) - now >= 0)
          {
            // Here you get the Tap event
            sendEvent(e.target, (tapNum === 2) && (target === e.target) ? 'dbltap' : 'tap', e)
            target= e.target
          }
        }

        // reset the tap counter
        tapTimer = setTimeout(function() {
          tapNum = 0
        }, dbltapThreshold)

      }
    },
    onTouchMove = function(e) {
      var pointer = getPointerEvent(e)
      currX = pointer.pageX
      currY = pointer.pageY
    },
    swipeThreshold = win.SWIPE_THRESHOLD || 100,
    tapThreshold = win.TAP_THRESHOLD || 150, // range of time where a tap event could be detected
    dbltapThreshold = win.DBL_TAP_THRESHOLD || 200, // delay needed to detect a double tap
    longtapThreshold = win.LONG_TAP_THRESHOLD || 1000, // delay needed to detect a long tap
    tapPrecision = win.TAP_PRECISION / 2 || 60 / 2, // touch events boundaries ( 60px by default )
    justTouchEvents = win.JUST_ON_TOUCH_DEVICES || isTouch,
    tapNum = 0,
    currX, currY, cachedX, cachedY, tapTimer, timestamp, target, longtapTimer

  //setting the events listeners
  setListener(doc, touchevents.touchstart + (justTouchEvents ? '' : ' mousedown'), onTouchStart)
  setListener(doc, touchevents.touchend + (justTouchEvents ? '' : ' mouseup'), onTouchEnd)
  setListener(doc, touchevents.touchmove + (justTouchEvents ? '' : ' mousemove'), onTouchMove)
}(document, window));


    })( module.exports , module , __context );
    __context.____MODULES[ "d0dc75c804e23230ad1fa244c8c431ec" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bc652a9cac55b5c2bad5ecd40a73ca4c" ,
        filename : "active.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    document.body.addEventListener('touchstart', function () {
    //webkit浏览器需要这个代码块以激活:active伪类,解释如下
    //https://developer.mozilla.org/en-US/docs/Web/CSS/:active
});


    })( module.exports , module , __context );
    __context.____MODULES[ "bc652a9cac55b5c2bad5ecd40a73ca4c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "d5709ff995c48321f18376708bcdd5d4" ,
        filename : "scroll.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    document.addEventListener('touchmove',function(e) {
        e.preventDefault();
},false);


    })( module.exports , module , __context );
    __context.____MODULES[ "d5709ff995c48321f18376708bcdd5d4" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "06cdb605b0a725a6eb530d36e7be866d" ,
        filename : "common.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var mojo =__context.____MODULES['017476039f552853ecf216957daea213'],
    initApp =__context.____MODULES['6d0ca3ce71dd4c4751cc8941e8cb475b'],
    initRoute =__context.____MODULES['ae214ffd680da3b2049f2dc9092bd578'];

module.exports = initApp()
                 .then(initRoute);

//Views
__context.____MODULES['465ff986500a058412c147261b408fd3'];

//Hacks
__context.____MODULES['d0dc75c804e23230ad1fa244c8c431ec'];
__context.____MODULES['bc652a9cac55b5c2bad5ecd40a73ca4c'];
__context.____MODULES['d5709ff995c48321f18376708bcdd5d4'];


    })( module.exports , module , __context );
    __context.____MODULES[ "06cdb605b0a725a6eb530d36e7be866d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "673f20db0884f8ce3aec3c8b242a3193" ,
        filename : "bindcard.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    alert(2)
var common =__context.____MODULES['06cdb605b0a725a6eb530d36e7be866d'];

common.then(function() {

});


    })( module.exports , module , __context );
    __context.____MODULES[ "673f20db0884f8ce3aec3c8b242a3193" ] = module.exports;
})(this);
