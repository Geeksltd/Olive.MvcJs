define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CKEditorFileManagerFactory = void 0;
    class CKEditorFileManagerFactory {
        constructor(url) {
            this.url = url;
        }
        enable(selector) { selector.each((i, e) => new CKEditorFileManager($(e), this.url).enable()); }
    }
    exports.CKEditorFileManagerFactory = CKEditorFileManagerFactory;
    class CKEditorFileManager {
        constructor(item, url) {
            this.item = item;
            this.url = url;
        }
        enable() {
            this.item.on('click', () => {
                const uri = this.item.data('download-uri');
                this.handleFileSelection(uri);
            });
        }
        handleFileSelection(uri) {
            // Support both CKEditor 4 and 5
            if (this.isCKEditor5()) {
                this.handleCKEditor5FileSelection(uri);
            }
            else {
                this.handleCKEditor4FileSelection(uri);
            }
        }
        isCKEditor5() {
            // Check if we're in a CKEditor 5 context
            return window.opener && (typeof window.opener["ClassicEditor"] !== "undefined" ||
                typeof window.opener["DecoupledEditor"] !== "undefined" ||
                typeof window.opener["InlineEditor"] !== "undefined" ||
                // Check for CKEditor 5 global object
                window.opener.ckeditor5 !== undefined);
        }
        handleCKEditor5FileSelection(uri) {
            // CKEditor 5 file selection handling
            try {
                // Try to use the modern CKEditor 5 API
                if (window.opener && window.opener.ckeditor5) {
                    // Use CKEditor 5's file selection API
                    const ckeditor5 = window.opener.ckeditor5;
                    if (ckeditor5.fileSelectionCallback) {
                        ckeditor5.fileSelectionCallback(uri);
                    }
                    else {
                        // Fallback to postMessage for CKEditor 5
                        window.opener.postMessage({
                            type: 'ckeditor5-file-selected',
                            url: uri
                        }, '*');
                    }
                }
                else {
                    // Fallback to CKEditor 4 method
                    this.handleCKEditor4FileSelection(uri);
                }
            }
            catch (error) {
                console.error("Error handling CKEditor 5 file selection:", error);
                // Fallback to CKEditor 4 method
                this.handleCKEditor4FileSelection(uri);
            }
            window.close();
        }
        handleCKEditor4FileSelection(uri) {
            // Legacy CKEditor 4 file selection handling
            try {
                if (window.opener && window.opener["CKEDITOR"]) {
                    window.opener["CKEDITOR"].tools.callFunction(this.url.getQuery('CKEditorFuncNum'), uri);
                }
                else {
                    console.error("CKEditor not found in parent window");
                }
            }
            catch (error) {
                console.error("Error handling CKEditor 4 file selection:", error);
            }
            window.close();
        }
    }
    exports.default = CKEditorFileManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tFZGl0b3JGaWxlTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2NrRWRpdG9yRmlsZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUVBLE1BQWEsMEJBQTBCO1FBRW5DLFlBQW9CLEdBQVE7WUFBUixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQUksQ0FBQztRQUUxQixNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pIO0lBTEQsZ0VBS0M7SUFFRCxNQUFxQixtQkFBbUI7UUFDcEMsWUFBb0IsSUFBWSxFQUFVLEdBQVE7WUFBOUIsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUFVLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBSSxDQUFDO1FBRWhELE1BQU07WUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUN2QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVTLG1CQUFtQixDQUFDLEdBQVc7WUFDckMsZ0NBQWdDO1lBQ2hDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FB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