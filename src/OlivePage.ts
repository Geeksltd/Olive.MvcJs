
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
import UserHelp from 'olive/Plugins/UserHelp'

export default class OlivePage {

    public modal = Modal;
    public waiting = Waiting;

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
        Grid.enableColumn($(".select-cols .apply"));
        Grid.enableSelectCol($(".select-grid-cols .group-control"));
        Grid.enableToggle($("th.select-all > input:checkbox"));
        MasterDetail.enable($("[data-delete-subform]"));
        Form.enableDefaultButtonKeyPress($("form input, form select"));
        Paging.enableOnSizeChanged($("form[method=get] .pagination-size").find("select[name=p],select[name$='.p']"));
        Sorting.enableDragSort($("[data-sort-item]").parents("tbody"));
        Paging.enableWithAjax($("a[data-pagination]"));
        Sorting.enableAjaxSorting($("a[data-sort]"));
        Sorting.setSortHeaderClass($("th[data-sort]"));
        Form.enablecleanUpNumberField($("[data-val-number]"));
        Modal.enalbeEnsureHeight($("[data-toggle=tab]"));
        Select.enableEnhance($("select.form-control"));
        UserHelp.enable($("[data-user-help]"));
        StandardAction.enableLinkModal($("[target='$modal'][href]"));

        $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust",
            (e: any) => $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight));

        //$.validator.unobtrusive.parse('form');

        // =================== Plug-ins ====================
        InstantSearch.enable($("[name=InstantSearch]"));
        AutoComplete.enable($("input[autocomplete-source]"));
        DatePicker.enable($("[data-control=date-picker],[data-control=calendar]"));
        TimeControl.enable($("[data-control='date-picker|time-picker']"));
        TimeControl.enable($("[data-control=time-picker]"));
        DateDropdown.enable($("[data-control=date-drop-downs]"));
        HtmlEditor.enable($("[data-control=html-editor]"));
        NumbericUpDown.enable($("[data-control=numeric-up-down]"));
        Slider.enable($("[data-control=range-slider],[data-control=slider]"));
        FileUpload.enable($(".file-upload input:file"));
        ConfirmBox.enable($("[data-confirm-question]"));
        PasswordStength.enable($(".password-strength"));
        SubMenu.enable($(".with-submenu"));

        // =================== Request lifecycle ====================
        AjaxRedirect.enableBack($(window));
        AjaxRedirect.enableRedirect($("a[data-redirect=ajax]"));
        Form.enablesubmitCleanGet($('form[method=get]'));
        FormAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
        FormAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
        FormAction.enableInvokeWithAjax($("[data-change-action]"), "change.data-action", "change.data-action");
        FormAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]"), "dp.change.data-action", "data-change-action");

        MasterDetail.updateSubFormStates();
        Modal.adjustHeight();

        this._initializeActions.forEach((action) => action());
    }

    goBack(target) {
        let returnUrl = Url.getQuery("ReturnUrl");

        if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
            AjaxRedirect.go(returnUrl, $(target), false, false, true);
        else Url.goBack();

        return false;
    }

    refresh(keepScroll = false) {
        if ($("main").parent().is("body"))
            AjaxRedirect.go(location.href, null, false /*isBack*/, keepScroll, false);
        else location.reload();

        return false;
    }
}
