export default class StandardAction {
    static runStartup(container?: JQuery, trigger?: any, stage?: string): void;
    static runAll(actions: any, trigger?: any): void;
    static run(action: any, trigger: any): boolean;
    static notify(action: any, trigger: any): void;
    static redirect(action: any, trigger: any): void;
    static refresh(keepScroll?: boolean): boolean;
    static openModal(event: any, url?: any, options?: any): void;
}
