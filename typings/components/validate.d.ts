import Alert from "olive/components/alert";
import { TooltipOption } from "typings-lib/bootstrap/index";
export default class Validate implements IService {
    private alert;
    private tooltipOptions;
    constructor(alert: Alert);
    configure(): void;
    setTooltipOptions(options: TooltipOption): void;
    validateForm(trigger: JQuery): boolean;
    reloadRules(form: JQuery): void;
    removeTooltipsRelatedTo(parent: JQuery): void;
}
