interface Window {
    stop();
    require(moduleName: string): Function;

    isModal(): boolean;
    getContainerIFrame(): HTMLIFrameElement;

    download(url: string);
}

interface JSON {
    safeParse(text: string);
}