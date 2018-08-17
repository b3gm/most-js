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
var most_1 = require("./most");
require("jest");
// suppresses error logging during tests.
most_1.default.setErrorLog(function () { });
var AbstractFooService = /** @class */ (function () {
    function AbstractFooService() {
    }
    return AbstractFooService;
}());
var ConcreteFooService = /** @class */ (function (_super) {
    __extends(ConcreteFooService, _super);
    function ConcreteFooService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConcreteFooService.prototype.greet = function () {
        return 'Hello';
    };
    return ConcreteFooService;
}(AbstractFooService));
var ConcreteService = /** @class */ (function () {
    function ConcreteService() {
    }
    ConcreteService.prototype.run = function () {
        return 'OK';
    };
    return ConcreteService;
}());
var idCnt = 0;
var PrototypeClass = /** @class */ (function () {
    function PrototypeClass() {
        this.id = ++idCnt;
    }
    return PrototypeClass;
}());
var ConstructorInjector = /** @class */ (function () {
    function ConstructorInjector(msg) {
        this.msg = msg;
    }
    return ConstructorInjector;
}());
var B = /** @class */ (function () {
    function B() {
        this.a = most_1.default.inject(A);
    }
    return B;
}());
// creates circular dependency
var A = /** @class */ (function () {
    function A() {
        this.b = most_1.default.inject(B);
    }
    return A;
}());
var D = /** @class */ (function () {
    function D() {
        this.c = most_1.default.inject(C);
    }
    return D;
}());
// is also circular depdendent, but uses mostInit() method to break out of it.
var C = /** @class */ (function () {
    function C() {
        this.d = null;
    }
    C.prototype.mostInit = function () {
        this.d = most_1.default.inject(D);
    };
    return C;
}());
var Eager = /** @class */ (function () {
    function Eager() {
    }
    return Eager;
}());
var AbstractPrototype = /** @class */ (function () {
    function AbstractPrototype() {
    }
    return AbstractPrototype;
}());
var ConcretePrototype = /** @class */ (function (_super) {
    __extends(ConcretePrototype, _super);
    function ConcretePrototype() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConcretePrototype;
}(AbstractPrototype));
var NotBoundClass = /** @class */ (function () {
    function NotBoundClass() {
    }
    return NotBoundClass;
}());
var AutoBindSingleton = /** @class */ (function () {
    function AutoBindSingleton() {
    }
    AutoBindSingleton.prototype.autocompleteTest = function () {
        return 'Most';
    };
    AutoBindSingleton['@Scope'] = most_1.default.Scope.SINGLETON;
    return AutoBindSingleton;
}());
var AutoBindPrototype = /** @class */ (function () {
    function AutoBindPrototype() {
    }
    AutoBindPrototype['@Scope'] = most_1.default.Scope.PROTOTYPE;
    return AutoBindPrototype;
}());
var UnknownTypeId = /** @class */ (function () {
    function UnknownTypeId() {
    }
    UnknownTypeId['@MostTypeId'] = '-1';
    return UnknownTypeId;
}());
describe('Most', function () {
    var foo;
    var conc;
    it('should bind constructors without throwing', function () {
        expect(function () {
            most_1.default.bind(AbstractFooService).toSingleton(ConcreteFooService);
        }).not.toThrow();
        expect(function () {
            most_1.default.bind(ConcreteService).asSingleton();
        }).not.toThrow();
        expect(function () {
            most_1.default.bind(PrototypeClass).asPrototype();
        }).not.toThrow();
        expect(function () {
            most_1.default.bind(ConstructorInjector).asSingleton('injected');
        }).not.toThrow();
        expect(function () {
            most_1.default.bind(A).asSingleton();
        }).not.toThrow();
        expect(function () {
            most_1.default.bind(B).asSingleton();
        }).not.toThrow();
        expect(function () {
            most_1.default.bind(C).asSingleton();
        }).not.toThrow();
        expect(function () {
            most_1.default.bind(D).asSingleton();
        }).not.toThrow();
    });
    it('should inject implementation for AbstractFooService', function () {
        expect(function () {
            foo = most_1.default.inject(AbstractFooService);
        }).not.toThrow();
        expect(typeof foo).toEqual('object');
        expect(foo).not.toEqual(null);
        expect(foo).toBeInstanceOf(AbstractFooService);
        expect(foo.greet()).toEqual('Hello');
    });
    it('should construct singletons only once', function () {
        var myFoo = most_1.default.inject(AbstractFooService);
        expect(myFoo).toEqual(foo);
    });
    it('should inject implementation for ConcreteService', function () {
        expect(function () {
            conc = most_1.default.inject(ConcreteService);
        }).not.toThrow();
        expect(conc).toBeInstanceOf(ConcreteService);
        expect(conc.run()).toEqual('OK');
    });
    it('should inject constructor arguments', function () {
        var inj = most_1.default.inject(ConstructorInjector);
        expect(inj.msg).toEqual('injected');
    });
    it('should construct new objects for each prototype injection', function () {
        var a = most_1.default.inject(PrototypeClass);
        var b = most_1.default.inject(PrototypeClass);
        expect(a).toBeInstanceOf(PrototypeClass);
        expect(b).toBeInstanceOf(PrototypeClass);
        expect(a).not.toEqual(b);
    });
    it('should throw when detecting a circular dependency', function () {
        expect(function () { return most_1.default.inject(B); }).toThrow('Class injection failed, error printed above');
    });
    it('should not throw, when mostInit method is used to break out of circular dependencies', function () {
        var c;
        expect(function () { return c = most_1.default.inject(C); }).not.toThrow();
        expect(c).toBeInstanceOf(C);
        expect(c.d).toBeInstanceOf(D);
        expect(c.d.c).toBeInstanceOf(C);
        expect(c.d.c).toEqual(c);
    });
    it('should also bind prototype implementations to abstract prototypes', function () {
        expect(function () { return most_1.default.bind(AbstractPrototype).toPrototype(ConcretePrototype); }).not.toThrow();
        var a;
        var b;
        expect(function () { return a = most_1.default.inject(AbstractPrototype); }).not.toThrow();
        expect(function () { return b = most_1.default.inject(AbstractPrototype); }).not.toThrow();
        expect(a).toBeInstanceOf(AbstractPrototype);
        expect(a).toBeInstanceOf(ConcretePrototype);
        expect(b).toBeInstanceOf(AbstractPrototype);
        expect(b).toBeInstanceOf(ConcretePrototype);
        expect(a).not.toBe(b);
    });
    it('should bind and return eager singletons', function () {
        var eager;
        expect(function () { return eager = most_1.default.bind(Eager).asEagerSingleton(); }).not.toThrow();
        expect(eager).toBeInstanceOf(Eager);
        expect(eager).toEqual(most_1.default.inject(Eager));
    });
    it('should throw when, attempting to inject unbound class instances', function () {
        expect(function () { return most_1.default.inject(NotBoundClass); }).toThrow(new Error(NotBoundClass + ' not bound.'));
    });
    it('should autobind annotated singletons', function () {
        var abInst;
        expect(function () { return abInst = most_1.default.inject(AutoBindSingleton); }).not.toThrow();
        expect(abInst).toBeInstanceOf(AutoBindSingleton);
    });
    it('should autobind annotated prototypes', function () {
        var abInst;
        expect(function () { return abInst = most_1.default.inject(AutoBindPrototype); }).not.toThrow();
        expect(abInst).toBeInstanceOf(AutoBindPrototype);
    });
    it('should throw on unknown type ids', function () {
        expect(function () { return most_1.default.inject(UnknownTypeId); }).toThrow(new Error(UnknownTypeId + ' contains unknown type id.'));
    });
    it('should correctly autocomplete returned instance members.', function () {
        var abInst = most_1.default.inject(AutoBindSingleton);
        expect(function () { return abInst.autocompleteTest(); }).not.toThrow();
    });
});
