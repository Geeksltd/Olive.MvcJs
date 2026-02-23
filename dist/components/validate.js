define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Validate {
        constructor(alert, responseProcessor) {
            this.alert = alert;
            this.responseProcessor = responseProcessor;
        }
        injectCss() {
            if (Validate.cssInjected)
                return;
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
        configure() {
            this.injectCss();
            const methods = $.validator.methods;
            const format = config_1.default.DATE_FORMAT;
            methods.date = function (value, element) {
                if (this.optional(element)) {
                    return true;
                }
                return moment(value, format).isValid();
            };
            const originalNumberMehtod = methods.number;
            const originalMinMehtod = methods.min;
            const originalMaxMehtod = methods.max;
            const originalRangeMehtod = methods.range;
            const clearMaskedNumber = (value) => value.replace(/,/g, "");
            methods.number = function (value, element) {
                return originalNumberMehtod.call(this, value, element);
            };
            methods.min = function (value, element, param) {
                return originalMinMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            methods.max = function (value, element, param) {
                return originalMaxMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            methods.range = function (value, element, param) {
                return originalRangeMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            // TODO: datetime, time
        }
        initialize() {
            this.responseProcessor.subformChanged.handle((data) => this.reloadRules(data.trigger.parents("form")));
        }
        /// TODO: this method is obsolete and DI should use instead.
        setTooltipOptions(options) {
            console.warn("MultiSelect.setOptions is obsolete and will be removed in next version.");
            this.tooltipOptions = options;
        }
        validateForm(trigger) {
            if (!this.needsValidation(trigger)) {
                return true;
            }
            const form = this.getForm(trigger);
            const validator = this.getValidator(trigger, form);
            this.extendValidatorSettings(validator, trigger);
            if (!validator.form()) {
                this.handleInvalidForm(validator, form, trigger);
                return false;
            }
            return true;
        }
        reloadRules(form) {
            form.removeData("validator").removeData("unobtrusiveValidation");
            // $.validator.unobtrusive.parse(form);
        }
        removeTooltipsRelatedTo(parent) {
            parent.find("[aria-describedby]").each((_, elem) => {
                const id = $(elem).attr("aria-describedby");
                $(`body > #${id}.tooltip`).tooltip("hide");
            });
        }
        needsValidation(trigger) {
            return !trigger.is("[formnovalidate]");
        }
        getForm(trigger) {
            return trigger.closest("form");
        }
        getValidator(trigger, form) {
            return form.validate();
        }
        ensureWrapper(element) {
            if (element.parent().hasClass("validation-icon-wrapper")) {
                return element.parent();
            }
            const wrapper = $("<div class='validation-icon-wrapper'></div>");
            element.before(wrapper);
            wrapper.append(element);
            return wrapper;
        }
        showBubble(wrapper) {
            wrapper.find(".validation-error-bubble").addClass("visible");
        }
        hideBubble(wrapper) {
            wrapper.find(".validation-error-bubble").removeClass("visible");
        }
        extendValidatorSettings(validator, trigger) {
            $.extend(validator.settings, {
                errorElement: "div",
                errorClass: "validation-error-bubble",
                errorPlacement: (error, element) => {
                    const wrapper = this.ensureWrapper(element);
                    if (!wrapper.find(".validation-error-icon").length) {
                        const icon = $('<i class="validation-error-icon fa fa-exclamation-circle"></i>');
                        wrapper.append(icon);
                        icon.on("mouseenter", () => this.showBubble(wrapper));
                        icon.on("mouseleave", () => {
                            if (!element.is(":focus"))
                                this.hideBubble(wrapper);
                        });
                        element.on("focus.validation", () => this.showBubble(wrapper));
                        element.on("blur.validation", () => this.hideBubble(wrapper));
                    }
                    wrapper.append(error);
                },
                highlight: (element, errorClass, validClass) => {
                    $(element).addClass("error").removeClass(validClass);
                },
                unhighlight: (element, errorClass, validClass) => {
                    const $el = $(element);
                    $el.removeClass("error").addClass(validClass);
                    const wrapper = $el.parent(".validation-icon-wrapper");
                    if (wrapper.length) {
                        wrapper.find(".validation-error-icon").remove();
                        wrapper.find(".validation-error-bubble").remove();
                        $el.off("focus.validation blur.validation");
                    }
                },
            });
        }
        focusOnInvalid(validator, form, trigger) {
            validator.focusInvalid();
        }
        showAdditionalErrors(_validator) {
        }
        handleMessageBoxStyle(validator, form, trigger) {
            const alertUntyped = alert;
            if (form.is("[data-validation-style*=message-box]")) {
                alertUntyped(validator.errorList.map((err) => err.message).join("\r\n"), () => { setTimeout(() => this.focusOnInvalid(validator, form, trigger), 0); });
            }
        }
        handleInvalidForm(validator, form, trigger) {
            this.handleMessageBoxStyle(validator, form, trigger);
            this.focusOnInvalid(validator, form, trigger);
            this.showAdditionalErrors(validator);
        }
    }
    Validate.cssInjected = false;
    exports.default = Validate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFLQSxNQUFxQixRQUFRO1FBSXpCLFlBQW9CLEtBQVksRUFBVSxpQkFBb0M7WUFBMUQsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFBSSxDQUFDO1FBSTNFLFNBQVM7WUFDYixJQUFJLFFBQVEsQ0FBQyxXQUFXO2dCQUFFLE9BQU87WUFDakMsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFFNUIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxLQUFLLENBQUMsV0FBVyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBNEJuQixDQUFDO1lBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVNLFNBQVM7WUFDWixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFakIsTUFBTSxPQUFPLEdBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFFekMsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7WUFFbEMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFPO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFBQyxPQUFPLElBQUksQ0FBQztnQkFBQyxDQUFDO2dCQUM1QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFDO1lBRUYsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzVDLE1BQU0saUJBQWlC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