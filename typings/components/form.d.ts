import Url from "olive/components/url";
import Validate from "olive/components/validate";
import Waiting from "olive/components/waiting";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
export default class Form implements IService {
    private url;
    private validate;
    private waiting;
    private ajaxRedirect;
    constructor(url: Url, validate: Validate, waiting: Waiting, ajaxRedirect: AjaxRedirect);
    protected currentRequestUrlProvider: (() => string);
    enableDefaultButtonKeyPress(selector: JQuery): void;
    enablecleanUpNumberField(selector: JQuery): void;
    enablesubmitCleanGet(selector: JQuery): void;
    private getCleanFormData;
    protected ignoreFormDataInput(inputName: string, values: string[]): boolean;
    cleanJson(str: any): string;
    getPostData(trigger: JQuery): JQuerySerializeArrayElement[];
    private DefaultButtonKeyPress;
    private cleanUpNumberField;
    private submitCleanGet;
}
