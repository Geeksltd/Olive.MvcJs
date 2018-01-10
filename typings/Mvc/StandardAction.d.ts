export default class StandardAction {
    static enableLinkModal(selector: JQuery): void;
    static runStartup(container?: JQuery, trigger?: any, stage?: string): void;
    static runAll(actions: any, trigger?: any): void;
    static run(action: any, trigger: any): boolean;
    static notify(action: any, trigger: any): void;
    static redirect(action: any, trigger: any): void;
    static openModal(event: any, url?: any, options?: any): void;
}
