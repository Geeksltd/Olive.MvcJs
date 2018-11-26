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

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable() {
        this.input.wrap("<div class='global-search-panel'></div>");

        let urlsList = (<string>this.input.attr("data-search-source") || '').split(";");
        this.urlList = urlsList;
        this.input.change((function (e) {
            this.createSearchComponent(this.urlList);
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
        var inputholder = this.input.parent();
        var listHolder = $("<div class='global-search-result-panel'>")
            .mouseenter(() => this.isMouseInsideSearchPanel = true)
            .mouseleave(() => this.isMouseInsideSearchPanel = false);
        var ul = $("<ul>");
        listHolder.append(ul);
        inputholder.append(listHolder);
        var divsummary = $("<div class='summary'>").html('Please wait we are loading data...');
        listHolder.append(divsummary);

        var ajaxlist = urls.map(p => {
            return {
                url: p
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
                    async: true,
                    // additional data to be send 
                    data: { searcher: this.input.val() },
                    // if succesfully respond, this callback will be called
                    success: (function (result) {
                        let tpobj = this;
                        tpobj.result = result;
                        if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                            resultcount += result.length;
                            tpobj.state = 1; // 1 -> success
                            // create UI element based on received data
                            for (var item of result) {
                                ul.append($("<li>")
                                    .append($("<a href='" + item.Url + "'>")
                                        .append($("<div class='item-div' title='Load this item from " + tpobj.url + "'>")
                                            .append($("<div class='item-icon'>").append($("<img class='icon' src='" + item.IconUrl + "'>")))
                                            .append($("<div class='item-title-wrapper'>")
                                                .append($("<div class='item-title'>").html(item.Title))
                                                .append($("<div class='item-description'>").append($("<p>").html(item.Description)))))));

                            }
                            console.log("ajax succeeded for: " + tpobj.url);
                            console.log(result);
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

                        if (resultcount === 0) {
                            divsummary.html('Found nothing');
                            console.log("Found nothing");
                        } else {
                            divsummary.html('Total Found: ' + resultcount);
                            console.log('Total Found: ' + resultcount);
                        }

                        // put summary of alternative sources based on the result
                        for (var aj of ajaxlist) {
                            // if found data from that source
                            if (aj.state === 1 && aj.result !== null && aj.result !== undefined && aj.result.length > 0) {
                                divsummary.append($("<div class='summary-element success'>")
                                    .append($("<span>").html('Showing <strong>' + aj.result.length + '</strong>'))
                                    .append($('<span>').html(' from: ' + aj.url)));
                            }
                            // if nothing found from that source
                            else if (aj.state === 1) {
                                divsummary.append($("<div class='summary-element warning'>").html('Found nothing from: ' + aj.url));
                            }
                            // if the source did not respond properly
                            else {
                                divsummary.append($("<div class='summary-element error'>").html('Failed to load data from : ' + aj.url));
                            }
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
