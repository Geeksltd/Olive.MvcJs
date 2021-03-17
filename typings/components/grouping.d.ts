import AjaxRedirect from "olive/mvc/ajaxRedirect";
import Url from "./url";
export declare class GroupingFactory implements IService {
    private url;
    private ajaxRedirect;
    constructor(url: Url, ajaxRedirect: AjaxRedirect);
    enable(selector: JQuery): void;
}
export default class Grouping {
    private dropdown;
    private url;
    private ajaxRedirect;
    constructor(dropdown: JQuery, url: Url, ajaxRedirect: AjaxRedirect);
}
