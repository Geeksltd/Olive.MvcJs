export default class Config {
    static TIME_FORMAT: string;
    static DATE_FORMAT: string;
    static DATE_TIME_FORMAT: string;
    static MINUTE_INTERVALS: number;
    static DATE_LOCALE: string;
    static DISABLE_BUTTONS_DURING_AJAX: boolean;
    static REDIRECT_SCROLLS_UP: boolean;
    static AUTOCOMPLETE_INPUT_DELAY: number;
    static DEFAULT_MODAL_BACKDROP: string;
    static DEFAULT_HTML_EDITOR_MODE: string;
    static CK_EDITOR_BASE_PATH: string;
    static CK_EDITOR_VERSION: 'auto' | '4' | '5';
    static CK_EDITOR_5_BUNDLE: 'classic' | 'decoupled' | 'inline' | 'balloon' | 'balloon-block';
    static CK_EDITOR_5_USE_CDN: boolean;
    static CK_EDITOR_5_CONFIG: {
        language: string;
        placeholder: string;
    };
}
