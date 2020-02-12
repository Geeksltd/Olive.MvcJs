export default class Url implements IService {

    public effectiveUrlProvider: ((url: string, trigger: JQuery) => string) = (u, t) => u;
    public onAuthenticationFailed: (() => void) = this.goToLoginPage;

    public makeAbsolute(baseUrl: string, relativeUrl: string): string {
        baseUrl = baseUrl || window.location.origin;
        relativeUrl = relativeUrl || '';

        if (relativeUrl.indexOf('/') != 0) relativeUrl = '/' + relativeUrl;

        if (baseUrl.charAt(baseUrl.length - 1) == '/')
            baseUrl = baseUrl.substring(0, baseUrl.length - 1);

        return baseUrl + relativeUrl;
    }

    public makeRelative(url: string): string {
        if (this.isAbsolute(url))
            return url.split("/").splice(3).join("/");
        else return url;
    }

    public isAbsolute(url: string): Boolean {
        if (!url) return false;
        url = url.toLowerCase();
        return url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
    }

    public current(): string { return window.location.href; }

    public goBack(): void {
        if (this.current().indexOf(this.baseContentUrl + "/##") === 0) history.back();
        else {
            let returnUrl = this.getQuery("ReturnUrl");
            if (returnUrl) window.location.href = returnUrl;
            else history.back();
        }
    }

    public updateQuery(uri, key, value) {
        if (uri == null) uri = window.location.href;

        let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        let separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) return uri.replace(re, '$1' + key + "=" + value + '$2');
        else return uri + separator + key + "=" + value;
    }

    public removeQuery(url: string, parameter: string) {
        //prefer to use l.search if you have a location/link object
        let urlParts = url.split('?');
        if (urlParts.length >= 2) {
            let prefix = encodeURIComponent(parameter).toLowerCase() + '=';
            let parts = urlParts[1].split(/[&;]/g);

            //reverse iteration as may be destructive
            for (let i = parts.length; i-- > 0;) {
                //idiom for string.startsWith
                if (parts[i].toLowerCase().lastIndexOf(prefix, 0) !== -1) {
                    parts.splice(i, 1);
                }
            }
            url = urlParts[0] + '?' + parts.join('&');

            return url;
        } else {
            return url;
        }
    }

    public getQuery(name: string, url: string = null): string {
        if (url) url = this.fullQueryString(url); else url = location.search;

        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i"),
            results = regex.exec(url);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    public getModalQuery(name: string): string {
        return this.getQuery(name, this.getQuery("_modal"));
    }

    public goToUrlAfterLogin(url: string) {
        window.location.href = "/login?returnUrl=/" + encodeURIComponent(this.makeRelative(url).trimStart("/"));
    }

    private goToLoginPage() {
        let query: string = this.current().split("/").splice(3).join("/");
        window.location.href = "/login?returnUrl=/" + query.trimStart("/");
    }

    private fullQueryString(url: string): string {
        if (url == undefined || url == null)
            url = this.current();

        if (url.indexOf("?") == -1) return '';

        return url.substring(url.indexOf("?"));
    }

    public addQuery(url: string, key: string, value) { return url + (url.indexOf("?") == -1 ? "?" : "&") + key + "=" + value; }

    public removeEmptyQueries(url: string): string {

        let items = this.fullQueryString(url).trimStart('?').split('&');
        let result = '';

        for (let i in items) {
            let key = items[i].split('=')[0];
            let val = items[i].split('=')[1];
            if (val != '' && val != undefined) result += "&" + key + "=" + val;
        }

        if (items.length > 0) result = result.substring(1);

        if (url.indexOf('?') > -1) result = url.substring(0, url.indexOf('?') + 1) + result;
        else result = url;

        if (result.indexOf("?") == result.length - 1) result = result.substring(0, result.length - 1);

        return result;
    }

    public baseContentUrl = window["BaseThemeUrl"] || '/';
    public ofContent(relativeUrl: string) {
        let base = this.baseContentUrl;
        while (base.length > 0 && base[base.length - 1] === '/')
            base = base.substring(0, base.length - 1);

        while (relativeUrl.length > 0 && relativeUrl[0] === '/')
            relativeUrl = relativeUrl.substring(1);

        return base + '/' + relativeUrl;
    }
}