define(["require", "exports", "olive/Components/Waiting"], function (require, exports, Waiting_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowContext = /** @class */ (function () {
        function WindowContext() {
        }
        WindowContext.handleAjaxResponseError = function (response) {
            Waiting_1.default.hidePleaseWait();
            console.error(response);
            var text = response.responseText;
            if (text.indexOf("<html") > -1) {
                document.write(text);
            }
            else if (text.indexOf("<form") > -1) {
                var form = $("form", document);
                if (form.length)
                    form.replaceWith($(text));
                else
                    document.write(text);
            }
            else
                alert(text);
        };
        WindowContext.toJson = function (data) {
            try {
                return JSON.parse(data);
            }
            catch (error) {
                console.log(error);
                console.log('Cannot parse this data to Json: ');
                console.log(data);
            }
        };
        WindowContext.applyColumns = function (event) {
            var button = $(event.currentTarget);
            var checkboxes = button.closest(".select-cols").find(":checkbox");
            if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0)
                return;
            $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
                .appendTo(button.parent());
        };
        WindowContext.enableSelectColumns = function (container) {
            var columns = container.find("div.select-cols");
            container.find("a.select-cols").click(function () { columns.show(); return false; });
            columns.find('.cancel').click(function () { return columns.hide(); });
        };
        WindowContext.enableSelectAllToggle = function (event) {
            var trigger = $(event.currentTarget);
            trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
        };
        WindowContext.enableUserHelp = function (element) {
            element.click(function () { return false; });
            var message = element.attr('data-user-help'); // todo: unescape message and conver to html
            element['popover']({ trigger: 'focus', content: message });
        };
        WindowContext.handleDefaultButton = function (event) {
            if (event.which === 13) {
                var target = $(event.currentTarget);
                var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
                if (button.length == 0)
                    button = $('[default-button]:first'); // anywhere
                button.click();
                return false;
            }
            else
                return true;
        };
        WindowContext.adjustIFrameHeightToContents = function (iframe) {
            $(iframe).height(iframe.contentWindow.document.body.scrollHeight);
        };
        WindowContext.cleanUpNumberField = function (field) {
            var domElement = field.get(0);
            // var start = domElement.selectionStart;
            // var end = domElement.selectionEnd;
            field.val(field.val().replace(/[^\d.-]/g, ""));
            // domElement.setSelectionRange(start, end);
        };
        WindowContext.events = {};
        return WindowContext;
    }());
    exports.default = WindowContext;
});
//# sourceMappingURL=WindowContext.js.map