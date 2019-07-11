export default class Grid implements IService {

    public enableColumn(element: any) {
        element.off("click.apply-columns").on("click.apply-columns", e => this.applyColumns(e));
    }

    public enableToggle(element: any) {
        element.off("change.select-all").on("change.select-all", e => this.enableSelectAllToggle(e));
    }

    private enableHlightRow(element: any) {
        this.highlightRow(element);
    }

    public enableSelectCol(selector: JQuery) {
        selector.each((i, e) => this.enableSelectColumns($(e)));
    }

    private applyColumns(event: JQueryEventObject) {
        let button = $(event.currentTarget);
        let checkboxes = button.closest(".select-cols").find(":checkbox");
        if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0) return;
        $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
            .appendTo(button.parent());
    }

    private enableSelectColumns(container) {
        let columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => { columns.show(); return false; });
        columns.find('.cancel').click(() => columns.hide());
    }

    private enableSelectAllToggle(event) {
        let trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
    }

    private highlightRow(element: any) {
        let target = $(element.closest("tr"));
        target.siblings('tr').removeClass('highlighted');
        target.addClass('highlighted');
    }

    public mergeActionButtons(): void {

        $("table tr > .actions-merge, .r-grid .r-grid-row > .actions-merge").each((index, item) => {

            let current: any = $(item);

            if (current.next().length === 0 && current.children("a,button").length <= 1)
                return;

            var mergedContent: any;
            if (current.children("a").length > 0) {
                mergedContent = {};
                current.children("a").each((i, innerLink) => {
                    let selected: any = $(innerLink);
                    mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" + selected.attr("data-redirect") + "'";
                });
            } if (current.children("button").length > 0) {
                if (!mergedContent)
                    mergedContent = {};

                current.children("button").each((i, innerLink) => {
                    let selected: any = $(innerLink);
                    mergedContent[selected.text().trim()] = selected.attr("formaction").trim() + "#ATTRIBUTE##BUTTON#";
                    if (selected.attr("data-confirm-question"))
                        mergedContent[selected.text().trim()] += "data-confirm-question='" + selected.attr("data-confirm-question") + "'";
                    if (selected.attr("formmethod"))
                        mergedContent[selected.text().trim()] += "formmethod='" + selected.attr("formmethod") + "'";
                });
            }
            else if (!mergedContent) {
                mergedContent = "";
            }

            current.nextAll(".actions-merge").each((i, innerItem) => {

                if (typeof mergedContent === "string")
                    mergedContent += " " + $(innerItem).html();
                else {
                    let currentInnerItem: any = $(innerItem);
                    currentInnerItem.children("a").each((i, innerLink) => {
                        let selected: any = $(innerLink);
                        mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" + selected.attr("data-redirect") + "'";
                    });

                    currentInnerItem.children("button").each((i, innerLink) => {
                        let selected: any = $(innerLink);
                        mergedContent[selected.text().trim()] = selected.attr("formaction").trim() + "#ATTRIBUTE##BUTTON#";
                        if (selected.attr("data-confirm-question"))
                            mergedContent[selected.text().trim()] += "data-confirm-question='" + selected.attr("data-confirm-question") + "'";
                        if (selected.attr("formmethod"))
                            mergedContent[selected.text().trim()] += "formmethod='" + selected.attr("formmethod") + "'";
                    });
                }
            });

            if (typeof mergedContent === "string")
                current.html(current.html() + mergedContent);
            else {
                let dropDownList: string = `<div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Select action
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">`;

                for (let val in mergedContent) {
                    let urlAddress = mergedContent[val].split("#ATTRIBUTE#");

                    if (urlAddress[1].startsWith("#BUTTON#")) {
                        urlAddress[1] = urlAddress[1].replace("#BUTTON#", "");
                        dropDownList += `<a class="dropdown-item" href="#" formaction="${urlAddress[0]}" ${urlAddress[1]}>${val}</a>`;
                    }
                    else
                        dropDownList += `<a class="dropdown-item" href="${urlAddress[0]}" ${urlAddress[1]}>${val}</a>`;
                }

                dropDownList += "</div></div>";

                current.empty().append($(dropDownList));
            }

            current.nextAll(".actions-merge").remove();

        });
    }
}

