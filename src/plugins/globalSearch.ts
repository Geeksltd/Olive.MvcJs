import Form from "olive/components/form";

export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number = 0;
    valueField: JQuery;    
    urlList: string[];
    isMouseInsideSearchPanel: boolean = false;

    public static enable(selector: JQuery) {
        selector.each((i, e) => new GlobalSearch($(e)).enable());
    }

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable() {
        //if (this.input.is("[data-typeahead-enabled=true]")) return;
        //else this.input.attr("data-typeahead-enabled", true);
        //this.input.wrap("<div class='typeahead__container'></div>");
        this.input.wrap("<div class='global-search-panel'></div>")

        //this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");


        let urlsList = (<string>this.input.attr("data-search-source") || '').split(";");
        this.urlList = urlsList;
        //this.input
        //    .data("selected-text", "")
        //    .on('input', () => this.clearValue())
        //    .on("typeahead:selected", (e, i) => this.itemSelected(i))
        //    .typeahead(this.createTypeaheadSettings(urlsList));
        this.input.change((function (e) {
            this.createSearchComponent(this.urlList);
        }).bind(this));

        this.input.on("blur", (function (e) {
            if (this.isMouseInsideSearchPanel === false) {
                this.clearSearchComponent();
            }
        }).bind(this));

        //this.createSearchComponent(urlsList);
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
                , result: { // the ajax response
                    Data: [{
                        Title: ""
                        , Description: ""
                        , IconUrl: ""
                        , Url: ""
                    }]
                    , TotalCount: 0
                    , StartIndex: 0
                    , Size: 0
                }
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
                    data: { searcher: this.input.val(), SortExpression: '', StartIndex: 0, Size: 10 },
                    // if succesfully respond, this callback will be called
                    success: (function (result) {
                        let tpobj = this;
                        tpobj.result = result;
                        if (result.hasOwnProperty('Data') && result.hasOwnProperty('TotalCount') && result.Data !== null && result.Data !== undefined && typeof (result.Data) === typeof ([])) {
                            resultcount += result.Data.length;
                            tpobj.state = 1; // 1 -> success
                            // create UI element based on received data
                            for (var item of result.Data) {
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
                            console.log("ajax success but failed to decode the response -> wellform expcted response is like this: {Data:[{Title:'',Description:'',IconUrl:'',Url:''}] , TotalCount:number}");
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
                            if (aj.state === 1 && aj.result.Data !== null && aj.result.Data !== undefined && aj.result.Data.length > 0) {
                                divsummary.append($("<div class='summary-element success'>")
                                    .append($("<span>").html('Showing <strong>' + aj.result.Data.length + '</strong> of <strong>' + aj.result.TotalCount + '</strong>'))
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

    createTypeaheadSettings(urls: string[]) {

        let sources = {};

        for (let url of urls) {
            if (url.charAt(0) == '/') {
                url = window.location.origin + url;
            }
            sources[url] = {
                ajax: query => {
                    return { type: "GET", url: url + '?searcher={{query}}', xhrFields: { withCredentials: true } };
                }
            };
        }

        return {
            maxItem: 50,
            minLength: 2,
            delay: 300,
            dynamic: true,
            backdrop: false,
            correlativeTemplate: true,
            emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
            display: "Title",
            template: `
                            <div class='item'>
                              <img class="icon" src="{{IconUrl}}" />
                                <div class='title-wrapper'>
                                  <div class='title'>{{Title}}</div>
                                  <div class='desc'>{{Description}}</div>
                                </div>
                              </div>
                          `,
            href: "{{Url}}",
            source: sources,
            callback: {
                onNavigateAfter: function (node, lis, a, item, query, event) {
                    if (~[38, 40].indexOf(event.keyCode)) {
                        var resultList = node.closest("form").find("ul.typeahead__list"),
                            activeLi = lis.filter("li.active"),
                            offsetTop = activeLi[0] && activeLi[0].offsetTop - (resultList.height() / 2) || 0;

                        resultList.scrollTop(offsetTop);
                    }
                },
                onClickAfter: function (node, a, item, event) {
                    event.preventDefault();
                    window.location.href = item.Url;
                    $('#result-container').text('');
                },
                onResult: function (node, query, result, resultCount) {
                    if (query === "") return;

                    var text = "";
                    if (result.length > 0 && result.length < resultCount) {
                        text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
                    } else if (result.length > 0) {
                        text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
                    } else {
                        text = 'No results matching "' + query + '"';
                    }
                    $('#result-container').html(text);

                },
                onMouseEnter: function (node, a, item, event) {
                    if (item.group === "country") {
                        $(a).append('<span class="flag-chart flag-' + item.display.replace(' ', '-').toLowerCase() + '"></span>')
                    }
                },
                onMouseLeave: function (node, a, item, event) {
                    $(a).find('.flag-chart').remove();
                }
            }
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
