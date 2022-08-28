import 'bootstrap-select'
import { ModalHelper } from "olive/components/modal"
import Config from "olive/config"

export class MultiSelectFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new MultiSelect($(e), this.modalHelper).show()); }
}

export default class MultiSelect implements IService {
    //https://developer.snapappointments.com/bootstrap-select/


    constructor(protected selectControl: JQuery, private modalHelper: ModalHelper) {
        if ($.fn.selectpicker)
            $.fn.selectpicker.Constructor.BootstrapVersion = "4";
    }

    public show() {

        var maxOptions = this.selectControl.attr("maxOptions") || false;
        var actionsBox = true;
        var attrib = this.selectControl.attr("actionsBox");
        if (attrib != undefined && attrib != null && attrib == "false") {
            actionsBox = false;
        }
        var container = this.selectControl.attr("container") || false;
        var deselectAllText = this.selectControl.attr("deselectAllText") || "Deselect All";
        var dropdownAlignRight = this.selectControl.attr("dropdownAlignRight") || false;
        var dropupAuto = true;
        var attrib = this.selectControl.attr("dropupAuto");
        if (attrib != undefined && attrib != null && attrib == "false") {
            dropupAuto = false;
        }
        var header = this.selectControl.attr("header") || false;
        var hideDisabled = this.selectControl.attr("hideDisabled") || false;

        var liveSearch = true;
        var attrib = this.selectControl.attr("liveSearch");
        if (attrib != undefined && attrib != null && attrib == "false") {
            liveSearch = false;
        }
        var liveSearchNormalize = this.selectControl.attr("liveSearchNormalize") || false;
        var liveSearchPlaceholder = this.selectControl.attr("liveSearchPlaceholder") || null;
        var liveSearchStyle = this.selectControl.attr("liveSearchStyle") || "contains";
        var maxOptionsText = this.selectControl.attr("maxOptionsText") || "Cannot select more items";
        var mobile = this.selectControl.attr("mobile") || false;
        var multipleSeparator = this.selectControl.attr("multipleSeparator") || ", ";
        var noneSelectedText = this.selectControl.attr("noneSelectedText") || "Nothing selected";
        var noneResultsText = this.selectControl.attr("noneResultsText") || "No results matched";
        var selectAllText = this.selectControl.attr("selectAllText") || "Select All";

        var selectedTextFormat = "count > 1";
        var attrib = this.selectControl.attr("selectedTextFormat");
        if (attrib != undefined && attrib != null) {
            selectedTextFormat = attrib;
        }

        var selectOnTab = this.selectControl.attr("selectOnTab") || false;
        var showContent = true;
        var attrib = this.selectControl.attr("showContent");
        if (attrib != undefined && attrib != null && attrib == "false") {
            showContent = false;
        }
        var showIcon = true;
        var attrib = this.selectControl.attr("showIcon");
        if (attrib != undefined && attrib != null && attrib == "false") {
            showIcon = false;
        }
        var showSubtext = this.selectControl.attr("showSubtext") || false;
        var size = this.selectControl.attr("size") || "auto";
        var styleBase = this.selectControl.attr("styleBase") || "btn";
        var title = this.selectControl.attr("title") || null;
        var virtualScroll = this.selectControl.attr("virtualScroll") || false;
        var width = this.selectControl.attr("width") || false;
        var windowPadding = this.selectControl.attr("windowPadding") || 0;
        var sanitize = true;
        var attrib = this.selectControl.attr("sanitize");
        if (attrib != undefined && attrib != null && attrib == "false") {
            sanitize = false;
        }

        const options = {
            maxOptions: maxOptions,
            actionsBox: actionsBox,
            container: container,
            deselectAllText: deselectAllText,
            dropdownAlignRight: dropdownAlignRight,
            dropupAuto: dropupAuto,
            header: header,
            hideDisabled: hideDisabled,
            liveSearch: liveSearch,
            liveSearchNormalize: liveSearchNormalize,
            liveSearchPlaceholder: liveSearchPlaceholder,
            liveSearchStyle: liveSearchStyle,
            maxOptionsText: maxOptionsText,
            mobile: mobile,
            multipleSeparator: multipleSeparator,
            noneSelectedText: noneSelectedText,
            noneResultsText: noneResultsText,
            selectAllText: selectAllText,
            selectedTextFormat: selectedTextFormat,
            selectOnTab: selectOnTab,
            showContent: showContent,
            showIcon: showIcon,
            showSubtext: showSubtext,
            size: size,
            styleBase: styleBase,
            title: title,
            virtualScroll: virtualScroll,
            width: width,
            windowPadding: windowPadding,
            sanitize: sanitize
        };
        this.selectControl.selectpicker(options);

        this.MoveActionButtons();
    }

    private MoveActionButtons() {
        //var actionbuttons = $(".bs-actionsbox");
        //if (actionbuttons != undefined && actionbuttons != null)
        //    actionbuttons.parent().prepend($(".bs-actionsbox"));
    }


}
