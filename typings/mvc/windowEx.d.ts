import { ModalHelper } from "olive/components/modal";
import AjaxRedirect from "./ajaxRedirect";
export default class WindowEx implements IService {
    private modalHelper;
    private ajaxRedirect;
    constructor(modalHelper: ModalHelper, ajaxRedirect: AjaxRedirect);
    enableBack(selector: JQuery): void;
    private back;
}
