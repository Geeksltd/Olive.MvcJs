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

interface Location {
    pathAndQuery(): string;
}

interface ArrayConstructor {
    groupBy(array: Array<any>, groupFunction: Function): Array<any>;
}

interface String {
    endsWith(searchString: string): boolean;
    htmlEncode(): string;
    htmlDecode(): string;
}