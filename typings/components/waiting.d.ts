import Url from 'olive/components/url';
export default class Waiting implements IService {
    private url;
    constructor(url: Url);
    show(blockScreen?: boolean, validate?: boolean): void;
    hide(): void;
}
