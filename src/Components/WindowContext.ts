import { Url } from './Url'
import { Form } from './Form'

export class WindowContext {

    static setting = {
        TIME_FORMAT: "HH:mm",
        MINUTE_INTERVALS: 5,
        DATE_LOCALE: "en-gb"
    };
    static events: { [event: string]: Function[] } = {};

    public static isWindowModal(): boolean {
        if ($(this.getContainerIFrame()).closest(".modal").length === 0) return false;
        return true;
    }

    public static getContainerIFrame() {
        if (parent == null || parent == self) return null;
        return $(parent.document).find("iframe").filter((i, f: any) => (f.contentDocument || f.contentWindow.document) == document).get(0);
    }

    public static adjustModalHeightForDataPicker(target: any) {
        var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');

        if (datepicker.length === 0) {
            this.adjustModalHeight();
            return;
        }

        var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        var overflow = Math.max(offset, 0);
        this.adjustModalHeight(overflow);
    }

    public static adjustModalHeight(overflow?: number) {
        if (this.isWindowModal()) {
            var frame = $(this.getContainerIFrame());
            if (frame.attr("data-has-explicit-height") != 'true')
                frame.height(document.body.offsetHeight + (overflow || 0));
        }
    }

    public static getPostData(trigger: JQuery): JQuerySerializeArrayElement[] {
        var form = trigger.closest("[data-module]");
        if (!form.is("form")) form = $("<form />").append(form.clone(true));
        var data = Form.merge(form.serializeArray());
        // If it's master-details, then we need the index.
        var subFormContainer = trigger.closest(".subform-item");
        if (subFormContainer != null) {
            data.push({
                name: "subFormIndex",
                value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
            });
        }


        data.push({ name: "current.request.url", value: window.location.pathAndQuery() });
        return data;
    }

    public static handleAjaxResponseError(response) {
        this.hidePleaseWait();
        console.log(response);

        var text = response.responseText;
        if (text.indexOf("<html") > -1) {
            document.write(text);
        }
        else if (text.indexOf("<form") > -1) {
            var form = $("form", document);
            if (form.length) form.replaceWith($(text));
            else document.write(text);
        }
        else alert(text);
    }

    public static hidePleaseWait() {
        $(".wait-screen").remove();
    }

    public static toJson(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            console.log('Cannot parse this data to Json: ');
            console.log(data);
        }
    }

    public static applyColumns(event: JQueryEventObject) {
        var button = $(event.currentTarget);
        var checkboxes = button.closest(".select-cols").find(":checkbox");
        if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0) return;
        $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
            .appendTo(button.parent());
     }

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

    public static enableSelectColumns(container) {
        var columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => { columns.show(); return false; });
        columns.find('.cancel').click(() => columns.hide());
    }

    public static enableInstantSearch(control) {
        // TODO: Make it work with List render mode too.
        control.off("keyup.immediate-filter").on("keyup.immediate-filter", (event) => {
            var keywords = control.val().toLowerCase().split(' ');
            var rows = control.closest('[data-module]').find(".grid > tbody > tr");

            rows.each((index, e) => {
                var row = $(e);
                var content = row.text().toLowerCase();
                var hasAllKeywords = keywords.filter((i) => content.indexOf(i) == -1).length == 0;
                if (hasAllKeywords) row.show(); else row.hide();
            });
        });

        control.on("keydown", e => {
            if (e.keyCode == 13) e.preventDefault();
        });
    }

    public static enableSelectAllToggle(event) {
        var trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
    }

    public static enableUserHelp(element: JQuery) {
        element.click(() => false);
        var message = element.attr('data-user-help');  // todo: unescape message and conver to html
        element['popover']({ trigger: 'focus', content: message });
    } 

   public static handleDefaultButton(event: JQueryEventObject): boolean {
        if (event.which === 13) {
            var target = $(event.currentTarget);
            var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
            if (button.length == 0) button = $('[default-button]:first') // anywhere
            button.click();
            return false;
        } else return true;
    }

    public static paginationSizeChanged(event: Event) {
        $(event.currentTarget).closest("form").submit();
    }

    public static enableAjaxPaging(event: JQueryEventObject) {
        var button = $(event.currentTarget);
        var page = button.attr("data-pagination");
        var key = "p";

        if (page.split('=').length > 1) { key = page.split('=')[0]; page = page.split('=')[1]; }

        var input = $("[name='" + key + "']");
        input.val(page);
        if (input.val() != page) {
            // Drop down list case
            input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
            input.remove();
        }
    }
}



