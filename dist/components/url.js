define(["require", "exports", "pako"], function (require, exports, pako) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Url = /** @class */ (function () {
        function Url() {
            var _this = this;
            this.effectiveUrlProvider = function (u, t) { return _this.decodeGzipUrl(u); };
            this.onAuthenticationFailed = this.goToLoginPage;
            this.baseContentUrl = this.decodeGzipUrl(window["BaseThemeUrl"]) || '/';
        }
        Url.prototype.decodeGzipUrl = function (inputUrl) {
            if (inputUrl === undefined || inputUrl === null)
                return inputUrl;
            var tempUrl = inputUrl;
            if (tempUrl.toLowerCase().contains("returnurl=")) {
                tempUrl = tempUrl.substring(tempUrl.indexOf("returnurl=") + 10);
            }
            if (tempUrl.startsWith("...") == false)
                return inputUrl;
            var encodedUrl = tempUrl.substring(3).replace(new RegExp("%7E", 'g'), "~").replace(new RegExp("~", 'g'), "+").replace(new RegExp("_", 'g'), "/").replace(new RegExp("-", 'g'), "=");
            if (encodedUrl === null || encodedUrl.length <= 0)
                return;
            var binaryArray = Uint8Array.from(atob(encodedUrl), function (c) { return c.charCodeAt(0); });
            var unzippedBinaryArray = pako.ungzip(binaryArray);
            var decodedString = String.fromCharCode.apply(null, unzippedBinaryArray);
            if (inputUrl.startsWith("...")) {
                return decodedString;
            }
            else {
                return inputUrl.substring(0, inputUrl.toLowerCase().indexOf("returnurl=") + 9) + decodedString;
            }
        };
        Url.prototype.makeAbsolute = function (baseUrl, relativeUrl) {
            baseUrl = this.decodeGzipUrl(baseUrl);
            relativeUrl = this.decodeGzipUrl(relativeUrl);
            baseUrl = baseUrl || window.location.origin;
            relativeUrl = relativeUrl || '';
            if (relativeUrl.indexOf('/') != 0)
                relativeUrl = '/' + relativeUrl;
            if (baseUrl.charAt(baseUrl.length - 1) == '/')
                baseUrl = baseUrl.substring(0, baseUrl.length - 1);
            return this.decodeGzipUrl(baseUrl + relativeUrl);
        };
        Url.prototype.makeRelative = function (url) {
            url = this.decodeGzipUrl(url);
            if (this.isAbsolute(url))
                return url.split("/").splice(3).join("/");
            else
                return url;
        };
        Url.prototype.isAbsolute = function (url) {
            if (!url)
                return false;
            url = url.toLowerCase();
            return url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
        };
        Url.prototype.current = function () { return this.decodeGzipUrl(window.location.href); };
        Url.prototype.goBack = function () {
            if (this.current().indexOf(this.baseContentUrl + "/##") === 0)
                history.back();
            else {
                var returnUrl = this.getQuery("ReturnUrl");
                returnUrl = this.decodeGzipUrl(returnUrl);
                if (returnUrl)
                    window.location.href = returnUrl;
                else
                    history.back();
            }
        };
        Url.prototype.updateQuery = function (uri, key, value) {
            if (uri == null)
                uri = window.location.href;
            uri = this.decodeGzipUrl(uri);
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re))
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            else
                return uri + separator + key + "=" + value;
        };
        Url.prototype.removeQuery = function (url, parameter) {
            //prefer to use l.search if you have a location/link object
            url = this.decodeGzipUrl(url);
            var urlParts = url.split('?');
            if (urlParts.length >= 2) {
                var prefix = encodeURIComponent(parameter).toLowerCase() + '=';
                var parts = urlParts[1].split(/[&;]/g);
                //reverse iteration as may be destructive
                for (var i = parts.length; i-- > 0;) {
                    //idiom for string.startsWith
                    if (parts[i].toLowerCase().lastIndexOf(prefix, 0) !== -1) {
                        parts.splice(i, 1);
                    }
                }
                url = urlParts[0] + '?' + parts.join('&');
                return url;
            }
            else {
                return url;
            }
        };
        Url.prototype.getQuery = function (name, url) {
            if (url === void 0) { url = null; }
            if (url)
                url = this.fullQueryString(url);
            else
                url = location.search;
            url = this.decodeGzipUrl(url);
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i"), results = regex.exec(url);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };
        Url.prototype.getModalQuery = function (name) {
            return this.getQuery(name, this.getQuery("_modal"));
        };
        Url.prototype.goToUrlAfterLogin = function (url) {
            url = this.decodeGzipUrl(url);
            window.location.href = "/login?returnUrl=/" + encodeURIComponent(this.makeRelative(url).trimStart("/"));
        };
        Url.prototype.goToLoginPage = function () {
            var query = this.current().split("/").splice(3).join("/");
            query = this.decodeGzipUrl(query);
            window.location.href = "/login?returnUrl=/" + query.trimStart("/");
        };
        Url.prototype.fullQueryString = function (url) {
            if (url == undefined || url == null)
                url = this.current();
            url = this.decodeGzipUrl(url);
            if (url.indexOf("?") == -1)
                return '';
            return url.substring(url.indexOf("?"));
        };
        Url.prototype.addQuery = function (url, key, value) { return this.decodeGzipUrl(url) + (this.decodeGzipUrl(url).indexOf("?") == -1 ? "?" : "&") + key + "=" + value; };
        Url.prototype.removeEmptyQueries = function (url) {
            url = this.decodeGzipUrl(url);
            var items = this.fullQueryString(url).trimStart('?').split('&');
            var result = '';
            for (var i in items) {
                var key = items[i].split('=')[0];
                var val = items[i].split('=')[1];
                if (val != '' && val != undefined)
                    result += "&" + key + "=" + val;
            }
            if (items.length > 0)
                result = result.substring(1);
            if (url.indexOf('?') > -1)
                result = url.substring(0, url.indexOf('?') + 1) + result;
            else
                result = url;
            if (result.indexOf("?") == result.length - 1)
                result = result.substring(0, result.length - 1);
            return result;
        };
        Url.prototype.ofContent = function (relativeUrl) {
            relativeUrl = this.decodeGzipUrl(relativeUrl);
            var base = this.baseContentUrl;
            base = this.decodeGzipUrl(base);
            while (base.length > 0 && base[base.length - 1] === '/')
                base = base.substring(0, base.length - 1);
            while (relativeUrl.length > 0 && relativeUrl[0] === '/')
                relativeUrl = relativeUrl.substring(1);
            return base + '/' + relativeUrl;
        };
        return Url;
    }());
    exports.default = Url;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvdXJsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFBQTtZQUFBLGlCQXdLQztZQWpKVSx5QkFBb0IsR0FBK0MsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBckIsQ0FBcUIsQ0FBQztZQUVuRywyQkFBc0IsR0FBaUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQWlJMUQsbUJBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQWM5RSxDQUFDO1FBdEtVLDJCQUFhLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssSUFBSTtnQkFBRSxPQUFPLFFBQVEsQ0FBQztZQUNqRSxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUM7WUFDdkIsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUM5QyxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ25FO1lBQ0QsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUs7Z0JBQUUsT0FBTyxRQUFRLENBQUE7WUFFdkQsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FB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