import Url from "olive/components/url";

export default class CKEditorFileManager {
    public static enable(selector: JQuery) { selector.each((i, e) => new CKEditorFileManager($(e)).enable()); }

    constructor(private item: JQuery) { }

    enable() {
        this.item.on('click', () => {
            const uri = this.item.data('download-uri');
            window.opener.CKEDITOR.tools.callFunction(Url.getQuery('CKEditorFuncNum'), uri);
            window.close();
        });
    }
}
