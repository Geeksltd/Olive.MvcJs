export default class UserHelp {
    element: JQuery;

    public static enable(selector: JQuery) { selector.each((i, e) => new UserHelp($(e))); }

    constructor(targetElement: JQuery) {
        this.element = targetElement;
        this.element.click(() => false);
        let message = this.element.attr('data-user-help');
        this.element['popover']({ trigger: 'focus', content: message, html: true });
    }
}