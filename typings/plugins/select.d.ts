import 'bootstrap-select';
import { DelayedInitializer } from './delayedInitializer';
export default class Select implements IService {
    enableEnhance(selector: JQuery, delayedInitializer: DelayedInitializer): void;
    private enhance;
    replaceSource(controlId: string, items: any): void;
}
