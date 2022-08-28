define(["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiSelectFactory = void 0;
    var MultiSelectFactory = /** @class */ (function () {
        function MultiSelectFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        MultiSelectFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new MultiSelect($(e), _this.modalHelper).show(); });
        };
        return MultiSelectFactory;
    }());
    exports.MultiSelectFactory = MultiSelectFactory;
    var MultiSelect = /** @class */ (function () {
        //https://developer.snapappointments.com/bootstrap-select/
        function MultiSelect(selectControl, modalHelper) {
            this.selectControl = selectControl;
            this.modalHelper = modalHelper;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
        }
        MultiSelect.prototype.show = function () {
            var maxOptions = this.selectControl.attr("maxOptions") || false;
            var actionsBox = true;
            var attrib = this.selectControl.attr("actionsBox");
            if (attrib != undefined && attrib != null && attrib == "false") {
                actionsBox = false;
            }
            var container = this.selectControl.attr("container") || false;
            var countSelectedText = this.selectControl.attr("countSelectedText") || "count";
            var deselectAllText = this.selectControl.attr("deselectAllText") || "Deselect All";
            var dropdownAlignRight = this.selectControl.attr("dropdownAlignRight") || false;
            var dropupAuto = true;
            var attrib = this.selectControl.attr("dropupAuto");
            if (attrib != undefined && attrib != null && attrib == "false") {
                dropupAuto = false;
            }
            var header = this.selectControl.attr("header") || false;
            var hideDisabled = this.selectControl.attr("hideDisabled") || false;
            var liveSearch = true;
            var attrib = this.selectControl.attr("liveSearch");
            if (attrib != undefined && attrib != null && attrib == "false") {
                liveSearch = false;
            }
            var liveSearchNormalize = this.selectControl.attr("liveSearchNormalize") || false;
            var liveSearchPlaceholder = this.selectControl.attr("liveSearchPlaceholder") || null;
            var liveSearchStyle = this.selectControl.attr("liveSearchStyle") || "contains";
            var maxOptionsText = this.selectControl.attr("maxOptionsText") || "Cannot select more items";
            var mobile = this.selectControl.attr("mobile") || false;
            var multipleSeparator = this.selectControl.attr("multipleSeparator") || ", ";
            var noneSelectedText = this.selectControl.attr("noneSelectedText") || "Nothing selected";
            var noneResultsText = this.selectControl.attr("noneResultsText") || "No results matched";
            var selectAllText = this.selectControl.attr("selectAllText") || "Select All";
            var selectedTextFormat = this.selectControl.attr("selectedTextFormat") || "count > 1";
            var selectOnTab = this.selectControl.attr("selectOnTab") || false;
            var showContent = true;
            var attrib = this.selectControl.attr("showContent");
            if (attrib != undefined && attrib != null && attrib == "false") {
                showContent = false;
            }
            var showIcon = true;
            var attrib = this.selectControl.attr("showIcon");
            if (attrib != undefined && attrib != null && attrib == "false") {
                showIcon = false;
            }
            var showSubtext = this.selectControl.attr("showSubtext") || false;
            var size = this.selectControl.attr("size") || "auto";
            var styleBase = this.selectControl.attr("styleBase") || "btn";
            var title = this.selectControl.attr("title") || null;
            var virtualScroll = this.selectControl.attr("virtualScroll") || false;
            var width = this.selectControl.attr("width") || false;
            var windowPadding = this.selectControl.attr("windowPadding") || 0;
            var sanitize = true;
            var attrib = this.selectControl.attr("sanitize");
            if (attrib != undefined && attrib != null && attrib == "false") {
                sanitize = false;
            }
            var options = {
                maxOptions: maxOptions,
                actionsBox: actionsBox,
                container: container,
                countSelectedText: countSelectedText,
                deselectAllText: deselectAllText,
                dropdownAlignRight: dropdownAlignRight,
                dropupAuto: dropupAuto,
                header: header,
                hideDisabled: hideDisabled,
                liveSearch: liveSearch,
                liveSearchNormalize: liveSearchNormalize,
                liveSearchPlaceholder: liveSearchPlaceholder,
                liveSearchStyle: liveSearchStyle,
                maxOptionsText: maxOptionsText,
                mobile: mobile,
                multipleSeparator: multipleSeparator,
                noneSelectedText: noneSelectedText,
                noneResultsText: noneResultsText,
                selectAllText: selectAllText,
                selectedTextFormat: selectedTextFormat,
                selectOnTab: selectOnTab,
                showContent: showContent,
                showIcon: showIcon,
                showSubtext: showSubtext,
                size: size,
                styleBase: styleBase,
                title: title,
                virtualScroll: virtualScroll,
                width: width,
                windowPadding: windowPadding,
                sanitize: sanitize
            };
            this.selectControl.selectpicker(options);
            this.MoveActionButtons();
        };
        MultiSelect.prototype.MoveActionButtons = function () {
            //var actionbuttons = $(".bs-actionsbox");
            //if (actionbuttons != undefined && actionbuttons != null)
            //    actionbuttons.parent().prepend($(".bs-actionsbox"));
        };
        return MultiSelect;
    }());
    exports.default = MultiSelect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlTZWxlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9tdWx0aVNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQTtRQUNJLDRCQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsbUNBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUE0RztZQUExRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQTlDLENBQThDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDaEgseUJBQUM7SUFBRCxDQUFDLEFBSkQsSUFJQztJQUpZLGdEQUFrQjtJQU0vQjtRQUNJLDBEQUEwRDtRQUcxRCxxQkFBc0IsYUFBcUIsRUFBVSxXQUF3QjtZQUF2RCxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3pFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZO2dCQUNqQixDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO1FBQzdELENBQUM7UUFFTSwwQkFBSSxHQUFYO1lBRUksSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQ2hFLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNuRCxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLElBQUks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