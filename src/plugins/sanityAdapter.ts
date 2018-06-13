export default class SanityAdapter {

    public static enable() { $(window).off('click.SanityAdapter').on('click.SanityAdapter', e => this.skipNewWindows(e)); }

    static skipNewWindows(element: JQueryEventObject) {
        $(element.target).filter('a').removeAttr('target');
        window["open"] = (url, r, f, re) => { location.replace(url); return window; };
    }
}
