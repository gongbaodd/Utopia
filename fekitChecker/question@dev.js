
;(function(__context){
    var module = {
        id : "49dd278f29117ff42d363e904cef1cef" ,
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
    __context.____MODULES[ "49dd278f29117ff42d363e904cef1cef" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6ff26f64e843858472e072cd3933ad28" ,
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
    __context.____MODULES[ "6ff26f64e843858472e072cd3933ad28" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c7b0b3df98e7837101ce2655fb939281" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['6ff26f64e843858472e072cd3933ad28']

    })( module.exports , module , __context );
    __context.____MODULES[ "c7b0b3df98e7837101ce2655fb939281" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "001201cdcb954cc2e4d5831d99c4b531" ,
        filename : "defineView.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];

module.exports = function( name, option) {
    var mojo = this;
    var tags = mojo.tags;
    var name = name.replace('.','-');

    tags[name] = {
        option: option,
        ready: option.ready
    };

    for (var key in option.init) {
        if (option.init.hasOwnProperty(key)) {
            tags[name][key] = option.init[key];
        }
    }
};


    })( module.exports , module , __context );
    __context.____MODULES[ "001201cdcb954cc2e4d5831d99c4b531" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6bee53f0a07b8d1f5e43ce208e628864" ,
        filename : "oldapi.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var oldBridge = {};

oldBridge.ready = function (callback) {
    if (window.QunarJSBridge) {
        callback(window.QunarJSBridge);
    } else {
        document.addEventListener("QunarJSBridgeReady_v1", function () {
            callback(window.QunarJSBridge);
        }, false);
    }
}

module.exports = oldBridge;


    })( module.exports , module , __context );
    __context.____MODULES[ "6bee53f0a07b8d1f5e43ce208e628864" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9a4e65a3281149da9ab4852727804f17" ,
        filename : "show.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var old  = __context.____MODULES['6bee53f0a07b8d1f5e43ce208e628864'];

module.exports = function(name) {
    var _name = name.replace('.','-');
    var mojo = this;
    var tags = mojo.tags;

    document.addEventListener('WebViewJavascriptBridgeReady',function(event) {
        mojo.bridge    = event.bridge;
        mojo.api       = 'NEW';
    });

    setTimeout(function(){
        if (!mojo.bridge) {
            mojo.api       = 'OLD';
            old.ready(function(bridge) {
                mojo.bridge = bridge;
            });
        }
        mojo.currentTag = _name;
        riot.route(name);
        riot.route.exec();
    },1000);
};


    })( module.exports , module , __context );
    __context.____MODULES[ "9a4e65a3281149da9ab4852727804f17" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4e8df976b60b3a8678c6a9b6bddd344a" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var _util = __context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];
var _defineView = __context.____MODULES['001201cdcb954cc2e4d5831d99c4b531'];
var _show = __context.____MODULES['9a4e65a3281149da9ab4852727804f17'];

var mojo = {
    util: _util,
    app: null,
    defineView: _defineView,
    show: _show,
    currentTag: "",
    _viewCache:{},
    tags: {}
};

// debug
// window.mojo = mojo;

module.exports = mojo;


    })( module.exports , module , __context );
    __context.____MODULES[ "4e8df976b60b3a8678c6a9b6bddd344a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e61f36f5986ba8a952697caa9e86c301" ,
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
    if(/.*iphone.*/.test(ua))      		return "iphone";
    if(/.*android.*/.test(ua))      	return "aphone";
    if(/.*linux.*/.test(ua))         	return "aphone";

    return "";
}


    })( module.exports , module , __context );
    __context.____MODULES[ "e61f36f5986ba8a952697caa9e86c301" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b7b4126b8cb7e53d77c54138db0c4807" ,
        filename : "index.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["index"] = "<yo-header title=\"答题领红包\" action=\"{closeMe}\"></yo-header>\n\n<camel-loading class=\"flex yo-flex yo-loading-camel\" if= \"{loading}\" ></camel-loading>\n\n<yo-error class=\"flex yo-flex ani fade-in\" if= \"{error}\" ></yo-error>\n<div class=\"float-up ani fade-in-up-fast\" if=\"{opt.ret}\">\n    <coupon-question-banner class=\"m-coupon-question-banner\" description=\"{opt.data.description}\" ></coupon-question-banner>\n\n    <div class=\"m-coupon-question-tips\" if=\"{opt.data.tips}\" >\n        {opt.data.tips}\n    </div>\n\n    <form class=\"m-coupon-question-list panel-wrapper yo-panel flex\" onsubmit={submit} ></form>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["index"];

    })( module.exports , module , __context );
    __context.____MODULES[ "b7b4126b8cb7e53d77c54138db0c4807" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "05086ce277b1fc4c5620d4b8632ff482" ,
        filename : "on.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = function(fn) {
    return function() {
        return fn.apply(this,arguments);
    }
};


    })( module.exports , module , __context );
    __context.____MODULES[ "05086ce277b1fc4c5620d4b8632ff482" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1d21c70d352334874b21ac9eae3ebf56" ,
        filename : "ajax.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    

/*

* Name: xhr,AJAX封装函数

* Description: 一个ajax调用封装类,仿jquery的ajax调用方式

* Author:jian.gong

*/

var xhr = function () {

    var ajax = function  () {

        return ('XMLHttpRequest' in window) ? function  () {

                return new XMLHttpRequest();

            } : function  () {

            return new ActiveXObject("Microsoft.XMLHTTP");

        }

    }(),

    formatData= function (fd) {

        var res = '';

        for(var f in fd) {

            res += f+'='+fd[f]+'&';

        }

        return res.slice(0,-1);

    },

    AJAX = function(ops) {

        var

        root = this,

        req = ajax();
         root.url = ops.url;

        root.type = ops.type || 'responseText';

        root.contentType = ops.contentType || 'application/x-www-form-urlencoded';

        root.method = ops.method || 'GET';

        root.async = ops.async || true;

        root.data = ops.data || {};

        root.complete = ops.complete || function  () {};

        root.success = ops.success || function(){};

        root.error =  ops.error || function (s) { alert(root.url+'->status:'+s+'error!')};

        root.abort = req.abort;

        root.setData = function  (data) {

            for(var d in data) {

                root.data[d] = data[d];

            }

        }

        root.send = function  () {

            var datastring = root.contentType==='application/x-www-form-urlencoded'? formatData(root.data) : root.data,

            sendstring,get = false,

            async = root.async,

            complete = root.complete,

            method = root.method,

            type=root.type,

            contentType=root.contentType;

            if(method === 'GET') {

                root.url+='?'+datastring;

                get = true;

            }

            req.open(method,root.url,async);

            if(!get) {

                req.setRequestHeader("Content-type",contentType);

                sendstring = datastring;

            }
             //在send之前重置onreadystatechange方法,否则会出现新的同步请求会执行两次成功回调(chrome等在同步请求时也会执行onreadystatechange)

            req.onreadystatechange = async ? function  () {

                // console.log('async true');

                if (req.readyState ==4){

                    complete();

                    if(req.status == 200) {

                        root.success(req[type]);

                    } else {

                        root.error(req.status);

                    }

                }

            } : null;

            req.send(sendstring);

            if(!async) {

                //console.log('async false');

                complete();

                root.success(req[type]);

            }

        }

        root.url && root.send();

    };

    return function(ops) {return new AJAX(ops);}

}();

 module.exports = xhr;


    })( module.exports , module , __context );
    __context.____MODULES[ "1d21c70d352334874b21ac9eae3ebf56" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "fa9c625ffb9ec79041aba28582f9aa83" ,
        filename : "query2json.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

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
            // 如果只有key没有value, 那么将全部丢入一个$nullName数组中
            if (hash.length < 2) {
                value = key;
                key = '$nullName';
            }
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

    function decodeFormat(data, isDecode){
	    return isDecode ? decodeURIComponent(data) : data;
	}
}

module.exports = _queryToJson;


    })( module.exports , module , __context );
    __context.____MODULES[ "fa9c625ffb9ec79041aba28582f9aa83" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1ce55f56df18203b9aff395418baf054" ,
        filename : "bind.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    hideNativeBar: hideNativeBar,
    getQuestions: getQuestions,
    renderData: renderData,
    errorHandler: errorHandler
};

var ajax =__context.____MODULES['1d21c70d352334874b21ac9eae3ebf56'];
var old = __context.____MODULES['6bee53f0a07b8d1f5e43ce208e628864'];
var mojo = __context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var $ = mojo.util;
var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];

function getQuestions() {
    var self = this;
    var store = self.dataStore;
    var dataString = "";
    try {
        dataString = JSON.stringify({tokenId: store.tokenId});
    } catch (e) {}

    ajax({
        method: "POST",
        url: store.urls.question,
        contentType:"application/json",
        data: dataString,
        success: _ajaxOK,
        error: _ajaxFail
    });

    function _ajaxOK(res) {

        try {
            res = JSON.parse(res)
        } catch (e) {}

        if (res.ret) {
            self.Tag = riot.mount('coupon-question',res);
            store.res = res.data;
            store.exports = {
                amount: res.data.amount
            };
        } else {
            _ajaxFail();
        }
    };

    function _ajaxFail() {
        self.errorHandler();
    };
};


function renderData(callback) {
    var self = this;
    var store = self.dataStore;
    var query2JSON = __context.____MODULES['fa9c625ffb9ec79041aba28582f9aa83'];

    var search = window.location.search.replace('?','');

    try {
        search = query2JSON(search);
    } catch (e) {
        search = {};
    }

    if (search.tokenId) {
        store.tokenId = search.tokenId;
        callback();
    } else {
        self.errorHandler();
    }
};

function hideNativeBar() {
    old.ready(function(bridge) {
        $('coupon-question').css('padding-top','0');
        bridge.call('hideNativeBar');
    });
};

function errorHandler() {
    var LOADING_TIME = 1000;
    setTimeout(function() {
        self.Tag = riot.mount('coupon-question',{error:true});
    },LOADING_TIME);
};


    })( module.exports , module , __context );
    __context.____MODULES[ "1ce55f56df18203b9aff395418baf054" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e37d3ad0bb0cfec45407a1d080084b11" ,
        filename : "animate.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    scroll: scroll,
    listPad: listPad
}

var mojo =__context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var $    = mojo.util;

function scroll(y) {
    var header = $('yo-header');
    var banner = $('.m-coupon-question-banner');
    var tips = $('.m-coupon-question-tips');

    if (y<0) {
        header.addClass('moveUp');
        banner.addClass('moveUp');
        tips.addClass('moveUp');
    } else {
        header.removeClass('moveUp');
        banner.removeClass('moveUp');
        tips.removeClass('moveUp');
    }
};

