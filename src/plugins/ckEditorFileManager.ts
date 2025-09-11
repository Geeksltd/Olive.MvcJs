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
            this.handleFileSelection(uri);
        });
    }

    protected handleFileSelection(uri: string) {
        // Support both CKEditor 4 and 5
        if (this.isCKEditor5()) {
            this.handleCKEditor5FileSelection(uri);
        } else {
            this.handleCKEditor4FileSelection(uri);
        }
    }

    protected isCKEditor5(): boolean {
        // Check if we're in a CKEditor 5 context
        return window.opener && (
            typeof window.opener["ClassicEditor"] !== "undefined" ||
            typeof window.opener["DecoupledEditor"] !== "undefined" ||
            typeof window.opener["InlineEditor"] !== "undefined" ||
            // Check for CKEditor 5 global object
            (window.opener as any).ckeditor5 !== undefined
        );
    }

    protected handleCKEditor5FileSelection(uri: string) {
        // CKEditor 5 file selection handling
        try {
            // Try to use the modern CKEditor 5 API
            if (window.opener && (window.opener as any).ckeditor5) {
                // Use CKEditor 5's file selection API
                const ckeditor5 = (window.opener as any).ckeditor5;
                if (ckeditor5.fileSelectionCallback) {
                    ckeditor5.fileSelectionCallback(uri);
                } else {
                    // Fallback to postMessage for CKEditor 5
                    window.opener.postMessage({
                        type: 'ckeditor5-file-selected',
                        url: uri
                    }, '*');
                }
            } else {
                // Fallback to CKEditor 4 method
                this.handleCKEditor4FileSelection(uri);
            }
        } catch (error) {
            console.error("Error handling CKEditor 5 file selection:", error);
            // Fallback to CKEditor 4 method
            this.handleCKEditor4FileSelection(uri);
        }
        
        window.close();
    }

    protected handleCKEditor4FileSelection(uri: string) {
        // Legacy CKEditor 4 file selection handling
        try {
            if (window.opener && window.opener["CKEDITOR"]) {
                window.opener["CKEDITOR"].tools.callFunction(this.url.getQuery('CKEditorFuncNum'), uri);
            } else {
                console.error("CKEditor not found in parent window");
            }
        } catch (error) {
            console.error("Error handling CKEditor 4 file selection:", error);
        }
        
        window.close();
    }
}
