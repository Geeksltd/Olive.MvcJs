define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SubMenu = /** @class */ (function () {
        function SubMenu(targetMenue) {
            this.menu = targetMenue;
            this.submenuOptions = { showTimeout: 0, hideTimeout: 0 };
            if (!!this.menu.attr('data-smartmenus-id'))
                return; // Already enabled
            this.menu.addClass("sm");
            if (this.menu.is(".nav-stacked.dropped-submenu"))
                this.menu.addClass("sm-vertical");
            var options = this.menu.attr("data-submenu-options");
            if (options)
                this.submenuOptions = JSON.safeParse(options);
            this.menu.smartmenus(this.submenuOptions);
        }
        SubMenu.enable = function (selector) { selector.each(function (i, e) { return new SubMenu($(e)); }); };
        SubMenu.createAccordion = function (selector) {
            selector.find('[data-toggle]').click(function (event) {
                $($(event.target).parent('li').siblings().children('[data-toggle][aria-expanded=true]')).trigger('click');
            });
        };
        return SubMenu;
    }());
    exports.default = SubMenu;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViTWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL3N1Yk1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFDQTtRQVlJLGlCQUFZLFdBQWdCO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztnQkFBRSxPQUFPLENBQUMsa0JBQWtCO1lBQ3RFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsOEJBQThCLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXRDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDckQsSUFBSSxPQUFPO2dCQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQXBCYSxjQUFNLEdBQXBCLFVBQXFCLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV4RSx1QkFBZSxHQUE3QixVQUE4QixRQUFnQjtZQUMxQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUs7Z0JBQ2hELENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5RyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFlTCxjQUFDO0lBQUQsQ0FBQyxBQXpCRCxJQXlCQyJ9