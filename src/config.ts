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
    public static CK_EDITOR_BASE_PATH = '/lib/ckeditor/';

}