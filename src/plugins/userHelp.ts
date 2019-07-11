export default class UserHelp {
    public static enable(selector: JQuery) { selector.each((i, e) => new UserHelp($(e))); }

    constructor(element: JQuery) {
        element.click(() => false);
        let message = element.attr('data-user-help');
        element['popover']({ trigger: 'focus', content: message, html: true });
    }
}