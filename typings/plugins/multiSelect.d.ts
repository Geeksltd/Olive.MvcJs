import 'bootstrap-select';
import { ModalHelper } from "olive/components/modal";
export declare class MultiSelectFactory implements IService {
    private modalHelper;
    constructor(modalHelper: ModalHelper);
    enable(selector: JQuery): void;
}
export default class MultiSelect implements IService {
    protected selectControl: JQuery;
    private modalHelper;
    constructor(selectControl: JQuery, modalHelper: ModalHelper);
    show(): void;
    private MoveActionButtons;
}
