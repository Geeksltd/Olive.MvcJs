define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Select = /** @class */ (function () {
        function Select() {
        }
        Select.enhance = function (selectControl) {
            selectControl.chosen({ disable_search_threshold: 5 });
        };
        return Select;
    }());
    exports.default = Select;
});
//# sourceMappingURL=Select.js.map