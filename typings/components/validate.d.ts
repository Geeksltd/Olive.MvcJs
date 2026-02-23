import Alert from "olive/components/alert";
import { TooltipOption } from "typings-lib/bootstrap/index";
import ResponseProcessor from "olive/mvc/responseProcessor";
export default class Validate implements IService {
    private alert;
    private responseProcessor;
    private tooltipOptions;
    constructor(alert: Alert, responseProcessor: ResponseProcessor);
    private static cssInjected;
    private injectCss;
    configure(): void;
    initialize(): void;
    setTooltipOptions(options: TooltipOption): void;
    validateForm(trigger: JQuery): boolean;
    reloadRules(form: JQuery): void;
    removeTooltipsRelatedTo(parent: JQuery): void;
    protected needsValidation(trigger: JQuery): boolean;
    protected getForm(trigger: JQuery): JQuery;
    protected getValidator(trigger: JQuery, form: JQuery): Validator;
    private ensureWrapper;
    private showBubble;
    private hideBubble;
    protected extendValidatorSettings(validator: Validator, trigger: JQuery): void;
    protected focusOnInvalid(validator: Validator, form: JQuery, trigger: JQuery): void;
    protected showAdditionalErrors(_validator: Validator): void;
    protected handleMessageBoxStyle(validator: Validator, form: JQuery, trigger: JQuery): void;
    protected handleInvalidForm(validator: Validator, form: JQuery, trigger: JQuery): void;
}
