define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowContext = /** @class */ (function () {
        function WindowContext() {
        }
        WindowContext.initialize = function () {
            window["download"] = function (url) {
                $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");
            };
            JSON["safeParse"] = function (data) {
                try {
                    return JSON.parse(data);
                }
                catch (error) {
                    console.log(error);
                    console.log('Cannot parse this data to Json: ');
                    throw error;
                }
            };
        };
        WindowContext.fitFrameContentHeight = function (iframe) {
            $(iframe).height(iframe.contentWindow.document.body.scrollHeight);
        };
        return WindowContext;
    }());
    exports.default = WindowContext;
});
//# sourceMappingURL=WindowContext.js.map