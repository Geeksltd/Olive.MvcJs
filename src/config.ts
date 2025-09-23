export default class Config {

    // formats: http://momentjs.com/docs/#/displaying/format/
    public static TIME_FORMAT = "HH:mm";
    public static DATE_FORMAT = "DD/MM/YYYY";
    public static DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
    public static MINUTE_INTERVALS = 5;
    public static DATE_LOCALE = "en-gb";

    public static DISABLE_BUTTONS_DURING_AJAX = true;
    public static REDIRECT_SCROLLS_UP = true;
    public static AUTOCOMPLETE_INPUT_DELAY = 500;
    public static DEFAULT_MODAL_BACKDROP = "static";

    /* Possible values: Compact | Medium | Advance | Full
    To customise modes, change '/Scripts/Lib/ckeditor_config.js' file */
    public static DEFAULT_HTML_EDITOR_MODE = "Medium";
    
    // CKEditor configuration - supports both v4 and v5
    public static CK_EDITOR_BASE_PATH = '/lib/ckeditor/';
    public static CK_EDITOR_VERSION: 'auto' | '4' | '5'  = 'auto'; // 'auto', '4', or '5'
    public static CK_EDITOR_5_BUNDLE: 'classic' | 'decoupled' | 'inline' | 'balloon' | 'balloon-block' = 'classic'; // 'classic', 'decoupled', 'inline', 'balloon', 'balloon-block'
    public static CK_EDITOR_5_USE_CDN = true; // Use local build via RequireJS compatibility
    
    // CKEditor 5 specific settings
    public static CK_EDITOR_5_CONFIG = {
        language: 'en',
        placeholder: 'Enter your content...',
        // Add more CKEditor 5 specific configurations here
    };

}