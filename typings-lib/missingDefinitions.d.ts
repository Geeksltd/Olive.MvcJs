interface Validator {
    unobtrusive: any;
}

interface JQuery {
    screenOffset(): any;
    getUniqueSelector(): string;
}

// CKEditor 4 declarations
declare var CKEDITOR: any;

// CKEditor 5 declarations
declare var ClassicEditor: any;
declare var DecoupledEditor: any;
declare var InlineEditor: any;
declare var BalloonEditor: any;
declare var BalloonBlockEditor: any;

declare var Globalize;


interface Window {
    stop();
    require(moduleName: string): Function;
    isModal(): boolean;
    download(url: string);
    page: any;
    testingContext: ITestingContext;
}

interface JSON {
    safeParse(text: string);
}

interface Location {
    pathAndQuery(): string;
}

interface ArrayConstructor {
    groupBy<T>(array: Array<T>, groupFunction: (item: T) => string | number): Dictionary<T>;
}

interface Dictionary<T> {
    [index: string]: T[];
    [index: number]: T[];
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
    contains(text: string): boolean;
}

interface JQueryStatic {
    raiseEvent(event: string, owner: any, data?: any): boolean;
}

interface ITestingContext {
    isAjaxRedirecting(): boolean;
    isOpeningModal(): boolean;
    isClosingModal(): boolean;
    isAwaitingAjaxResponse(): boolean;
    isOliveMvcLoaded(): boolean;
    onPageInitialized(): void;
}
