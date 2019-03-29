export default class MasterDetail {
    public static enable(selector: JQuery) { selector.off("click.delete-subform").on("click.delete-subform", (e) => this.deleteSubForm(e)); }

    static updateSubFormStates() {
        let countItems = element => $(element).parent().find(".subform-item:visible").length;
        // Hide removed items
        $("input[name$=MustBeDeleted][value]").val("true");
        $("input[name$=MustBeDeleted][value]").closest('.subform-item').hide();
        // hide empty headers
        $(".horizontal-subform thead").each((i, e) =>
            $(e).css('visibility', (countItems(e) > 0) ? 'visible' : 'hidden'));
        // Hide add buttons
        $("[data-subform-max]").each((i, e) => {
            let show = countItems(e) < parseInt($(e).attr('data-subform-max'));
            $(e).closest('[data-module]').find("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
        });
        // Hide delete buttons
        $("[data-subform-min]").each((i, e) => {
            let show = countItems(e) > parseInt($(e).attr('data-subform-min'));
            $(e).find("[data-delete-subform=" + $(e).attr("data-subform") + "]").css('visibility', (show) ? 'visible' : 'hidden');
        });
    }

    static deleteSubForm(event: JQueryEventObject) {
        let button = $(event.currentTarget);

        let container = button.parents(".subform-item");
        container.find("input[name$=MustBeDeleted]").val("true");
        this.updateSubFormStates();
        event.preventDefault();
    }
}
