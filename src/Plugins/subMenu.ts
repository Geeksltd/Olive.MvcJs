import { WindowContext } from '../Components/WindowContext'
export class SubMenu {
    menu: any;
    submenuOptions: any;

    constructor(targetMenue: any) {
        this.menu = targetMenue;
        this.submenuOptions = { showTimeout: 0, hideTimeout: 0 };
        if (!!this.menu.attr('data-smartmenus-id')) return; // Already enabled
        this.menu.addClass("sm");

        if (this.menu.is(".nav-stacked.dropped-submenu"))
            this.menu.addClass("sm-vertical");

        var options = this.menu.attr("data-submenu-options");
        if (options) this.submenuOptions = WindowContext.toJson(options);
        this.menu.smartmenus(this.submenuOptions);
    }
}
