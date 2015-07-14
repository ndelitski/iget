'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _store = require('./store');

var Translator = (function () {
    function Translator(_ref) {
        var store = _ref.store;
        var _ref$locales = _ref.locales;
        var locales = _ref$locales === undefined ? [] : _ref$locales;
        var _ref$lang = _ref.lang;
        var lang = _ref$lang === undefined ? 'en' : _ref$lang;
        var _ref$stringsLang = _ref.stringsLang;
        var stringsLang = _ref$stringsLang === undefined ? 'en' : _ref$stringsLang;

        _classCallCheck(this, Translator);

        this._store = store;
        this._resultLang = lang;
        this._defaultStringsLang = stringsLang;
        this.extendTranslateMethods(locales);
    }

    _createClass(Translator, [{
        key: 'extendTranslateMethods',
        value: function extendTranslateMethods(locales) {
            var _this = this;

            this.translate = this.translate.bind(this);
            this.translate._store = this._store; //for test purposes
            locales.forEach(function (lang) {
                _this.translate[lang] = function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return _this.translate.apply(_this, [lang].concat(args));
                };
            });
            //immutable
            this.translate.lang = function (toLang) {
                return new Translator({ store: _this._store, lang: toLang, locales: locales }).translate;
            };
        }
    }, {
        key: 'translate',
        value: function translate(strLang, str) {
            if (arguments.length == 1) {
                str = strLang;
                strLang = this._defaultStringsLang;
            }
            return this._store.get(strLang, str, this._resultLang);
        }
    }]);

    return Translator;
})();

var STORE_CACHE = {};

exports['default'] = function (_ref2) {
    var store = _ref2.store;
    var file = _ref2.file;
    var url = _ref2.url;
    var project = _ref2.project;
    var stringsLang = _ref2.stringsLang;
    var _ref2$locales = _ref2.locales;
    var locales = _ref2$locales === undefined ? ['en', 'ru'] : _ref2$locales;
    var _ref2$lang = _ref2.lang;
    var lang = _ref2$lang === undefined ? 'en' : _ref2$lang;

    if (!store && file) {
        store = new _store.LocalStore({ file: file });
    } else if (!store && url && project) {
        if (STORE_CACHE[url + project]) {
            store = STORE_CACHE[url + project];
        } else {
            store = new _store.RemoteStore({ url: url, project: project });
            STORE_CACHE[url + project] = store;
        }
    } else if (!store) {
        throw new Error('store should be defined or file/url parameter');
    }

    var tr = new Translator({ locales: locales, lang: lang, store: store, stringsLang: stringsLang });

    if (store.fetched && store.fetched.then) {
        return store.fetched.then(function () {
            return tr.translate;
        });
    } else {
        return _Promise.resolve(tr.translate);
    }
};

module.exports = exports['default'];