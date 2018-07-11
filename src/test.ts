import Most from './most';
import assert from './assert';

abstract class AbstractFooService {
	public abstract greet():string;
}

class ConcreteFooService extends AbstractFooService {
	public greet() {
		return 'Hello';
	}
}

class ConcreteService {
	public run() {
		return 'OK';
	}
}

let idCnt:number = 0;

class PrototypeClass {
	public id:number = ++idCnt;
}

class ConstructorInjector {
	constructor(public msg:string) {
		
	}
}

class B {
	public a:A = Most.inject(A);
}
// creates circular dependency
class A {
	public b:B = Most.inject(B);
}

class D {
	public c:C = Most.inject(C);
}
// is also circular depdendent, but uses mostInit() method to break out of it.
class C {
	public d:D = null;
	
	mostInit() {
		this.d = Most.inject(D);
	}
}

Most.bind(AbstractFooService).toSingleton(ConcreteFooService);
Most.bind(ConcreteService).asSingleton();
Most.bind(PrototypeClass).asPrototype();
Most.bind(ConstructorInjector).asSingleton('injected');
Most.bind(A).asSingleton();
Most.bind(B).asSingleton();
Most.bind(C).asSingleton();
Most.bind(D).asSingleton();

class TestCase {
	private foo:AbstractFooService;
	private conc:ConcreteService;
	
	constructor() {
		this.foo = Most.inject(AbstractFooService);
		this.conc = Most.inject(ConcreteService);
	}
	
	public testSingletonBinding() {
		let foo:AbstractFooService = Most.inject(AbstractFooService);
		assert.identical(foo, this.foo, 'Objects are not identical');
		assert.equals(foo.greet(), 'Hello', 'Unexpected greeting');
	}
	
	public testSingletonRegisty() {
		assert.equals(this.conc.run(), 'OK', 'Unexpected response from ConcreteService');
	}
	
	public testConstructorInjection() {
		let inj:ConstructorInjector = Most.inject(ConstructorInjector);
		assert.equals(inj.msg, 'injected');
	}
	
	public testProtoypeInjection() {
		let a:PrototypeClass = Most.inject(PrototypeClass);
		let b:PrototypeClass = Most.inject(PrototypeClass);
		assert.isTrue(typeof (a.id) === typeof(b.id), 'Types of Prototype instance ids are different');
		assert.notIdentical(a, b, 'Prototypes must yield different instances');
	}
	
	public testCircularDependencyDetection() {
		assert.throws(() => Most.inject(B), 'Circular dependencies are not detected.');
	}
	
	public testCircularDependencyBreaking() {
		let c:C;
		assert.throwsNot(() => {
			c = Most.inject(C);
		});
		assert.notNull(c, 'Class C has not been injected at all');
		assert.notNull(c.d, 'Class D has not been injected into c');
		assert.notNull(c.d.c, 'Class C has not been injected into d');
	}
}

assert.run(new TestCase());