
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
                    mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" +  selected.attr("data-redirect") + "'";
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
                        mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" +  selected.attr("data-redirect") + "'";
                    });
                }
            });

            if (typeof mergedContent === "string") {
                current.html(current.html() + mergedContent);
            } else {
                var dropDownList :string = `<div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Select action
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">`;

                for (var val in mergedContent) {
                    let urlAddress = mergedContent[val].split("#ATTRIBUTE#");
                    dropDownList += `<a class="dropdown-item" href="${urlAddress[0]}" ${urlAddress[1]}>${val}</a>`
                }

                dropDownList += "</div></div>";
                
                current.empty().append($(dropDownList));
            }

            current.nextAll(".actions").remove();

        });
    }
}