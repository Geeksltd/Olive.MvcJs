import Url from 'olive/components/url';
export default class Waiting implements IService {
    private url;
    private tokens;
    private tokenSeed;
    constructor(url: Url);
    show(blockScreen?: boolean, validate?: boolean): string;
    hide(token?: string): void;
    private addCover;
}
