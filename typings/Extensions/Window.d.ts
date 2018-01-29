interface Window {
    stop(): any;
    require(moduleName: string): Function;
    isModal(): boolean; 
    download(url: string): any;
}
interface JSON {
    safeParse(text: string): any;
}