function listPad() {
    var root = mojo.tags['coupon-question'].Tag[0].root;
    var header = $('yo-header',root).height();
    var banner = $('coupon-question-banner',root).height();
    var tips   = $('.m-coupon-question-tips',root).height();
    var list   = $('.yo-list-question',root);
    list.css('padding-top',(header+banner+tips)/100+'rem');
};


    })( module.exports , module , __context );
    __context.____MODULES[ "e37d3ad0bb0cfec45407a1d080084b11" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e039975073cbf98e3752e2aa35d2f5d3" ,
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
 * @category core
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
    __context.____MODULES[ "e039975073cbf98e3752e2aa35d2f5d3" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "07f7f5f1483551abfe3cb9260cc8c8d3" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['e039975073cbf98e3752e2aa35d2f5d3'];


    })( module.exports , module , __context );
    __context.____MODULES[ "07f7f5f1483551abfe3cb9260cc8c8d3" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9fdc82e50bd1e90d32ac8ca18a9e225a" ,
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
    __context.____MODULES[ "9fdc82e50bd1e90d32ac8ca18a9e225a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "28643231f1ee2617a2ae63ddb71835f7" ,
        filename : "attribute.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * @namespace Attribute
 * kami中属性的处理对象mixin到base中
 * @name {Object} Attribute
 * @private
 */
;(function () {
    'use strict';
    var Attribute = {
        /**
         * 合并和解析参数
         * 
         * @function initAttrs
         * @memberOf  Attribute
         * @private
         * @param  {Object} config 配置项
         */
        initAttrs : function (config) {
            
            var options = this.options = {};

            mergeInheritedOptions(options, this);

            if (config) {
                
                merge(options, config);
                
            }
            
            parseEventsFromOptions(this, options);

        },
        /**
         * 获取options中的参数
         * @function get
         * @memberOf  Attribute
         * @version  0.0.1
         * @param  {String} key key的名字
         * @return {Object}     对应的key的值
         * 
         */
        get: function (key) {
            var options = this.options;
            
            var value = null;
            if (options.hasOwnProperty(key)) {
                value = options[key];
            }
            
            return value;

        },
        /**
         * 设置options中的参数
         * @function set
         * @memberOf  Attribute
         * @param  {String} key key的名字
         * @param {Object}  value   对应的key的值
         */
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
        // var m = name.match(EVENT_NAME_PATTERN);
        // var ret = m[1] ? 'change:' : '';
        // ret += m[2].toLowerCase();
        // return ret;
        name = name || '';
        return name.toLowerCase();
    }

    return Attribute;
    
}());

    })( module.exports , module , __context );
    __context.____MODULES[ "28643231f1ee2617a2ae63ddb71835f7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4439998e396459c1ca2b6aa30c9bb65f" ,
        filename : "base.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * @class Base
 * 工具类组件的基类
 * @constructor
 * @mixin Attribute,Event
 * @category core
 */

;(function () {
    'use strict';

    var Kami =__context.____MODULES['07f7f5f1483551abfe3cb9260cc8c8d3'];
    var Event =__context.____MODULES['9fdc82e50bd1e90d32ac8ca18a9e225a'];
    
    var Attribute =__context.____MODULES['28643231f1ee2617a2ae63ddb71835f7'];
    
    var Base = Kami.create({
        Mixins: [Event, Attribute],

        /**
         * 初始化Kami组件
         * @param  {Object} config 用户传进来的选项
         * @memberOf  Base
         * @function initialize
         */
        initialize: function (config) {
           
            this.initAttrs(config);
        },
        /**
         * 销毁组件
         * @memberOf  Base
         * @function destroy
         */
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
    __context.____MODULES[ "4439998e396459c1ca2b6aa30c9bb65f" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "836629a8b44935f1b2ecae68e932a7c2" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['4439998e396459c1ca2b6aa30c9bb65f'];


    })( module.exports , module , __context );
    __context.____MODULES[ "836629a8b44935f1b2ecae68e932a7c2" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "aa5241bee014f98b7ae0194d4158534c" ,
        filename : "widget.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * Kami非工具类组件的基类，提供了组件的生命周期，初始化，渲染，销毁等
 * 
 * @author  sharon.li <xuan.li@qunar.com>
 * @class Widget
 * @constructor
 * @extends Base
 * @category core
 * @required yo-base, yo-ddd
 * 
 */
/**
 * @quote
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
    

    var $ =__context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];
    
    var Base =__context.____MODULES['836629a8b44935f1b2ecae68e932a7c2'];
    
    
    window.Kami = window.Kami || {};
    window.Kami._widgetCache = {};

    
    var EVENT_PREFIX = 'delegate-event-{cid}:';
    var DATA_WIDGET_CID = 'data-widget-cid';
    var DELEGATE_EVENT_NS = '.delegate-events-';
    var $PARENT_NODE = document.body;
    var Widget = Base.extend({
        /**
         * @property {HTMLElement| String} container @require组件的容器
         * @property {HTMLElement} parentNode 父容器，默认为body
         * @property {String} template 模板字符串
         * @property {String} skin 默认的皮肤
         * @property {String} extraClass 组件根节点添加的额外样式
         * @property {Boolean} resizable 组件是否会根据响应窗口变化事件，默认为true
         * @memberOf Widget
         */
        options: {
            //当前组件的类型
            type: 'widget',

            container: null,

            // // 默认数据模型
            // datasource: null,

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
            resizable: true //是否允许监听窗口resize
        },
        /**
         * 获取组件样式命名空间的前缀
         * @function  getClassNamePrefix
         * @memberOf  Widget
         * @private
         * @return {String} 返回组件命名空间前缀
         */
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
        /**
         * 获得组件的样式命名空间
         * @function  getClassName
         * @memberOf  Widget
         * @param  {String} name 样式名称
         * @return {String}   组件的样式命名空间
         */
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

        /**
         * 获得组件根节点
         * 获得组件的样式命名空间
         * @function  _getMainElement
         * @memberOf  Widget
         * @private
         * @param  {Object} config 配置项
         */
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
         * @function parseTemplate
         * @memberOf  Widget
         * @param  {String} tpl 模板字符串
         * @return {String}     解析后的模板字符串
         */
        parseTemplate : function (tpl) {
            return tpl || '';
        },
        
        /**
         * 组件初始化方法,initialize是new组件时调用的，而init是给子组件暴露的方法
         * 可以在该方法中绑定事件或者处理其他逻辑
         * @function init
         * @private
         * @memberOf  Widget
         */
        init : function () {

        },
        /**
         * 对参数进行初始化，内部调用Base的initialize方法来
         * 进行参数初始化
         * @function initialize
         * @private
         * @memberOf  Widget
         * @param  {Object} config  配置项
         * @return {Kami}        返回当前组件的实例
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
        /**
         * 缓存当前组件
         * 进行参数初始化
         * @memberOf  Widget
         * @function _cacheWidget
         * @private
         */
        _cacheWidget: function () {
            var cid = this.cid;
            Kami._widgetCache[this.cid] = this;
            this.widgetEl.attr(DATA_WIDGET_CID, cid);
            // debugger

        },
        /**
         * 渲染组件到页面中
         * 并且出发事件，方便用户处理在组件渲染后的行为
         * @function render
         * @memberOf  Widget
         * @return {Kami} 返回当前组件实例
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
         * @function resize
         * @memberOf  Widget
         */
        resize: function () {},
        /**
         * 不需要在代理到container的事件，解绑方法
         * 例如resize
         * @function __renderEvent
         * @memberOf  Widget
         * @private
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
         * @function __unrenderEvent
         * @memberOf  Widget
         * @private
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
         * @function delegateEvents
         * @memberOf  Widget
         * @param  {HTMLElement} element 代理事件的节点
         * @param  {Object} events  事件对象
         * @param  {Function} handler 事件的处理方法
         * @return {Kami}        返回Kami组件
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

        
        /**
         * 卸载事件代理
         * @function undelegateEvents
         * @memberOf  Widget
         * @param  {HTMLElement} element  需要卸载事件的节点
         * @param  {String} eventKey 需要卸载的事件名称
         * @return {Kami}        返回Kami组件
         */
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
        
        /**
         * 销毁组件
         * @function destroy
         * @memberOf  Widget
         */
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
    __context.____MODULES[ "aa5241bee014f98b7ae0194d4158534c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "baa80dc0359f340d87bd0936bbc6b20e" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['aa5241bee014f98b7ae0194d4158534c']

    })( module.exports , module , __context );
    __context.____MODULES[ "baa80dc0359f340d87bd0936bbc6b20e" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "f41ac386e8378c7921c0663731fd230d" ,
        filename : "arttemplate.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /*!
 * artTemplate - Template Engine
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */
 
!(function () {


/**
 * 模板引擎
 * @name    template
 * @param   {String}            模板名
 * @param   {Object, String}    数据。如果为字符串则编译并缓存编译结果
 * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
 */
var template = function (filename, content) {
    return typeof content === 'string'
    ?   compile(content, {
            filename: filename
        })
    :   renderFile(filename, content);
};


template.version = '3.0.0';


/**
 * 设置全局配置
 * @name    template.config
 * @param   {String}    名称
 * @param   {Any}       值
 */
template.config = function (name, value) {
    defaults[name] = value;
};



var defaults = template.defaults = {
    openTag: '{{#',    // 逻辑语法开始标签
    closeTag: '}}',   // 逻辑语法结束标签
    escape: true,     // 是否编码输出变量的 HTML 字符
    cache: true,      // 是否开启缓存（依赖 options 的 filename 字段）
    compress: false,  // 是否压缩输出
    parser: null      // 自定义语法格式器 @see: template-syntax.js
};


var cacheStore = template.cache = {};


/**
 * 渲染模板
 * @name    template.render
 * @param   {String}    模板
 * @param   {Object}    数据
 * @return  {String}    渲染好的字符串
 */
template.render = function (source, options) {
    return compile(source, options);
};


/**
 * 渲染模板(根据模板名)
 * @name    template.render
 * @param   {String}    模板名
 * @param   {Object}    数据
 * @return  {String}    渲染好的字符串
 */
var renderFile = template.renderFile = function (filename, data) {
    var fn = template.get(filename) || showDebugInfo({
        filename: filename,
        name: 'Render Error',
        message: 'Template not found'
    });
    return data ? fn(data) : fn;
};


/**
 * 获取编译缓存（可由外部重写此方法）
 * @param   {String}    模板名
 * @param   {Function}  编译好的函数
 */
template.get = function (filename) {

    var cache;
    
    if (cacheStore[filename]) {
        // 使用内存缓存
        cache = cacheStore[filename];
    } else if (typeof document === 'object') {
        // 加载模板并编译
        var elem = document.getElementById(filename);
        
        if (elem) {
            var source = (elem.value || elem.innerHTML)
            .replace(/^\s*|\s*$/g, '');
            cache = compile(source, {
                filename: filename
            });
        }
        else {
            var source = filename
            .replace(/^\s*|\s*$/g, '').replace(/<!--[\s\S]*?-->/g, '');
            cache = compile(source, {
                templateStr: filename
            });
        }
    }

    return cache;
};


var toString = function (value, type) {

    if (typeof value !== 'string') {

        type = typeof value;
        if (type === 'number') {
            value += '';
        } else if (type === 'function') {
            value = toString(value.call(value));
        } else {
            value = '';
        }
    }

    return value;

};


var escapeMap = {
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
    "'": "&#39;",
    "&": "&#38;"
};


var escapeFn = function (s) {
    return escapeMap[s];
};

var escapeHTML = function (content) {
    return toString(content)
    .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
};


var isArray = Array.isArray || function (obj) {
    return ({}).toString.call(obj) === '[object Array]';
};


var each = function (data, callback) {
    var i, len;        
    if (isArray(data)) {
        for (i = 0, len = data.length; i < len; i++) {
            callback.call(data, data[i], i, data);
        }
    } else {
        for (i in data) {
            callback.call(data, data[i], i);
        }
    }
};


var utils = template.utils = {

    $helpers: {},

    $include: renderFile,

    $string: toString,

    $escape: escapeHTML,

    $each: each
    
};/**
 * 添加模板辅助方法
 * @name    template.helper
 * @param   {String}    名称
 * @param   {Function}  方法
 */
template.helper = function (name, helper) {
    helpers[name] = helper;
};

var helpers = template.helpers = utils.$helpers;




/**
 * 模板错误事件（可由外部重写此方法）
 * @name    template.onerror
 * @event
 */
template.onerror = function (e) {
    var message = 'Template Error\n\n';
    for (var name in e) {
        message += '<' + name + '>\n' + e[name] + '\n\n';
    }
    
    if (typeof console === 'object') {
        console.error(message);
    }
};


// 模板调试器
var showDebugInfo = function (e) {

    template.onerror(e);
    
    return function () {
        return '{Template Error}';
    };
};


/**
 * 编译模板
 * 2012-6-6 @TooBug: define 方法名改为 compile，与 Node Express 保持一致
 * @name    template.compile
 * @param   {String}    模板字符串
 * @param   {Object}    编译选项
 *
 *      - openTag       {String}
 *      - closeTag      {String}
 *      - filename      {String}
 *      - escape        {Boolean}
 *      - compress      {Boolean}
 *      - debug         {Boolean}
 *      - cache         {Boolean}
 *      - parser        {Function}
 *
 * @return  {Function}  渲染方法
 */
var compile = template.compile = function (source, options) {
    // 合并默认配置
    options = options || {};
    for (var name in defaults) {
        if (options[name] === undefined) {
            options[name] = defaults[name];
        }
    }


    var filename = options.filename;


    try {
        var Render = compiler(source, options);
        
    } catch (e) {
    
        e.filename = filename || 'anonymous';
        e.name = 'Syntax Error';

        return showDebugInfo(e);
        
    }
    
    
    // 对编译结果进行一次包装

    function render (data) {
        
        try {
            
            return new Render(data, filename) + '';
            
        } catch (e) {
            
            // 运行时出错后自动开启调试模式重新编译
            if (!options.debug) {
                options.debug = true;
                return compile(source, options)(data);
            }
            
            return showDebugInfo(e)();
            
        }
        
    }
    

    render.prototype = Render.prototype;
    render.toString = function () {
        return Render.toString();
    };


    if (filename && options.cache) {
        cacheStore[filename] = render;
    }

    
    return render;

};




// 数组迭代
var forEach = utils.$each;


// 静态分析模板变量
var KEYWORDS =
    // 关键字
    'break,case,catch,continue,debugger,default,delete,do,else,false'
    + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
    + ',throw,true,try,typeof,var,void,while,with'

    // 保留字
    + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
    + ',final,float,goto,implements,import,int,interface,long,native'
    + ',package,private,protected,public,short,static,super,synchronized'
    + ',throws,transient,volatile'

    // ECMA 5 - use strict
    + ',arguments,let,yield'

    + ',undefined';

var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
var SPLIT_RE = /[^\w$]+/g;
var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
var BOUNDARY_RE = /^,+|,+$/g;
var SPLIT2_RE = /^$|,+/;


// 获取变量
function getVariable (code) {
    return code
    .replace(REMOVE_RE, '')
    .replace(SPLIT_RE, ',')
    .replace(KEYWORDS_RE, '')
    .replace(NUMBER_RE, '')
    .replace(BOUNDARY_RE, '')
    .split(SPLIT2_RE);
};


// 字符串转义
function stringify (code) {
    return "'" + code
    // 单引号与反斜杠转义
    .replace(/('|\\)/g, '\\$1')
    // 换行符转义(windows + linux)
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n') + "'";
}


function compiler (source, options) {
    
    var debug = options.debug;
    var openTag = options.openTag;
    var closeTag = options.closeTag;
    var parser = options.parser;
    var compress = options.compress;
    var escape = options.escape;
    

    
    var line = 1;
    var uniq = {$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1};
    


    var isNewEngine = ''.trim;// '__proto__' in {}
    var replaces = isNewEngine
    ? ["$out='';", "$out+=", ";", "$out"]
    : ["$out=[];", "$out.push(", ");", "$out.join('')"];

    var concat = isNewEngine
        ? "$out+=text;return $out;"
        : "$out.push(text);";
          
    var print = "function(){"
    +      "var text=''.concat.apply('',arguments);"
    +       concat
    +  "}";

    var include = "function(filename,data){"
    +      "data=data||$data;"
    +      "var text=$utils.$include(filename,data,$filename);"
    +       concat
    +   "}";

    var headerCode = "'use strict';"
    + "var $utils=this,$helpers=$utils.$helpers,"
    + (debug ? "$line=0," : "");
    
    var mainCode = replaces[0];

    var footerCode = "return new String(" + replaces[3] + ");"
    
    // html与逻辑语法分离
    forEach(source.split(openTag), function (code) {
        code = code.split(closeTag);
        
        var $0 = code[0];
        var $1 = code[1];
        
        // code: [html]
        if (code.length === 1) {
            
            mainCode += html($0);
         
        // code: [logic, html]
        } else {
            
            mainCode += logic($0);
            
            if ($1) {
                mainCode += html($1);
            }
        }
        

    });
    
    var code = headerCode + mainCode + footerCode;
    
    // 调试语句
    if (debug) {
        code = "try{" + code + "}catch(e){"
        +       "throw {"
        +           "filename:$filename,"
        +           "name:'Render Error',"
        +           "message:e.message,"
        +           "line:$line,"
        +           "source:" + stringify(source)
        +           ".split(/\\n/)[$line-1].replace(/^\\s+/,'')"
        +       "};"
        + "}";
    }
    
    
    
    try {
        
        
        var Render = new Function("$data", "$filename", code);
        Render.prototype = utils;

        return Render;
        
    } catch (e) {
        e.temp = "function anonymous($data,$filename) {" + code + "}";
        throw e;
    }



    
    // 处理 HTML 语句
    function html (code) {
        
        // 记录行号
        line += code.split(/\n/).length - 1;

        // 压缩多余空白与注释
        if (compress) {
            code = code
            .replace(/\s+/g, ' ')
            .replace(/<!--[\w\W]*?-->/g, '');
        }
        
        if (code) {
            code = replaces[1] + stringify(code) + replaces[2] + "\n";
        }

        return code;
    }
    
    
    // 处理逻辑语句
    function logic (code) {

        var thisLine = line;
       
        if (parser) {
        
             // 语法转换插件钩子
            code = parser(code, options);
            
        } else if (debug) {
        
            // 记录行号
            code = code.replace(/\n/g, function () {
                line ++;
                return "$line=" + line +  ";";
            });
            
        }
        
        
        // 输出语句. 编码: <%=value%> 不编码:<%=#value%>
        // <%=#value%> 等同 v2.0.3 之前的 <%==value%>
        if (code.indexOf('=') === 0) {
            var codeEscape = /^=[=#]/.test(code);
            var escapeSyntax = null;
            if (escape) {
                if (codeEscape) {
                    escapeSyntax = false;
                }
                else {
                    escapeSyntax = true;
                }
            }
            else {
                if (!codeEscape) {
                    escapeSyntax = false;
                }
                else {
                    escapeSyntax = true;
                }
            }
            
            // var escapeSyntax = escape ^ !/^=[=#]/.test(code);

            code = code.replace(/^=[=#]?|[\s;]*$/g, '');

            // 对内容编码
            if (escapeSyntax) {

                var name = code.replace(/\s*\([^\)]+\)/, '');

                // 排除 utils.* | include | print
                
                if (!utils[name] && !/^(include|print)$/.test(name)) {
                    code = "$escape(" + code + ")";
                }

            // 不编码
            } else {
                code = "$string(" + code + ")";
            }
            

            code = replaces[1] + code + replaces[2];

        }
        
        if (debug) {
            code = "$line=" + thisLine + ";" + code;
        }
        
        // 提取模板中的变量名
        forEach(getVariable(code), function (name) {
            
            // name 值可能为空，在安卓低版本浏览器下
            if (!name || uniq[name]) {
                return;
            }

            var value;

            // 声明模板变量
            // 赋值优先级:
            // [include, print] > utils > helpers > data
            if (name === 'print') {

                value = print;

            } else if (name === 'include') {
                
                value = include;
                
            } else if (utils[name]) {

                value = "$utils." + name;

            } else if (helpers[name]) {

                value = "$helpers." + name;

            } else {

                value = "$data." + name;
            }
            
            headerCode += name + "=" + value + ",";
            uniq[name] = true;
            
            
        });
        
        return code + "\n";
    }
    
    
};



// 定义模板引擎的语法


defaults.openTag = '{{';
defaults.closeTag = '}}';


var filtered = function (js, filter) {
    var parts = filter.split(':');
    var name = parts.shift();
    var args = parts.join(':') || '';

    if (args) {
        args = ', ' + args;
    }

    return '$helpers.' + name + '(' + js + args + ')';
}


defaults.parser = function (code, options) {

    // var match = code.match(/([\w\$]*)(\b.*)/);
    // var key = match[1];
    // var args = match[2];
    // var split = args.split(' ');
    // split.shift();

    code = code.replace(/^\s/, '');

    var split = code.split(' ');
    var key = split.shift();
    var args = split.join(' ');

    

    switch (key) {

        case 'if':

            code = 'if(' + args + '){';
            break;

        case 'else':
            
            if (split.shift() === 'if') {
                split = ' if(' + split.join(' ') + ')';
            } else {
                split = '';
            }

            code = '}else' + split + '{';
            break;

        case '/if':

            code = '}';
            break;

        case 'each':
            
            var object = split[0] || '$data';
            var as     = split[1] || 'as';
            var value  = split[2] || '$value';
            var index  = split[3] || '$index';
            
            var param   = value + ',' + index;
            
            if (as !== 'as') {
                object = '[]';
            }
            
            code =  '$each(' + object + ',function(' + param + '){';
            break;

        case '/each':

            code = '});';
            break;

        case 'echo':

            code = 'print(' + args + ');';
            break;

        case 'print':
        case 'include':

            code = key + '(' + split.join(',') + ');';
            break;

        default:

            // 过滤器（辅助方法）
            // {{value | filterA:'abcd' | filterB}}
            // >>> $helpers.filterB($helpers.filterA(value, 'abcd'))
            // TODO: {{ddd||aaa}} 不包含空格
            if (/^\s*\|\s*[\w\$]/.test(args)) {

                var escape = true;

                // {{#value | link}}
                if (code.indexOf('#') === 0) {
                    code = code.substr(1);
                    escape = false;
                }

                var i = 0;
                var array = code.split('|');
                var len = array.length;
                var val = array[i++];

                for (; i < len; i ++) {
                    val = filtered(val, array[i]);
                }

                code = (escape ? '=' : '=#') + val;

            // 即将弃用 {{helperName value}}
            } else if (template.helpers[key]) {
                
                code = '=#' + key + '(' + split.join(',') + ');';
            
            // 内容直接输出 {{value}}
            } else {

                code = '=' + code;
            }

            break;
    }
    
    
    return code;
};



// RequireJS && SeaJS
if (typeof define === 'function') {
    define(function() {
        return template;
    });

// NodeJS
} else if (typeof exports !== 'undefined') {
    module.exports = template;
} else {
    this.template = template;
}

})();

    })( module.exports , module , __context );
    __context.____MODULES[ "f41ac386e8378c7921c0663731fd230d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e9d91ae35de159c997aca76da9ccb8f6" ,
        filename : "template.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var template =__context.____MODULES['f41ac386e8378c7921c0663731fd230d'];
template.config('parser', parser);
template.config('escape', false);
function parser(code, options) {

    // var match = code.match(/([\w\$]*)(\b.*)/);
    // var key = match[1];
    // var args = match[2];
    // var split = args.split(' ');
    // split.shift();

    code = code.replace(/^\s/, '');

    var split = code.split(/\s+/);
    var key = split.shift();
    var args = split.join(' ');

    

    switch (key) {

        case 'if':
        case '#if':

            code = 'if(' + args + '){';
            break;

        case 'else':
        case '#else':
            if (split.shift() === 'if') {
                split = ' if(' + split.join(' ') + ')';
            } else {
                split = '';
            }

            code = '}else' + split + '{';
            break;

        case '/if':

            code = '}';
            break;

        case 'each':
        case '#each':    
            var object = split[0] || '$data';
            var as     = split[1] || 'as';
            var value  = split[2] || '$value';
            var index  = split[3] || '$index';
            
            var param   = value + ',' + index;
            
            if (as !== 'as') {
                object = '[]';
            }
            
            code =  '$each(' + object + ',function(' + param + '){';
            break;

        case '/each':

            code = '});';
            break;

        case 'echo':
        case '#echo':
            code = 'print(' + args + ');';
            break;

        case 'print':
        case 'include':
        case '#print':
        case '#include':
        

            code = key + '(' + split.join(',') + ');';
            break;

        default:

            // 过滤器（辅助方法）
            // {{value | filterA:'abcd' | filterB}}
            // >>> $helpers.filterB($helpers.filterA(value, 'abcd'))
            // TODO: {{ddd||aaa}} 不包含空格
            if (/^\s*\|\s*[\w\$]/.test(args)) {

                var escape = true;

                // {{#value | link}}
                if (code.indexOf('#') === 0) {
                    code = code.substr(1);
                    escape = false;
                }

                var i = 0;
                var array = code.split('|');
                var len = array.length;
                var val = array[i++];

                for (; i < len; i ++) {
                    val = filtered(val, array[i]);
                }

                code = (escape ? '=' : '=#') + val;

            // 即将弃用 {{helperName value}}
            } else if (template.helpers[key]) {
                
                code = '=#' + key + '(' + split.join(',') + ');';
            
            // 内容直接输出 {{value}}
            } else {

                code = '=' + code;
            }

            break;
    }
    
    
    return code;
};
module.exports = template;


    })( module.exports , module , __context );
    __context.____MODULES[ "e9d91ae35de159c997aca76da9ccb8f6" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "244e1a5887dd19ba4ca7fba09c6774ab" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['e9d91ae35de159c997aca76da9ccb8f6'];


    })( module.exports , module , __context );
    __context.____MODULES[ "244e1a5887dd19ba4ca7fba09c6774ab" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "40d0b787257a5cf4cfcfc69f874f4290" ,
        filename : "overlay.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["overlay"] = "<div class=\"{{uiClass}}\">{{content}}</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["overlay"];

    })( module.exports , module , __context );
    __context.____MODULES[ "40d0b787257a5cf4cfcfc69f874f4290" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bcb3aa4bc9e209fcbefc4964e1bd5bef" ,
        filename : "mask.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["mask"] = "<div class=\"yo-mask \"></div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["mask"];

    })( module.exports , module , __context );
    __context.____MODULES[ "bcb3aa4bc9e209fcbefc4964e1bd5bef" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "3b9fef9fb7b703f32937c629fd2f07ef" ,
        filename : "overlay.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    
/**
 * 浮层的基类
 * @author  sharon.li <xuan.li@qunar.com>
 * @class Overlay
 * @constructor
 * @extends Widget
 * @category primary
 */

var Widget =__context.____MODULES['baa80dc0359f340d87bd0936bbc6b20e'];
var Template =__context.____MODULES['244e1a5887dd19ba4ca7fba09c6774ab'];
var $ =__context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];
var OverlayTpl =__context.____MODULES['40d0b787257a5cf4cfcfc69f874f4290'];


var MaskTpl =__context.____MODULES['bcb3aa4bc9e209fcbefc4964e1bd5bef'];
var Overlay = Widget.extend({

    /**
     * @property {String} width 宽度字符串，如：36px，默认不传
     * @property {String} height 高度字符串，如：36px，默认不传
     * @property {Number} zIndex 组件默认的z-index，如果有mask, mask的z-index为zIndex-1
     * @property {Boolean} hasMask 是否有遮罩，默认为true
     * @property {Boolean} effect 当前组件是否有动画效果，默认为false
     * @property {String} maskTpl 遮罩的模板字符串
     * @property {Array} maskOffset 遮罩的上下偏移,默认为[0, 0]
     * @memberOf Overlay
     */

    /**
     * @event {function} show 组件显示时触发的事件
     * @event {function} hide 组件隐藏时触发的事件
     * @memberOf Overlay
     */

    /**
     * 右侧确定按钮点击时触发的事件
     * @event ok
     * @memberOf Overlay
     */

    /**
     * 左侧取消按钮点击时触发的事件
     * @event cancel
     * @memberOf Overlay
     */
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
        maskOffset: [0, 0]
    },

    /**
     * 解析模板
     * @function parseTemplate
     * @memberOf Overlay
     * @private
     * @param  {String} tpl 待解析的模板
     * @return {String}     解析后的模板
     */
    parseTemplate: function (tpl) {


        this.content = this.get('content') || '';
        // debugger
        return Template(tpl || OverlayTpl, {
            uiClass: this.getClassName(),
            content: this.content
        });


    },

    /**
     * 根据窗口大小重新调整组件位置和大小
     * @function resize
     * @memberOf Overlay
     */
    resize: function () {
    },


    /**
     * 组件当前是否有遮罩
     * @function _hasMask
     * @memberOf Overlay
     * @private
     * @return {Boolean} 当前组件是否有mask
     */

    _hasMask : function () {
        return this.hasMask && this.mask && this.mask.length;
    },


    /**
     * 显示组件
     * @function show
     * @memberOf Overlay
     */
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
        this.trigger('show');
        this.resize();

    },

    /**
     * 隐藏组件
     * @function hide
     * @memberOf Overlay
     */
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


        this.trigger('hide');
    },

    /**
     * 处理组件数据
     * @function init
     * @memberOf Overlay
     * @private
     */
    init: function () {

        this.hasMask = this.get('hasMask');
        this.zIndex = this.get('zIndex') || 3001;
        this.useYo = !!this.get('yo');

        // this.parentNode = this.get('parentNode');

    },


    /**
     * 将组件渲染到document中
     * @function render
     * @memberOf Overlay
     */
    render: function () {
        Overlay.superClass.render.call(this);


        this.initProp();

        this.initUi();

    },

    /**
     * 处理组件样式
     * @function initUi
     * @memberOf Overlay
     * @private
     */
    initUi: function () {

        if (!this._hasMask()) {

            this.mask = this.get('maskTpl') || MaskTpl;
            this.mask = $(this.mask);

        }

        this.maskOffset = this.get('maskOffset') || [0, 0];
        this.widgetEl.css('z-index', this.zIndex);
        if (this._hasMask()) {
            var maskHeight = Math.max($(document.documentElement).height(), $(document.body).height(), window.innerHeight);
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

    /**
     * 初始化组件与ui相关的属性
     * @function initProp
     * @memberOf Overlay
     * @private
     */
    initProp: function () {

    },

    /**
     * 销毁组件
     * @function destroy
     * @memberOf  Overlay
     */
    destroy : function () {

        if (this.hasMask && this.mask) {

            this.mask.remove();
        }

        Overlay.superClass.destroy.call(this);
    }

});


module.exports = Overlay;


    })( module.exports , module , __context );
    __context.____MODULES[ "3b9fef9fb7b703f32937c629fd2f07ef" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "33505a95ef8e708c96ad4b00c76191b0" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['3b9fef9fb7b703f32937c629fd2f07ef'];


    })( module.exports , module , __context );
    __context.____MODULES[ "33505a95ef8e708c96ad4b00c76191b0" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "44b1f274915e2b1808aa3a17843944a0" ,
        filename : "loading.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["loading"] = "<div class=\"yo-loading\"><div class=\"inner\" data-role=\"inner\"><i class=\"yo-ico\"></i>{{content}}</div></div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["loading"];

    })( module.exports , module , __context );
    __context.____MODULES[ "44b1f274915e2b1808aa3a17843944a0" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "cc90d0b52060afd9c579bf13e160440b" ,
        filename : "loading.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * 弹层组件
 * @author  eva.li <eva.li@qunar.com>
 * @class Loading
 * @constructor
 * @extends Widget
 * @category primary
 * @demo http://ued.qunar.com/mobile/kami/demos/src/html/loading/index.html
 */

var Overlay =__context.____MODULES['33505a95ef8e708c96ad4b00c76191b0'];
var LoadingTpl =__context.____MODULES['44b1f274915e2b1808aa3a17843944a0'];
var Widget =__context.____MODULES['baa80dc0359f340d87bd0936bbc6b20e'];
var $ =__context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];

