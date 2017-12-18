define(["require", "exports", "olive/Components/Waiting"], function (require, exports, Waiting_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowContext = /** @class */ (function () {
        function WindowContext() {
        }
        WindowContext.initialize = function () {
            window["isModal"] = function () { return WindowContext.isWindowModal(); };
            window["getContainerIFrame"] = function () { return WindowContext.findContainerIFrame(); };
        };
        WindowContext.findContainerIFrame = function () {
            if (parent == null || parent == self)
                return null;
            else
                return $(parent.document).find("iframe")
                    .filter(function (i, f) { return (f.contentDocument || f.contentWindow.document) == document; }).get(0);
        };
        WindowContext.isWindowModal = function () {
            if ($(window.getContainerIFrame()).closest(".modal").length === 0)
                return false;
            return true;
        };
        WindowContext.expandModalToFitPicker = function (target) {
            var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');
            if (datepicker.length === 0) {
                this.adjustModalHeight();
                return;
            }
            var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
            var overflow = Math.max(offset, 0);
            this.adjustModalHeight(overflow);
        };
        WindowContext.adjustModalHeight = function (overflow) {
            if (window.isModal()) {
                var frame = $(window.getContainerIFrame());
                if (frame.attr("data-has-explicit-height") != 'true')
                    frame.height(document.body.offsetHeight + (overflow || 0));
            }
        };
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
        WindowContext.enableInstantSearch = function (control) {
            // TODO: Make it work with List render mode too.
            control.off("keyup.immediate-filter").on("keyup.immediate-filter", function (event) {
                var keywords = control.val().toLowerCase().split(' ');
                var rows = control.closest('[data-module]').find(".grid > tbody > tr");
                rows.each(function (index, e) {
                    var row = $(e);
                    var content = row.text().toLowerCase();
                    var hasAllKeywords = keywords.filter(function (i) { return content.indexOf(i) == -1; }).length == 0;
                    if (hasAllKeywords)
                        row.show();
                    else
                        row.hide();
                });
            });
            control.on("keydown", function (e) {
                if (e.keyCode == 13)
                    e.preventDefault();
            });
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
        WindowContext.paginationSizeChanged = function (event) {
            $(event.currentTarget).closest("form").submit();
        };
        WindowContext.enableAjaxPaging = function (event) {
            var button = $(event.currentTarget);
            var page = button.attr("data-pagination");
            var key = "p";
            if (page.split('=').length > 1) {
                key = page.split('=')[0];
                page = page.split('=')[1];
            }
            var input = $("[name='" + key + "']");
            input.val(page);
            if (input.val() != page) {
                // Drop down list case
                input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
                input.remove();
            }
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
        WindowContext.ensureModalResize = function () {
            var _this = this;
            setTimeout(function () { return _this.adjustModalHeight(); }, 1);
        };
        WindowContext.events = {};
        return WindowContext;
    }());
    exports.default = WindowContext;
});
//# sourceMappingURL=WindowContext.js.map