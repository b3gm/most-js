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
var assert_1 = require("./assert");
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
most_1.default.bind(AbstractFooService).toSingleton(ConcreteFooService);
most_1.default.bind(ConcreteService).asSingleton();
most_1.default.bind(PrototypeClass).asPrototype();
most_1.default.bind(ConstructorInjector).asSingleton('injected');
most_1.default.bind(A).asSingleton();
most_1.default.bind(B).asSingleton();
most_1.default.bind(C).asSingleton();
most_1.default.bind(D).asSingleton();
var TestCase = /** @class */ (function () {
    function TestCase() {
        this.foo = most_1.default.inject(AbstractFooService);
        this.conc = most_1.default.inject(ConcreteService);
    }
    TestCase.prototype.testSingletonBinding = function () {
        var foo = most_1.default.inject(AbstractFooService);
        assert_1.default.identical(foo, this.foo, 'Objects are not identical');
        assert_1.default.equals(foo.greet(), 'Hello', 'Unexpected greeting');
    };
    TestCase.prototype.testSingletonRegisty = function () {
        assert_1.default.equals(this.conc.run(), 'OK', 'Unexpected response from ConcreteService');
    };
    TestCase.prototype.testConstructorInjection = function () {
        var inj = most_1.default.inject(ConstructorInjector);
        assert_1.default.equals(inj.msg, 'injected');
    };
    TestCase.prototype.testProtoypeInjection = function () {
        var a = most_1.default.inject(PrototypeClass);
        var b = most_1.default.inject(PrototypeClass);
        assert_1.default.isTrue(typeof (a.id) === typeof (b.id), 'Types of Prototype instance ids are different');
        assert_1.default.notIdentical(a, b, 'Prototypes must yield different instances');
    };
    TestCase.prototype.testCircularDependencyDetection = function () {
        assert_1.default.throws(function () { return most_1.default.inject(B); }, 'Circular dependencies are not detected.');
    };
    TestCase.prototype.testCircularDependencyBreaking = function () {
        var c;
        assert_1.default.throwsNot(function () {
            c = most_1.default.inject(C);
        });
        assert_1.default.notNull(c, 'Class C has not been injected at all');
        assert_1.default.notNull(c.d, 'Class D has not been injected into c');
        assert_1.default.notNull(c.d.c, 'Class C has not been injected into d');
    };
    return TestCase;
}());
assert_1.default.run(new TestCase());
