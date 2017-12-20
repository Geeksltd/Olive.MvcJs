
import Config from "olive/Config"

import FormAction from 'olive/Mvc/FormAction'
import AjaxRedirect from 'olive/Mvc/AjaxRedirect'
import StandardAction from 'olive/Mvc/StandardAction'

import Form from 'olive/Components/Form'
import Url from 'olive/Components/Url'
import SystemExtensins from 'olive/Extensions/SystemExtensins';
import Modal from 'olive/Components/Modal'
import Validate from 'olive/Components/Validate'
import Sorting from 'olive/Components/Sorting'
import Paging from 'olive/Components/Paging'
import MasterDetail from 'olive/Components/MasterDetail'
import Alert from 'olive/Components/Alert'
import Waiting from 'olive/Components/Waiting'
import Grid from 'olive/Components/Grid'

import Select from 'olive/Plugins/Select'
import PasswordStength from 'olive/Plugins/PasswordStength'
import HtmlEditor from 'olive/Plugins/HtmlEditor'
import TimeControl from 'olive/Plugins/TimeControl'
import AutoComplete from 'olive/Plugins/AutoComplete'
import Slider from 'olive/Plugins/Slider'
import DatePicker from 'olive/Plugins/DatePicker'
import NumbericUpDown from 'olive/Plugins/NumericUpDown'
import FileUpload from 'olive/Plugins/FileUpload'
import ConfirmBox from 'olive/Plugins/ConfirmBox'
import SubMenu from 'olive/Plugins/SubMenu'
import InstantSearch from 'olive/Plugins/InstantSearch'
import DateDropdown from 'olive/Plugins/DateDropdown'

export default class OlivePage {

    public modal() { return Modal; }

    constructor() {
        SystemExtensins.initialize();
        Modal.initialize();

        $(() => {
            //$.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS, { backdrop: this.DEFAULT_MODAL_BACKDROP });
            //$.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
            Alert.enableAlert();
            Validate.configure();
            this.onViewChanged(null, null, true);
        });

        // TODO: Find a cleaner way.
        window["alertify"] = <alertify.IAlertifyStatic>window.require("alertify")();
        FormAction.onViewChanged.handle(x => this.onViewChanged(x.container, x.trigger, x.isNewPage));
    }

    _initializeActions = [];
    onInit(action) { this._initializeActions.push(action) }

    _preInitializeActions = [];
    onPreInit(action) { this._preInitializeActions.push(action) }

    onViewChanged(container: JQuery = null, trigger: any = null, newPage: boolean = false) {
        StandardAction.runStartup(container, trigger, "PreInit");
        this.initialize();
        StandardAction.runStartup(container, trigger, "Init");

        if (newPage) {
            $('[autofocus]:not([data-autofocus=disabled]):first').focus();
            if (Config.REDIRECT_SCROLLS_UP) $(window).scrollTop(0);
        }
    }

