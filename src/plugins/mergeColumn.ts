import AjaxRedirect from "olive/mvc/ajaxRedirect";
import Modal from "olive/components/modal";

export default class MergeColumn {

    public static mergeActionButtons(): void {

        $("table tr > .actions").each((index, item) => {

            var current: any = $(item);

            if (current.next().length <= 0) {
                return;
            }

            var mergedContent:any;

            if (current.children("a").length > 0) {
                mergedContent = {};
                current.children("a").each((i, innerLink) => {
                    let selected : any = $(innerLink);
                    mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#MODAL#" + (selected.attr("target") === "$modal");
                });
            } else {
                mergedContent = "";
            }

            current.nextAll(".actions").each((i, innerItem) => {

                if (typeof mergedContent === "string") {
                    mergedContent += " " + $(innerItem).html();
                } else {
                    let currentInnerItem : any = $(innerItem);
                    currentInnerItem.children("a").each((i, innerLink) => {
                        let selected : any = $(innerLink);
                        mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#MODAL#" + (selected.attr("target") === "$modal");
                    });
                }
            });

            if (typeof mergedContent === "string") {
                current.html(current.html() + mergedContent);
            } else {
                var dropDownList :any = $("<select />");
                $("<option />", { value: 0, text: "---select---" }).appendTo(dropDownList);
                for (var val in mergedContent) {
                    $("<option />", { value: mergedContent[val], text: val }).appendTo(dropDownList);
                }
                dropDownList.change(() => {
                    let urlToGo : any = dropDownList.val().split("#MODAL#");
                    if(urlToGo[1] === "true") {
                        new Modal(null,urlToGo[0],null).open();
                    } else {
                        AjaxRedirect.go(dropDownList.val());
                    }
                });
                current.empty().append(dropDownList);
            }

            current.nextAll(".actions").remove();

        });
    }
}