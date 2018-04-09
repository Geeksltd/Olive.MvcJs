define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var InstantSearch = (function () {
        function InstantSearch(targetInput) {
            this.input = targetInput;
        }
        InstantSearch.enable = function (selector) { selector.each(function (i, e) { return new InstantSearch($(e)).enable(); }); };
        InstantSearch.prototype.enable = function () {
            // TODO: Make it work with List render mode too.
            this.input.off("keyup.immediate-filter").on("keyup.immediate-filter", this.onChanged);
            this.input.on("keydown", function (e) {
                if (e.keyCode == 13)
                    e.preventDefault();
            });
        };
        InstantSearch.prototype.onChanged = function (event) {
            var keywords = this.input.val().toLowerCase().split(' ');
            var rows = this.input.closest('[data-module]').find(".grid > tbody > tr");
            rows.each(function (index, e) {
                var row = $(e);
                var content = row.text().toLowerCase();
                var hasAllKeywords = keywords.filter(function (i) { return content.indexOf(i) == -1; }).length == 0;
                if (hasAllKeywords)
                    row.show();
                else
                    row.hide();
            });
        };
        return InstantSearch;
    }());
    exports.default = InstantSearch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFudFNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2luc3RhbnRTZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFDQTtRQUtJLHVCQUFZLFdBQWdCO1lBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFBQyxDQUFDO1FBRjdDLG9CQUFNLEdBQXBCLFVBQXFCLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUlyRyw4QkFBTSxHQUFOO1lBQ0ksZ0RBQWdEO1lBQ2hELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV0RixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBQSxDQUFDO2dCQUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztvQkFBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsaUNBQVMsR0FBVCxVQUFVLEtBQVU7WUFDaEIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFMUUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNmLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZixJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUF4QixDQUF3QixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztnQkFDbEYsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDO29CQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFBQyxJQUFJO29CQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDTCxvQkFBQztJQUFELENBQUMsQUEzQkQsSUEyQkMifQ==