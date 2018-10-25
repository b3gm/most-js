What is Most
============

Most (NOT pronounced like the english word 'most' as in 'most of ...') is a
javascript dependency
injection framework, that was inspired by google's guice for java. Since
dependency injection frameworks are
traditionally named after beverages or liquid containers (citation needed),
the name of this library refers to literal 'Most', an alcoholic
beverage which is popular in Austria.

Installation
============

Most relases are available on our internal npm repository and can simply be
installed by running:

```bash
npm install --save @b3gm/most
```

TypeScript bindings are provided.

Basic Usage
===========

Suppose you have an abstract class `AbstractFoo`, the implementation
of which you may want to override differently in different projects:

```typescript
// AbstractFoo.ts:
export default abstract class AbstractFoo {
	public abstract greet():void;
}
```

Some project may want to use this implementation:
```typescript
// ConcreteFoo.ts:
import AbstractFoo from './AbstractFoo';

export default class ConcreteFoo extends AbstractFoo {
	public greet() {
		alert('Hello world');
	}
}
```

First you have to make these classes known to Most and tell it which
implementation it should use. In a web project this is usually set up
in a DOMContentLoaded event handler:

```typescript
// index.ts
import Most from '@b3gm/most';
import AbstractFoo from './AbstractFoo';
import ConcreteFoo from './ConcreteFoo';

document.addEventListener('DOMContentLoaded', () => {
	Most.bind(AbstractFoo).toSingleton(ConcreteFoo);

	// proceed to start your webapp
});
```

Another service that wants to consume an AbstractFoo object can simply
let Most inject a concrete implementation of AbstractFoo without it
even having to know about ConcreteFoo:

```typescript
// Consumer.ts
export default class Consumer {
	private foo:AbstractFoo = Most.inject(AbstractFoo);

	public run() {
		this.foo.greet();// alerts 'Hello World'
	}
}
```

If there is no abstract parent class, you can simply use
```typescript
Most.bind(MyFoo).asSingleton()
```

in order to bind MyFoo to itself. There is also prototype injection
available through `.asProtoype()` and `.toPrototype(...)` functions
and also a convenience method `.asEagerSingleton()`, which works
basically like `.toSingleton()` but also constructs and returns the
object immediately after binding.

Note that Most will throw an error, when circular dependencies are
detected. Since this is an anti pattern anyway, you should design
your project in a way that avoids circular dependencies. The error
message provides an injection stack, that lets you know exactly
through which chain of object construction the circular dependency has
been detected.

If however this cannot be avoided, you can define a `mostInit()` method
in one of the offending classes and inject its dependencies there in
order to break the circular depency. This means however, that you do not
have the one of the dependencies available in the constructor of one
of the classes.

Note also that you cannot bind implementations to typescript interfaces
since these interfaces do not show up as objects at runtime.