export default class CrossDomainEvent {
    static handle(command: string, handler: ((arg: any) => void)): void;
    static raise(window: Window, command: string, arg?: any): void;
}
