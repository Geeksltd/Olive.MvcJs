define(["require", "exports", "olive/mvc/ajaxRedirect", "./url"], function (require, exports, ajaxRedirect_1, url_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Grouping = /** @class */ (function () {
        function Grouping(dropdown) {
            this.dropdown = dropdown;
            dropdown.on('change', function () {
                ajaxRedirect_1.default.go(url_1.default.updateQuery(url_1.default.current(), "GroupBy", dropdown.val()), dropdown, false, true, false);
            });
        }
        Grouping.enable = function (selector) { selector.each(function (_, elem) { return new Grouping($(elem)); }); };
        return Grouping;
    }());
    exports.default = Grouping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9ncm91cGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUdBO1FBR0ksa0JBQW9CLFFBQWdCO1lBQWhCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDaEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLHNCQUFZLENBQUMsRUFBRSxDQUFDLGFBQUcsQ0FBQyxXQUFXLENBQUMsYUFBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3RyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFOYSxlQUFNLEdBQXBCLFVBQXFCLFFBQWdCLElBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxJQUFJLElBQUssT0FBQSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQU90RyxlQUFDO0lBQUQsQ0FBQyxBQVJELElBUUMifQ==