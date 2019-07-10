import Validate from "./validate";
export default class MasterDetail implements IService {
    private validate;
    constructor(validate: Validate);
    enable(selector: JQuery): void;
    updateSubFormStates(): void;
    deleteSubForm(event: JQueryEventObject): void;
}
