import Most from './most';
import 'jest';

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
 
class Eager {
	
}

abstract class AbstractPrototype {
	
}

class ConcretePrototype extends AbstractPrototype {
	
}

class NotBoundClass {
	
}

describe('Most', () => {
	let foo:AbstractFooService;
	let conc:ConcreteService;
	
	it('should bind constructors without throwing', () => {
		expect(() => {
			Most.bind(AbstractFooService).toSingleton(ConcreteFooService);
		}).not.toThrow();
		expect(() => {
			Most.bind(ConcreteService).asSingleton();
		}).not.toThrow();
		expect(() => {
			Most.bind(PrototypeClass).asPrototype();
		}).not.toThrow();
		expect(() => {
			Most.bind(ConstructorInjector).asSingleton('injected');
		}).not.toThrow();
		expect(() => {
			Most.bind(A).asSingleton();
		}).not.toThrow();
		expect(() => {
			Most.bind(B).asSingleton();
		}).not.toThrow();
		expect(() => {
			Most.bind(C).asSingleton();
		}).not.toThrow();
		expect(() => {
			Most.bind(D).asSingleton();
		}).not.toThrow();
	});
	
	it('should inject implementation for AbstractFooService', () => {
		expect(() => {
			foo = Most.inject(AbstractFooService);
		}).not.toThrow();
		expect(typeof foo).toEqual('object');
		expect(foo).not.toEqual(null);
		expect(foo).toBeInstanceOf(AbstractFooService);
		expect(foo.greet()).toEqual('Hello');
	});
	
	it('should construct singletons only once', () => {
		let myFoo:AbstractFooService = Most.inject(AbstractFooService);
		expect(myFoo).toEqual(foo);
	});
	
	it('should inject implementation for ConcreteService', () => {
		expect(() => {
			conc = Most.inject(ConcreteService);
		}).not.toThrow();
		expect(conc).toBeInstanceOf(ConcreteService);
		expect(conc.run()).toEqual('OK');
	});
	
	it('should inject constructor arguments', () => {
		let inj:ConstructorInjector = Most.inject(ConstructorInjector);
		expect(inj.msg).toEqual('injected');
	});
	
	it('should construct new objects for each prototype injection', () => {
		let a:PrototypeClass = Most.inject(PrototypeClass);
		let b:PrototypeClass = Most.inject(PrototypeClass);
		expect(a).toBeInstanceOf(PrototypeClass);
		expect(b).toBeInstanceOf(PrototypeClass);
		expect(a).not.toEqual(b);
	});
	
	it('should throw when detecting a circular dependency', () => {
		expect(() => Most.inject(B)).toThrow('Class injection failed, error printed above');
	});
	
	it('should not throw, when mostInit method is used to break out of circular dependencies', () => {
		let c:C;
		expect(() => c = Most.inject(C)).not.toThrow();
		expect(c).toBeInstanceOf(C);
		expect(c.d).toBeInstanceOf(D);
		expect(c.d.c).toBeInstanceOf(C);
		expect(c.d.c).toEqual(c);
	});
	
	it('should also bind prototype implementations to abstract prototypes', () => {
		expect(() => Most.bind(AbstractPrototype).toPrototype(ConcretePrototype)).not.toThrow();
		let a:AbstractPrototype;
		let b:AbstractPrototype;
		expect(() => a = Most.inject(AbstractPrototype)).not.toThrow();
		expect(() => b = Most.inject(AbstractPrototype)).not.toThrow();
		expect(a).toBeInstanceOf(AbstractPrototype);
		expect(a).toBeInstanceOf(ConcretePrototype);
		expect(b).toBeInstanceOf(AbstractPrototype);
		expect(b).toBeInstanceOf(ConcretePrototype);
		expect(a).not.toBe(b);
	});
	
	it('should bind and return eager singletons', () => {
		let eager:Eager;
		expect(() => eager = Most.bind(Eager).asEagerSingleton()).not.toThrow();
		expect(eager).toBeInstanceOf(Eager);
		expect(eager).toEqual(Most.inject(Eager));
	});
	
	it('should throw when, attempting to inject unbound class instances', () => {
		expect(() => Most.inject(NotBoundClass)).toThrow(
			new Error(NotBoundClass + ' not bound.')
		);
	});
});
