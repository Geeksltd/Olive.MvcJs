import AjaxRedirect from "olive/mvc/ajaxRedirect";
import { ModalHelper } from "olive/components/modal";
import ServerInvoker from "olive/mvc/serverInvoker";
export default class TestingContext implements IService, ITestingContext {
    private ajaxRedirect;
    private modalHelper;
    private serverInvoker;
    private isLoaded;
    constructor(ajaxRedirect: AjaxRedirect, modalHelper: ModalHelper, serverInvoker: ServerInvoker);
    isAjaxRedirecting(): boolean;
    isOpeningModal(): boolean;
    isClosingModal(): boolean;
    isAwaitingAjaxResponse(): boolean;
    isOliveMvcLoaded(): boolean;
    onPageInitialized(): void;
}
