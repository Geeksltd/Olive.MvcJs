define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GroupingFactory = void 0;
    class GroupingFactory {
        constructor(url, ajaxRedirect) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
        }
        enable(selector) { selector.each((_, elem) => new Grouping($(elem), this.url, this.ajaxRedirect)); }
    }
    exports.GroupingFactory = GroupingFactory;
    class Grouping {
        constructor(dropdown, url, ajaxRedirect) {
            this.dropdown = dropdown;
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            dropdown.on('change', () => {
                this.ajaxRedirect.go(this.url.updateQuery(this.url.current(), "GroupBy", dropdown.val()), dropdown, false, true, false);
            });
        }
    }
    exports.default = Grouping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9ncm91cGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBSUEsTUFBYSxlQUFlO1FBQ3hCLFlBQ1ksR0FBUSxFQUNSLFlBQTBCO1lBRDFCLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUNsQyxDQUFDO1FBRUUsTUFBTSxDQUFDLFFBQWdCLElBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztLQUMzSDtJQVBELDBDQU9DO0lBRUQsTUFBcUIsUUFBUTtRQUN6QixZQUFvQixRQUFnQixFQUN4QixHQUFRLEVBQ1IsWUFBMEI7WUFGbEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUN4QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDbEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1SCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSjtJQVJELDJCQVFDIn0=