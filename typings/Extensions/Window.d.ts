interface Window {
    stop(): any;
    require(moduleName: string): Function;
    isModal(): boolean;
}
