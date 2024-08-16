export declare type CrossDomainEventCommands = "refresh-page" | "set-iframe-height" | "close-modal" | "file-uploaded" | string;
export default class CrossDomainEvent {
    static handle(command: CrossDomainEventCommands, handler: ((arg: any) => void)): void;
    static raise(window: Window, command: CrossDomainEventCommands, arg?: any): void;
}
