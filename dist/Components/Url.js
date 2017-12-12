exports.__esModule = true;
var Url = /** @class */ (function () {
    function Url() {
    }
    Url.current = function () { return window.location.href; };
    Url.goBack = function () {
        var returnUrl = Url.getQuery("ReturnUrl");
        if (returnUrl)
            window.location.href = returnUrl;
        else
            history.back();
    };
    Url.updateQuery = function (uri, key, value) {
        if (uri == null)
            uri = window.location.href;
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re))
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        else
            return uri + separator + key + "=" + value;
    };
    Url.removeQuery = function (url, parameter) {
        //prefer to use l.search if you have a location/link object
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
    Url.getQuery = function (name, url) {
        if (url === void 0) { url = null; }
        if (url)
            url = Url.fullQueryString(url);
        else
            url = location.search;
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i"), results = regex.exec(url);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
    Url.fullQueryString = function (url) {
        if (url == undefined || url == null)
            url = Url.current();
        if (url.indexOf("?") == -1)
            return '';
        return url.substring(url.indexOf("?") + 1);
    };
    Url.addQuery = function (url, key, value) { return url + (url.indexOf("?") == -1 ? "?" : "&") + key + "=" + value; };
    Url.removeEmptyQueries = function (url) {
        var items = Url.fullQueryString(url).split('&');
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
    return Url;
}());
exports.Url = Url;
//# sourceMappingURL=Url.js.map