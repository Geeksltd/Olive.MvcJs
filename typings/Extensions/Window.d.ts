interface Window {
    stop(): any;
    require(moduleName: string): Function;
    isModal(): boolean;
    getContainerIFrame(): HTMLIFrameElement;
    download(url: string): any;
}
interface JSON {
    safeParse(text: string): any;
}
