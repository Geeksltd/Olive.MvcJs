export default class Url {
    static current(): string;
    static goBack(): void;
    static updateQuery(uri: any, key: any, value: any): any;
    static removeQuery(url: string, parameter: string): string;
    static getQuery(name: string, url?: string): string;
    static fullQueryString(url: string): string;
    static addQuery(url: string, key: string, value: any): string;
    static removeEmptyQueries(url: string): string;
    static baseContentUrl: any;
    static ofContent(relativeUrl: string): string;
}