//【TODO】init里的posObj不需要了
//【TODO】参考alert改一下
var Loading = Widget.extend({

    /**
     * @property {HTMLElement| String} container 组件的容器
     * @property {Boolean} hasMask 是否有遮罩，默认为true
     * @property {String} width 宽度字符串，如：36px，默认不传
     * @property {String} height 高度字符串，如：36px，默认不传
     * @property {Number} zIndex 组件默认的z-index，如果有mask, mask的z-index为zIndex-1
     * @property {String | HTMLElement} content 组件的内容
     * @property {String} unit 单位
     * @property {Array} maskOffset 遮罩的上下偏移,默认为[0, 0]
     * @memberOf Loading
     */
    options: {
        type: 'loading',
        hasMask: false,
        width: null,
        height: null,
        zIndex: 3001,
        content: '',
        unit: 'px',
        maskOffset: [0, 0],
        template: LoadingTpl,
        /**
         * 显示时触发的事件
         * @event show
         * @memberOf Loading
         */
        onshow: function () {},
        /**
         * 隐藏时触发的事件
         * @event hide
         * @memberOf Loading
         */
        onhide: function () {}
    },


    /**
     * 处理组件数据
     * @function init
     * @memberOf Loading
     * @private
     */
    init: function () {
        this._opt = {
            hasMask: this.get('hasMask') || false,
            width: this.get('width') || null,
            height: this.get('height') || null,
            zIndex: this.get('zIndex') || null,
            content: this.get('content') || '',
            unit: this.get('unit') || 'px',
            maskOffset: this.get('maskOffset') || [0,0],
            template: this.get('template'),
            posObj: this.get('posObj')
        };
        this._isRender = false;
        this._isShow = false;
        Loading.superClass.init.call(this);
    },

    /**
     * 处理组件样式
     * @function initUi
     * @memberOf Loading
     * @private
     */
    initUi: function(){
        $(this.widgetEl).css('top', this.get('maskOffset')[0]+ this.get('unit'));
        $(this.widgetEl).css('bottom', this.get('maskOffset')[1]+ this.get('unit'));
        $(this.widgetEl).css('position', 'absolute');
    },

    /**
     * 显示组件
     * @function show
     * @memberOf Loading
     */
    show: function(){
        if(!this._isRender){
            this.render();
        }else if(!this._isShow){
            this._isShow = true;
            this._widgetMap['overlay'].show();
        }
    },

    /**
     * 显示组件
     * @function hide
     * @memberOf Loading
     */
    hide: function(){
        this._isShow = false;
        this._widgetMap['overlay'].hide();
    },

    /**
     * 将组件渲染到document中
     * @function render
     * @private
     * @memberOf Loading
     */
    render: function(){
        var loading = this;
        var dialog;
        dialog = new Overlay(this._opt);
        dialog.on('hide', function(){
            var defaultAct = loading.trigger('hide');
            if(defaultAct === false){
                this.container.off('touchmove', stopMove);
            }
        });
        dialog.on('show', function(){
            var defaultAct = loading.trigger('show');
            if(defaultAct === false){
                this.container.on('touchmove', stopMove);
            }
        });
        dialog.render();
        this.widgetEl = dialog.widgetEl;
        this._widgetMap['overlay'] = dialog;
        this.initUi();
        this._isRender = true;
        this._isShow = true;
        this.trigger('show');
    }
});

// this deal with singleton
var loading = null;
var stopMove = function () {
    return false;
};

var DEFAULT_OPT = {
    hasMask: false,
    content: '',
    force: false,
    type: 'loading',
    template: LoadingTpl,
    maskOffset: [0, 0]
};
/**
 * Loading的静态方法显示组件的单例
 * @function Loading.show
 * @static
 * @param  {Object} opt 单例属性与属性一致
 * @paramDetails {Boolean} hasMask 是否有遮罩，默认为true
 * @paramDetails {String} width 宽度字符串，如：36px，默认不传
 * @paramDetails {String} height 高度字符串，如：36px，默认不传
 * @paramDetails {Number} zIndex 组件默认的z-index，如果有mask, mask的z-index为zIndex-1
 * @paramDetails {String | HTMLElement} content 组件的内容
 * @paramDetails {String} unit 单位
 * @paramDetails {Array} maskOffset 遮罩的上下偏移,默认为[0, 0]
 * @memberOf Loading
 */
Loading.show = function (opt) {
    var _opt = {};
    $.extend(_opt, DEFAULT_OPT, opt);
    if (loading == null) {
        loading = new Loading(_opt);
        loading.show();
    }
    else if (!!_opt.force) {
        Loading.destroy();
        Loading.show(_opt);
    }
    else {
        loading.show();
    }
};
/**
 * Loading的静态方法隐藏组件的单例
 * @function Loading.hide
 * @static
 * @memberOf Loading
 */
Loading.hide = function(){
    if(!!loading){
        loading.hide();
    }
}
/**
 * Loading的静态方法销毁组件的单例
 * @function Loading.destroy
 * @static
 * @memberOf Loading
 */
Loading.destroy = function(){
    if(!!loading){
        loading.destroy();
        loading = null;
    }
}
module.exports = Loading;


    })( module.exports , module , __context );
    __context.____MODULES[ "cc90d0b52060afd9c579bf13e160440b" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "44deb389282beb5e0e2ae5b1feaf9a14" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['cc90d0b52060afd9c579bf13e160440b']

    })( module.exports , module , __context );
    __context.____MODULES[ "44deb389282beb5e0e2ae5b1feaf9a14" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "7567e6093adb2a7617f107217f6eba7b" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["loading"] = __context.____MODULES['44deb389282beb5e0e2ae5b1feaf9a14'];
module.exports = obj["loading"];


    })( module.exports , module , __context );
    __context.____MODULES[ "7567e6093adb2a7617f107217f6eba7b" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "171a92febb96d571c18cd0fe6caed2cf" ,
        filename : "loading.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var Loading = window.Kami.loading =__context.____MODULES['7567e6093adb2a7617f107217f6eba7b'];
var $ =__context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];
var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];

