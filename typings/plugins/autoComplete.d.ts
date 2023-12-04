import Form from "olive/components/form";
import Url from "olive/components/url";
import ServerInvoker from "olive/mvc/serverInvoker";
export declare class AutoCompleteFactory implements IService {
    private url;
    private form;
    private serverInvoker;
    constructor(url: Url, form: Form, serverInvoker: ServerInvoker);
    enable(selector: JQuery): void;
}
export default class AutoComplete {
    input: JQuery;
    private url;
    private form;
    private serverInvoker;
    private static customOptions;
    protected valueField: JQuery;
    private selectedItemOnEnter;
    static setOptions(options: RunningCoder.Typeahead.Options): void;
    constructor(input: JQuery, url: Url, form: Form, serverInvoker: ServerInvoker);
    enable(): void;
    private getMandatoryOptions;
    private getMandatoryCallbacks;
    protected getDefaultOptions(): RunningCoder.Typeahead.Options;
    protected getPostData(): any;
    protected clearValue(): void;
    protected itemSelected(item: any): void;
    protected toObject(arr: JQuerySerializeArrayElement[]): {};
}
