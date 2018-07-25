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
require("mocha");
var chai = require("chai");
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
var should = chai.should();
describe('Most', function () {
    var foo;
    var conc;
    it('should bind constructors without throwing', function () {
        should.not.throw(function () {
            most_1.default.bind(AbstractFooService).toSingleton(ConcreteFooService);
        }, 'AbstractFooService could not be bound');
        should.not.throw(function () {
            most_1.default.bind(ConcreteService).asSingleton();
        }, 'ConcreteService could not be bound');
        should.not.throw(function () {
            most_1.default.bind(PrototypeClass).asPrototype();
        }, 'PrototypeClass could not be bound');
        should.not.throw(function () {
            most_1.default.bind(ConstructorInjector).asSingleton('injected');
        }, 'Binding with constructor injection failed');
        should.not.throw(function () {
            most_1.default.bind(A).asSingleton();
        }, 'A could not be bound');
        should.not.throw(function () {
            most_1.default.bind(B).asSingleton();
        }, 'B could not be bound');
        should.not.throw(function () {
            most_1.default.bind(C).asSingleton();
        }, 'C could not be bound');
        should.not.throw(function () {
            most_1.default.bind(D).asSingleton();
        }, 'D could not be bound');
    });
    it('should inject implementation for AbstractFooService', function () {
        should.not.throw(function () {
            foo = most_1.default.inject(AbstractFooService);
        });
        foo.should.be.an('object', 'foo is not an object');
        foo.should.not.equal(null, 'foo is equal to null');
        foo.should.be.an.instanceof(AbstractFooService, 'foo is not an instance of AbstractFooService');
        foo.greet().should.equal('Hello');
    });
    it('should construct singletons only once', function () {
        var myFoo = most_1.default.inject(AbstractFooService);
        myFoo.should.equal(foo, 'myFoo is not strictly equal to foo');
    });
    it('should inject implementation for ConcreteService', function () {
        chai.should().not.throw(function () {
            conc = most_1.default.inject(ConcreteService);
            conc.should.instanceof(ConcreteService);
            conc.run().should.equal('OK');
        }, 'Could not inject ConcreteService');
    });
    it('should inject constructor arguments', function () {
        var inj = most_1.default.inject(ConstructorInjector);
        inj.msg.should.equal('injected', 'Constructor argument was not injected.');
    });
    it('should construct new objects for each prototype injection', function () {
        var a = most_1.default.inject(PrototypeClass);
        var b = most_1.default.inject(PrototypeClass);
        a.should.instanceof(PrototypeClass);
        b.should.instanceof(PrototypeClass);
        a.should.not.equal(b);
    });
    it('should throw when detecting a circular dependency', function () {
        should.throw(function () { return most_1.default.inject(B); }, 'Class injection failed, error printed above');
    });
    it('should not throw, when mostInit method is used to break out of circular dependencies', function () {
        var c;
        should.not.throw(function () { return c = most_1.default.inject(C); });
        c.should.be.instanceof(C);
        c.d.should.be.instanceof(D);
        c.d.c.should.be.instanceof(C);
        c.d.c.should.equal(c);
        "Bortscht".should.not.be.undefined;
        "Bortscht".should.not.equal("Bortscht");
    });
});