var DEFAULT_OPT = {
    template:'<camel-loading class="yo-flex flex" \
                loading="yo-loading-coupon" fill="#921001"\
                color="#fd2" bgcolor="#fd2"\
                ></camel-loading>',
    extraClass:'',
    effect:true
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
    __context.____MODULES[ "171a92febb96d571c18cd0fe6caed2cf" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a501720ffac2e867bac6c056e9aba58f" ,
        filename : "tip.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["tip"] = "<div class=\"{{uiClass}} yo-tip\">{{content}}</div> ";
if (typeof module !== "undefined") module.exports = window.QTMPL["tip"];

    })( module.exports , module , __context );
    __context.____MODULES[ "a501720ffac2e867bac6c056e9aba58f" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8cd7440b4ea201906b7bc3b55be813f6" ,
        filename : "tip.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * 弹层组件
 * @author  eva.li <eva.li@qunar.com>
 * @class Tip
 * @constructor
 * @category primary
 * @demo http://ued.qunar.com/mobile/kami/demos/src/html/tip/index.html
 * @extends Widget
 */

var Overlay =__context.____MODULES['33505a95ef8e708c96ad4b00c76191b0'];
var Widget =__context.____MODULES['baa80dc0359f340d87bd0936bbc6b20e'];
var TipTpl =__context.____MODULES['a501720ffac2e867bac6c056e9aba58f'];
var Template =__context.____MODULES['244e1a5887dd19ba4ca7fba09c6774ab'];
var $ =__context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];
//【TODO】用内聚overlay的方式重新实现tips
var Tip = Widget.extend({
    /**
     * @property {HTMLElement| String} container 组件的容器
     * @property {Boolean} hasMask 是否有遮罩，默认为false
     * @property {Boolean} autoHide 是否自动隐藏， 默认为true
     * @property {Number} zIndex 组件默认的z-index，如果有mask, mask的z-index为zIndex-1
     * @property {Number} autoHideTime 自动消失的时间，当autoHide为true时，该属性有效，默认为2秒
     * @property {String | HTMLElement} content tip的内容
     * @property {Boolean} effect 是否开启动画效果，默认为true
     * @property {Array} maskOffset 遮罩的上下偏移，默认为[0,0]
     * @property {Boolean} resizeable 当屏幕大小发生变化时，是否切换位置
     * @memberOf Tip
     */
    
    
    options: {
        type: 'tip',
        hasMask: false,
        zIndex: 3001,
        maskOffset: [0, 0],
        autoHide: true,
        content: '我是tips',
        template: TipTpl,
        effect: true,
        resizable: true,
        autoHideTime: 2,//默认为秒  
        /**
         * 组件隐藏时触发的事件
         * @event hide
         * @memberOf Tip
         */
        onhide: function () {}
    },
    /**
     * 内置函数初始化组件内置Overlay组件
     * @function _createOverlay
     * @private
     * @memberOf Tip
     */
    _createOverlay: function () {
        this._opt = {
            hasMask: this.get('hasMask'),
            zIndex: this.get('zIndex'),
            maskOffset: this.get('maskOffset'),
            effect: this.get('effect')
        }
        this.overlay = this._widgetMap['overlay'] = new Overlay(this._opt);
        this.overlay.render();
    },
     /**
     * 设置组件的数据
     * @function init
     * @memberOf Tip
     */
    init: function () {
        this.autoHide = !!this.get('autoHide');
        this.autoHideTime = parseInt(this.get('autoHideTime')|| 0, 10) || 2;
        Tip.superClass.init.call(this);
    },
    /**
     * 将组件渲染到document中
     * @function render
     * @memberOf Tip
     */
    render: function(){
        this.get('hasMask') && this._createOverlay();
        Tip.superClass.render.call(this);
        this.initUi();
        this._isShow = true;
        this.show();
    },
    /**
     * 重设组件位置
     * @function resize
     * @memberOf Tip
     */
    resize: function(){
        this.overlay && this.overlay.resize();
        Tip.superClass.resize.call(this);
        this.initUi();
    },

    /**
     * 设置组件内容
     * @function setContent
     * @param {String | HTMLElement} content 组件要显示的新内容
     * @memberOf Tip
     */
    setContent: function(content) {
        this.widgetEl[0].innerHTML = content;
    },
    /**
     * 获取组件内容
     * @function getContent
     * @param {String | HTMLElement} content 组件要正在现实的内容
     * @memberOf Tip
     */
    getContent: function(content) {
        return $(this.widgetEl[0]).html();
    },
    /**
     * 解析模板
     * @function parseTemplate
     * @memberOf Tip
     * @private
     * @param  {String} tpl 待解析的模板
     * @return {String}     解析后的模板
     */
    parseTemplate: function (template) { 
        this.content = this.get('content') || '';
        return Template(this.get('template') || TipTpl, {
            uiClass: this.getClassName(),
            content: this.content
        });      
    },

    /**
     * 显示组件
     * @function show
     * @memberOf Tip
     */
    show: function () {
        var widget = this;
        // Tip.superClass.show.call(this);
        this.overlay && this.overlay.show();
        this.widgetEl.show();
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
        this._isShow = true;
        // this.resize();
    },

    /**
     * 显示组件
     * @function hide
     * @memberOf Tip
     */
    hide: function() {
        this.widgetEl.hide();
        this.overlay && this.overlay.hide();
        this.trigger('hide', this);
        // var widget = this;
        // setTimeout(function() {
        //     widget.destroy();
        // }, 200);
        this._isShow = false;
        // this.destroy();
    },

    /**
     * 销毁组件
     * @function destroy
     * @memberOf Tip
     */
    destroy: function () {
        this.timer && window.clearTimeout(this.timer);
        this.off();
        this._isShow = false;
        Tip.superClass.destroy.call(this);
    },

    /**
     * 设置组件的样式
     * @function initUi
     * @memberOf Tip
     */
    initUi: function () {
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
   /**
    * 判断当前组件时候否显示
    * @private
    * @function isShow
    * @return Bollean 是否显示
    */
   isShow: function(){
        return this._isShow;
   }
});
// this deal with singleton
var tips = null;
var DEFAULT_OPT = {
    force: true
};
/**
 * 单例Tip的show方法,当不传force的时候默认为true
 * @static
 * @function Tip.show 
 * @param {Object} opt 单例Tip参数设置
 * @paramDetails {Boolean} opt.hasMask 是否有遮罩，默认为false
 * @paramDetails {Boolean} opt.autoHide 是否自动隐藏， 默认为true
 * @paramDetails {Number} opt.zIndex 组件默认的z-index，如果有mask, mask的z-index为zIndex-1
 * @paramDetails {Number} opt.autoHideTime 自动消失的时间，当autoHide为true时，该属性有效，默认为2秒
 * @paramDetails {String | HTMLElement} opt.content tip的内容
 * @paramDetails {Boolean} opt.effect 是否开启动画效果，默认为true
 * @paramDetails {Array} opt.maskOffset 遮罩的上下偏移，默认为[0,0]
 * @paramDetails {Boolean} opt.resizeable 当屏幕大小发生变化时，是否切换位置
 * @paramDetails {Boolean} opt.force 是否强制重新创建内容
 * @return {Object} 单例tip对象
 * @memberOf Tip
 */
Tip.show = function (opt) {
    
    var _opt = {};
    $.extend(_opt, DEFAULT_OPT, opt);
    if (opt.template) {
        _opt.template = opt.template;
    }
    if (tips == null) {
        tips = new Tip(_opt);
        tips.render();
        _opt.onhide && tips.on('hide', _opt.onhide);
    }
    else if (!!_opt.force) {
        Tip.destroy();
        Tip.show(opt);
    } 
    else if (!tips.isShow()){
        tips.show();
    }
    return tips; 
};
/**
 * 单例Tip的hide方法
 * @static
 * @function Tip.hide
 * @memberOf Tip
 */
Tip.hide = function () {
    if (!!tips) {
        tips.hide();
    } 
};
/**
 * 单例Tip的destory方法
 * @static
 * @function Tip.destroy
 * @memberOf Tip
 */
Tip.destroy = function () {
    tips && tips.destroy();
    tips = null;
};
module.exports = Tip;  

    })( module.exports , module , __context );
    __context.____MODULES[ "8cd7440b4ea201906b7bc3b55be813f6" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9b097ae946123c94e474b3b42e8b89f5" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['8cd7440b4ea201906b7bc3b55be813f6']

    })( module.exports , module , __context );
    __context.____MODULES[ "9b097ae946123c94e474b3b42e8b89f5" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "5f79d90a92464ffb07a9a739c955080a" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["tip"] = __context.____MODULES['9b097ae946123c94e474b3b42e8b89f5'];
module.exports = obj["tip"];

    })( module.exports , module , __context );
    __context.____MODULES[ "5f79d90a92464ffb07a9a739c955080a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "611e28328d5aa9a25be23d4ea50976ce" ,
        filename : "panel.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["panel"] = "<div>\n    <div data-role=\"scroller\">\n        <div data-role=\"body\"></div>\n    </div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["panel"];

    })( module.exports , module , __context );
    __context.____MODULES[ "611e28328d5aa9a25be23d4ea50976ce" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "dd5c07774e3cbc96d49e5c4d05970537" ,
        filename : "panel-refresh.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["panel-refresh"] = "<div style=\"position: absolute; text-align: center; width: 100%; height: 40px; line-height: 40px; top: -40px;\">\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico\">&#xf07b;</i>\n        <div class=\"text\">下拉可以刷新</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico\">&#xf079;</i>\n        <div class=\"text\">释放立即更新</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-loading\">&#xf089;</i>\n        <div class=\"text\">努力加载中...</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-succ\">&#xf078;</i>\n        <div class=\"text\">加载成功</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-fail\">&#xf077;</i>\n        <div class=\"text\">加载失败</div>\n    </div>\n</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["panel-refresh"];

    })( module.exports , module , __context );
    __context.____MODULES[ "dd5c07774e3cbc96d49e5c4d05970537" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a806de6a8522db120e11d117800962c0" ,
        filename : "panel-loadmore.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["panel-loadmore"] = "<div style=\"position: absolute; text-align: center; height: 40px; line-height: 40px; width: 100%; bottom: -40px;\">\n    <div class=\"yo-loadtip\">\n        <i class=\"yo-ico yo-ico-loading\">&#xf089;</i>\n        <div class=\"text\">正在加载...</div>\n    </div>\n    <div class=\"yo-loadtip\">\n        <div class=\"text\">没有更多了...</div>\n    </div>\n</div>";
if (typeof module !== "undefined") module.exports = window.QTMPL["panel-loadmore"];

    })( module.exports , module , __context );
    __context.____MODULES[ "a806de6a8522db120e11d117800962c0" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a8037a2aaecdf4b8d4dc3f82ba80ad35" ,
        filename : "panel.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /**
 * 面板组件，支持横向纵向滑动，以及下拉刷新和加载更多
 * @author zxiao <jiuhu.zh@gmail.com>
 * @class Panel
 * @constructor
 * @extends Widget
 * @category primary
 * @demo http://ued.qunar.com/mobile/kami/demos/src/html/panel/index.html
 */
var $ =__context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];
var Widget =__context.____MODULES['baa80dc0359f340d87bd0936bbc6b20e'];
var Template =__context.____MODULES['244e1a5887dd19ba4ca7fba09c6774ab'];
var PanelTpl =__context.____MODULES['611e28328d5aa9a25be23d4ea50976ce'];
var RefreshTpl =__context.____MODULES['dd5c07774e3cbc96d49e5c4d05970537'];
var LoadmoreTpl =__context.____MODULES['a806de6a8522db120e11d117800962c0'];

// 动画定时器
var rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };

// 默认不阻止浏览器默认行为的控件
var Reg = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;

var Panel = Widget.extend({
    /**
     * @property {Boolean} scrollX X轴是否滚动，默认为false
     * @property {Boolean} scrollY Y轴是否滚动，默认为true
     * @property {Boolean} isTransition 默认滚动的动画效果，默认为true，true使用css的transition，false使用js动画
     * @property {Boolean} scrollLock 当容器内的内容的高度小于容器高度时，是否允许滚动，默认为false
     * @property {Boolean} preventDefault 阻止浏览器默认事件，默认为true
     * @property {Boolean} stopPropagation 阻止touch事件冒泡，默认为false
     * @property {Boolean}  canLockY 是否支持锁定Y轴滚动，默认为false， 在与slidermenu的配合使用时，需要设置为true
     * @property {Boolean} resizable 当浏览器窗口改变时是否可调整大小，默认为true
     * @property {Boolean} useRefresh 是否启用刷新功能，默认为false，开启下来刷新组件
     * @property {Boolean} useLoadmore 是否启用加载更多功能，默认为false，开启上拉加载更多
     * @property {String} template 组件的模板，需要自定义时修改
     * @property {String} refreshTpl 刷新数据提示模板，需要自定义时修改
     * @property {String} loadmoreTpl 家在更多时提示模板，需要自定义时修改
     * @memberOf Panel
     */
    
     /**
     * @event {function} tap 
     * @memberOf Panel
     */
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
        /**
         * 用户下拉列表满足刷新条件时触发的事件
         * @event refresh
         * @memberOf Panel
         * @param  {Number} pageNum 当前的页码
         */
        onRefresh: function(pageNum) {},
        // 加载更多中，该接口必须调用Panel.loadMore()方法通知Panel数据已加载
        /**
         * 用户上拉列表满足加载更多条件时触发的事件
         * @event loadmore
         * @memberOf Panel
         * @param  {Number} pageNum 当前的页码
         */
        onLoadMore: function(pageNum) {},
        /**
         * 渲染完成后触发的事件
         * @event ready
         * @memberOf Panel
         */
        onReady: function() {},

        // panel点击事件
        /**
         * 用户点击某项数据时触发的事件
         * @event tap
         * @param  {HTMLEvent} e touch事件的事件对象
         * @memberOf Panel
         */
        onTap: function (e) {},
        /**
         * touchstart事件开始前触发的事件
         * @event beforestart
         * @param  {HTMLEvent} e touch事件的事件对象
         * @memberOf Panel
         */
        onBeforeStart: function (e) {},
        /**
         * touchmove事件开始前触发的事件
         * @event beforemove
         * @param  {HTMLEvent} e touch事件的事件对象
         * @memberOf Panel
         */
        onBeforeMove: function(e) {},
        
        // onScroll: function (translateX, translateY, stopAnimate) {},

        /**
         * touchmove事件结束后触发的事件,切换下拉刷新图标
         * @event aftermove
         * @param  {Number} translateY 滚动偏移的translateY
         * @memberOf Panel
         */
        onAfterMove: function(translateY) {
            translateY > 0 && this.get('useRefresh') && !this._refreshing && this._changeRefreshStatus(translateY);
            this._moveWhenLoad = this._refreshing || this._loadmoreing;
        },

        /**
         * touchend事件开始前触发的事件
         * @event beforeend
         * @param  {HTMLEvent} e touch事件的事件对象
         * @memberOf Panel
         */
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

        /**
         * 列表滚动时触发的事件
         * @event 
         * @param  {Number} translateX 滚动偏移的translateX
         * @param  {Number} translateY 滚动偏移的translateY
         * @param  {Boolean} stopAnimate 是否停止动画
         * @memberOf Panel
         */
        onScroll: function (translateX, translateY) {
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

    /**
     * 处理组件数据
     * @function init
     * @memberOf Panel
     * @private
     */
    init: function() {
        this._initPrivate();
    },

    /**
     * 判断是否需要使用fromHTML属性，即从节点创建
     * @function _isFromHTML
     * @memberOf Panel
     * @private
     */
    _isFromHTML: function(){
        var container = this.get('container');
        container = container || $PARENT_NODE;
        container = $(container);
        // 容器内部获取第一个对象节点
        var firstElement = container[0].firstElementChild;
        // 如果存在对象节点
        if(firstElement){
            // 获取滚动容器
            var scroller = container.find('[data-role="scroller"]');
            // 获取内容容器
            var body = container.find('[data-role="body"]');
            // 如果容器没有添加标示
            if(scroller.length === 0 || body.length === 0){
                // 容器第一个节点默认为是滚动容器
                $(firstElement).data('role', 'scroller');
                // 滚动容器内第一个节点默认未是内容容器
                $(firstElement.firstElementChild).data('role', 'body');
            }
            return true;
        }

        return false;
    },

    /**
     * 根据配置获取组件根节点
     * @function _getMainElement
     * @memberOf Panel
     * @private
     * @param  {Object} config 组件的配置项
     */
    _getMainElement: function(config){
        var isFromHTML = this._isFromHTML();
        if(isFromHTML){
            var container = this.get('container');
            container = container || $PARENT_NODE;
            container = $(container);
            this.widgetEl = container;
            this.container = container;
            this.on('ready', function(){
                this.resize();
            })
        }else{
            Panel.superClass._getMainElement.call(this, config);
        }
    },

    /**
     * 将组件渲染到document中
     * @function render
     * @memberOf Panel
     */
    render: function() {
        if(!this._isRender){
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
        }
        return this;
    },

    /**
     * 销毁组件
     * @function destroy
     * @memberOf Panel
     */
    destroy: function () {
        Panel.superClass.destroy.call(this);
    },

    /**
     * 重新计算滚动区域，容器高度发生变化后调用
     * @function resize
     * @memberOf Panel
     */

    resize: function() {
        if(!this._isRender){return false;}
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
     * 滚动函数
     * @function scrollTo
     * @memberOf Panel
     * @param {Number} translateX 需要滚动的translateX值
     * @param {Number} translateY 需要滚动的translateY值
     * @param {Array} time  是transition-duration表示过渡效果需要多少毫秒
     * @param {String | Function} effect transition-timing-function过渡效果的速度曲线
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

    /**
     * 停止动画
     * @function stopAnimate
     * @memberOf Panel
     * @private
     */
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
     * 手动模拟刷新列表操作，组件滚动到头部
     * @function simulateRefresh
     * @memberOf Panel
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
     * 刷新组件的HTML
     * @function refresh
     * @memberOf Panel
     * @param {String} html 需要更新的html字符串
     * @param {Boolean} isFail 加载是否成功，如果加载数据碰到异常才设置成false，否则默认都为true
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
     * 组件加载更多数据
     * @function loadMore
     * @memberOf Panel
     * @param {Array} data 加载到的数据
     * @param {Boolean} isFail 加载失败，如果加载数据碰到异常才设置成true
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
     * 获得当前组件的是第几页
     * @function getPageNum
     * @memberOf Panel
     * @return {Number} 获得当前组件的是第几页
     */
    getPageNum: function() {
        return this._pageNum;
    },

    /**
     * 滑动超出最大范围，回弹到终点
     * @function _resetPosition
     * @private
     * @memberOf Panel
     */
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


    /**
     * 初始化私有属性
     * @function _initPrivate
     * @private
     * @memberOf Panel
     */
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

    /**
     * touchstart事件的处理函数，初始化参数，停止正在进行的动画
     * @function _touchStart
     * @private
     * @param  {HTMLDOMEvent} e touchstart事件的事件对象
     * @memberOf Panel
     */
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

    /**
     * touchmove事件的处理函数，处理位移偏移，处理canLockY
     * @function _touchMove
     * @param  {HTMLDOMEvent} e touchmove事件的事件对象
     * @private
     * @memberOf Panel
     */
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

    /**
     * touchend事件的处理函数，添加active样式，处理组件的回弹，滚动到目标位置
     * @function _touchEnd
     * @param  {HTMLDOMEvent} e touchmove事件的事件对象
     * @private
     * @memberOf Panel
     */
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

    /**
     * transition动画结束后的处理函数
     * @function _transitionEnd
     * @memberOf Panel
     * @param  {HTMLDOMEvent} e transitionEnd结束时事件对象
     * @private
     */
    _transitionEnd: function(e) {
        if ( e.target != this._scroller[0] ) {
            return;
        }
        setTransitionTime(this._scroller);
        this._isAnimating = false;
        this._resetPosition();
    },

    /**
     * 不适用transition时的惯性动画函数
     * @function _animate
     * @memberOf Panel
     * @private
     * @param  {Number} translateX scroller要滚动的目标translateX
     * @param  {Number} translateY scroller要滚动的目标translateY
     * @param  {Number} time       scorller要滚动到
     * @param  {Function} effect     滚动的效果函数
     */
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

     /**
     * 设置scroller的translateX和translateY值
     * @function _translate
     * @private
     * @param  {Number} translateX 要给scroller设置的translateX值
     * @param  {Number} translateY 要给scroller设置的translateY值
     * @memberOf Panel
     */
    _translate: function(translateX, translateY) {
        this._scroller[0].style.webkitTransform = 'translate(' + translateX + 'px, ' + translateY + 'px) translateZ(0)';
        this._scroller[0].style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) translateZ(0)';
        this.trigger('scroll', translateX, translateY, this._stopAnimate);
    },

    /**
     * 创建刷新和加载更多的操作图标
     * @function _createDragIcon
     * @memberOf Panel
     * @private
     */
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


    /**
     * 根据translateY改变刷新的显示状态（下拉刷新or释放更新）
     * @function _changeRefreshStatus
     * @memberOf Panel
     * @param {Number} translateY translateY的偏移
     * @private
     */
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

    /**
     * 根据direction改变icon的样式
     * @function _changeRefreshAnimate
     * @memberOf Panel
     * @param {String} direction 方向，上为up下位down
     * @private
     */
    _changeRefreshAnimate: function(direction) {
        if(direction == 'up') {
            iconAnimate(this._dragIcon, 'addClass', true);
            iconAnimate(this._endIcon, 'removeClass');
        } else {
            iconAnimate(this._dragIcon, 'removeClass');
            iconAnimate(this._endIcon, 'addClass', false);
        }
    },

    /**
     * refresh状态初始化
     * @function _refreshInit
     * @memberOf Panel
     * @private
     */
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

    /**
     * loadMore状态初始化
     * @function _loadMoreInit
     * @memberOf Panel
     * @private
     */
    _loadMoreInit: function() {
        this._loadmoreing = true;
        this._loadmoreEl.show();
        this._endmoreEl.hide();
        this._maxY -= this.get('loadmoreContY');
        this.trigger('loadmore', this._pageNum);
    },

    /**
     * 隐藏刷新和家在更多的状态
     * @function _reset
     * @memberOf Panel
     * @private
     */
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
    __context.____MODULES[ "a8037a2aaecdf4b8d4dc3f82ba80ad35" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a921987b65516fde7a8f25bf35318879" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports =__context.____MODULES['a8037a2aaecdf4b8d4dc3f82ba80ad35']

    })( module.exports , module , __context );
    __context.____MODULES[ "a921987b65516fde7a8f25bf35318879" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4253350d8d5afdf80f75900f0dd52e9d" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var obj = {};
obj["panel"] = __context.____MODULES['a921987b65516fde7a8f25bf35318879'];
module.exports = obj["panel"];


    })( module.exports , module , __context );
    __context.____MODULES[ "4253350d8d5afdf80f75900f0dd52e9d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1a305f5d0a3f14d1e4f8aa7163d7c925" ,
        filename : "panel.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    window.Kami = window.Kami || {};
var $     = __context.____MODULES['c7b0b3df98e7837101ce2655fb939281'];
var Panel =__context.____MODULES['4253350d8d5afdf80f75900f0dd52e9d'];
var panel = null;
window.Kami.panel = panel;
var DEFAULT_OPT = {
    preventDefault:false
};
var scrollPanel = {
    render: function (opt) {

            panel = new Panel($.extend(DEFAULT_OPT,opt));
            panel.render();
    },
    getter: function() {
        return panel;
    }
};

    // scrollPanel.render(_.extend({}, {
    //     container:element
    // },opt));

module.exports = scrollPanel;


    })( module.exports , module , __context );
    __context.____MODULES[ "1a305f5d0a3f14d1e4f8aa7163d7c925" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "fe68e6edfd63cf4e00af6a0fc385ff9d" ,
        filename : "container.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["container"] = "<coupon-question-list></coupon-question-list>\n<footer class=\"m-coupon-question-footer\">\n    <button class=\"yo-btn yo-btn-l yo-btn-submit\" disabled>提交</button>\n</footer>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["container"];

    })( module.exports , module , __context );
    __context.____MODULES[ "fe68e6edfd63cf4e00af6a0fc385ff9d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6c9893c99df65ee676be86e077974f32" ,
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
            window.addEventListener('load', function(){
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
            });
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

            /* 分享图片到朋友圈 */
            shareImageToTimeline: 'shareImageToTimeline',

            // 唤起share dialog框
            showShareItems: "doShare",

            // 设备信息
            getDeviceInfo: 'native.getDeviceInfo', // 获取设备信息

            login: 'login.start', // 登录
            syncLoginFromTouch: 'syncLoginFromTouch', // 从touch端同步登陆信息

            log: 'debug.log', // debug
            uelog: 'hy.uelog' // uelog
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
        version: '1.0.10',
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
    __context.____MODULES[ "6c9893c99df65ee676be86e077974f32" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "021a472bd1ec6ceb280d26247f76f1ab" ,
        filename : "closeMe.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var api = __context.____MODULES['6c9893c99df65ee676be86e077974f32'];
var old = __context.____MODULES['6bee53f0a07b8d1f5e43ce208e628864'];

function closeMe() {
    if(!window.history.go(-1)) {
        api.ready(function() {
            api.hy.closeWebView({});
        });
        old.ready(function(bridge) {
            bridge.call('closeWeb');
        });
    }
};

module.exports = closeMe;


    })( module.exports , module , __context );
    __context.____MODULES[ "021a472bd1ec6ceb280d26247f76f1ab" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b523ec41eae0dacaed9a04530cd54f92" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    mounted: mounted,
    scroll: scroll,
    aftermove: aftermove,
    submit: submit,
    listPanelReady: listPanelReady,
    checkedStateChange: checkedStateChange,
    labelTapped: labelTapped,
    closeMe: closeMe
};

