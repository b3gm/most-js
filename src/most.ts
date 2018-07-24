let errorLog:(...args:Array<any>) => void = console.error.bind(console);

abstract class InstanceGetter {
	protected cnstrct: new () => any;
	protected constructArgs: Array<any>;
	private constructing: boolean;

	public abstract getInst(args:Array<any>):any;

	constructor(cnstrct: new () => Object, args?: Array<any>) {
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

class SingletonGetter extends InstanceGetter {
	private inst:any = null;

	public getInst(args: Array<any>): any {
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

class PrototypeGetter extends InstanceGetter {
	public getInst(argv: Array<any>): any {
		let args = this.prependToArray(this.cnstrct, argv);
		let instance: any = new (Function.prototype.bind.apply(this.cnstrct, args));
		this.postProcess(instance);
		return instance;
	}
}

let conf: { [id: string]: InstanceGetter } = {};
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

export interface IMostBinder {
	toSingleton(cnstrct: new (...args: Array<any>) => Object, ...args: Array<any>):void;
	toPrototype(cnstrct: new (...args: Array<any>) => Object):void;
	asSingleton(...args: Array<any>):void;
	asPrototype():void;
	asEagerSingleton(...args: Array<any>):Object;
}

class MostBinder implements IMostBinder {
	private c: any;
	public static typeKey: string = '__Most_type_id';

	constructor(c: any, id: string) {
		this.c = c;

		c[MostBinder.typeKey]  = id;
	}

	/**
	 * Bind a class to an implementation. This cannot be an interface, since typescript drops them on compilation.
	 */
	public toSingleton(cnstrct: new (...args: Array<any>) => Object, ...args: Array<any>) {
		conf[this.c[MostBinder.typeKey]] = new SingletonGetter(cnstrct, args);
	}

	/**
	 * Also binds a class to an implementation, but creates a new instance on each call.
	 */
	public toPrototype(cnstrct: new (...args: Array<any>) => Object) {
		conf[this.c[MostBinder.typeKey]] = new PrototypeGetter(cnstrct);
	}

	/**
	 * Just makes the class known to Most.
	 */
	public asSingleton(...args: Array<any>) {
		conf[this.c[MostBinder.typeKey]] = new SingletonGetter(this.c, args);
	}

	public asPrototype() {
		conf[this.c[MostBinder.typeKey]] = new PrototypeGetter(this.c);
	}

	/**
	 * Like toSingleton, but also instantiates the class immediately.
	 */
	public asEagerSingleton(...args: Array<any>) {
		conf[this.c[MostBinder.typeKey]] = new SingletonGetter(this.c, args);
		return inject(this.c);
	}
}

function bind(c: {}):IMostBinder {
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

function inject(clazz: any, ...args: Array<any>) {
	if (!clazz[MostBinder.typeKey] ||  !conf[clazz[MostBinder.typeKey]]) throw clazz + ' not bound.';

	++recurseDepth;
	let result:any;
	try {
		result = conf[clazz[MostBinder.typeKey]].getInst(args);
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
	setErrorLog
};