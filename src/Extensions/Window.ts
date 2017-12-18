interface Window {
    stop();
    require(moduleName: string): Function;

    isModal(): boolean;
    getContainerIFrame(): HTMLIFrameElement;
}