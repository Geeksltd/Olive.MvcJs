/// <reference path="missingDefinitions.d.ts" />

declare var $: JQueryStatic;
declare var jQuery: JQueryStatic;

interface JQueryStatic {
    (selector: any, context?: any): JQuery;
    fn: any;
    raiseEvent(event: string, owner: any, data?: any): boolean;
    validator: any;
    [key: string]: any;
}

interface JQuery {
    serializeArray(): JQuerySerializeArrayElement[];
    [key: string]: any;
}

interface JQueryEventObject {
    [key: string]: any;
}

type OliveEvent = any;

interface JQuerySerializeArrayElement {
    name: string;
    value: string;
}

interface JQueryXHR {
    [key: string]: any;
}

declare module "jquery" {
    export function param(obj: any, traditional?: boolean): string;
    const jquery: JQueryStatic;
    export = jquery;
}

declare module "pako/dist/pako" {
    const pako: any;
    export = pako;
}

declare module "file-style" { }

declare module "jquery-sortable" { }

declare namespace RunningCoder {
    namespace Typeahead {
        interface Options {
            [key: string]: any;
        }
        interface Callback {
            [key: string]: any;
        }
    }
}

declare namespace tempusDominus {
    class TempusDominus {
        constructor(element: Element, options?: any);
        dispose(): void;
    }
}

declare namespace TomSelect {
    interface IOptions {
        [key: string]: any;
    }
}

interface Window {
    stop(): void;
    require(moduleName: string): Function;
    isModal(): boolean;
    download(url: string): void;
    page: any;
    testingContext: ITestingContext;
    alertify: alertify.IAlertifyStatic;
    bootstrap?: {
        Modal?: {
            getOrCreateInstance(element: Element): { show(): void; hide(): void };
            getInstance(element: Element): { hide(): void } | null;
        };
    };
}

interface JSON {
    safeParse(text: string): any;
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

interface ITestingContext {
    isAjaxRedirecting(): boolean;
    isOpeningModal(): boolean;
    isClosingModal(): boolean;
    isAwaitingAjaxResponse(): boolean;
    isOliveMvcLoaded(): boolean;
    onPageInitialized(): void;
}

declare var moment: moment.MomentStatic;

declare namespace moment {
    interface MomentStatic {
        (inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean): moment.Moment;
        (inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean): moment.Moment;
        utc(inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean): moment.Moment;
        isMoment(obj: any): boolean;
        isDate(obj: any): boolean;
        locale(language?: string): string;
        format: string;
    }
    interface Moment {
        format(format?: string): string;
        isValid(): boolean;
    }
    type MomentInput = string | number | Date | Moment;
    type MomentFormatSpecification = string | string[];
}

declare var alertify: alertify.IAlertifyStatic;

declare namespace alertify {
    interface IAlertifyStatic {
        alert(message: string, callback?: Function, style?: string): IAlertifyStatic;
        confirm(message: string, callback?: Function, style?: string): IAlertifyStatic;
        log(message: string, style?: string): IAlertifyStatic;
        set(options: any, key?: any, value?: any): IAlertifyStatic;
        success(message: string): IAlertifyStatic;
        error(message: string): IAlertifyStatic;
        warning(message: string): IAlertifyStatic;
    }
}

declare var CKEDITOR: any;
declare var ClassicEditor: any;
declare var DecoupledEditor: any;
declare var InlineEditor: any;
declare var BalloonEditor: any;
declare var BalloonBlockEditor: any;
declare var Globalize: any;
declare var tempusDominus: any;
declare var TomSelect: any;

declare interface Validator {
    unobtrusive: any;
    settings?: any;
    errorList?: any[];
    form(): JQuery;
    element(element: any): void;
    focusInvalid(): void;
    [key: string]: any;
}

declare interface IService { }

declare interface IServiceContainer { }

declare interface IInvocationContext { }
