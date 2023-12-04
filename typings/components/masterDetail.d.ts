import Validate from "./validate";
import ResponseProcessor from "olive/mvc/responseProcessor";
export default class MasterDetail implements IService {
    private validate;
    private responseProcessor;
    constructor(validate: Validate, responseProcessor: ResponseProcessor);
    initialize(): void;
    enable(selector: JQuery): void;
    updateSubFormStates(): void;
    private deleteSubForm;
}
