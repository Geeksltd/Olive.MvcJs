export default class Config {

    // formats: http://momentjs.com/docs/#/displaying/format/
    static TIME_FORMAT: string = "HH:mm";
    static DATE_FORMAT: string = "DD/MM/YYYY";
    static DATE_TIME_FORMAT: string = "DD/MM/YYYY HH:mm";
    static MINUTE_INTERVALS: number = 5;
    static DATE_LOCALE: string = "en-gb";

    static DISABLE_BUTTONS_DURING_AJAX: boolean = false;
    static REDIRECT_SCROLLS_UP: boolean = true;
    static AUTOCOMPLETE_INPUT_DELAY: number = 500;
    static DEFAULT_MODAL_BACKDROP = "static";

    /* Possible values: Compact | Medium | Advance | Full
    To customise modes, change '/Scripts/Lib/ckeditor_config.js' file */
    static DEFAULT_HTML_EDITOR_MODE = "Medium";

}

