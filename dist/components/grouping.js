define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GroupingFactory = void 0;
    var GroupingFactory = /** @class */ (function () {
        function GroupingFactory(url, ajaxRedirect) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
        }
        GroupingFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (_, elem) { return new Grouping($(elem), _this.url, _this.ajaxRedirect); });
        };
        return GroupingFactory;
    }());
    exports.GroupingFactory = GroupingFactory;
    var Grouping = /** @class */ (function () {
        function Grouping(dropdown, url, ajaxRedirect) {
            var _this = this;
            this.dropdown = dropdown;
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            dropdown.on('change', function () {
                _this.ajaxRedirect.go(_this.url.updateQuery(_this.url.current(), "GroupBy", dropdown.val()), dropdown, false, true, false);
            });
        }
        return Grouping;
    }());
    exports.default = Grouping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9ncm91cGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBSUE7UUFDSSx5QkFDWSxHQUFRLEVBQ1IsWUFBMEI7WUFEMUIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQ2xDLENBQUM7UUFFRSxnQ0FBTSxHQUFiLFVBQWMsUUFBZ0I7WUFBOUIsaUJBQXdIO1lBQWhGLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsSUFBSSxJQUFLLE9BQUEsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSSxDQUFDLFlBQVksQ0FBQyxFQUFsRCxDQUFrRCxDQUFDLENBQUE7UUFBQyxDQUFDO1FBQzVILHNCQUFDO0lBQUQsQ0FBQyxBQVBELElBT0M7SUFQWSwwQ0FBZTtJQVM1QjtRQUNJLGtCQUFvQixRQUFnQixFQUN4QixHQUFRLEVBQ1IsWUFBMEI7WUFGdEMsaUJBTUM7WUFObUIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUN4QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDbEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLEtBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLGVBQUM7SUFBRCxDQUFDLEFBUkQsSUFRQyJ9