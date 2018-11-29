import Form from "olive/components/form";

export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number = 0;
    valueField: JQuery;
    testvarable: number = 3;
    urlList: string[];
    isMouseInsideSearchPanel: boolean = false;

    public static enable(selector: JQuery) {
        selector.each((i, e) => new GlobalSearch($(e)).enable());
    }

    public static boldSearch(str: string, searchText: string) {
        var ix = -1;
        var result: string = "";
        if (str !== null && str !== undefined) {
            var strlower = str.toLowerCase();
            var stxt = searchText.toLowerCase();
            if (searchText !== "" && searchText !== null && searchText !== undefined) {
                do {
                    let ix_next = strlower.indexOf(stxt, ix);
                    if (ix_next < 0)
                        break;
                    if (ix < 0) result = str.substr(0, ix_next);
                    result += (ix >= 0 ? str.substr(ix, ix_next - ix) : "") + "<strong>" + str.substr(ix_next, stxt.length) + "</strong>";
                    ix = ix_next + stxt.length;
                } while (true);
            }
            result += (ix < 0 ? str : str.substr(ix, str.length - ix));
        }
        return result;
    }

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable() {
        if (this.input.is("[data-globalsearch-enabled=true]")) return;
        else this.input.attr("data-globalsearch-enabled", true);
        this.input.wrap("<div class='global-search-panel'></div>");

        let urlsList = (<string>this.input.attr("data-search-source") || '').split(";");
        this.urlList = urlsList;

        var timeout = null;
        this.input.keyup((function (e) {
            clearTimeout(timeout);
            timeout = setTimeout((function () {
                this.createSearchComponent(this.urlList)
            }).bind(this), 300);
        }).bind(this));

        this.input.on("blur", (function (e) {
            if (this.isMouseInsideSearchPanel === false) {
                this.clearSearchComponent();
            }
        }).bind(this));
    }

    inputChangeHandler() {
        this.createSearchComponent(this.urlList);
    }

    clearSearchComponent() {
        let inputholder = this.input.parent();
        if (inputholder !== undefined) {
            let panel = inputholder.find(".global-search-result-panel");
            if (panel !== undefined) {
                panel.empty();
                panel.remove();
            }
        }
    }

    createSearchComponent(urls: string[]) {
        this.clearSearchComponent();
        var searchPanel = this.input.parent();
        var resultPanel = $("<div class='global-search-result-panel'>")
            .mouseenter(() => this.isMouseInsideSearchPanel = true)
            .mouseleave(() => this.isMouseInsideSearchPanel = false);
        var ul = $("<ul>");
        //resultPanel.append(ul);
        searchPanel.append(resultPanel);
        var divsummary = $("<div class='summary'>").html('loading data...');
        resultPanel.append(divsummary);

        var ajaxlist = urls.map(p => {
            return {
                url: p
                , clearPanelMethod: this.clearSearchComponent
                , resultPanelElement: resultPanel
                , searchPanelElement: searchPanel
                , ulElement: ul
                , text: this.input.val()
                , state: 0 // 0 means pending, 1 means success, 2 means failed
                , ajx: {} // the ajax object
                , displayMessage: "" // message to display on summary
                , result: [{
                    Title: ""
                    , Description: ""
                    , IconUrl: ""
                    , Url: ""
                }]
            };
        });

        var resultcount = 0;
        for (let tempobj of ajaxlist) {
            tempobj.ajx = $
                .ajax({
                    dataType: "json",
                    url: tempobj.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    // additional data to be send 
                    data: { searcher: tempobj.text },
                    // if succesfully respond, this callback will be called
                    success: (function (result) {
                        let tpobj = this;
                        tpobj.result = result;
                        if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                            tpobj.state = 1; // 1 -> success
                            // filter in client side
                            let resultfiltered = result.filter(p => (p.Description !== null && p.Description !== undefined && p.Description.match(new RegExp(tpobj.text, 'gi'))) || p.Title.match(new RegExp(tpobj.text, 'gi')));
                            // create UI element based on received data
                            for (var i = 0; i < resultfiltered.length && i < 20; i++) {
                                resultcount++;
                                var item = resultfiltered[i];
                                ul.append($("<li>")
                                    .append($("<a href='" + item.Url + "'>")
                                        .append($("<div class='item'>")
                                            .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>")))
                                            .append($("<div class='title-wrapper'>")
                                                .append($("<div class='title'>").html(GlobalSearch.boldSearch(item.Title, tpobj.text)))//.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>')))
                                                .append($(" <div class='desc'>").html(GlobalSearch.boldSearch(item.Description, tpobj.text)))//.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>'))
                                            ))));
                            }
                            console.log("ajax succeeded for: " + tpobj.url);
                            console.log(resultfiltered);
                            console.log(tpobj);
                        } else {
                            tpobj.state = 2; // 2 -> fail
                            console.log("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                            console.log(result);
                        }
                    }).bind(tempobj)
                })
                // if failed to get data run this callback
                .fail((function (e) {
                    let tpobj = this;
                    tpobj.state = 2;
                    console.log('ajax failed Loading data from source [' + tpobj.url + ']');
                    console.log(e);
                }).bind(tempobj))
                // use this callback to check whether all ajax requests, finished
                .always((function () {
                    let tpobj = this;
                    console.log('always event raised for: ' + tpobj.url);
                    // check all ajax finished            
                    if (ajaxlist.filter(p => p.state === 0).length === 0) {
                        console.log('All ajax completed');
                        //tempobj.clearPanelMethod()
                        tempobj.resultPanelElement.append(tempobj.ulElement);

                        if (resultcount === 0) {
                            divsummary.html('Found nothing');
                            console.log("Found nothing");
                        } else {
                            divsummary.empty();
                            divsummary.remove();
                            //divsummary.html('Total Found: ' + resultcount);
                            console.log('Total Found: ' + resultcount);
                        }
                    }
                }).bind(tempobj));
            console.log('ajax send to: ' + tempobj.url);
        }
    }

    clearValue() {
        if (this.input.val() === "") this.valueField.val("");
        if (this.input.val() !== this.input.data("selected-text"))
            this.valueField.val("");
    }

    itemSelected(item: any) {

        if (item != undefined) {
            this.valueField.val(item.Value);
            this.input.data("selected-text", item.Display);
            this.input.val(item.Display);
        } else {
            console.log("Clearing text, item is undefined");
            this.input.data("selected-text", "");
        }
        // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
        this.input.trigger("change");
    }

    // Convert current form array to simple plain object
    toObject(arr: JQuerySerializeArrayElement[]) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i)
            rv[arr[i].name] = arr[i].value;
        return rv;
    }
}
