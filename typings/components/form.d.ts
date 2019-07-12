import Url from 'olive/components/url';
import Validate from 'olive/components/validate';
import Waiting from 'olive/components/waiting';
import CombinedUtilities from 'olive/mvc/combinedUtilities';
export default class Form implements IService {
    private url;
    private validate;
    private waiting;
    private ajaxRedirect;
    constructor(url: Url, validate: Validate, waiting: Waiting, ajaxRedirect: CombinedUtilities);
    private currentRequestUrlProvider;
    enableDefaultButtonKeyPress(selector: JQuery): void;
    enablecleanUpNumberField(selector: JQuery): void;
    enablesubmitCleanGet(selector: JQuery): void;
    private getCleanFormData;
    cleanJson(str: any): string;
    getPostData(trigger: JQuery): JQuerySerializeArrayElement[];
    private DefaultButtonKeyPress;
    private cleanUpNumberField;
    private submitCleanGet;
}
