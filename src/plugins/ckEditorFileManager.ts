import Url from "olive/components/url";

export class CKEditorFileManagerFactory implements IService {

    constructor(private url: Url) { }

    public enable(selector: JQuery) { selector.each((i, e) => new CKEditorFileManager($(e), this.url).enable()); }
}
export default class CKEditorFileManager {
    constructor(private item: JQuery, private url: Url) { }

    public enable() {
        this.item.on('click', () => {
            const uri = this.item.data('download-uri');
            window.opener.CKEDITOR.tools.callFunction(this.url.getQuery('CKEditorFuncNum'), uri);
            window.close();
        });
    }
}
