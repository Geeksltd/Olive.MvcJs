import Url from 'olive/components/url';
import CombinedUtilities from 'olive/mvc/combinedUtilities';
export default class Paging implements IService {
    private url;
    private formAction;
    constructor(url: Url, formAction: CombinedUtilities);
    enableOnSizeChanged(selector: JQuery): void;
    enableWithAjax(selector: JQuery): void;
    private onSizeChanged;
    private withAjax;
}
