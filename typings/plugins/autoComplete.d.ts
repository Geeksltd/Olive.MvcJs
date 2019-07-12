import Form from "olive/components/form";
import Url from 'olive/components/url';
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
    private awaitingAutocompleteResponses;
    private valueField;
    static setOptions(options: RunningCoder.Typeahead.Options): void;
    constructor(input: JQuery, url: Url, form: Form, serverInvoker: ServerInvoker);
    enable(): void;
    private clearValue;
    private itemSelected;
    private toObject;
}
