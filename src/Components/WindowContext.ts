import Url from 'olive/Components/Url'
import Form from 'olive/Components/Form'
import Waiting from 'olive/Components/Waiting'

export default class WindowContext {
    static events: { [event: string]: Function[] } = {};

    public static handleAjaxResponseError(response) {
        Waiting.hidePleaseWait();
        console.error(response);

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

    public static enableSelectColumns(container) {
        var columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => { columns.show(); return false; });
        columns.find('.cancel').click(() => columns.hide());
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

    public static adjustIFrameHeightToContents(iframe) {
        $(iframe).height(iframe.contentWindow.document.body.scrollHeight);
    }

    public static cleanUpNumberField(field: JQuery) {
        var domElement = <HTMLInputElement>field.get(0);
        // var start = domElement.selectionStart;
        // var end = domElement.selectionEnd;
        field.val(field.val().replace(/[^\d.-]/g, ""));
        // domElement.setSelectionRange(start, end);
    }
}