var mojo =__context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var animate =__context.____MODULES['e37d3ad0bb0cfec45407a1d080084b11'];
var event= module.exports;
var ajax =__context.____MODULES['1d21c70d352334874b21ac9eae3ebf56'];
var $    = mojo.util;
var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];

var loading = __context.____MODULES['171a92febb96d571c18cd0fe6caed2cf'];
var tips  = __context.____MODULES['5f79d90a92464ffb07a9a739c955080a'];

function submit(e) {
    var self = this;
    var store = mojo.tags['coupon-question'].dataStore;
    var submit = self.tags['coupon-question-list'].submits;
    var tokenId = mojo.tags['coupon-question'].dataStore.tokenId;
    var url = mojo.tags['coupon-question'].dataStore.urls.submit;
    var dataString = "{}";

    loading.show({});
    _stringifyParams();

    ajax({
        method: "POST",
        url: url,
        contentType:"application/json",
        data: dataString,
        success: _ajaxOK,
        error: _ajaxFail
    });

    return false;

    function _ajaxOK(res) {
        try {
            res = JSON.parse(res)
        } catch (e) {}

        if (res.ret) {
            setTimeout(function() {
                loading.hide();
            },1000);
            store.exports && (store.exports.callBackUrl = res.data.callBackUrl);
            mojo.show('coupon.finish');
        } else {
            _ajaxFail(res);
        }
    };

    function _ajaxFail(res) {
        loading.hide();
        tips.show({content: res.errmsg || "网络错误"});
    };

    function _stringifyParams() {
        try {
            dataString = JSON.stringify({
                tokenId: tokenId,
                submits: submit
            });
        } catch (e) {}
    }
}

function mounted() {
    var self = this;
    var opt = self.opt;

    $(self.root).addClass('fade-in-fast');

    if (self.opt.ret) {
        var panel = __context.____MODULES['1a305f5d0a3f14d1e4f8aa7163d7c925'];
        var container = __context.____MODULES['fe68e6edfd63cf4e00af6a0fc385ff9d'];
        var wrapper = $('.panel-wrapper')[0];

        var _opts = {
            container:wrapper,
            onReady:_panelReady,
            onScroll:event.scroll,
            onAfterMove:event.aftermove
        };

        panel.render(_opts);

        function _panelReady() {
            var panel   = this;
            var html    = container;
            panel.html(html);

            var content  = riot.mount("coupon-question-list",{list:opt.data.questionList,panel:panel});
            self.tags["coupon-question-list"] = content[0];
        };
    }
};

function scroll(x,y) {
    animate.scroll(y);
};

function aftermove(y) {
    animate.scroll(y);
};

function labelTapped(e) {
        var target = $(e.target);
        var self   = this;
        var submit = this.submits;
        var index  = self.index;//题目在列表中的位置
        var input  = self.tags['coupon-question-checked'];
        var id     = input.opts.name;
        var type   = input.opts.type;
        var box    = self[id];
        var val    = input.getValue();
        var answer = submit[index].answers;

        answer.length = 0;

        input.trigger('checked');

        switch (type) {
            case 'radio':
                _radioHandler();
                break;
            case 'checkbox':
                _checkboxHandler();
                break;
            default:
        }

        _setDisableState();

        function _setDisableState() {
            for (var i = 0; i < submit.length; i++) {
                var sub = submit[i];
                if (sub.answers.length) {
                    if (i === submit.length-1) {
                        self.btnDisableFlag.setState(false);
                    }
                    continue;
                } else {
                    self.btnDisableFlag.setState(true);
                    break;
                }
            }
        };

        function _radioHandler() {
            answer.push(val);
        };

        function _checkboxHandler() {
            if (box.forEach) {
                box.forEach(function(input) {
                    __pushAnswer(input._tag);
                });
            } else {
                __pushAnswer(box._tag);
            }

            function __pushAnswer(_t) {
                if (_t.getState()) {
                    answer.push(_t.getValue());
                }
            };

        };
};

function checkedStateChange() {
    var self = this;
    var opts = self.opts;
    var type = opts.type;
    var root = $(self.root);
    var name = opts.name;
    var value   = self.getValue();
    var parent  = self.parent;
    var state   = self.getState();
    var label   = root.closest('.label');

    switch (type) {
        case 'radio':
            _radioHandler();
            break;
        case 'checkbox':
            _checkHandler();
            break;
        default:

    }

    function _radioHandler() {
        if (!state) {//以前没点上
            self.setState(true);
            parent[name].forEach(function(input) {
                var _t = input._tag;
                if (_t.value !== value) {
                    _t.setState(false);
                }
            });
        }
    };

    function _checkHandler() {
        self.setState(!state);
    };
};

function listPanelReady() {
    var self =  this;
    animate.listPad();
    self.panel.resize();
};

