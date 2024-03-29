import { ModalHelper } from "olive/components/modal";
import AjaxRedirect from "./ajaxRedirect";

export default class WindowEx implements IService {
    constructor(private modalHelper: ModalHelper,
        private ajaxRedirect: AjaxRedirect) { }

    public enableBack(selector: JQuery) {
        selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back(e));
    }

    private back(event: JQueryEventObject) {
        if (this.modalHelper.isOrGoingToBeModal()) {
            this.modalHelper.close();
            return;
        }

        if (this.ajaxRedirect.ajaxChangedUrl == 0) return;

        this.ajaxRedirect.ajaxChangedUrl--;
        const link = $(event.currentTarget);

        if (link && link.length && link.prop("tagName") == "A") {
            let ajaxTarget = link.attr("ajax-target");
            let ajaxhref = link.attr("href");
            this.ajaxRedirect.go(location.href, null, true, false, false, undefined, ajaxTarget, ajaxhref);
            return;
        }

        this.ajaxRedirect.go(location.href, null, true, false, false, undefined, undefined, undefined);
    }
}