import Most from './most';
import 'mocha';
import * as chai from 'chai';

// suppresses error logging during tests.
Most.setErrorLog(() => {});

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

let should = chai.should();

describe('Most', () => {
	let foo:AbstractFooService;
	let conc:ConcreteService;
	
	it('should bind constructors without throwing', () => {
		should.not.throw(() => {
			Most.bind(AbstractFooService).toSingleton(ConcreteFooService);
		}, 'AbstractFooService could not be bound');
		should.not.throw(() => {
			Most.bind(ConcreteService).asSingleton();
		}, 'ConcreteService could not be bound');
		should.not.throw(() => {
			Most.bind(PrototypeClass).asPrototype();
		}, 'PrototypeClass could not be bound');
		should.not.throw(() => {
			Most.bind(ConstructorInjector).asSingleton('injected');
		}, 'Binding with constructor injection failed');
		should.not.throw(() => {
			Most.bind(A).asSingleton();
		}, 'A could not be bound');
		should.not.throw(() => {
			Most.bind(B).asSingleton();
		}, 'B could not be bound');
		should.not.throw(() => {
			Most.bind(C).asSingleton();
		}, 'C could not be bound');
		should.not.throw(() => {
			Most.bind(D).asSingleton();
		}, 'D could not be bound');
	});
	
	it('should inject implementation for AbstractFooService', () => {
		should.not.throw(() => {
			foo = Most.inject(AbstractFooService);
		});
		foo.should.be.an('object', 'foo is not an object');
		foo.should.not.equal(null, 'foo is equal to null');
		foo.should.be.an.instanceof(AbstractFooService, 'foo is not an instance of AbstractFooService');
		foo.greet().should.equal('Hello');
	});
	
	it('should construct singletons only once', () => {
		let myFoo:AbstractFooService = Most.inject(AbstractFooService);
		myFoo.should.equal(foo, 'myFoo is not strictly equal to foo');
	});
	
	it('should inject implementation for ConcreteService', () => {
		chai.should().not.throw(() => {
			conc = Most.inject(ConcreteService);
			conc.should.instanceof(ConcreteService);
			conc.run().should.equal('OK');
		}, 'Could not inject ConcreteService');
	});
	
	it('should inject constructor arguments', () => {
		let inj:ConstructorInjector = Most.inject(ConstructorInjector);
		inj.msg.should.equal('injected', 'Constructor argument was not injected.');
	});
	
	it('should construct new objects for each prototype injection', () => {
		let a:PrototypeClass = Most.inject(PrototypeClass);
		let b:PrototypeClass = Most.inject(PrototypeClass);
		a.should.instanceof(PrototypeClass);
		b.should.instanceof(PrototypeClass);
		a.should.not.equal(b);
	});
	
	it('should throw when detecting a circular dependency', () => {
		should.throw(() => Most.inject(B), 'Class injection failed, error printed above');
	});
	
	it('should not throw, when mostInit method is used to break out of circular dependencies', () => {
		let c:C;
		should.not.throw(() => c = Most.inject(C));
		c.should.be.instanceof(C);
		c.d.should.be.instanceof(D);
		c.d.c.should.be.instanceof(C);
		c.d.c.should.equal(c);
	});
});
