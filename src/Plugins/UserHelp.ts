export default class UserHelp {
    element: JQuery;

    public static enable(selector: JQuery) { selector.each((i, e) => new UserHelp($(e))); }

    constructor(targetElement: JQuery) {
        this.element = targetElement;
        this.element.click(() => false);
        let message = this.element.attr('data-user-help');  // todo: unescape message and conver to html
        this.element['popover']({ trigger: 'focus', content: message });
    }
}