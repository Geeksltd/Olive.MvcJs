import AjaxRedirect from "olive/mvc/ajaxRedirect";
import Url from "./url";

export default class Grouping {
    public static enable(selector: JQuery): void { selector.each((_, elem) => new Grouping($(elem))) }

    constructor(private dropdown: JQuery) {
        dropdown.on('change', () => {
            AjaxRedirect.go(Url.updateQuery(Url.current(), "GroupBy", dropdown.val()), dropdown, false, true, false);
        });
    }
}