function closeMe() {
    var closeMe = __context.____MODULES['021a472bd1ec6ceb280d26247f76f1ab'];
    window.history.go(-1);
    closeMe();
};


    })( module.exports , module , __context );
    __context.____MODULES[ "b523ec41eae0dacaed9a04530cd54f92" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "96236fa428f7dd4428fb6baf5e59ecaa" ,
        filename : "header.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["header"] = "<h2 class=\"title\">{text}</h2>\n<span class=\"regret yo-ico\" ontap=\"{action}\">{icon}</span>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["header"];

    })( module.exports , module , __context );
    __context.____MODULES[ "96236fa428f7dd4428fb6baf5e59ecaa" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a6c80e180250a7a0f4ce675448e2a3a1" ,
        filename : "header.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var headerStr = __context.____MODULES['96236fa428f7dd4428fb6baf5e59ecaa'];

riot.tag("yo-header",headerStr,_headerStr);

function _headerStr(opts){
	this.text   = opts.title  || "会员红包";
	this.icon   = opts.icon   || "\uf07d" ;
	this.action = opts.action;
}


    })( module.exports , module , __context );
    __context.____MODULES[ "a6c80e180250a7a0f4ce675448e2a3a1" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "970c7010af7778195deaccf068ba69cd" ,
        filename : "error.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["error"] = "<div class=\"yo-error\">\n    <section class=\"m-nodata\">\n        <p class=\"info\">您的访问信息有错哦</p>\n    </section>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["error"];

    })( module.exports , module , __context );
    __context.____MODULES[ "970c7010af7778195deaccf068ba69cd" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e4c384a1fe51ff91da43f7d33a863850" ,
        filename : "error.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot =__context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var tpl  =__context.____MODULES['970c7010af7778195deaccf068ba69cd'];

riot.tag('yo-error',tpl,{});


    })( module.exports , module , __context );
    __context.____MODULES[ "e4c384a1fe51ff91da43f7d33a863850" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "716e913d8c374a4e1f5ceffbb5ab1c91" ,
        filename : "camel-loading.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["camel-loading"] = "<svg style=\"display:none;\">\n<g id=\"camel-loading-svg\">\n<rect x=\"0\" y=\"0\" rx=\"1\" ry=\"1\" width=\"50\" height=\"25\" style=\"fill:{fill}\"/>\n<g transform=\"translate(-7 40)\" style=\"fill:{bgcolor};fill-opacity:0.6;\">\n    <g transform=\"rotate(0 32 0)\">\n        <path\n           id=\"camel-bg-svg\"\n           d=\"m 52.537273,0.46644091 c -0.03218,-0.05608 -0.06993,-0.588419 -0.08387,-1.182966 -0.10247,-4.36961621 -2.170941,-9.48140391 -5.361663,-13.25021291 -3.925178,-4.636334 -10.353971,-7.708085 -16.232091,-7.755877 -0.625374,-0.0051 -0.849769,-0.05608 -0.849769,-0.19312 0,-0.141505 0.204009,-0.177813 0.849769,-0.151238 3.184772,0.13106 6.086623,0.842374 8.929584,2.188854 7.537239,3.56978 12.352882,10.6800607 12.996216,19.18887391 0.06397,0.846084 0.0485,1.257658 -0.04728,1.257658 -0.07831,0 -0.168708,-0.04588 -0.200893,-0.101972 z m 2.353842,-0.214388 c 0,-0.277036 -0.05285,-0.308602 -0.42521,-0.253952 -0.319206,0.04685 -0.409771,0.01555 -0.363279,-0.12552 0.03831,-0.116266 0.420812,-0.240064 1.003054,-0.324651 0.886282,-0.128755 0.943633,-0.158511 0.984217,-0.510633 0.02808,-0.24365401 -0.03112,-0.40239401 -0.169953,-0.45566701 -0.117178,-0.04496 -0.213051,-0.166985 -0.213051,-0.271154 0,-0.104168 -0.122366,-0.189397 -0.271926,-0.189397 -0.47398,0 -0.293293,-0.196739 0.374613,-0.40789 0.560051,-0.177053 0.667361,-0.272097 0.813858,-0.720836 0.134354,-0.411542 0.134354,-0.559011 0,-0.723551 -0.495181,-0.6064332 -0.689055,-0.7511172 -0.924116,-0.6896472 -0.139896,0.03658 -0.325281,-0.01894 -0.411967,-0.123391 -0.08668,-0.104451 -0.287781,-0.1949 -0.446877,-0.201 -0.234745,-0.009 -0.20794,-0.04672 0.142202,-0.200088 0.52689,-0.230792 0.632766,-0.386114 0.515358,-0.756037 -0.07589,-0.239114 -0.159345,-0.270067 -0.518638,-0.192368 -1.481174,0.320311 -1.65186,0.320882 -1.65186,0.0055 0,-0.274062 0.44805,-0.476421 1.95083,-0.881077 0.581927,-0.156696 0.589802,-0.166648 0.502047,-0.634418 -0.139175,-0.741865 -0.964787,-2.8126227 -1.651535,-4.1422947 -0.588361,-1.139174 -0.644802,-1.203542 -0.984664,-1.122964 -0.198292,0.04701 -0.452305,0.160543 -0.564475,0.252291 -0.343076,0.280614 -1.441882,0.884368 -1.60951,0.884368 -0.290105,0 -0.162609,-0.253834 0.249881,-0.497498 0.224339,-0.13252 0.408064,-0.334825 0.40828,-0.449567 2.72e-4,-0.11474 0.185679,-0.330987 0.412145,-0.480547 0.332908,-0.219855 0.395894,-0.337014 0.32893,-0.611833 -0.128283,-0.526478 -0.714282,-1.211891 -1.121479,-1.31174 -0.202282,-0.0496 -0.508064,-0.239602 -0.679516,-0.422225 -0.214891,-0.22889 -0.404961,-0.309243 -0.611834,-0.258657 -0.41081,0.100457 -1.233111,-0.629201 -1.117961,-0.992007 0.04462,-0.140579 0.02012,-0.2933 -0.05443,-0.339378 -0.07455,-0.04607 -0.102733,-0.16931 -0.06262,-0.273851 0.120356,-0.313648 -0.355533,-1.137919 -0.824208,-1.427577 -0.275958,-0.170552 -0.724203,-0.282971 -1.209191,-0.303267 -0.423873,-0.01774 -0.771095,-0.065 -0.771606,-0.105024 -5.44e-4,-0.04003 -0.213661,-0.217643 -0.473666,-0.394705 -0.366882,-0.249846 -0.444804,-0.371624 -0.347995,-0.543852 0.08915,-0.158602 0.04686,-0.30506 -0.148212,-0.513303 -0.150126,-0.160258 -0.375505,-0.496766 -0.500845,-0.747796 -0.224563,-0.449751 -1.194376,-1.074431 -1.650322,-1.063013 -0.115019,0.0029 -0.332758,0.201727 -0.483862,0.44188 -0.151105,0.240153 -0.355766,0.436643 -0.454802,0.436643 -0.09904,0 -0.281638,0.196419 -0.405782,0.436486 -0.134202,0.25952 -0.287215,0.39733 -0.377404,0.339908 -0.100896,-0.06423 0.295339,-1.029878 1.183323,-2.883815 1.200197,-2.505771 1.371383,-2.791715 1.695174,-2.831537 0.324703,-0.03993 0.35239,-0.08678 0.281228,-0.475871 -0.04341,-0.237365 -0.02626,-0.514826 0.03812,-0.61658 0.06438,-0.101752 0.08793,-0.296364 0.05233,-0.432471 -0.08485,-0.324462 -0.429494,-0.190936 -0.588822,0.228131 -0.07126,0.187417 -0.233581,0.321364 -0.38945,0.321364 -0.368671,0 -0.482507,0.239641 -0.287193,0.604588 0.185593,0.346783 0.07458,0.602752 -1.673523,3.858506 -0.961477,1.790742 -0.977553,1.810898 -1.381223,1.731713 -0.224633,-0.04406 -0.475657,-0.170117 -0.557831,-0.280117 -0.08217,-0.11 -0.185145,-0.164261 -0.228826,-0.12058 -0.131936,0.131937 -1.049379,-0.227925 -1.049379,-0.411612 0,-0.094 0.244734,-0.772394 0.543852,-1.507535 0.299119,-0.73514 0.543852,-1.410627 0.543852,-1.501084 0,-0.165422 -0.585155,-0.334417 -1.157941,-0.334417 -0.223871,0 -0.332633,0.102282 -0.397587,0.373898 -0.33097,1.383993 -0.785292,2.617289 -0.964158,2.617289 -0.237691,0 -0.242848,-0.06141 -0.05717,-0.680713 0.202201,-0.674394 0.307689,-1.464829 0.290201,-2.174511 -0.01753,-0.71141 -0.373887,-1.112429 -0.873993,-0.983529 -0.431926,0.111326 -0.601685,0.392626 -0.778108,1.289367 -0.0846,0.430027 -0.207672,0.781866 -0.273487,0.781866 -0.06582,0 -0.139216,0.137663 -0.163112,0.305917 -0.03182,0.224084 -0.134373,0.305917 -0.383355,0.305917 -0.26824,0 -0.327905,-0.05734 -0.282983,-0.271926 0.133763,-0.638986 0.0773,-1.631208 -0.09091,-1.597566 -0.09348,0.01869 -0.169954,-0.02719 -0.169954,-0.101972 0,-0.07478 -0.146326,-0.135963 -0.325168,-0.135963 -0.349395,0 -0.398668,0.109819 -0.564272,1.257658 -0.05125,0.355203 -0.148928,0.645824 -0.217067,0.645824 -0.06814,0 -0.182045,0.152959 -0.253123,0.339908 -0.07108,0.186949 -0.230405,0.339908 -0.354059,0.339908 -0.227646,0 -0.220716,-0.430047 0.02976,-1.846737 0.05999,-0.339308 0.01136,-0.460235 -0.255358,-0.634997 -0.268427,-0.175879 -0.39008,-0.18579 -0.656687,-0.0535 -0.268799,0.133375 -0.334855,0.282704 -0.369948,0.836311 -0.0235,0.370671 -0.115272,0.720078 -0.203945,0.776464 -0.235305,0.149625 -0.773057,0.129258 -0.773057,-0.02928 0,-0.07478 0.145174,-0.135963 0.322609,-0.135963 0.289368,0 0.329598,-0.07273 0.390436,-0.70589 0.05306,-0.552219 0.145624,-0.767923 0.425188,-0.990839 0.196548,-0.156723 0.35736,-0.35913 0.35736,-0.449795 0,-0.256467 0.244395,-0.193856 0.332999,0.08531 0.04367,0.137586 0.228229,0.329809 0.410135,0.427163 0.313839,0.167961 0.326481,0.222917 0.247404,1.075483 -0.07436,0.80168 -0.0606,0.879728 0.12772,0.724454 0.116868,-0.09636 0.253715,-0.515441 0.306643,-0.939065 0.156134,-1.249657 0.205425,-1.28087 1.324553,-0.838774 0.363362,0.143542 0.369012,0.163878 0.310341,1.117014 -0.04584,0.744747 -0.02755,0.892552 0.07855,0.634741 0.07607,-0.184838 0.187136,-0.368388 0.246809,-0.407889 0.05967,-0.0395 0.195759,-0.43892 0.302412,-0.887598 0.173529,-0.730013 0.247176,-0.84197 0.700509,-1.064912 0.278626,-0.137022 0.506593,-0.335869 0.506593,-0.44188 0,-0.10601 0.06118,-0.192746 0.135963,-0.192746 0.07478,0 0.135963,0.13824 0.135963,0.307201 0,0.168962 0.113771,0.378255 0.252825,0.465096 0.149103,0.09312 0.292418,0.399376 0.349331,0.74651 l 0.09651,0.58862 0.207163,-0.389738 c 0.196991,-0.370602 0.239983,-0.385383 0.875608,-0.301065 1.2975,0.17212 1.266982,0.07612 0.586796,1.845916 -0.33039,0.859652 -0.600709,1.57201 -0.600709,1.583019 0,0.01101 0.09495,0.05645 0.211006,0.100988 0.127248,0.04883 0.176137,0.02455 0.123164,-0.06116 -0.140891,-0.227965 0.06014,-0.806493 0.280254,-0.806493 0.110745,0 0.194109,-0.04589 0.185253,-0.101973 -0.06389,-0.404597 0.04488,-0.577843 0.362761,-0.577843 0.456902,0 1.148934,0.364777 1.148934,0.605614 0,0.104908 -0.09007,0.280811 -0.200154,0.390895 -0.158978,0.158977 -0.165085,0.229259 -0.02969,0.34163 0.129956,0.107853 0.419729,-0.319169 1.219317,-1.796834 1.028526,-1.900751 1.166591,-2.307051 0.982232,-2.890538 -0.07213,-0.228279 0.01221,-0.369278 0.395934,-0.66196 0.26817,-0.204544 0.487582,-0.449275 0.487582,-0.543848 0,-0.09457 0.107619,-0.200093 0.239154,-0.23449 0.144405,-0.03776 0.550957,-0.698658 1.026173,-1.668156 0.54747,-1.116906 0.830282,-1.562353 0.929156,-1.463479 0.09887,0.09887 -0.06504,0.612139 -0.538532,1.686289 -0.46939,1.064852 -0.670284,1.691862 -0.647216,2.020024 0.0184,0.261728 9.49e-4,0.535518 -0.03869,0.608423 -0.03969,0.0729 -0.07533,0.281713 -0.07922,0.46402 -0.0048,0.224407 -0.13881,0.40292 -0.414956,0.552693 -0.321762,0.174514 -0.616869,0.648435 -1.397604,2.24446 -0.588522,1.203093 -0.939974,2.072974 -0.867009,2.14594 0.07296,0.07297 0.244418,-0.07423 0.422961,-0.363118 0.318556,-0.515436 0.581598,-0.589495 1.159127,-0.326356 0.267721,0.121982 0.38748,0.121982 0.509462,0 0.245357,-0.245358 0.404814,-0.189344 0.310141,0.108944 -0.06164,0.194222 0.04857,0.402167 0.398727,0.752329 0.266155,0.266154 0.485863,0.558357 0.488242,0.649338 0.0024,0.09098 0.08768,0.275336 0.189563,0.409677 0.101881,0.13434 0.155342,0.358581 0.118801,0.498314 -0.09315,0.356221 0.412111,0.648677 1.318868,0.763387 0.411288,0.05203 0.908763,0.175856 1.105499,0.27517 0.58092,0.293253 1.06991,0.97168 1.06991,1.484395 0,0.251578 0.06281,0.496232 0.139568,0.543673 0.07677,0.04744 0.124529,0.158124 0.106145,0.24596 -0.01838,0.08783 0.0771,0.325358 0.212195,0.527828 0.196216,0.294086 0.31997,0.353258 0.615278,0.294197 0.236603,-0.04732 0.429887,-0.0014 0.536994,0.127697 0.09204,0.110897 0.287454,0.170217 0.434265,0.131825 0.168721,-0.04412 0.267545,-0.0015 0.268609,0.11601 0.0027,0.292479 0.873793,0.792131 1.222221,0.701014 0.308808,-0.08075 0.313212,-1.34e-4 0.03982,0.728703 -0.03223,0.08591 0.0067,0.196591 0.08664,0.245959 0.07988,0.04937 0.145232,0.212124 0.145232,0.361683 0,0.14956 0.06162,0.233846 0.136923,0.187303 0.07531,-0.04654 0.174228,0.01259 0.219824,0.13141 0.06061,0.157946 0.129566,0.177303 0.256464,0.07198 0.131901,-0.109468 0.274235,0.01956 0.592929,0.537507 0.230651,0.374854 0.507529,0.89256 0.615286,1.150459 0.161814,0.387276 0.249177,0.45498 0.50183,0.388911 0.244984,-0.06407 0.288651,-0.03503 0.219261,0.145801 -0.06597,0.171925 -0.0084,0.2258 0.240969,0.2258 0.180189,0 0.369465,-0.06771 0.420616,-0.150479 0.06483,-0.104899 0.128405,-0.0946 0.209888,0.034 0.176311,0.278256 0.144232,0.524377 -0.06835,0.524377 -0.247653,0 -0.402998,0.4137293 -0.222948,0.5937803 0.205445,0.205444 0.171627,0.357961 -0.07938,0.357961 -0.239237,0 -0.233613,0.05502 0.138969,1.35963 0.246324,0.862519 0.275232,1.275835 0.08083,1.155686 -0.07477,-0.04622 -0.135963,0.02709 -0.135963,0.162909 0,0.206878 -0.09374,0.239697 -0.577843,0.202294 -0.317813,-0.02455 -0.730802,0.01916 -0.91775,0.09714 -0.279416,0.116558 -0.218926,0.129757 0.339907,0.07417 0.545621,-0.05427 0.741566,-0.01455 0.992639,0.201189 0.302406,0.259854 0.305375,0.283208 0.08915,0.701341 -0.226696,0.438377 -0.130288,0.660371 0.289356,0.666295 0.08111,0.0011 0.311024,0.185632 0.510911,0.4099706 0.219978,0.246888 0.497185,0.407888 0.702289,0.407888 0.438317,0 0.436258,0.241626 -0.0034,0.408816 -0.188291,0.07159 -0.404366,0.299511 -0.48017,0.506497 -0.0758,0.206984 -0.293027,0.504336 -0.482723,0.660779 l -0.344901,0.284442 0.376044,0.446902 0.376042,0.446902 -0.436878,0.39035201 c -0.240283,0.214692 -0.58887,0.390349 -0.774641,0.390349 -0.284649,0 -0.337762,0.06414 -0.337762,0.407889 0,0.22434 -0.06119,0.40789 -0.135963,0.40789 -0.07478,0 -0.135963,-0.142362 -0.135963,-0.31636 z M 52.375799,-12.620001 c 0.13535,-0.149559 0.19072,-0.269981 0.123045,-0.267603 -0.158056,0.0056 -0.598915,0.338672 -0.598915,0.452545 0,0.172666 0.234834,0.0814 0.47587,-0.184942 z m -12.168692,-9.3656 c 0,-0.06606 -0.137662,-0.14997 -0.305916,-0.186461 -0.168254,-0.03649 -0.412988,-0.111352 -0.543853,-0.166359 -0.136781,-0.05749 -0.237935,-0.04084 -0.237935,0.03917 0,0.07655 0.168255,0.200631 0.373898,0.275739 0.481766,0.175955 0.713806,0.18828 0.713806,0.03791 z m 12.782848,15.1871817 c 0.0019,-0.256909 0.145879,-0.370653 0.779895,-0.616091 0.513909,-0.198944 0.82328,-0.255303 0.912372,-0.166212 0.208407,0.208407 -0.08161,0.558793 -0.614802,0.742777 -1.097905,0.378844 -1.079961,0.378186 -1.077465,0.03952 z m -0.345399,-0.936898 c -0.06033,-0.190101 -0.0079,-0.347371 0.160791,-0.482911 0.237366,-0.190638 0.234754,-0.196741 -0.05066,-0.118399 -0.250439,0.06874 -0.33598,-0.0014 -0.509861,-0.417455 -0.114914,-0.275028 -0.208936,-0.522141 -0.208936,-0.54914 0,-0.09175 1.3496,-0.7334817 1.542561,-0.7334817 0.105582,0 0.270906,0.1905727 0.367385,0.4234957 0.141893,0.342558 0.142473,0.476249 0.003,0.699527 -0.148134,0.237199 -0.142092,0.264408 0.04294,0.193401 0.242847,-0.09319 0.559863,0.366297 0.414735,0.601122 -0.103466,0.167411 -1.218048,0.665752 -1.489013,0.665752 -0.10093,0 -0.223773,-0.126861 -0.272985,-0.281911 z m 1.412467,-0.470232 c 0.035,-0.035 0.03814,-0.08805 0.007,-0.117883 -0.09439,-0.09039 -1.076374,0.346156 -1.076374,0.478502 0,0.108864 0.905139,-0.196366 1.06939,-0.360619 z m -0.594482,-0.334004 c 0.04763,-0.07707 -0.007,-0.09986 -0.127939,-0.05344 -0.235545,0.09039 -0.278641,0.187841 -0.08307,0.187841 0.07037,0 0.16532,-0.06048 0.211006,-0.134406 z m -0.156786,-0.358458 c 0.34192,-0.16305 0.445844,-0.287732 0.396645,-0.47587 -0.08019,-0.306643 -0.17513,-0.31363 -0.787115,-0.05793 -0.508269,0.212369 -0.512383,0.218076 -0.388976,0.53967 0.103468,0.269632 0.203282,0.26888 0.779446,-0.0059 z m -1.536718,-0.993253 c -0.159891,-0.2987617 -0.143452,-0.3146177 0.810706,-0.7820207 0.517675,-0.253588 0.640852,-0.271136 0.80038,-0.114034 0.361622,0.35612 -0.136647,0.8416287 -1.100856,1.0726667 -0.282972,0.0678 -0.401352,0.02683 -0.51023,-0.176612 z m 1.490522,-0.5862477 c 0,-0.161594 -0.258822,-0.12202 -0.761239,0.116392 -0.671902,0.318839 -0.566806,0.4642127 0.149406,0.206666 0.336507,-0.121007 0.611833,-0.266383 0.611833,-0.323058 z m -1.960118,-0.326448 c -0.04715,-0.122873 -0.06899,-0.232284 -0.04854,-0.243135 1.184832,-0.62855 1.487709,-0.759021 1.600369,-0.689392 0.296848,0.183462 0.10359,0.448231 -0.579397,0.793791 -0.842105,0.426066 -0.861134,0.428781 -0.972434,0.138736 z\"\n        />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           width=\"100%\"\n           height=\"100%\" />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           transform=\"matrix(-0.99999448,-0.00332237,0.00332237,-0.99999448,61.817607,0.72065512)\"\n           width=\"100%\"\n           height=\"100%\" />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           transform=\"matrix(0.02368043,-0.99971957,0.99971957,0.02368043,30.338939,30.637309)\"\n           width=\"100%\"\n           height=\"100%\" />\n        <use\n           x=\"0\"\n           y=\"0\"\n           xlink:href=\"#camel-bg-svg\"\n           transform=\"matrix(0.01666783,0.99986108,-0.99986108,0.01666783,30.328036,-30.156237)\"\n           width=\"100%\"\n           height=\"100%\" />\n        <animateTransform attributeName=\"transform\" begin=\"0s\" dur=\"30s\" type=\"rotate\" from=\"0 32 0\" to=\"360 32 0\" repeatCount=\"indefinite\"/>\n    </g>\n</g>\n<g transform=\"translate(15 7)\" style=\"fill:{color}\">\n    <path\n       id=\"camel1-svg\"\n       d=\"m 7.1120645,15.742968 c 0,-0.141356 0.080261,-0.306614 0.1783575,-0.367241 0.3900625,-0.241072 0.132766,-0.831519 -0.8026075,-1.841834 -0.5395305,-0.582758 -0.980965,-1.173477 -0.980965,-1.312709 0,-0.139232 0.230657,-0.569939 0.5125715,-0.957126 C 6.750426,10.26008 6.824206,9.898644 6.392691,9.4354675 6.13114,9.1547255 5.82008,9.044045 5.292625,9.044045 4.0763811,9.044045 2.5513803,7.9194505 1.7552163,6.435424 1.6046997,6.154865 1.3237871,5.901559 1.130966,5.8725215 0.08694992,5.7152995 -0.04522895,5.641566 0.0107852,5.247649 0.05482421,4.9379465 0.25952798,4.803909 0.95873955,4.626939 1.449222,4.502798 2.1174305,4.4225375 2.4436475,4.4485815 2.9909712,4.4922765 3.0622256,4.5713935 3.3664537,5.4731875 3.9744838,7.275513 5.0751945,7.5913 6.4878145,6.368686 7.139636,5.8045385 7.454776,5.655257 7.9938965,5.655257 8.525677,5.655257 8.6961995,5.576776 8.768959,5.2985425 8.822452,5.093984 9.012241,4.941828 9.2138995,4.941828 c 0.1934115,0 0.4796715,-0.180587 0.636133,-0.4013035 0.2657095,-0.374832 0.3005665,-0.381029 0.5284125,-0.093947 0.205081,0.2583975 0.329006,0.2752475 0.777972,0.105782 0.414832,-0.1565815 0.656233,-0.147484 1.081502,0.04076 0.47769,0.2114455 0.536096,0.312422 0.458234,0.7922265 -0.07861,0.4843955 0.04027,0.681014 0.998019,1.650731 1.032691,1.045592 1.087254,1.144641 1.087254,1.9736815 0,0.968906 0.294163,1.9962175 0.571602,1.9962175 0.099,0 0.129005,0.132868 0.06669,0.295263 -0.06857,0.178678 0.03564,0.453811 0.263926,0.696805 0.352421,0.375134 0.368836,0.519934 0.249602,2.201739 l -0.127628,1.800196 -0.512095,0 c -0.596631,0 -0.591253,0.0142 -0.245659,-0.648452 0.561499,-1.076624 0.178023,-2.529917 -1.02899,-3.899658 -0.345769,-0.392386 -0.68495,-0.65848 -0.753734,-0.59132 -0.06879,0.06716 -0.181225,0.598422 -0.249867,1.180582 -0.08591,0.728563 -0.260945,1.223496 -0.561593,1.587931 -0.240235,0.291202 -0.677572,0.942194 -0.971862,1.446648 -0.390761,0.669821 -0.643305,0.918145 -0.936375,0.92073 -0.5232,0.0046 -0.50692,-0.191979 0.05991,-0.723389 0.961341,-0.901276 1.539109,-2.820442 1.37575,-4.569818 -0.100867,-1.0801625 -0.122926,-1.1209965 -0.660021,-1.221756 -0.390156,-0.073194 -0.847412,0.031555 -1.5351425,0.351671 -0.5387125,0.250753 -1.111346,0.456698 -1.27252,0.457656 -0.42096,0.0025 -0.460968,0.232339 -0.403919,2.320387 0.02814,1.030013 0.00532,2.213859 -0.050724,2.630769 -0.087335,0.649729 -0.162235,0.758019 -0.524299,0.758019 -0.248881,0 -0.4224095,-0.105581 -0.4224095,-0.25701 z M 7.3759455,12.5666 C 7.306477,12.051594 7.210979,11.565226 7.1637295,11.485784 7.0381275,11.274608 6.5893,11.928368 6.5826655,12.332158 c -0.00485,0.296627 0.6258675,1.170818 0.844762,1.170818 0.041155,0 0.017985,-0.421369 -0.051482,-0.936376 z\"\n      >\n       <animate\n             id=\"frame1\"\n             attributeName=\"display\"\n             values=\"inline;none;none;none;none;none\"\n             keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n             dur=\"1s\"\n             begin=\"0s\"\n             repeatCount=\"indefinite\" />\n    </path>\n    <path\n          id=\"camel2-svg\"\n          d=\"M 7.3178714,15.445942 C 7.5050368,14.694937 7.4709515,13.795226 7.2011665,12.36542 L 6.986861,11.229644 6.4839491,11.812196 c -0.7397701,0.856917 -0.7763682,1.20371 -0.2389533,2.264247 0.4536523,0.89524 0.4596535,0.942332 0.1490325,1.169464 C 5.8808001,15.621189 5.5759305,15.450608 5.5415664,14.768938 5.5245004,14.430396 5.4003351,13.775302 5.2656443,13.313173 5.0440088,12.552734 5.0503878,12.427472 5.3328163,11.994178 6.3993359,10.357953 6.5756539,9.1089201 5.7169372,9.2730743 4.7466199,9.4585621 4.0105416,9.1411042 2.8687515,8.0447011 2.256108,7.4564107 1.7548542,6.8330667 1.7548542,6.6594926 1.7548542,6.3676283 0.88041022,5.9795832 0.21602682,5.976619 -0.11065205,5.9751593 -0.05030538,5.1517832 0.28593702,5.0227549 0.44529549,4.9616033 1.1455409,4.8633993 1.8420379,4.8045236 L 3.108396,4.6974772 3.2214335,5.2626651 c 0.1947674,0.9738367 0.6487406,1.727538 1.1707851,1.943776 0.6616521,0.2740652 1.0763576,0.121924 1.9464919,-0.7141007 0.6110948,-0.5871397 0.8359908,-0.6925682 1.4773597,-0.6925682 0.6086309,0 0.7745172,-0.068764 0.8485149,-0.351732 0.056613,-0.2164893 0.2398841,-0.351732 0.476641,-0.351732 0.236757,0 0.4200278,-0.1352427 0.476641,-0.351732 0.1134526,-0.4338433 0.5016409,-0.4570726 0.7347299,-0.043966 0.139086,0.246505 0.217839,0.2640081 0.395644,0.087933 0.264061,-0.2614931 1.206841,-0.2958395 1.206841,-0.043966 0,0.096726 0.12794,0.175866 0.28431,0.175866 0.202268,0 0.256433,0.106607 0.187702,0.3694331 -0.09957,0.3807549 0.187234,1.2133609 0.417961,1.2133609 0.07153,0 0.413695,0.2836447 0.760372,0.6303216 0.608236,0.6082364 0.910358,1.3385186 1.012475,2.4473333 0.02672,0.2901789 0.200362,0.7016359 0.385861,0.9143479 0.1855,0.212713 0.290996,0.507344 0.234436,0.654736 -0.05769,0.150335 0.08696,0.493542 0.329483,0.781766 C 15.964448,12.403271 16,12.591674 16,14.222761 L 16,16 15.560335,16 c -0.441787,0 -0.613073,-0.399668 -0.263799,-0.615531 0.258636,-0.159846 0.214441,-0.96726 -0.104117,-1.902178 -0.259774,-0.762394 -1.676311,-2.582405 -2.009918,-2.582405 -0.0808,0 -0.196055,0.455053 -0.256116,1.01123 -0.06006,0.556176 -0.199025,1.169508 -0.308807,1.362961 -0.109782,0.193453 -0.308845,0.589151 -0.442362,0.87933 -0.133517,0.290179 -0.316807,0.665019 -0.407312,0.832977 -0.09051,0.167959 -0.164554,0.464733 -0.164554,0.659498 0,0.27622 -0.116059,0.354118 -0.527598,0.354118 -0.582631,0 -0.671984,-0.188835 -0.253638,-0.536031 0.720855,-0.598256 1.189731,-2.607674 1.031564,-4.420874 C 11.735122,9.6839943 11.731382,9.6757886 11.183804,9.5730623 10.79585,9.5002815 10.347795,9.6025836 9.6673567,9.9193056 9.1361691,10.166556 8.5605829,10.369625 8.3882761,10.37057 c -0.1723067,9.5e-4 -0.3495828,0.100643 -0.3939467,0.221551 -0.044364,0.120907 -0.012824,1.288218 0.070089,2.594023 0.082913,1.305805 0.1019093,2.424651 0.042215,2.486324 -0.059695,0.06167 -0.2946184,0.168476 -0.5220527,0.237339 -0.3940805,0.119321 -0.4066166,0.09752 -0.2667087,-0.463865 z\"\n    >\n       <animate\n             id=\"frame2\"\n             attributeName=\"display\"\n             values=\"none;inline;none;none;none;none\"\n             keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n             dur=\"1s\"\n             begin=\"0s\"\n             repeatCount=\"indefinite\" />\n     </path>\n     <path\n           id=\"camel3-svg\"\n           d=\"m 11.694744,15.893439 c 0,-0.05861 0.161653,-0.312069 0.359228,-0.563245 0.197576,-0.251177 0.44296,-0.76764 0.545299,-1.147697 0.199468,-0.74077 0.04948,-2.985451 -0.210214,-3.145949 -0.08501,-0.05254 -0.154555,-0.298474 -0.154555,-0.546528 0,-1.2490252 -0.695963,-1.4316719 -2.4854398,-0.652273 -1.1345943,0.494168 -1.1358967,0.495597 -1.0191106,1.1183 0.064315,0.342925 0.23144,0.844927 0.3713898,1.11556 0.1399497,0.270633 0.254454,0.632018 0.254454,0.803079 0,0.355498 0.2878241,1.32191 0.6513016,2.186843 0.327217,0.778647 0.33612,0.758581 -0.3364431,0.758356 C 9.0970953,15.819687 9.0853682,15.803356 9.0572243,14.965269 9.0371739,14.3682 8.8068602,13.664331 8.2925679,12.628382 7.8877878,11.813025 7.556604,11.064112 7.556604,10.96413 c 0,-0.475265 -0.3345929,-0.09336 -0.5894723,0.672831 -0.1563629,0.470039 -0.4925164,1.37599 -0.7470077,2.013226 -0.2544914,0.637235 -0.4627114,1.386148 -0.4627114,1.664252 0,0.441878 -0.068066,0.505642 -0.5397575,0.505642 -0.2968665,0 -0.5397574,-0.05291 -0.5397574,-0.117579 0,-0.06467 0.194409,-0.530209 0.4320199,-1.034535 0.2376107,-0.504326 0.5166616,-1.402738 0.6201129,-1.996471 0.1034512,-0.593733 0.2834043,-1.50102 0.399896,-2.016193 C 6.4250891,9.3499742 6.3135581,9.1630726 5.2394581,9.1630726 4.4783023,9.1630726 4.225077,9.0632738 3.4795999,8.4694934 2.3897141,7.6013883 2.0536586,7.2235444 1.8163793,6.5994526 1.6728502,6.2219424 1.4367193,6.0542405 0.81430111,5.8877689 0.15656621,5.7118517 0,5.5927101 0,5.2681131 0,4.7350942 0.04357633,4.7174114 1.7167989,4.5714542 L 3.1603568,4.4455309 3.3930449,5.3534319 C 3.5210232,5.8527775 3.8181222,6.4689245 4.0532649,6.7226475 4.7726057,7.4988291 5.5322213,7.3228031 6.9201075,6.0583128 7.1142899,5.8813953 7.5827716,5.6871364 7.9611783,5.6266267 8.3654233,5.5619853 8.7233122,5.378111 8.828904,5.1808112 8.9277464,4.9961222 9.1752761,4.8450131 9.3789696,4.8450131 c 0.2190393,0 0.4087978,-0.1470171 0.4644519,-0.3598383 0.113975,-0.4358409 0.5123125,-0.4700837 0.7397945,-0.063596 0.153922,0.2750439 0.19605,0.2750439 0.58873,0 0.23262,-0.1629331 0.526376,-0.2962422 0.652791,-0.2962422 0.363936,0 0.949522,0.6820918 0.949522,1.1060048 0,0.2323329 0.419889,0.8023275 1.053373,1.4299436 0.971283,0.9622864 1.061256,1.1200064 1.154544,2.0238768 0.06689,0.6480589 0.273567,1.2407685 0.609875,1.7489632 0.350594,0.529784 0.439114,0.791897 0.284808,0.843333 -0.26756,0.08919 -0.298836,0.696767 -0.04397,0.85428 0.288884,0.178541 0.212077,0.761008 -0.29962,2.27216 -0.415472,1.22698 -0.535658,1.416183 -0.899595,1.416183 -0.519205,0 -0.519315,0.004 0.02974,-1.079515 0.586035,-1.156485 0.568232,-1.761628 -0.07808,-2.653829 -0.803258,-1.108866 -0.911479,-1.100906 -0.911479,0.06704 0,1.467271 -0.967797,3.846228 -1.564705,3.846228 -0.227923,0 -0.414406,-0.04795 -0.414406,-0.106561 z\"\n     >\n       <animate\n             id=\"frame3\"\n             attributeName=\"display\"\n             values=\"none;none;inline;none;none;none\"\n             keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n             dur=\"1s\"\n             begin=\"0s\"\n             repeatCount=\"indefinite\" />\n     </path>\n     <path\n        id=\"camel4-svg\"\n        d=\"M 8.7959769,14.733538 C 8.7823709,13.962655 8.6416974,13.173477 8.4364574,12.716637 L 8.0992897,11.966141 7.9316262,12.622825 C 7.8394115,12.984001 7.7056873,13.828309 7.6344617,14.499065 7.5119445,15.65285 7.4771343,15.721823 6.9889944,15.77799 6.4016791,15.845568 6.3706616,15.734011 6.7310637,14.850321 6.8729831,14.50234 7.0314449,13.273019 7.0832012,12.118496 7.2025402,9.4564011 6.9826172,8.9629542 5.5925417,8.7738664 5.096474,8.7063876 4.5281652,8.6057104 4.3296332,8.550139 3.7880973,8.3985568 2.1379694,6.7917174 1.8662797,6.1514073 1.680471,5.7134991 1.4492167,5.5465837 0.81406548,5.3919372 0.12893242,5.2251211 0,5.1208599 0,4.7336426 0,4.336324 0.11518495,4.2524818 0.84430805,4.1190775 1.3086775,4.0341139 2.0169795,3.9496831 2.4183125,3.9314535 3.1424232,3.8985623 3.1505359,3.9060226 3.4781201,4.9059984 3.895193,6.179146 4.3323163,6.6203411 5.2093056,6.6533106 5.7732981,6.6745132 6.0485257,6.539104 6.7434918,5.8985065 7.4356058,5.2605383 7.724319,5.1178647 8.3231936,5.1178647 c 0.5750126,0 0.7539352,-0.080801 0.8309348,-0.375248 0.058037,-0.221935 0.2559221,-0.375248 0.4843416,-0.375248 0.2124165,0 0.476584,-0.1688617 0.587039,-0.3752481 0.240288,-0.4489831 0.750496,-0.4991125 0.750496,-0.073738 0,0.2135636 0.09577,0.2620819 0.328342,0.1663373 0.720327,-0.2965451 0.990415,-0.3092897 1.52643,-0.072027 0.471409,0.2086657 0.542941,0.3271373 0.456995,0.7568685 -0.08426,0.4213047 0.04204,0.6497726 0.729807,1.3201051 1.143179,1.114209 1.40549,1.5840968 1.552296,2.7806783 0.06963,0.5675626 0.216264,1.2924751 0.325848,1.6109161 0.136653,0.397104 0.138925,0.686766 0.0072,0.922089 -0.176098,0.314669 -0.214883,0.299452 -0.467988,-0.183617 -0.387542,-0.739649 -0.571885,-0.301548 -0.300332,0.713757 0.176363,0.659403 0.172812,1.132697 -0.01664,2.2179 -0.341473,1.955965 -0.274035,1.856066 -1.228584,1.81996 -0.934764,-0.03536 -1.039183,-0.214301 -0.475299,-0.814528 0.284272,-0.302594 0.382184,-0.688895 0.407282,-1.606897 0.03651,-1.33541 -0.154678,-1.844834 -0.867715,-2.312035 -0.390874,-0.25611 -0.476679,-0.46085 -0.476679,-1.137407 0,-0.7595531 -0.0436,-0.8346499 -0.548976,-0.9456498 C 11.540584,9.0697376 11.06967,9.1757694 10.327657,9.5151734 9.749393,9.7796771 9.1690775,9.996089 9.0380672,9.996089 c -0.2709452,0 -0.1985999,1.246308 0.082427,1.419992 0.091792,0.05673 0.1668938,0.589424 0.1668938,1.183763 0,0.59434 0.1304728,1.519966 0.2899394,2.056949 C 9.900035,15.743466 9.8335656,16.000084 9.2294095,16 8.8492003,15.999947 8.8166498,15.904837 8.7959769,14.733538 Z\"\n     >\n        <animate\n           id=\"frame4\"\n           attributeName=\"display\"\n           values=\"none;none;none;inline;none;none\"\n           keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n           dur=\"1s\"\n           begin=\"0s\"\n           repeatCount=\"indefinite\" />\n     </path>\n     <path\n        id=\"camel5-svg\"\n        d=\"M 7.1493305,15.450337 C 7.5631556,14.650087 7.5205085,13.34185 7.0672237,12.931633 6.7569062,12.6508 6.6927936,12.311573 6.6480373,10.713674 L 6.5951997,8.8272558 5.8499795,8.7775975 C 5.4401084,8.7502855 4.9088829,8.6839924 4.6694783,8.6302797 4.1226173,8.5075861 2.4960161,7.0038832 1.9099589,6.0792563 1.5757991,5.5520499 1.3419893,5.3799123 0.95713494,5.3777595 0.27262434,5.373931 -0.06953266,5.1308761 0.01178373,4.7062204 0.09008118,4.2973304 1.5580726,3.8549351 2.5746867,3.9338613 3.1545724,3.9788816 3.2382447,4.0624038 3.506212,4.8637148 3.9045618,6.0549132 4.4254237,6.5406054 5.3299645,6.5643233 5.9338164,6.5801574 6.1745259,6.4657743 6.7514541,5.8888461 7.3404186,5.2998816 7.5691837,5.1943074 8.2564263,5.1943074 c 0.6537502,0 0.8292719,-0.072038 0.9078732,-0.3726101 0.057629,-0.2203749 0.2541231,-0.3726101 0.4809368,-0.3726101 0.2109232,0 0.4732337,-0.1676745 0.5829117,-0.3726101 0.238599,-0.4458269 0.74522,-0.4956038 0.74522,-0.07322 0,0.2148251 0.09209,0.2594296 0.326034,0.1579153 0.592919,-0.2572835 1.537017,-0.3218269 1.537017,-0.1050783 0,0.1136783 0.131405,0.2066879 0.292012,0.2066879 0.202907,0 0.25746,0.1088648 0.178779,0.3567664 -0.183804,0.5791162 0.09366,1.3018894 0.621072,1.6178186 0.972378,0.5824775 1.487316,1.4989472 1.62451,2.8912548 0.06994,0.7097724 0.199984,1.3355011 0.288987,1.3905091 0.222574,0.137558 0.205144,1.195853 -0.0197,1.195853 -0.09984,0 -0.326172,-0.272471 -0.502967,-0.605491 -0.467733,-0.881043 -0.557324,-0.182795 -0.09382,0.731169 0.254699,0.502226 0.381726,1.20786 0.430141,2.38944 l 0.0687,1.676745 -0.512339,0.05895 c -0.500627,0.0576 -0.69698,-0.202303 -0.326034,-0.431561 0.294025,-0.181717 0.217118,-1.928111 -0.115807,-2.629696 -0.375807,-0.791955 -0.603838,-0.953458 -0.487588,-0.345335 0.05233,0.273725 -0.109633,0.864282 -0.399523,1.456796 -0.268137,0.548052 -0.487522,1.176737 -0.487522,1.397076 0,0.320927 -0.111179,0.400617 -0.558915,0.400617 -0.677354,0 -0.693447,-0.15782 -0.104577,-1.025569 0.249887,-0.368228 0.550474,-0.960796 0.667972,-1.316819 0.193328,-0.58579 0.15098,-0.784126 -0.445562,-2.086767 C 12.591695,10.59284 12.269432,9.7774115 12.238111,9.5724759 12.15601,9.035273 11.346611,9.0031784 10.382034,9.498878 9.9387594,9.7266782 9.3260954,9.9653093 9.0205583,10.029169 l -0.5555222,0.116109 -0.00339,1.560209 c -0.00312,1.433143 0.036834,1.603273 0.4905408,2.088988 0.2716632,0.290829 0.6279716,0.52878 0.7917961,0.52878 0.1935167,0 0.2978626,0.163163 0.2978626,0.465762 0,0.25617 -0.04743,0.465763 -0.1054003,0.465763 -0.2360649,0 -0.9501023,-0.446888 -1.4316163,-0.895993 l -0.5123388,-0.477854 0,1.059533 C 7.9924876,15.995521 7.9901047,16 7.4287881,16 l -0.5636994,0 0.2842418,-0.549663 z\"\n     >\n     <animate\n        id=\"frame5\"\n        attributeName=\"display\"\n        values=\"none;none;none;none;inline;none\"\n        keyTimes=\"0;0.20;0.40;0.60;0.80;1\"\n        dur=\"1s\"\n        begin=\"0s\"\n        repeatCount=\"indefinite\" />\n     </path>\n</g>\n</g>\n</svg>\n<div class=\"yo-loading {loading} ani fade-in\">\n    <span class=\"inner\">\n        <i class=\"yo-ico\"></i>\n        <div class=\"svg\">\n            <svg viewBox=\"10 0 30 25\" class=\"yo-camel\">\n                <use xlink:href=\"#camel-loading-svg\"></use>\n            </svg>\n        </div>\n        <p>{ content }</p>\n    </span>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["camel-loading"];

    })( module.exports , module , __context );
    __context.____MODULES[ "716e913d8c374a4e1f5ceffbb5ab1c91" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8cd7c0dbdcff97054640277b122bfb1c" ,
        filename : "camel-loading.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot =__context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var tpl  =__context.____MODULES['716e913d8c374a4e1f5ceffbb5ab1c91'];

riot.tag('camel-loading',tpl,_camel);

function _camel(opts) {
    this.content = opts.content || '加载中...';
    this.bgcolor = opts.bgcolor || '#1ba9ba';
    this.color   = opts.color || '#1ba9ba';
    this.loading = opts.loading || 'yo-loading-camel';
    this.fill    = opts.fill || "#f2f8fb";
};


    })( module.exports , module , __context );
    __context.____MODULES[ "8cd7c0dbdcff97054640277b122bfb1c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "81ecc97e3a4872efcc6cdad309523063" ,
        filename : "coupon-question-banner.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["coupon-question-banner"] = "<div class=\"mask\">\n    <div class=\"logo\"></div>\n    <div class=\"desp\">\n            <h4 class=\"sub\">完成下列问题</h4>\n            <h1 class=\"title\" node-type=\"title\">{opt.description}</h1>\n    </div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["coupon-question-banner"];

    })( module.exports , module , __context );
    __context.____MODULES[ "81ecc97e3a4872efcc6cdad309523063" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "783b6ff5189aa241924cbaa79870d3d8" ,
        filename : "coupon-question-list.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["coupon-question-list"] = "<div class=\"yo-list yo-list-question\">\n        <div class=\"item item-active\" each=\"{list,index in opt.list}\">\n            <i>{index+1}.</i>\n            <div class=\"content\">\n                <h2>{list.content}</h2>\n                <div class=\"label\" each=\"{option in list.chosenList}\" ontap=\"{toggle}\" >\n                    <span class=\"yo-checked yo-checked-{list.chosenType}\">\n                        <coupon-question-checked class=\"input\" type=\"{ radio: list.chosenType == 'Single',checkbox: list.chosenType != 'Single' }\" value={option.option} name=\"{list.id}\" checked=\"{false}\"></coupon-question-checked>\n                        <span class=\"type\"></span>\n                    </span>\n                    <span class=\"inner\">{option.content}</span>\n                </div>\n            </div>\n        </div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["coupon-question-list"];

    })( module.exports , module , __context );
    __context.____MODULES[ "783b6ff5189aa241924cbaa79870d3d8" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bc40f0d8059bd7cdbaf86618a7c22299" ,
        filename : "tag.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var mojo =__context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var on   = __context.____MODULES['05086ce277b1fc4c5620d4b8632ff482'];
var event= __context.____MODULES['b523ec41eae0dacaed9a04530cd54f92'];
var $    = mojo.util;

__context.____MODULES['a6c80e180250a7a0f4ce675448e2a3a1'];
__context.____MODULES['e4c384a1fe51ff91da43f7d33a863850'];
__context.____MODULES['8cd7c0dbdcff97054640277b122bfb1c'];

var html  =__context.____MODULES['b7b4126b8cb7e53d77c54138db0c4807'];
riot.tag('coupon-question',html,function(opt) {
    var self = this;

    this.opt = opt;
    this.loading = opt.loading;
    this.error = opt.error;
    this.submit = on(event.submit);
    this.closeMe = on(event.closeMe);
    this.on('mount',on(event.mounted));
});

riot.tag('coupon-question-checked','',function(opt) {
    var self = this;
    var root = $(self.root);
    var label = root.closest('.label');

    this.checked = opt.checked;
    this.value   = opt.value;
    this.on('checked',on(event.checkedStateChange));
    this.getState = function() {
        return this.checked;
    };
    this.setState = function(state) {
        this.checked = state;
        if (state) {
            label.addClass('active');
        } else {
            label.removeClass('active');
        }
    };
    this.getValue = function() {
        return this.value;
    };
});

var banner =__context.____MODULES['81ecc97e3a4872efcc6cdad309523063'];
riot.tag('coupon-question-banner',banner,function(opt) {
    this.opt = opt;
});

var list =__context.____MODULES['783b6ff5189aa241924cbaa79870d3d8'];
riot.tag('coupon-question-list',list,function(opt) {
    var ids  = [];

    _initSubmits();

    this.opt = opt;
    this.submits = ids;
    this.btnDisableFlag = new btnDisableState();
    this.panel = opt.panel;

    this.toggle = on(event.labelTapped);
    this.on('mount',on(event.listPanelReady));

    function _initSubmits() {
        for (var i = 0; i < opt.list.length; i++) {
            var _item = {
                questionId: opt.list[i].id,
                answers: []
            };
            ids.push(_item)
        }
    };

    function btnDisableState() {
        this.state = true;
        this.setState = function(state) {
            this.state = state;
            this.trigger('change');
        };

        riot.observable(this);
        this.on('change',function() {
            $('.yo-btn-submit').prop('disabled',this.state);
        });
    };
});


    })( module.exports , module , __context );
    __context.____MODULES[ "bc40f0d8059bd7cdbaf86618a7c22299" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bbd783bc5b71e9286c4d1c2c953188f3" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var QApp  =__context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var _     = QApp.util;
var ua    = __context.____MODULES['e61f36f5986ba8a952697caa9e86c301'];
var html  =__context.____MODULES['b7b4126b8cb7e53d77c54138db0c4807'];
var on    = __context.____MODULES['05086ce277b1fc4c5620d4b8632ff482'];
var bind  =__context.____MODULES['1ce55f56df18203b9aff395418baf054'];
var tag   =__context.____MODULES['bc40f0d8059bd7cdbaf86618a7c22299'];
var event =__context.____MODULES['b523ec41eae0dacaed9a04530cd54f92'];
var riot  = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var old   = __context.____MODULES['6bee53f0a07b8d1f5e43ce208e628864'];

QApp.defineView('coupon.question', {
    html: _generateHTML(),
    plugins: [],
    init: {
        getQuestions: on(bind.getQuestions),
        renderData: on(bind.renderData),
        hideNativeBar: on(bind.hideNativeBar),
        errorHandler: on(bind.errorHandler),
        dataStore:{
            urls:{
                question: '/balance/api/question/questions',
                submit: '/balance/api/question/submit'
            }
        }
    },
    bindEvents: {},
    ready: function() {
        var self = this;

        self.hideNativeBar();
        self.renderData(function() {
            self.getQuestions();
        });

        //debug
        window.mojo = QApp;
        // window.riot = riot;

        self.Tag = riot.mount('coupon-question',{loading:true});
    }
});

function _generateHTML() {
    var pad = "";
    if(/qunariphone/.test(ua())){
        pad = "style=\"padding-top:.22rem;\"";
    }
    var tpl = ['<coupon-question class="m-coupon-question yo-flex ani" ',pad,'></coupon-question>'].join('');

    return tpl;
};


    })( module.exports , module , __context );
    __context.____MODULES[ "bbd783bc5b71e9286c4d1c2c953188f3" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4dfebf9fbf72067b82891077756e9c72" ,
        filename : "index.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["index"] = "<yo-header title=\" \" icon=\"&#xf077;\" class=\"yo-header yo-header-transparent\" action=\"{closeMe}\"></yo-header>\n<div class=\"yo-align\">\n    <div class=\"m-coupon-finish-animate\">\n        <div class=\"m-data\">\n            <div class=\"yellow-cards ani coupon-action-flow-reverse\"></div>\n            <div class=\"little-guy ani coupon-action-flow\"></div>\n            <div class=\"coupon-envolope\">\n                <div class=\"content ani coupon-action-grow\">\n                    <h4>恭喜您获得</h4>\n                    <p><span class=\"yen\">&yen;</span>{ opt.amount }</p>\n                </div>\n            </div>\n            <div class=\"m-coupon-finish-btn-group\">\n                <button if=\"{full}\" class=\"yo-btn yo-btn-l yo-btn-stacked yo-btn-material yo-btn-full\" data-href={fullURL} onTap={onFullBtnTaped}>{full}</button>\n                <button if=\"{stroke}\" class=\"yo-btn yo-btn-l yo-btn-stacked yo-btn-material yo-btn-stroke\" data-href={strokeURL} onTap={onStrokeBtnTaped}>{stroke}</button>\n            </div>\n        </div>\n    </div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["index"];

    })( module.exports , module , __context );
    __context.____MODULES[ "4dfebf9fbf72067b82891077756e9c72" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e64e16dac4221fd1fac3d1b467745585" ,
        filename : "openURL.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var api = __context.____MODULES['6c9893c99df65ee676be86e077974f32'];
var ua = __context.____MODULES['e61f36f5986ba8a952697caa9e86c301'];
var mojo  = __context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];

