import Alert from "olive/components/alert";
import { TooltipOption } from "typings-lib/bootstrap/index";
import ResponseProcessor from "olive/mvc/responseProcessor";
export default class Validate implements IService {
    private alert;
    private responseProcessor;
    private tooltipOptions;
    constructor(alert: Alert, responseProcessor: ResponseProcessor);
    configure(): void;
    initialize(): void;
    setTooltipOptions(options: TooltipOption): void;
    validateForm(trigger: JQuery): boolean;
    reloadRules(form: JQuery): void;
    removeTooltipsRelatedTo(parent: JQuery): void;
}
