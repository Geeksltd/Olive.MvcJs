export default class Config {

    // formats: http://momentjs.com/docs/#/displaying/format/
    static TIME_FORMAT = "HH:mm";
    static DATE_FORMAT = "DD/MM/YYYY";
    static DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
    static MINUTE_INTERVALS = 5;
    static DATE_LOCALE = "en-gb";

    static DISABLE_BUTTONS_DURING_AJAX = true;
    static REDIRECT_SCROLLS_UP = true;
    static AUTOCOMPLETE_INPUT_DELAY = 500;
    static DEFAULT_MODAL_BACKDROP = "static";

    /* Possible values: Compact | Medium | Advance | Full
    To customise modes, change '/Scripts/Lib/ckeditor_config.js' file */
    static DEFAULT_HTML_EDITOR_MODE = "Medium";
    static CK_EDITOR_BASE_PATH = '/lib/ckeditor/';

}