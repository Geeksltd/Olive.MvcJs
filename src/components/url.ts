import pako = require('pako');

export default class Url implements IService {

    public decodeGzipUrl(inputUrl: string): string {
        if (inputUrl === undefined || inputUrl === null || inputUrl.startsWith("...") == false) return inputUrl;
        var tempUrl = inputUrl;
        if (tempUrl.toLowerCase().contains("returnurl=")) {
            tempUrl = tempUrl.substring(tempUrl.indexOf("returnurl=") + 10);
        }
        var encodedUrl = tempUrl.substring(3).replace(new RegExp("%7E", 'g'), "~").replace(new RegExp("~", 'g'), "+").replace(new RegExp("_", 'g'), "/").replace(new RegExp("-", 'g'), "=");
        if (encodedUrl === null || encodedUrl.length <= 0) return;
        var binaryArray = Uint8Array.from(atob(encodedUrl), c => c.charCodeAt(0));
        var unzippedBinaryArray = pako.ungzip(binaryArray);
        var decodedString = String.fromCharCode.apply(null, unzippedBinaryArray);
        return decodedString;
    }

    public effectiveUrlProvider: ((url: string, trigger: JQuery) => string) = (u, t) => this.decodeGzipUrl(u);

    public onAuthenticationFailed: (() => void) = this.goToLoginPage;

    public makeAbsolute(baseUrl: string, relativeUrl: string): string {
        baseUrl = this.decodeGzipUrl(baseUrl);
        relativeUrl = this.decodeGzipUrl(relativeUrl);
        baseUrl = baseUrl || window.location.origin;
        relativeUrl = relativeUrl || '';

        if (relativeUrl.indexOf('/') != 0) relativeUrl = '/' + relativeUrl;

        if (baseUrl.charAt(baseUrl.length - 1) == '/')
            baseUrl = baseUrl.substring(0, baseUrl.length - 1);

        return this.decodeGzipUrl(baseUrl + relativeUrl);
    }

    public makeRelative(url: string): string {
        url = this.decodeGzipUrl(url)
        if (this.isAbsolute(url))
            return url.split("/").splice(3).join("/");
        else return url;
    }

    public isAbsolute(url: string): Boolean {
        if (!url) return false;
        url = url.toLowerCase();
        return url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
    }

    public current(): string { return this.decodeGzipUrl(window.location.href); }

    public goBack(): void {
        if (this.current().indexOf(this.baseContentUrl + "/##") === 0) history.back();
        else {
            let returnUrl = this.getQuery("ReturnUrl");
            returnUrl = this.decodeGzipUrl(returnUrl);
            if (returnUrl) window.location.href = returnUrl;
            else history.back();
        }
    }

    public updateQuery(uri, key, value) {
        if (uri == null) uri = window.location.href;
        uri = this.decodeGzipUrl(uri);
        let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        let separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) return uri.replace(re, '$1' + key + "=" + value + '$2');
        else return uri + separator + key + "=" + value;
    }

    public removeQuery(url: string, parameter: string) {
        //prefer to use l.search if you have a location/link object
        url = this.decodeGzipUrl(url);
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
        url = this.decodeGzipUrl(url);
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
        url = this.decodeGzipUrl(url);
        window.location.href = "/login?returnUrl=/" + encodeURIComponent(this.makeRelative(url).trimStart("/"));
    }

    private goToLoginPage() {
        let query: string = this.current().split("/").splice(3).join("/");
        query = this.decodeGzipUrl(query);
        window.location.href = "/login?returnUrl=/" + query.trimStart("/");
    }

    private fullQueryString(url: string): string {
        url = this.decodeGzipUrl(url);
        if (url == undefined || url == null)
            url = this.current();

        if (url.indexOf("?") == -1) return '';

        return url.substring(url.indexOf("?"));
    }

    public addQuery(url: string, key: string, value) { return this.decodeGzipUrl(url) + (this.decodeGzipUrl(url).indexOf("?") == -1 ? "?" : "&") + key + "=" + value; }

    public removeEmptyQueries(url: string): string {
        url = this.decodeGzipUrl(url);
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

    public baseContentUrl = this.decodeGzipUrl(window["BaseThemeUrl"]) || '/';

    public ofContent(relativeUrl: string) {
        relativeUrl = this.decodeGzipUrl(relativeUrl);
        let base = this.baseContentUrl;
        base = this.decodeGzipUrl(base);
        while (base.length > 0 && base[base.length - 1] === '/')
            base = base.substring(0, base.length - 1);

        while (relativeUrl.length > 0 && relativeUrl[0] === '/')
            relativeUrl = relativeUrl.substring(1);

        return base + '/' + relativeUrl;
    }
}