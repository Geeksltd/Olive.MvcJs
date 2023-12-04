import { ModalHelper } from "olive/components/modal";
export declare class TimeControlFactory implements IService {
    private modalHelper;
    constructor(modalHelper: ModalHelper);
    enable(selector: JQuery): void;
}
export default class TimeControl {
    private modalHelper;
    constructor(targetInput: any, modalHelper: ModalHelper);
}
