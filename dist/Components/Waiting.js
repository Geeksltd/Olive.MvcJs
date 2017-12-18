define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Waiting = /** @class */ (function () {
        function Waiting() {
        }
        Waiting.show = function (blockScreen) {
            if (blockScreen === void 0) { blockScreen = false; }
            if (!$(document.forms[0]).valid())
                return;
            var screen = $("<div class='wait-screen' />").appendTo("body");
            if (blockScreen) {
                $("<div class='cover' />")
                    .width(Math.max($(document).width(), $(window).width()))
                    .height(Math.max($(document).height(), $(window).height()))
                    .appendTo(screen);
            }
            $("<div class='wait-container'><div class='wait-box'><img src='/public/img/loading.gif'/></div>")
                .appendTo(screen)
                .fadeIn('slow');
        };
        Waiting.hide = function () {
            $(".wait-screen").remove();
        };
        return Waiting;
    }());
    exports.default = Waiting;
});
//# sourceMappingURL=Waiting.js.map