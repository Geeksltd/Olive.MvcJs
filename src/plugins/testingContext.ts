import AjaxRedirect from "olive/mvc/ajaxRedirect";
import { ModalHelper } from "olive/components/modal";
import ServerInvoker from "olive/mvc/serverInvoker";

export default class TestingContext implements IService, ITestingContext {
    private isLoaded = false;

    constructor(
        private ajaxRedirect: AjaxRedirect,
        private modalHelper: ModalHelper,
        private serverInvoker: ServerInvoker,
    ) { }

    public isAjaxRedirecting() {
        return this.ajaxRedirect.isAjaxRedirecting;
    }

    public isOpeningModal() {
        return !!this.modalHelper.currentModal?.isOpening;
    }

    public isClosingModal() {
        return this.modalHelper.isClosingModal;
    }

    public isAwaitingAjaxResponse() {
        return this.serverInvoker.isAwaitingAjaxResponse;
    }

    public isOliveMvcLoaded() {
        return this.isLoaded;
    }

    public onPageInitialized() {
        this.isLoaded = true;
    }
}
