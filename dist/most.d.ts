export declare enum Scope {
    SINGLETON = 0,
    PROTOTYPE = 1
}
export interface IMostBinder {
    toSingleton(cnstrct: new (...args: Array<any>) => Object, ...args: Array<any>): void;
    toPrototype(cnstrct: new (...args: Array<any>) => Object): void;
    asSingleton(...args: Array<any>): void;
    asPrototype(): void;
    asEagerSingleton(...args: Array<any>): Object;
}
declare function bind(c: {}): IMostBinder;
declare function inject<T>(clazz: {
    prototype: T;
}, ...args: Array<any>): T;
declare function setErrorLog(log: (...args: Array<any>) => void): void;
declare const _default: {
    inject: typeof inject;
    bind: typeof bind;
    setErrorLog: typeof setErrorLog;
    Scope: typeof Scope;
};
export default _default;
