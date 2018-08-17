let errorLog:(...args:Array<any>) => void = console.error.bind(console);

const mostTypeKey = '@MostTypeId';
const typeAnnotationKey = '@Scope';

/**
 * Use as public static property "@Scope" in a class to autobind on
 * first injection attempt.
 */
export enum Scope {
	SINGLETON, PROTOTYPE
}

abstract class InstanceGetter<T> {
	protected cnstrct:{prototype:T};
	protected constructArgs: Array<any>;
	private constructing: boolean;

	public abstract getInst(args:Array<any>):any;

	constructor(cnstrct:{prototype:T}, args?: Array<any>) {
		this.cnstrct = cnstrct;
		this.constructArgs = args || [];
		this.constructing = false;
	}

	public setConstructing() {
		this.constructing = true;
	}

	public setConstructed() {
		this.constructing = false;
	}

	public isConstructing() {
		return this.constructing;
	}

	protected prependToArray(obj: any, arr: any[]) {
		let result: any[] = [obj];
		for (let o of arr) {
			result.push(o);
		}
		return result;
	}

	protected postProcess(obj: any) {
		if (typeof (obj['mostInit']) == 'function') {
			mostInitHandler.push(() => {obj['mostInit']();});
		}
	}
}

class SingletonGetter<T> extends InstanceGetter<T> {
	private inst:T = null;

	public getInst(args: Array<any>):T {
		if (this.inst === null) {
			if (this.isConstructing()) throw new Error('circular dependency detected');
			this.setConstructing();
			this.inst = new (Function.prototype.bind.apply(this.cnstrct, this.prependToArray(this.cnstrct, this.constructArgs)));
			this.setConstructed();
			this.postProcess(this.inst);
		}
		return this.inst;
	}
}

class PrototypeGetter<T> extends InstanceGetter<T> {
	public getInst(argv: Array<any>):T {
		let args = this.prependToArray(this.cnstrct, argv);
		let instance:T = new (Function.prototype.bind.apply(this.cnstrct, args));
		this.postProcess(instance);
		return instance;
	}
}

let conf: { [id: string]: InstanceGetter<any> } = {};
let mostIdCounter: number = 0;
let recurseDepth:number = -1;
let injectStackMarker:string = 'injectStack';

let mostInitHandler:Array<() => void> = [];

function fireInitHandler() {
	let handlers = mostInitHandler;
	mostInitHandler = [];
	for(let i = handlers.length - 1; i >= 0; --i) {
		// execute most initHandler in reverse order, though that probably doesn't matter;
		handlers[i]();
	}
}

export interface IMostBinder<T> {
	toSingleton(cnstrct: new (...args: Array<any>) => T, ...args: Array<any>):void;
	toPrototype(cnstrct: new (...args: Array<any>) => T):void;
	asSingleton(...args: Array<any>):void;
	asPrototype():void;
	asEagerSingleton(...args: Array<any>):T;
}

class MostBinder<T> implements IMostBinder<T> {
	private c:{prototype:T};

	constructor(c:{prototype:T}, private readonly id: string) {
		this.c = c;
		(<any>c)[mostTypeKey] = id;
	}

	/**
	 * Bind a class to an implementation. This cannot be an interface, since typescript drops them on compilation.
	 */
	public toSingleton(cnstrct: new (...args: Array<any>) => Object, ...args: Array<any>) {
		conf[extractMostId(this.c)] = new SingletonGetter(cnstrct, args);
	}

	/**
	 * Also binds a class to an implementation, but creates a new instance on each call.
	 */
	public toPrototype(cnstrct: new (...args: Array<any>) => Object) {
		conf[this.id] = new PrototypeGetter(cnstrct);
	}

	/**
	 * Just makes the class known to Most.
	 */
	public asSingleton(...args: Array<any>) {
		conf[this.id] = new SingletonGetter(this.c, args);
	}

	public asPrototype() {
		conf[this.id] = new PrototypeGetter(this.c);
	}

	/**
	 * Like toSingleton, but also instantiates the class immediately.
	 */
	public asEagerSingleton(...args: Array<any>) {
		conf[this.id] = new SingletonGetter(this.c, args);
		return inject(this.c);
	}
}

function bind<T>(c: {prototype:T}):IMostBinder<T> {
	let id: string = (++mostIdCounter).toFixed();
	return new MostBinder(c, id);
}

function checkInitHandlerFiring() {
	if(recurseDepth == 0) {
		fireInitHandler();
	}
}

function logInjectionError(e:any) {
	let cerr:any = e;
	let errArgs:Array<any> = [];
	errArgs.push('Caught error:', cerr);
	while(cerr['cause']) {
		cerr = cerr['cause'];
		errArgs.push('\nCaused by:', cerr);
	}
	if(e[injectStackMarker]) {
		errArgs.push('\nInjection stack:', e[injectStackMarker]);
	}

	errorLog.call(null, errArgs);
}

function extractMostId(clazz:any):string {
	return clazz[mostTypeKey];
}

function extractMostScope(clazz:any):Scope {
	return clazz[typeAnnotationKey];
}

function autoBind<T>(clazz: {prototype:T}) {
	const scope = extractMostScope(clazz);
	switch(scope) {
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

function inject<T>(clazz: {prototype:T}, ...args: Array<any>):T {
	let id = extractMostId(clazz);
	if (!id) {
		id = autoBind(clazz);
	}
	if(!conf[id]) {
		throw new Error(clazz + ' contains unknown type id.');
	}

	++recurseDepth;
	let result:T;
	try {
		result = conf[id].getInst(args);
	} catch (e) {
		let nerr:Error = new Error('Unable to get Instance of class');
		let injectStack:Array<any> = e[injectStackMarker] || [];
		injectStack.push(clazz);
		(<any>nerr)['cause'] = e;
		--recurseDepth;
		(<any>nerr)[injectStackMarker] = injectStack;
		if(recurseDepth == -1) {
			logInjectionError(nerr);
			throw new Error('Class injection failed, error printed above');
		}
		throw nerr;
	}
	checkInitHandlerFiring();
	--recurseDepth;

	return result;
}

function setErrorLog(log:(...args:Array<any>) => void) {
	errorLog = log;
}

export default {
	inject,
	bind,
	setErrorLog,
	Scope
};