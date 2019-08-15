export default class SanityAdapter implements IService {

    public enable() { $(window).off('click.SanityAdapter').on('click.SanityAdapter', e => this.skipNewWindows(e)); }

    private skipNewWindows(element: JQueryEventObject) {
        $(element.target).filter('a').removeAttr('target');
        window["open"] = (url, r, f, re) => { location.replace(url); return window; };
    }
}
