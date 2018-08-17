"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var errorLog = console.error.bind(console);
var mostTypeKey = '@MostTypeId';
var typeAnnotationKey = '@Scope';
/**
 * Use as public static property "@Scope" in a class to autobind on
 * first injection attempt.
 */
var Scope;
(function (Scope) {
    Scope[Scope["SINGLETON"] = 0] = "SINGLETON";
    Scope[Scope["PROTOTYPE"] = 1] = "PROTOTYPE";
})(Scope = exports.Scope || (exports.Scope = {}));
var InstanceGetter = /** @class */ (function () {
    function InstanceGetter(cnstrct, args) {
        this.cnstrct = cnstrct;
        this.constructArgs = args || [];
        this.constructing = false;
    }
    InstanceGetter.prototype.setConstructing = function () {
        this.constructing = true;
    };
    InstanceGetter.prototype.setConstructed = function () {
        this.constructing = false;
    };
    InstanceGetter.prototype.isConstructing = function () {
        return this.constructing;
    };
    InstanceGetter.prototype.prependToArray = function (obj, arr) {
        var result = [obj];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var o = arr_1[_i];
            result.push(o);
        }
        return result;
    };
    InstanceGetter.prototype.postProcess = function (obj) {
        if (typeof (obj['mostInit']) == 'function') {
            mostInitHandler.push(function () { obj['mostInit'](); });
        }
    };
    return InstanceGetter;
}());
var SingletonGetter = /** @class */ (function (_super) {
    __extends(SingletonGetter, _super);
    function SingletonGetter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inst = null;
        return _this;
    }
    SingletonGetter.prototype.getInst = function (args) {
        if (this.inst === null) {
            if (this.isConstructing())
                throw new Error('circular dependency detected');
            this.setConstructing();
            this.inst = new (Function.prototype.bind.apply(this.cnstrct, this.prependToArray(this.cnstrct, this.constructArgs)));
            this.setConstructed();
            this.postProcess(this.inst);
        }
        return this.inst;
    };
    return SingletonGetter;
}(InstanceGetter));
var PrototypeGetter = /** @class */ (function (_super) {
    __extends(PrototypeGetter, _super);
    function PrototypeGetter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrototypeGetter.prototype.getInst = function (argv) {
        var args = this.prependToArray(this.cnstrct, argv);
        var instance = new (Function.prototype.bind.apply(this.cnstrct, args));
        this.postProcess(instance);
        return instance;
    };
    return PrototypeGetter;
}(InstanceGetter));
var conf = {};
var mostIdCounter = 0;
var recurseDepth = -1;
var injectStackMarker = 'injectStack';
var mostInitHandler = [];
function fireInitHandler() {
    var handlers = mostInitHandler;
    mostInitHandler = [];
    for (var i = handlers.length - 1; i >= 0; --i) {
        // execute most initHandler in reverse order, though that probably doesn't matter;
        handlers[i]();
    }
}
var MostBinder = /** @class */ (function () {
    function MostBinder(c, id) {
        this.id = id;
        this.c = c;
        c[mostTypeKey] = id;
    }
    /**
     * Bind a class to an implementation. This cannot be an interface, since typescript drops them on compilation.
     */
    MostBinder.prototype.toSingleton = function (cnstrct) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        conf[extractMostId(this.c)] = new SingletonGetter(cnstrct, args);
    };
    /**
     * Also binds a class to an implementation, but creates a new instance on each call.
     */
    MostBinder.prototype.toPrototype = function (cnstrct) {
        conf[this.id] = new PrototypeGetter(cnstrct);
    };
    /**
     * Just makes the class known to Most.
     */
    MostBinder.prototype.asSingleton = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        conf[this.id] = new SingletonGetter(this.c, args);
    };
    MostBinder.prototype.asPrototype = function () {
        conf[this.id] = new PrototypeGetter(this.c);
    };
    /**
     * Like toSingleton, but also instantiates the class immediately.
     */
    MostBinder.prototype.asEagerSingleton = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        conf[this.id] = new SingletonGetter(this.c, args);
        return inject(this.c);
    };
    return MostBinder;
}());
function bind(c) {
    var id = (++mostIdCounter).toFixed();
    return new MostBinder(c, id);
}
function checkInitHandlerFiring() {
    if (recurseDepth == 0) {
        fireInitHandler();
    }
}
function logInjectionError(e) {
    var cerr = e;
    var errArgs = [];
    errArgs.push('Caught error:', cerr);
    while (cerr['cause']) {
        cerr = cerr['cause'];
        errArgs.push('\nCaused by:', cerr);
    }
    if (e[injectStackMarker]) {
        errArgs.push('\nInjection stack:', e[injectStackMarker]);
    }
    errorLog.call(null, errArgs);
}
function extractMostId(clazz) {
    return clazz[mostTypeKey];
}
function extractMostScope(clazz) {
    return clazz[typeAnnotationKey];
}
function autoBind(clazz) {
    var scope = extractMostScope(clazz);
    switch (scope) {
        case Scope.PROTOTYPE:
            bind(clazz).asPrototype();
            break;
        case Scope.SINGLETON:
            bind(clazz).asSingleton();
            break;
        default:
            throw new Error(clazz + ' not bound.');
    }
    return extractMostId(clazz);
}
function inject(clazz) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var id = extractMostId(clazz);
    if (!id) {
        id = autoBind(clazz);
    }
    if (!conf[id]) {
        throw new Error(clazz + ' contains unknown type id.');
    }
    ++recurseDepth;
    var result;
    try {
        result = conf[id].getInst(args);
    }
    catch (e) {
        var nerr = new Error('Unable to get Instance of class');
        var injectStack = e[injectStackMarker] || [];
        injectStack.push(clazz);
        nerr['cause'] = e;
        --recurseDepth;
        nerr[injectStackMarker] = injectStack;
        if (recurseDepth == -1) {
            logInjectionError(nerr);
            throw new Error('Class injection failed, error printed above');
        }
        throw nerr;
    }
    checkInitHandlerFiring();
    --recurseDepth;
    return result;
}
function setErrorLog(log) {
    errorLog = log;
}
exports.default = {
    inject: inject,
    bind: bind,
    setErrorLog: setErrorLog,
    Scope: Scope
};
