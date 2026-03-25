import Config from "olive/config";
import Alert from "olive/components/alert";
import { TooltipOption } from "typings-lib/bootstrap/index";
import ResponseProcessor from "olive/mvc/responseProcessor";

export default class Validate implements IService {
    /// TODO: this field is obsolete and DI should use instead.
    private tooltipOptions: TooltipOption;

    constructor(private alert: Alert, private responseProcessor: ResponseProcessor) { }

    private static cssInjected = false;

    private injectCss() {
        if (Validate.cssInjected) return;
        Validate.cssInjected = true;

        const style = document.createElement("style");
        style.textContent = `
            .validation-icon-wrapper { position: relative; display: inline-block; width: 100%; }
            .validation-error-icon {
                position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                color: #dc3545; font-size: 16px; cursor: pointer; z-index: 2;
            }
            .validation-error-bubble {
                position: absolute; right: 0; top: 100%;
                margin-top: 4px; padding: 6px 10px;
                background: #fff; color: #dc3545; border: 1px solid #dc3545;
                border-radius: 4px; font-size: 13px; z-index: 1000; white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                opacity: 0; pointer-events: none;
                transition: opacity 0.15s;
            }
            .validation-error-bubble.visible {
                opacity: 1; pointer-events: auto;
            }
            .validation-error-bubble::before {
                content: ''; position: absolute; top: -6px; right: 10px;
                border-left: 6px solid transparent; border-right: 6px solid transparent;
                border-bottom: 6px solid #dc3545;
            }
            .validation-error-bubble::after {
                content: ''; position: absolute; top: -5px; right: 11px;
                border-left: 5px solid transparent; border-right: 5px solid transparent;
                border-bottom: 5px solid #fff;
            }
        `;
        document.head.appendChild(style);
    }

    public configure() {
        this.injectCss();

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

    private ensureWrapper(element: JQuery): JQuery {
        const parent = element.parent();
        if (parent.hasClass("validation-icon-wrapper")) {
            return parent;
        }
        if (parent.hasClass("form-control")) {
            parent.addClass("validation-icon-wrapper");
            return parent;
        }
        const wrapper = $("<div class='validation-icon-wrapper'></div>");
        element.before(wrapper);
        wrapper.append(element);
        return wrapper;
    }

    private showBubble(wrapper: JQuery) {
        wrapper.find(".validation-error-bubble").addClass("visible");
    }

    private hideBubble(wrapper: JQuery) {
        wrapper.find(".validation-error-bubble").removeClass("visible");
    }

    protected extendValidatorSettings(validator: Validator, trigger: JQuery) {
        $.extend(validator.settings, {
            errorElement: "div",
            errorClass: "validation-error-bubble",
            errorPlacement: (error: JQuery, element: JQuery) => {
                const wrapper = this.ensureWrapper(element);

                if (!wrapper.find(".validation-error-icon").length) {
                    const icon = $('<i class="validation-error-icon fa fa-exclamation-circle"></i>');
                    wrapper.append(icon);

                    icon.on("mouseenter", () => this.showBubble(wrapper));
                    icon.on("mouseleave", () => {
                        if (!element.is(":focus")) this.hideBubble(wrapper);
                    });

                    element.on("focus.validation", () => this.showBubble(wrapper));
                    element.on("blur.validation", () => this.hideBubble(wrapper));

                    if (element.is("select")) {
                        element.on("change.validation", () => {
                            const form = element.closest("form");
                            if (form.length) form.validate().element(element);
                        });
                    }
                }

                wrapper.append(error);
            },
            highlight: (element: HTMLElement, errorClass: string, validClass: string) => {
                $(element).addClass("error").removeClass(validClass);
            },
            unhighlight: (element: HTMLElement, errorClass: string, validClass: string) => {
                const $el = $(element);
                $el.removeClass("error").addClass(validClass);

                const wrapper = $el.parent(".validation-icon-wrapper");
                if (wrapper.length) {
                    wrapper.find(".validation-error-icon").remove();
                    wrapper.find(".validation-error-bubble").remove();
                    $el.off("focus.validation blur.validation change.validation");
                    if (wrapper.hasClass("form-control")) {
                        wrapper.removeClass("validation-icon-wrapper");
                    }
                }
            },
        });
    }

    protected focusOnInvalid(validator: Validator, form: JQuery, trigger: JQuery) {
        validator.focusInvalid();
    }

    protected showAdditionalErrors(_validator: Validator) {
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
