import { TooltipOption } from "typings-lib/bootstrap/index";
export default class Validate {
    private static tooltipOptions;
    static configure(): void;
    static setTooltipOptions(options: TooltipOption): void;
    static validateForm(trigger: JQuery): boolean;
    static reloadRules(form: JQuery): void;
}
