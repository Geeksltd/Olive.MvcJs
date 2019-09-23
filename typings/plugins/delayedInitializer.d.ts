export declare class DelayedInitializer implements IService {
    delayedLoadMinCount: number;
    delay: number;
    initialize(selector: JQuery, init: (index: number, elem: Element) => any): void;
}
