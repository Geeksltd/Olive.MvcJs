# Olive.MvcJs Upgrade Guide (v4.0.0)

This document describes the peer library versions required by `olive.mvc@4.0.0` and how to configure host MVC applications (Olive.Templates, Geeks.MS Hub, and custom sites).

## Peer dependency matrix

| Library | Minimum version | wwwroot path (typical) | Load order |
|---------|-----------------|------------------------|------------|
| RequireJS | 2.3.6 | `/lib/requirejs/` | 1 |
| jQuery | 3.7.1 | `/lib/jquery/` | 2 |
| Popper | 2.11.8 | `/lib/popper/` | 3 |
| Bootstrap | 5.3.x | `/lib/bootstrap/` | 4 |
| Moment | 2.30.1 | `/lib/moment/` | 5 |
| alertifyjs | 1.13.1 | `/lib/alertifyjs/` | 6 |
| bootstrap-select | 1.14.0-beta3 | `/lib/bootstrap-select/` | 7 |
| Tempus Dominus | 6.10.x | `/lib/tempus-dominus/` | 8 |
| jquery-typeahead | 2.11.1 | `/lib/jquery-typeahead/` | 9 |
| jquery-validation | 1.19.5 | `/lib/jquery-validation/` | 10 |
| jquery-validation-unobtrusive | 4.0.0 | `/lib/jquery-validation-unobtrusive/` | 11 |
| pwstrength | 3.1.1 | `/lib/pwstrength/` | optional |
| bootstrap-filestyle | 1.2.3 | `/lib/filestyle/` | optional |
| jquery-sortable | 0.9.13 | `/lib/jquery-sortable/` | optional |
| CKEditor | 5.x | `/lib/ckeditor/` | optional (html editor) |

**Critical:** Popper must load before Bootstrap 5. Bootstrap must load before bootstrap-select.

## RequireJS configuration (map mode)

Add or update paths in your host app's `require.config.js`:

```javascript
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
```

## RequireJS configuration (bundle mode)

When using `olive.mvc/dist/bundle.js`, remove the `olive` map entry and add the `bundles` block from `dist/bundle-requireJs-help.md`.

## LibMan example (Olive.Templates)

```json
{
  "version": "1.0",
  "defaultProvider": "cdnjs",
  "libraries": [
    { "library": "jquery@3.7.1", "destination": "wwwroot/lib/jquery/" },
    { "library": "bootstrap@5.3.3", "destination": "wwwroot/lib/bootstrap/" },
    { "provider": "unpkg", "library": "@popperjs/core@2.11.8", "destination": "wwwroot/lib/popper/" },
    { "library": "moment.js@2.30.1", "destination": "wwwroot/lib/moment/" },
    { "provider": "jsdelivr", "library": "alertifyjs@1.13.1", "destination": "wwwroot/lib/alertifyjs/" },
    { "provider": "jsdelivr", "library": "@eonasdan/tempus-dominus@6.10.4", "destination": "wwwroot/lib/tempus-dominus/" },
    { "provider": "jsdelivr", "library": "requirejs@2.3.6", "destination": "wwwroot/lib/requirejs/" }
  ]
}
```

## Host app checklist

1. Upgrade `wwwroot/lib/*` to the versions in the matrix above.
2. Update CSS links: Bootstrap 5 bundle CSS, Tempus Dominus CSS, bootstrap-select BS5 CSS, alertifyjs default CSS.
3. Update RequireJS paths/shims as shown above.
4. Deploy `olive.mvc@4.0.0` to `wwwroot/lib/olive.mvc/`.
5. Set `Config.CK_EDITOR_VERSION = '5'` (default in v4) and ship CKEditor 5 at `/lib/ckeditor/`.
6. Verify script order in `_Layout.cshtml`: jQuery → Popper → Bootstrap → plugins → RequireJS → olive.mvc.

## Olive.Microservices.HubJs

After upgrading Olive.MvcJs, run `hubjs.bat` (or manually):

```bat
cd Olive.MvcJs
yarn install
yarn build
yarn build:bundle
```

Then copy to HubJs and rebuild the HubJs bundle per your existing HubJs pipeline.

## Breaking changes from v3.x

- **Bootstrap 5** required (BS4 no longer supported).
- **alertifyjs 1.x** replaces alertify 0.3 (handled internally by Olive.MvcJs adapter).
- **Tempus Dominus 6.x** replaces eonasdan bootstrap-datetimepicker (handled internally by adapter).
- **CKEditor 5** is the default; v4 fallback remains available via `Config.CK_EDITOR_VERSION = '4'`.

## Regression testing

See the checklist in this repo's README.md under "Upgrade testing".
