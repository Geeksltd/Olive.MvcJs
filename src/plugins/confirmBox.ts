
export default class ConfirmBox {
    public static enable(selector: JQuery) { selector.each((i, e) => new ConfirmBox($(e)).enable()); }

    constructor(private button: JQuery) { }

    private enable() {
        this.button.off("click.confirm-question").bindFirst("click.confirm-question", e => {
            e.stopImmediatePropagation();

            alertify.set({
                labels: {
                    ok: this.button.attr('data-confirm-ok') || 'OK',
                    cancel: this.button.attr('data-confirm-cancel') || 'Cancel'
                }
            });

            this.showConfirm(this.button.attr('data-confirm-question'), () => {
                this.button.off("click.confirm-question");
                this.button.trigger('click');
                this.enable();
            });
            return false;
        });
    }

    public showConfirm(text, yesCallback) {
        alertify.confirm(text.replace(/\r/g, "<br />"), e => {
            if (e) yesCallback();
            else return false;
        });
    }
}
