import { ModalHelper } from "olive/components/modal";
import { DelayedInitializer } from "./delayedInitializer";
export declare class TimeControlFactory implements IService {
    private modalHelper;
    private delayedInitializer;
    constructor(modalHelper: ModalHelper, delayedInitializer: DelayedInitializer);
    enable(selector: JQuery): void;
}
export default class TimeControl {
    private modalHelper;
    constructor(targetInput: any, modalHelper: ModalHelper);
}
