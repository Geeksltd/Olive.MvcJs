// import AjaxRedirect from "olive/mvc/ajaxRedirect";
import Url from "./url";
import CombinedUtilities from "olive/mvc/combinedUtilities";

export class GroupingFactory implements IService {
    constructor(
        private url: Url,
        private ajaxRedirect: CombinedUtilities
    ) { }

    public enable(selector: JQuery): void { selector.each((_, elem) => new Grouping($(elem), this.url, this.ajaxRedirect)) }
}

export default class Grouping {
    constructor(private dropdown: JQuery,
        private url: Url,
        private ajaxRedirect: CombinedUtilities) {
        dropdown.on('change', () => {
            this.ajaxRedirect.go_ar(this.url.updateQuery(this.url.current(), "GroupBy", dropdown.val()), dropdown, false, true, false);
        });
    }
}
