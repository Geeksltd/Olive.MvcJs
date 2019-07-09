
export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number = 0;
    valueField: JQuery;
    testvarable: number = 3;
    urlList: string[];
    isMouseInsideSearchPanel: boolean = false;
    isTyping: boolean = false;
    searchedText: string = null;

    public static enable(selector: JQuery) {
        selector.each((i, e) => new GlobalSearch($(e)).enable());
    }

    public static boldSearch(str: string, searchText: string) {
        var ix = -1;
        var result: string = "";
        if (str !== null && str !== undefined) {
            str = str
                .replace(/<strong>/gi, '↨↨').replace(/<\/strong>/gi, '↑↑');
            var strlower = str.toLowerCase();
            if (searchText !== "" && searchText !== null && searchText !== undefined) {
                var stxt = searchText.toLowerCase();
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
            result = result
                .replace(/↨↨/gi, '<strong>').replace(/↑↑/gi, '</strong>');
        }
        return result;
    }

    public static boldSearchAll(str: string, searchText: string) {
        var result: string = str;
        if (searchText != null && searchText != undefined) {
            var splitedsearchtext = searchText.split(' ');
            for (var strST of splitedsearchtext) {
                result = this.boldSearch(result, strST);
            }
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
            this.isTyping = true;
            clearTimeout(timeout);
            timeout = setTimeout((function () {
                this.isTyping = false;
                if (this.searchedText != this.input.val().trim()) {
                    this.createSearchComponent(this.urlList);
                }
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
        this.searchedText = this.input.val().trim();
        var searchPanel = this.input.parent();
        var resultPanel = searchPanel.find(".global-search-result-panel");

        if (resultPanel == undefined || resultPanel == null || resultPanel.length == 0) {
            resultPanel = $("<div class='global-search-result-panel'>")
                .mouseenter(() => this.isMouseInsideSearchPanel = true)
                .mouseleave(() => this.isMouseInsideSearchPanel = false);
            searchPanel.append(resultPanel);
        }
        resultPanel.empty();
        var beginSearchStarted = true;
        var searchHolder = $("<div class='search-container'>");
        // loading icon
        if ($(".global-search-panel .loading-div").length > 0) {
            $(".global-search-panel .loading-div").empty();
            $(".global-search-panel .loading-div").remove();
        }
        $(".global-search-panel").append($("<div class='loading-div'>")
            .append($("<i class= 'loading-icon fa fa-spinner fa-spin' > </i><div>")));

        var ajaxlist = urls.map(p => {
            let icon = p.split("#")[1].trim();
            return {
                url: p.split("#")[0].trim(),
                icon: icon,
                globalsearchRef: this,
                text: this.searchedText,
                state: 0, // 0 means pending, 1 means success, 2 means failed
                ajx: {}, // the ajax object
                displayMessage: "", // message to display on summary
                result: [{
                    Title: ""
                    , Description: ""
                    , IconUrl: ""
                    , Url: ""
                }],
                template: jQuery
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
                        if (tpobj.globalsearchRef.isTyping == false) {
                            tpobj.result = result;
                            if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                                tpobj.state = 1; // 1 -> success                           
                                // filter in client side                           
                                let resultfiltered = result.filter(p => {
                                    let resfilter = false;
                                    if (tpobj.text != null && tpobj.text != undefined && tpobj.text !== '') {
                                        var arfilter = tpobj.text.split(' ');
                                        for (var strfilter of arfilter) {
                                            if (((p.Description !== null && p.Description !== undefined && p.Description.match(new RegExp(strfilter, 'gi')) != null) || p.Title.match(new RegExp(strfilter, 'gi')) != null)) {
                                                resfilter = true;
                                                break;
                                            }
                                        }
                                    } else {
                                        resfilter = true;
                                    }
                                    return resfilter;
                                });

                                let searchItem = $("<div class='search-item'>");

                                let groupTitle = tpobj.url.split(".")[0].replace("https://", "").replace("http://", "").toUpperCase();

                                let searhTitle = $("<div class='search-title'>").append($("<i>").attr("class", tpobj.icon)).append(groupTitle);

                                searchItem.append(searhTitle);

                                let childrenItems = $("<ul>");

                                for (var i = 0; i < resultfiltered.length && i < 10; i++) {
                                    resultcount++;
                                    var item = resultfiltered[i];

                                    childrenItems.append($("<li>")
                                    .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>")))
                                        .append($("<a href='" + item.Url + "'>")
                                            .html(GlobalSearch.boldSearchAll(item.Title, tpobj.text)))
                                            .append($(" <div class='desc'>").html(item.Description)));
                                }

                                searchItem.append(childrenItems);

                                if (resultfiltered.length === 0)
                                    searchItem.addClass("d-none");

                                searchHolder.append(searchItem);

                                if (beginSearchStarted && resultfiltered.length > 0) {
                                    beginSearchStarted = false;
                                    resultPanel.append(searchHolder);
                                }

                            } else {
                                tpobj.state = 2; // 2 -> fail
                                console.log("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                            }
                        }
                    }).bind(tempobj)
                })
                // if failed to get data run this callback
                .fail((function (e) {
                    let tpobj = this;
                    tpobj.state = 2;

                    let ulFail = $("<ul>");
                    ulFail.append($("<li>").append($("<span>").html('ajax failed Loading data from source [' + tpobj.url + ']')));
                    resultPanel.append(ulFail);

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
                        $(".global-search-panel .loading-div").empty();
                        $(".global-search-panel .loading-div").remove();
                        if (resultcount === 0) {
                            console.log("Found nothing");

                            let ulNothing = $("<ul>");
                            ulNothing.append("<li>").append("<span>").html('Nothing found');
                            resultPanel.append(ulNothing);

                        } else {
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
