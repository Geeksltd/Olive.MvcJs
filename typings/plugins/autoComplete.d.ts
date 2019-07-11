import Form from "olive/components/form";
import Url from 'olive/components/url';
import FormAction from 'olive/mvc/formAction';
export declare class AutoCompleteFactory implements IService {
    private url;
    private form;
    private formAction;
    constructor(url: Url, form: Form, formAction: FormAction);
    enable(selector: JQuery): void;
}
export default class AutoComplete {
    input: JQuery;
    private url;
    private form;
    private formAction;
    private static customOptions;
    private awaitingAutocompleteResponses;
    private valueField;
    static setOptions(options: RunningCoder.Typeahead.Options): void;
    constructor(input: JQuery, url: Url, form: Form, formAction: FormAction);
    enable(): void;
    private clearValue;
    private itemSelected;
    private toObject;
}
