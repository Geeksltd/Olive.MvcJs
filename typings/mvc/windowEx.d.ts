import { ModalHelper } from "olive/components/modal";
import AjaxRedirect from "./ajaxRedirect";
import { MainTagHelper } from "olive/components/mainTag";
export default class WindowEx implements IService {
    private modalHelper;
    private mainTagHelper;
    private ajaxRedirect;
    constructor(modalHelper: ModalHelper, mainTagHelper: MainTagHelper, ajaxRedirect: AjaxRedirect);
    enableBack(selector: JQuery): void;
    private back;
}
