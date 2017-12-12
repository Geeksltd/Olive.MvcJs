// -------------------- String Extensions ------------------
interface Location {
    pathAndQuery(): string;
}

if (!window.location.pathAndQuery) {
    window.location.pathAndQuery = function () { return window.location.pathname + window.location.search; };
}