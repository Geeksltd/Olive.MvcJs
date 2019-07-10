import Form from "olive/components/form";
export declare class SliderFactory implements IService {
    private form;
    constructor(form: Form);
    enable(selector: JQuery): void;
}
export default class Slider {
    private form;
    input: JQuery;
    options: any;
    constructor(targetInput: JQuery, form: Form);
    enable(): void;
}
