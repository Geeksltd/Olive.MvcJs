interface Validator {
    unobtrusive: any;
}

interface JQuery {
    screenOffset(): any;
    getUniqueSelector(): any;
}

declare var CKEDITOR;
declare var Globalize;


interface Window {
    stop();
    require(moduleName: string): Function;
    isModal(): boolean;
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

    withPrefix(prefix: string): string;
    trimStart(text: string): string;
    startsWith(text: string): boolean;
    trimEnd(text: string): string;
    trimText(text: string): string;
}

interface JQueryStatic {
    raiseEvent(event: string, owner: any, data?: any): boolean;
}
