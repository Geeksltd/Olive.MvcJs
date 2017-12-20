import {Enums} from 'olive/Extensions/Enums'

export default class Grid {

    public static enable(element:any,targetAction){
        switch(targetAction){
            case Enums.GridAction.applyColumns: {
                element.off("click.apply-columns").on("click.apply-columns",(e) => this.applyColumns(e));
                break;
            }
            case Enums.GridAction.enableSelectAllToggle:{
                element.off("click.select-all").on("click.select-all",(e) => this.enableSelectAllToggle(e));
                break;
            }
            case Enums.GridAction.enableSelectColumns:{
                let target = element as JQuery;
                target.each((i,e)=> this.enableSelectColumns($(e)));
                break;
            }
            case Enums.GridAction.highlightRow:{
               this.highlightRow(element);
               break;
            }
            default:{                
                break;
            }
        }
    }

    public static applyColumns(event: JQueryEventObject) {
        let button = $(event.currentTarget);
        let checkboxes = button.closest(".select-cols").find(":checkbox");
        if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0) return;
        $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
            .appendTo(button.parent());
    }

    public static enableSelectColumns(container) {
        let columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => { columns.show(); return false; });
        columns.find('.cancel').click(() => columns.hide());
    }

    public static enableSelectAllToggle(event) {
        let trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
    }

    public static highlightRow(element: any) {
        let target = $(element.closest("tr"));
        target.siblings('tr').removeClass('highlighted');
        target.addClass('highlighted');
    }
}

