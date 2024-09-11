define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WindowEx {
        constructor(modalHelper, mainTagHelper, ajaxRedirect) {
            this.modalHelper = modalHelper;
            this.mainTagHelper = mainTagHelper;
            this.ajaxRedirect = ajaxRedirect;
        }
        enableBack(selector) {
            selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back(e));
        }
        back(event) {
            if (this.modalHelper.isOrGoingToBeModal()) {
                this.modalHelper.close();
                return;
            }
            if (this.ajaxRedirect.ajaxChangedUrl == 0)
                return;
            this.ajaxRedirect.ajaxChangedUrl--;
            const link = $(event.currentTarget);
            const thatModalHelper = this.modalHelper;
            const thatMainTagHelper = this.mainTagHelper;
            const onSuccess = success => {
                thatModalHelper.tryOpenFromUrl();
                thatMainTagHelper.resetState();
                thatMainTagHelper.tryOpenFromUrl();
            };
            if (link && link.length && link.prop("tagName") == "A") {
                let ajaxTarget = link.attr("ajax-target");
                let ajaxhref = link.attr("href");
                this.ajaxRedirect.go(location.href, null, true, false, false, onSuccess, ajaxTarget, ajaxhref);
            }
            else {
                this.ajaxRedirect.go(location.href, null, true, false, false, onSuccess, undefined, undefined);
            }
        }
    }
    exports.default = WindowEx;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93RXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbXZjL3dpbmRvd0V4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUlBLE1BQXFCLFFBQVE7UUFDekIsWUFDWSxXQUF3QixFQUN4QixhQUE0QixFQUM1QixZQUEwQjtZQUYxQixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUN4QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUM1QixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUFJLENBQUM7UUFFcEMsVUFBVSxDQUFDLFFBQWdCO1lBQzlCLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVPLElBQUksQ0FBQyxLQUF3QjtZQUNqQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUN6QixPQUFPO1lBQ1gsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLElBQUksQ0FBQztnQkFBRSxPQUFPO1lBRWxELElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbkMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVwQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3pDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUU3QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsRUFBRTtnQkFDeEIsZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNqQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDL0IsaUJBQWlCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkMsQ0FBQyxDQUFBO1lBRUQsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNyRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25HLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25HLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUF2Q0QsMkJBdUNDIn0=