interface Window {
    stop(): any;
    require(moduleName: string): Function;
}
interface JQueryStatic {
    raiseEvent(event: string, owner: any, data?: any): boolean;
}
