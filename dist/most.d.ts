export interface IMostBinder {
    toSingleton(cnstrct: new (...args: Array<any>) => Object, ...args: Array<any>): void;
    toPrototype(cnstrct: new (...args: Array<any>) => Object): void;
    asSingleton(...args: Array<any>): void;
    asPrototype(): void;
    asEagerSingleton(...args: Array<any>): Object;
}
declare function bind(c: {}): IMostBinder;
declare function inject(clazz: any, ...args: Array<any>): any;
declare const _default: {
    inject: typeof inject;
    bind: typeof bind;
};
export default _default;