    initialize() {
        this._preInitializeActions.forEach((action) => action());

        // =================== Standard Features ====================
        $(".select-cols .apply").off("click.apply-columns").on("click.apply-columns", (e) => Grid.applyColumns(e));
        $("[data-delete-subform]").off("click.delete-subform").on("click.delete-subform", (e) => MasterDetail.deleteSubForm(e));
        $("[target='$modal'][href]").off("click.open-modal").on("click.open-modal", (e) => this.openLinkModal(e));
        $(".select-grid-cols .group-control").each((i, e) => Grid.enableSelectColumns($(e)));
        $("th.select-all > input:checkbox").off("click.select-all").on("click.select-all", (e) => Grid.enableSelectAllToggle(e));
        $("[data-user-help]").each((i, e) => this.enableUserHelp($(e)));
        $("form input, form select").off("keypress.default-button").on("keypress.default-button", (e) => Form.onDefaultButtonKeyPress(e));
        $("form[method=get] .pagination-size").find("select[name=p],select[name$='.p']").off("change.pagination-size").on("change.pagination-size", (e) => Paging.onSizeChanged(e));
        $("[data-sort-item]").parents("tbody").each((i, e) => Sorting.enableDragSort($(e)));
        $("a[data-pagination]").off("click.ajax-paging").on("click.ajax-paging", (e) => Paging.enableWithAjax(e));
        $("a[data-sort]").off("click.ajax-sorting").on("click.ajax-sorting", (e) => Sorting.enableAjaxSorting(e));
        $("th[data-sort]").each((i, e) => Sorting.setSortHeaderClass($(e)));
        $("[data-val-number]").off("blur.cleanup-number").on("blur.cleanup-number", (e) => Form.cleanUpNumberField($(e.currentTarget)));
        $("[data-toggle=tab]").off("click.tab-toggle").on("click.tab-toggle", () => Modal.ensureHeight());
        $("select.form-control").each((i, e) => Select.enhance($(e)));
        $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust",
            (e: any) => $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight));

        //$.validator.unobtrusive.parse('form');

        // =================== Plug-ins ====================
        InstantSearch.enable($("[name=InstantSearch]"));
        AutoComplete.enable($("input[autocomplete-source]"));
        $("[data-control=date-picker],[data-control=calendar]").each((i, e) => new DatePicker($(e)));
        $("[data-control='date-picker|time-picker']").each((i, e) => new TimeControl($(e)));
        $("[data-control=time-picker]").each((i, e) => new TimeControl($(e)));
        $("[data-control=date-drop-downs]").each((i, e) => DateDropdown.enable($(e)));
        $("[data-control=html-editor]").each((i, e) => new HtmlEditor($(e)).enable());
        $("[data-control=numeric-up-down]").each((i, e) => new NumbericUpDown($(e)).enable());
        $("[data-control=range-slider],[data-control=slider]").each((i, e) => new Slider($(e)).enable());
        $(".file-upload input:file").each((i, e) => new FileUpload($(e)).enable());
        $("[data-confirm-question]").each((i, e) => new ConfirmBox($(e)).enable());
        $(".password-strength").each((i, e) => PasswordStength.enable($(e)));
        $(".with-submenu").each((i, e) => new SubMenu($(e)));

        // =================== Request lifecycle ====================
        $(window).off("popstate.ajax-redirect").on("popstate.ajax-redirect", (e) => AjaxRedirect.back(e));
        $("a[data-redirect=ajax]").off("click.ajax-redirect").on("click.ajax-redirect", (e) => AjaxRedirect.enable(e));
        $('form[method=get]').off("submit.clean-up").on("submit.clean-up", (e) => Form.submitCleanGet(e));
        $("[formaction]").not("[formmethod=post]").off("click.formaction").on("click.formaction", (e) => FormAction.invokeWithAjax(e, $(e.currentTarget).attr("formaction"), false));
        $("[formaction][formmethod=post]").off("click.formaction").on("click.formaction", (e) => FormAction.invokeWithPost(e));
        $("[data-change-action]").off("change.data-action").on("change.data-action", (e) => FormAction.invokeWithAjax(e, $(e.currentTarget).attr("data-change-action"), false));
        $("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]").off("dp.change.data-action").on("dp.change.data-action", (e) => FormAction.invokeWithAjax(e, $(e.currentTarget).attr("data-change-action"), false));

        MasterDetail.updateSubFormStates();
        Modal.adjustHeight();

        this._initializeActions.forEach((action) => action());
    }

    skipNewWindows() {
        // Remove the target attribute from links:
        $(window).off('click.SanityAdapter').on('click.SanityAdapter', e => {
            $(e.target).filter('a').removeAttr('target');
        });

        window["open"] = (url, r, f, re) => { location.replace(url); return window; };
    }

    openLinkModal(event: JQueryEventObject) {
        StandardAction.openModal(event);
        return false;
    }

    goBack(target) {
        let returnUrl = Url.getQuery("ReturnUrl");

        if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
            AjaxRedirect.go(returnUrl, $(target), false, false, true);
        else Url.goBack();

        return false;
    }

    public enableUserHelp(element: JQuery) {
        element.click(() => false);
        let message = element.attr('data-user-help');  // todo: unescape message and conver to html
        element['popover']({ trigger: 'focus', content: message });
    }
}
