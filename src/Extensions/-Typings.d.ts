

interface Window {
    stop();
    require(moduleName: string): Function;
    isModal(): boolean;
    getContainerIFrame(): HTMLIFrameElement;
    download(url: string);
    page: any;
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

interface JQueryStatic {
    raiseEvent(event: string, owner: any, data?: any): boolean;
}