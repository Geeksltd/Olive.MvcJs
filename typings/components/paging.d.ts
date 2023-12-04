import Url from 'olive/components/url';
import ServerInvoker from 'olive/mvc/serverInvoker';
export default class Paging implements IService {
    private url;
    private serverInvoker;
    constructor(url: Url, serverInvoker: ServerInvoker);
    enableOnSizeChanged(selector: JQuery): void;
    enableWithAjax(selector: JQuery): void;
    private onSizeChanged;
    private withAjax;
}
