import { ModalHelper } from "olive/components/modal";
import AjaxRedirect from "./ajaxRedirect";
import { MainTagHelper } from "olive/components/mainTag";

export default class WindowEx implements IService {
    constructor(
        private modalHelper: ModalHelper,
        private mainTagHelper: MainTagHelper,
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

        const thatModalHelper = this.modalHelper;
        const thatMainTagHelper = this.mainTagHelper;

        const onSuccess = success => {
            thatModalHelper.tryOpenFromUrl();
            thatMainTagHelper.resetState();
            thatMainTagHelper.tryOpenFromUrl();
        }

        if (link && link.length && link.prop("tagName") == "A") {
            let ajaxTarget = link.attr("ajax-target");
            let ajaxhref = link.attr("href");
            this.ajaxRedirect.go(location.href, null, true, false, false, onSuccess, ajaxTarget, ajaxhref);
        }
        else {
            this.ajaxRedirect.go(location.href, null, true, false, false, onSuccess, undefined, undefined);
        }
    }
}