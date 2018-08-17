/**
 * Use as public static property "@Scope" in a class to autobind on
 * first injection attempt.
 */
export declare enum Scope {
    SINGLETON = 0,
    PROTOTYPE = 1
}
export interface IMostBinder<T> {
    toSingleton(cnstrct: new (...args: Array<any>) => T, ...args: Array<any>): void;
    toPrototype(cnstrct: new (...args: Array<any>) => T): void;
    asSingleton(...args: Array<any>): void;
    asPrototype(): void;
    asEagerSingleton(...args: Array<any>): T;
}
declare function bind<T>(c: {
    prototype: T;
}): IMostBinder<T>;
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