function _openURL(_url, _close, _extra) {
    // @_url:string
    // @_close:
    //     不传,true : closeMe
    //     false     : dontcloseMe
    //@_extra:
    //     可不传
    // {
    //     title:'啥玩意儿?',
    //     nav:"navibar-none",
    //     env:"OLD"/"NEW",
    //     onback:function() {}
    // }

    var close = true;
    var apiReady = false;

    if (typeof _close !== "undefined") {
        if (!_close) {
            close = false;
        }
    }

    var nav =  (_extra && _extra.nav) || "navibar-normal";

    var title = (_extra && _extra.title) || " "  ;

    var env = (_extra && _extra.env) || mojo.api || "OLD";

    var onback = function(){};
    if (_extra && _extra.onback) {
        onback = _extra.onback;
    }

    api.ready(function() {
        apiReady = true;
        if (/qunar/.test(ua())) {
            if (env == 'NEW') {
                openView(_url, close, nav, title, onback);
            } else {
                window.location.href = _url;
            }
        } else {
            window.open(_url);
        }
    });

    setTimeout(function() {
        if (apiReady == false) {
            window.location.href = _url;
        }
    },1000);

};

function openView(_url, close, nav, title, onback) {

    var webViewOpts = {};
    var __hash = _url.split('?')[1] ? _url.split('#')[1] : '';
    webViewOpts.url = _url;
    webViewOpts.type = nav;
    webViewOpts.navigation = {
               title:{
                   style: 'text',
                   text: title
               }
           };

    api.hy.openWebView(webViewOpts);

    if (close) {
        closeViewHandler();
    }

    onBackHandler();

    function closeViewHandler() {
        api.hy.onCloseWebView({
            success: function() {
                api.hy.closeWebView({});
            }
        })
    };

    function onBackHandler() {
        if (onback) {
            api.hy.onShow({
                success: function() {
                    onback();
                }
            })
        }
    };
};

