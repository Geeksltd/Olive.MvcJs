import Url from "olive/components/url";
export declare class CKEditorFileManagerFactory implements IService {
    private url;
    constructor(url: Url);
    enable(selector: JQuery): void;
}
export default class CKEditorFileManager {
    private item;
    private url;
    constructor(item: JQuery, url: Url);
    enable(): void;
}
