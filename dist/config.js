define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Config {
    }
    // formats: http://momentjs.com/docs/#/displaying/format/
    Config.TIME_FORMAT = "HH:mm";
    Config.DATE_FORMAT = "DD/MM/YYYY";
    Config.DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
    Config.MINUTE_INTERVALS = 5;
    Config.DATE_LOCALE = "en-gb";
    Config.DISABLE_BUTTONS_DURING_AJAX = true;
    Config.REDIRECT_SCROLLS_UP = true;
    Config.AUTOCOMPLETE_INPUT_DELAY = 500;
    Config.DEFAULT_MODAL_BACKDROP = "static";
    /* Possible values: Compact | Medium | Advance | Full
    To customise modes, change '/Scripts/Lib/ckeditor_config.js' file */
    Config.DEFAULT_HTML_EDITOR_MODE = "Medium";
    // CKEditor configuration - supports both v4 and v5
    Config.CK_EDITOR_BASE_PATH = '/lib/ckeditor/';
    Config.CK_EDITOR_VERSION = 'auto'; // 'auto', '4', or '5'
    Config.CK_EDITOR_5_BUNDLE = 'classic'; // 'classic', 'decoupled', 'inline', 'balloon', 'balloon-block'
    Config.CK_EDITOR_5_USE_CDN = true; // Use local build via RequireJS compatibility
    // CKEditor 5 specific settings
    Config.CK_EDITOR_5_CONFIG = {
        language: 'en',
        placeholder: 'Enter your content...',
        // Add more CKEditor 5 specific configurations here
    };
    exports.default = Config;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQSxNQUFxQixNQUFNOztJQUV2Qix5REFBeUQ7SUFDM0Msa0JBQVcsR0FBRyxPQUFPLENBQUM7SUFDdEIsa0JBQVcsR0FBRyxZQUFZLENBQUM7SUFDM0IsdUJBQWdCLEdBQUcsa0JBQWtCLENBQUM7SUFDdEMsdUJBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLGtCQUFXLEdBQUcsT0FBTyxDQUFDO0lBRXRCLGtDQUEyQixHQUFHLElBQUksQ0FBQztJQUNuQywwQkFBbUIsR0FBRyxJQUFJLENBQUM7SUFDM0IsK0JBQXdCLEdBQUcsR0FBRyxDQUFDO0lBQy9CLDZCQUFzQixHQUFHLFFBQVEsQ0FBQztJQUVoRDt3RUFDb0U7SUFDdEQsK0JBQXdCLEdBQUcsUUFBUSxDQUFDO0lBRWxELG1EQUFtRDtJQUNyQywwQkFBbUIsR0FBRyxnQkFBZ0IsQ0FBQztJQUN2Qyx3QkFBaUIsR0FBRyxNQUFNLENBQUMsQ0FBQyxzQkFBc0I7SUFDbEQseUJBQWtCLEdBQUcsU0FBUyxDQUFDLENBQUMsK0RBQStEO0lBQy9GLDBCQUFtQixHQUFHLElBQUksQ0FBQyxDQUFDLDhDQUE4QztJQUV4RiwrQkFBK0I7SUFDakIseUJBQWtCLEdBQUc7UUFDL0IsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsdUJBQXVCO1FBQ3BDLG1EQUFtRDtLQUN0RCxDQUFDO3NCQTdCZSxNQUFNIn0=