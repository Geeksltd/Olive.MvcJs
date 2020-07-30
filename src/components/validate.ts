import Config from "olive/config";
import Alert from "olive/components/alert";
import { TooltipOption } from "typings-lib/bootstrap/index";
import ResponseProcessor from "olive/mvc/responseProcessor";

export default class Validate implements IService {
    /// TODO: this field is obsolete and DI should use instead.
    private tooltipOptions: TooltipOption;

    constructor(private alert: Alert, private responseProcessor: ResponseProcessor) { }

    public configure() {

        const methods: any = $.validator.methods;

        const format = Config.DATE_FORMAT;

        methods.date = function (value, element) {
            if (this.optional(element)) { return true; }
            return moment(value, format).isValid();
        };

        const originalNumberMehtod = methods.number;
        const originalMinMehtod = methods.min;
        const originalMaxMehtod = methods.max;
        const originalRangeMehtod = methods.range;

        const clearMaskedNumber = (value: string) => value.replace(/,/g, "");

        methods.number = function (value: string, element: any) {
            return originalNumberMehtod.call(this, value, element);
        };

        methods.min = function (value: string, element: any, param: any) {
            return originalMinMehtod.call(this, clearMaskedNumber(value), element, param);
        };

        methods.max = function (value: string, element: any, param: any) {
            return originalMaxMehtod.call(this, clearMaskedNumber(value), element, param);
        };

        methods.range = function (value: string, element: any, param: any) {
            return originalRangeMehtod.call(this, clearMaskedNumber(value), element, param);
        };

        // TODO: datetime, time
    }

    public initialize() {
        this.responseProcessor.subformChanged.handle((data) => this.reloadRules(data.trigger.parents("form")));
    }

    /// TODO: this method is obsolete and DI should use instead.
    public setTooltipOptions(options: TooltipOption) {
        console.warn("MultiSelect.setOptions is obsolete and will be removed in next version.");
        this.tooltipOptions = options;
    }

    public validateForm(trigger: JQuery) {

        if (!this.needsValidation(trigger)) { return true; }

        const form = this.getForm(trigger);
        const validator = this.getValidator(trigger, form);

        this.extendValidatorSettings(validator, trigger);

        if (!validator.form()) {
            this.handleInvalidForm(validator, form, trigger);

            return false;
        }
        return true;
    }

    public reloadRules(form: JQuery) {
        form.removeData("validator").removeData("unobtrusiveValidation");
        // $.validator.unobtrusive.parse(form);
    }

    public removeTooltipsRelatedTo(parent: JQuery) {
        parent.find("[aria-describedby]").each((_, elem) => {
            const id = $(elem).attr("aria-describedby");

            $(`body > #${id}.tooltip`).tooltip("hide");
        });
    }

    protected needsValidation(trigger: JQuery): boolean {
        return !trigger.is("[formnovalidate]");
    }

    protected getForm(trigger: JQuery): JQuery {
        return trigger.closest("form");
    }

    protected getValidator(trigger: JQuery, form: JQuery) {
        return form.validate();
    }

    protected extendValidatorSettings(validator: Validator, trigger: JQuery) {
        $.extend(validator.settings, {
            tooltip_options: { _all_: this.tooltipOptions },
        });
    }

    protected focusOnInvalid(validator: Validator, form: JQuery, trigger: JQuery) {
        validator.focusInvalid();
    }

    protected showAdditionalErrors(validator: Validator) {
        let errorMessage: string = "";

        $.each(validator.errorList, (_, item) => {
            if (!$(".tooltip:contains('" + item.message + "')")) {
                errorMessage += item.message + "<br/>";
            }
        });

        if (errorMessage.length > 0) {
            this.alert.alert(errorMessage, "error");
        }
    }

    protected handleMessageBoxStyle(validator: Validator, form: JQuery, trigger: JQuery) {
        const alertUntyped: any = alert;
        if (form.is("[data-validation-style*=message-box]")) {
            alertUntyped(validator.errorList.map((err) => err.message).join("\r\n"),
                () => { setTimeout(() => this.focusOnInvalid(validator, form, trigger), 0); });
        }
    }

    protected handleInvalidForm(validator: Validator, form: JQuery, trigger: JQuery) {
        this.handleMessageBoxStyle(validator, form, trigger);
        this.focusOnInvalid(validator, form, trigger);
        this.showAdditionalErrors(validator);
    }
}
