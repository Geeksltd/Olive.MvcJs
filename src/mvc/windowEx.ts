import { ModalHelper } from "olive/components/modal";
import AjaxRedirect from "./ajaxRedirect";

export default class WindowEx implements IService {
    constructor(private modalHelper: ModalHelper,
        private ajaxRedirect: AjaxRedirect) { }

    public enableBack(selector: JQuery) {
        selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back(e));
    }

    private back(event: JQueryEventObject) {
        if (this.modalHelper.isOrGoingToBeModal())
            window.location.reload();
        else {
            if (this.ajaxRedirect.ajaxChangedUrl == 0) return;
            this.ajaxRedirect.ajaxChangedUrl--;
            this.ajaxRedirect.go(location.href, null, true, false, false);
        }
    }
}