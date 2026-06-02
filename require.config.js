require.config({
    paths: {
        "jquery": "jquery/dist/jquery.min",
        "popper": "popper/umd/popper.min",
        "bootstrap": "bootstrap/dist/js/bootstrap.bundle.min",
        "moment": "moment/min/moment-with-locales.min",
        "alertify": "alertifyjs/build/alertify.min",
        "bootstrap-select": "bootstrap-select/dist/js/bootstrap-select.min",
        "tempus-dominus": "tempus-dominus/dist/js/tempus-dominus.min",
        "olive": "olive.mvc/dist"
    },
    shim: {
        "bootstrap": { deps: ["jquery", "popper"], exports: "bootstrap" },
        "bootstrap-select": { deps: ["jquery", "bootstrap"] },
        "alertify": { deps: ["jquery"], exports: function() { return alertify; } },
        "tempus-dominus": { deps: ["popper"], exports: "tempusDominus" }
    },
    map: {
        "*": {
            "olive": "olive.mvc/dist"
        }
    }
});
