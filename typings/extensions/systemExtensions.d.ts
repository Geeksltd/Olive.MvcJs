export default class SystemExtensions {
    static initialize(): void;
    static safeParse(data: any): any;
    static download(url: any): void;
    static groupBy(array: Array<any>, groupFunction: Function): any[];
    static stringEndsWith(searchString: string): boolean;
    static htmlEncode(text: string): string;
    static htmlDecode(text: string): string;
}
