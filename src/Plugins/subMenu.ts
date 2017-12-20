
export default class SubMenu {
    menu: any;
    submenuOptions: any;
    
    public static enable(selector:JQuery){selector.each((i,e)=> new SubMenu($(e)));}
    
    constructor(targetMenue: any) {
        this.menu = targetMenue;
        this.submenuOptions = { showTimeout: 0, hideTimeout: 0 };
        if (!!this.menu.attr('data-smartmenus-id')) return; // Already enabled
        this.menu.addClass("sm");

        if (this.menu.is(".nav-stacked.dropped-submenu"))
            this.menu.addClass("sm-vertical");

        let options = this.menu.attr("data-submenu-options");
        if (options) this.submenuOptions = JSON.safeParse(options);
        this.menu.smartmenus(this.submenuOptions);
    }
}
