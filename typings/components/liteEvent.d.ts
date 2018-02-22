export default class LiteEvent<T> {
    private handlers;
    handle(handler: {
        (data?: T): void;
    }): void;
    remove(handler: {
        (data?: T): void;
    }): void;
    raise(data?: T): void;
}
