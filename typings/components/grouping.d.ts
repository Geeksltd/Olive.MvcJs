import Url from "./url";
import CombinedUtilities from "olive/mvc/combinedUtilities";
export declare class GroupingFactory implements IService {
    private url;
    private ajaxRedirect;
    constructor(url: Url, ajaxRedirect: CombinedUtilities);
    enable(selector: JQuery): void;
}
export default class Grouping {
    private dropdown;
    private url;
    private ajaxRedirect;
    constructor(dropdown: JQuery, url: Url, ajaxRedirect: CombinedUtilities);
}