module.exports = _openURL;


    })( module.exports , module , __context );
    __context.____MODULES[ "e64e16dac4221fd1fac3d1b467745585" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "6e8d578c1acfbf3ed721713c57ee70ba" ,
        filename : "event.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    mounted: mounted,
    closeMe: closeMe,
    onBtnTaped: onBtnTaped
}

var mojo =__context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var $ = mojo.util;
var event = module.exports;

function mounted() {
    var self = this;
    var root = self.root;

    setTimeout(function() {
        $(root).css('display','block');
        $(root).addClass('m-coupon-finish');
        $(root).addClass('fade-in-up-fast');
    },500);
};

function closeMe() {
    var closeMe = __context.____MODULES['021a472bd1ec6ceb280d26247f76f1ab'];
    window.history.go(-2);
    closeMe();
};

function onBtnTaped(e) {
    var closeMe = __context.____MODULES['021a472bd1ec6ceb280d26247f76f1ab'];
    var uaJudge = __context.____MODULES['e61f36f5986ba8a952697caa9e86c301'];
    var openURL = __context.____MODULES['e64e16dac4221fd1fac3d1b467745585'];
    var loading = __context.____MODULES['171a92febb96d571c18cd0fe6caed2cf'];

    var target = $(e.target);
    var href = target.data('href');

    loading.show({});

    setTimeout(function() {
        loading.hide();
    },3000);

    if (href) {
        if (/qunar/.test(uaJudge())) {
            href = uaJudge()+'://web/url?url='+encodeURIComponent(href);
        }
        openURL(href);
    } else {
        event.closeMe();
    }
};


    })( module.exports , module , __context );
    __context.____MODULES[ "6e8d578c1acfbf3ed721713c57ee70ba" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "04e6f145f06812a21cf1cf59177b3e76" ,
        filename : "tag.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot  = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var event = __context.____MODULES['6e8d578c1acfbf3ed721713c57ee70ba'];
var on    = __context.____MODULES['05086ce277b1fc4c5620d4b8632ff482'];

__context.____MODULES['a6c80e180250a7a0f4ce675448e2a3a1'];

var html  = __context.____MODULES['4dfebf9fbf72067b82891077756e9c72'];
riot.tag('coupon-finish',html,function(opt) {
    var full = "查看会员红包";
    var stroke = "红包商城";
    var fullURL = window.location.href.replace(/\/question.html.*/,"/detail.html");
    var strokeURL = "http://hbhuanli.qunar.com";

    if (opt.callback) {
        full = "完成";
        stroke = "";
        fullURL = opt.callback;
    }

    this.opt = opt;
    this.full = full;
    this.stroke = stroke;
    this.fullURL = fullURL;
    this.strokeURL = strokeURL;
    this.closeMe = on(event.closeMe);
    this.onFullBtnTaped = on(event.onBtnTaped);
    this.onStrokeBtnTaped = on(event.onBtnTaped);
    this.on('mount',on(event.mounted));
});


    })( module.exports , module , __context );
    __context.____MODULES[ "04e6f145f06812a21cf1cf59177b3e76" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "79137772c2f85687fdd2c837c6edcced" ,
        filename : "bind.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = {
    renderData : renderData
}

var mojo = __context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];

function renderData() {
    var self = this;
    var store = self.dataStore;
    var questionTag = mojo.tags["coupon-question"];
    var resData = questionTag.dataStore.exports;
    var amount = 0;
    var callback = resData.callBackUrl || "";

    try {
        amount = parseFloat(resData.amount);
    } catch (e) {}

    store.callback = resData.callBackUrl;
    store.amount = amount;
};


    })( module.exports , module , __context );
    __context.____MODULES[ "79137772c2f85687fdd2c837c6edcced" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "87432772a896e4a49f66a198422018df" ,
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var QApp  =__context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var ua    = __context.____MODULES['e61f36f5986ba8a952697caa9e86c301'];
var $ = QApp.util;
var html =__context.____MODULES['4dfebf9fbf72067b82891077756e9c72'];
var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var on   = __context.____MODULES['05086ce277b1fc4c5620d4b8632ff482'];
var tag  = __context.____MODULES['04e6f145f06812a21cf1cf59177b3e76'];
var bind = __context.____MODULES['79137772c2f85687fdd2c837c6edcced'];

QApp.defineView('coupon.finish', {
    html: _generateHTML(),
    plugins: [],
    init: {
        Tag: null,
        renderData: on(bind.renderData),
        dataStore:{}
    },
    bindEvents: {},
    ready: function() {
        var self = this;

        self.renderData();
        self.Tag = riot.mount("coupon-finish",self.dataStore);
    }
});

function _generateHTML() {
    var style = ["style=\"","display:none;","\""].join('');;
    if(/qunariphone/.test(ua())){
        style = ["style=\"",
                 "display:none;",
                 "padding-top:.22rem;",
                 "\""].join('');
    }
    var tpl = ['<coupon-finish class="yo-flex ani" ',style,'></coupon-finish>'].join('');
    return tpl;
};


    })( module.exports , module , __context );
    __context.____MODULES[ "87432772a896e4a49f66a198422018df" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "decaf5630ae98aabc55aca15942ebdaf" ,
        filename : "initApp.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var mojo = __context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var app  = null;

createApp(function() {
    riot.mount('qapp-app');
});

function createApp(callback) {

    riot.tag('qapp-app','',function() {
        var self = this;
        self.on("mount",function() {
            app = self;
            mojo.app = self;
        })
    });

    var app = document.createElement("QAPP-APP");
    document.body.appendChild(app);
    callback();
};


    })( module.exports , module , __context );
    __context.____MODULES[ "decaf5630ae98aabc55aca15942ebdaf" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a44ab2c607b1823422f9f727df3784a4" ,
        filename : "initRoute.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];
var mojo = __context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];

riot.route(function(collection,id,action){
    //url#collection/id/action
    var current = mojo.currentTag;
    var name    = collection;
    var cache   = mojo._viewCache;
    var app     = document.querySelector("QAPP-APP");

    if (cache[name]) {
        //TODO
        //存在缓存怎么办呢
    } else {
        var view = document.createElement('QAPP-VIEW');
            view.id = current;
            view.className = 'ani fade-in';
            app.appendChild(view);
            cache[name] = view;

        var _inter = setInterval(function() {
        //appendChild有时间延时必须这么做
            var _view = document.getElementById(current);
            if (_view) {
                //ready
                var _tag = mojo.tags[current];
                _view.innerHTML = _tag.option.html;
                _tag.option.ready.bind(_tag)();
                clearInterval(_inter);
            }
        },0);
    }
});


    })( module.exports , module , __context );
    __context.____MODULES[ "a44ab2c607b1823422f9f727df3784a4" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "d2dc22c3cbc467234e1f2402befb3572" ,
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
    __context.____MODULES[ "d2dc22c3cbc467234e1f2402befb3572" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "3b084b6b70fa1dec8efa1a2816c8b234" ,
        filename : "question.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    //require views
__context.____MODULES['bbd783bc5b71e9286c4d1c2c953188f3'];
__context.____MODULES['87432772a896e4a49f66a198422018df'];

//router config & qapp-app Tag & tocca for Tap event
__context.____MODULES['decaf5630ae98aabc55aca15942ebdaf'];
__context.____MODULES['a44ab2c607b1823422f9f727df3784a4'];
__context.____MODULES['d2dc22c3cbc467234e1f2402befb3572'];

//require mojos
//---riot adapter for QApp
var mojo = __context.____MODULES['4e8df976b60b3a8678c6a9b6bddd344a'];
var riot = __context.____MODULES['49dd278f29117ff42d363e904cef1cef'];

riot.route.base('#/');
mojo.show('coupon.question');

//Debug store
// window.mojo = mojo;

//Debuging finish
// setTimeout(function(){
//     mojo.show('coupon.finish');
// },200);

document.body.addEventListener('touchstart', function () {
    //webkit浏览器需要这个代码块以激活:active伪类,解释如下
    //https://developer.mozilla.org/en-US/docs/Web/CSS/:active
});


    })( module.exports , module , __context );
    __context.____MODULES[ "3b084b6b70fa1dec8efa1a2816c8b234" ] = module.exports;
})(this);
