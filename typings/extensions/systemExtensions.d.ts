export default class SystemExtensions {
    static initialize(): void;
    static extend(type: any, name: string, implementation: Function): void;
    static extendString(): void;
    static safeParse(data: any): any;
    static download(url: any): void;
    static groupBy(array: Array<any>, groupFunction: Function): any[];
}
