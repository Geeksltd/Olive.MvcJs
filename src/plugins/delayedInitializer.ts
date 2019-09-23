export class DelayedInitializer implements IService {
    public delayedLoadMinCount: number = 5;
    public delay: number = 100;

    public initialize(selector: JQuery, init: (index: number, elem: Element) => any) {
        if (selector.length >= this.delayedLoadMinCount) {
            setTimeout(() => selector.each(init), this.delay)
        }
        else {
            selector.each(init);
        }
    }
}