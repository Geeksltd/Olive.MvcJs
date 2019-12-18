export default class ConfirmBoxFactory implements IService {
    public enable(selector: JQuery) { selector.each((i, e) => new ConfirmBox($(e)).enable()); }
}

export class ConfirmBox {
    constructor(protected button: JQuery) { }

    public enable() {
        this.button.off("click.confirm-question").bindFirst("click.confirm-question", e => {
            e.stopImmediatePropagation();

            this.setButtonsLabel(
                this.button.attr('data-confirm-ok') || 'OK',
                this.button.attr('data-confirm-cancel') || 'Cancel',
            );

            this.showConfirm(this.button.attr('data-confirm-question'), () => {
                this.button.off("click.confirm-question");
                this.button.trigger('click');
                this.enable();
            });

            return false;
        });
    }

    public setButtonsLabel(ok: string, cancel: string) {
        alertify.set({ labels: { ok, cancel } });
    }

    public showConfirm(text: string, yesCallback: () => void) {
        alertify.confirm(text.replace(/\r/g, "<br />"), e => {
            if (e) yesCallback();
            else return false;
        });
    }
}
