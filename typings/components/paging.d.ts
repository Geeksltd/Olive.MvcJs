import Url from 'olive/components/url';
import FormAction from 'olive/mvc/formAction';
export default class Paging implements IService {
    private url;
    private formAction;
    constructor(url: Url, formAction: FormAction);
    enableOnSizeChanged(selector: JQuery): void;
    enableWithAjax(selector: JQuery): void;
    onSizeChanged(event: Event): void;
    withAjax(event: JQueryEventObject): void;
}
