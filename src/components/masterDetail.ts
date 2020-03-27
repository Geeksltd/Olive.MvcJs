import Validate from "./validate";
import ResponseProcessor from "olive/mvc/responseProcessor";

export default class MasterDetail implements IService {

    constructor(private validate: Validate, private responseProcessor: ResponseProcessor) { }

    public initialize() {
        this.responseProcessor.subformChanged.handle((_) => this.updateSubFormStates());
    }

    public enable(selector: JQuery) {
        selector.off("click.delete-subform").on("click.delete-subform", (e) => this.deleteSubForm(e));
    }

    public updateSubFormStates() {
        const countItems = (element) => $(element).parent().find(".subform-item:visible").length;
        // Hide removed items
        $("input[name$=MustBeDeleted][value=False]").val("false");
        $("input[name$=MustBeDeleted][value=True]").val("true");
        $("input[name$=MustBeDeleted][value=true]").closest(".subform-item").hide();
        // hide empty headers
        $(".horizontal-subform thead").each((i, e) =>
            $(e).css("visibility", (countItems(e) > 0) ? "visible" : "hidden"));
        // Hide add buttons
        $("[data-subform-max]").each((i, e) => {
            const show = countItems(e) < parseInt($(e).attr("data-subform-max"), 10);
            $(e).closest("[data-module]").find("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
        });
        // Hide delete buttons
        $("[data-subform-min]").each((i, e) => {
            const show = countItems(e) > parseInt($(e).attr("data-subform-min"), 10);
            $(e).find("[data-delete-subform=" + $(e).attr("data-subform") + "]").css("visibility", (show) ? "visible" : "hidden");
        });
    }

    private deleteSubForm(event: JQueryEventObject) {
        const button = $(event.currentTarget);

        const container = button.parents(".subform-item");
        this.validate.removeTooltipsRelatedTo(container);
        container.find("input[name$=MustBeDeleted]").val("true");
        container.find("[data-val=true]").attr("readonly", "readonly");
        this.updateSubFormStates();
        event.preventDefault();
    }
}
