export default class LiteEvent<T> {
    private handlers: { (data?: T): void; }[] = [];

    public handle(handler: { (data?: T): void }): void {
        this.handlers.push(handler);
    }

    public remove(handler: { (data?: T): void }): void {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public raise(data?: T) {
        this.handlers.slice(0).forEach(h => h(data));
    }
}