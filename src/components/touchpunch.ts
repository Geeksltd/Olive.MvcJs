import Url from "olive/components/url";
import ServerInvoker from "olive/mvc/serverInvoker";
import "jquery-ui-widget";
import "jquery-ui-mouse";
import "jquery-ui-touch-punch";

export default class TouchPunch implements IService {

    constructor(
        private url: Url,
        private serverInvoker: ServerInvoker) { }
}