export default class MasterDetail {
    public static updateSubFormStates() {
        var countItems = (element) => $(element).parent().find(".subform-item:visible").length;
        // Hide removed items
        $("input[name*=MustBeDeleted][value=True]").closest('[data-subform]').hide();
        // hide empty headers
        $(".horizontal-subform thead").each((i, e) => {
            $(e).css('visibility', (countItems(e) > 0) ? 'visible' : 'hidden');
        });
        // Hide add buttons
        $("[data-subform-max]").each((i, e) => {
            var show = countItems(e) < parseInt($(e).attr('data-subform-max'));
            $(e).find("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
        });
        // Hide delete buttons
        $("[data-subform-min]").each((i, e) => {
            var show = countItems(e) > parseInt($(e).attr('data-subform-min'));
            $(e).find("[data-delete-subform=" + $(e).attr("data-subform") + "]").css('visibility', (show) ? 'visible' : 'hidden');
        });
    }

    public static deleteSubForm(event: JQueryEventObject) {
        var button = $(event.currentTarget);

        var container = button.parents(".subform-item");
        container.find("input[name*=MustBeDeleted]").val("true");
        container.hide();
        this.updateSubFormStates();
        event.preventDefault();
    }
}