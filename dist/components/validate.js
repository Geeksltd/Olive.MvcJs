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
                        if (element.is("select")) {
                            element.on("change.validation", () => {
                                const form = element.closest("form");
                                if (form.length)
                                    form.validate().element(element);
                            });
                        }
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
                        $el.off("focus.validation blur.validation change.validation");
                        if (wrapper.hasClass("form-control")) {
                            wrapper.removeClass("validation-icon-wrapper");
                        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFLQSxNQUFxQixRQUFRO1FBSXpCLFlBQW9CLEtBQVksRUFBVSxpQkFBb0M7WUFBMUQsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFBSSxDQUFDO1FBSTNFLFNBQVM7WUFDYixJQUFJLFFBQVEsQ0FBQyxXQUFXO2dCQUFFLE9BQU87WUFDakMsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFFNUIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5QyxLQUFLLENBQUMsV0FBVyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBNEJuQixDQUFDO1lBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVNLFNBQVM7WUFDWixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFakIsTUFBTSxPQUFPLEdBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFFekMsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7WUFFbEMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFPO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFBQyxPQUFPLElBQUksQ0FBQztnQkFBQyxDQUFDO2dCQUM1QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFDO1lBRUYsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzVDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN0QyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDdEMsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBRTFDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXJFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFhLEVBQUUsT0FBWTtnQkFDbEQsT0FBTyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUM7WUFFRixPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVUsS0FBYSxFQUFFLE9BQVksRUFBRSxLQUFVO2dCQUMzRCxPQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xGLENBQUMsQ0FBQztZQUVGLE9BQU8sQ0FBQyxHQUFHLEdBQUcsVUFBVSxLQUFhLEVBQUUsT0FBWSxFQUFFLEtBQVU7Z0JBQzNELE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEYsQ0FBQyxDQUFDO1lBRUYsT0FBTyxDQUFDLEtBQUssR0FBRyxVQUFVLEtBQWEsRUFBRSxPQUFZLEVBQUUsS0FBVTtnQkFDN0QsT0FBTyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRixDQUFDLENBQUM7WUFFRix1QkFBdUI7UUFDM0IsQ0FBQztRQUVNLFVBQVU7WUFDYixJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0csQ0FBQztRQUVELDREQUE0RDtRQUNyRCxpQkFBaUIsQ0FBQyxPQUFzQjtZQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlFQUF5RSxDQUFDLENBQUM7WUFDeEYsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7UUFDbEMsQ0FBQztRQUVNLFlBQVksQ0FBQyxPQUFlO1lBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQUMsT0FBTyxJQUFJLENBQUM7WUFBQyxDQUFDO1lBRXBELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFbkQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVqRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVNLFdBQVcsQ0FBQyxJQUFZO1lBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDakUsdUNBQXVDO1FBQzNDLENBQUM7UUFFTSx1QkFBdUIsQ0FBQyxNQUFjO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFFNUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMsZUFBZSxDQUFDLE9BQWU7WUFDckMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRVMsT0FBTyxDQUFDLE9BQWU7WUFDN0IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFUyxZQUFZLENBQUMsT0FBZSxFQUFFLElBQVk7WUFDaEQsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVPLGFBQWEsQ0FBQyxPQUFlO1lBQ2pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsRUFBRSxDQUFDO2dCQUM3QyxPQUFPLE1BQU0sQ0FBQztZQUNsQixDQUFDO1lBQ0QsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDM0MsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQztZQUNELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDO1FBRU8sVUFBVSxDQUFDLE9BQWU7WUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRU8sVUFBVSxDQUFDLE9BQWU7WUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRVMsdUJBQXVCLENBQUMsU0FBb0IsRUFBRSxPQUFlO1lBQ25FLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDekIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLFVBQVUsRUFBRSx5QkFBeUI7Z0JBQ3JDLGNBQWMsRUFBRSxDQUFDLEtBQWEsRUFBRSxPQUFlLEVBQUUsRUFBRTtvQkFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDakQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7d0JBQ2pGLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRXJCLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDdEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFOzRCQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0NBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDeEQsQ0FBQyxDQUFDLENBQUM7d0JBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQy9ELE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3dCQUU5RCxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQzs0QkFDdkIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7Z0NBQ2pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQ3JDLElBQUksSUFBSSxDQUFDLE1BQU07b0NBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDdEQsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQztvQkFDTCxDQUFDO29CQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLENBQUM7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsT0FBb0IsRUFBRSxVQUFrQixFQUFFLFVBQWtCLEVBQUUsRUFBRTtvQkFDeEUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pELENBQUM7Z0JBQ0QsV0FBVyxFQUFFLENBQUMsT0FBb0IsRUFBRSxVQUFrQixFQUFFLFVBQWtCLEVBQUUsRUFBRTtvQkFDMUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN2QixHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFFOUMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO29CQUN2RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2xELEdBQUcsQ0FBQyxHQUFHLENBQUMsb0RBQW9ELENBQUMsQ0FBQzt3QkFDOUQsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7NEJBQ25DLE9BQU8sQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsQ0FBQzt3QkFDbkQsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMsY0FBYyxDQUFDLFNBQW9CLEVBQUUsSUFBWSxFQUFFLE9BQWU7WUFDeEUsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFUyxvQkFBb0IsQ0FBQyxVQUFxQjtRQUNwRCxDQUFDO1FBRVMscUJBQXFCLENBQUMsU0FBb0IsRUFBRSxJQUFZLEVBQUUsT0FBZTtZQUMvRSxNQUFNLFlBQVksR0FBUSxLQUFLLENBQUM7WUFDaEMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUNuRSxHQUFHLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkYsQ0FBQztRQUNMLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxTQUFvQixFQUFFLElBQVksRUFBRSxPQUFlO1lBQzNFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsQ0FBQzs7SUE1TmMsb0JBQVcsR0FBRyxLQUFLLENBQUM7c0JBTmxCLFFBQVEifQ==