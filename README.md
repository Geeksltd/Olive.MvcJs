# Olive.MvcJs

Client-side TypeScript library for [Olive MVC](https://github.com/Geeksltd/Olive.MvcJs) applications. Version **4.0.0** targets **Bootstrap 5** with adapter layers for backward-compatible plugin behavior.

## Build

Requires Node 20+ and Yarn 1.x.

```bat
yarn install
yarn build          REM compile AMD modules to dist/
yarn build:bundle   REM compile single bundle.js + update RequireJS help
yarn lint
```

Windows batch shortcuts: `build.bat`, `bundle-build.bat`, `localTest.bat`, `hubjs.bat`.

## Upgrade from v3.x

See [UPGRADE.md](UPGRADE.md) for peer library versions, RequireJS configuration, and host app migration steps.

Example RequireJS config: [host-requirejs.config.example.js](host-requirejs.config.example.js).

## Bundling

### Related files structure
```
📦Olive.MvcJs
 ┣ 📂bundling-helper
 ┃ ┗ 📜fix-bundle-modules.js
 ┣ 📂dist
 ┃ ┣📜bundle-requireJs-help.md
 ┃ ┗📜bundle.js
 ┣ 📜bundle-build.bat
 ┗ 📜bundle-tsconfig.json
```

### Files Description
- `/bundling-helper/fix-bundle-modules.js` - Fixes bundled module names with the `olive/` prefix and generates `bundle-requireJs-help.md`.
- `/dist/bundle-requireJs-help.md` (auto-generated) - RequireJS `bundles` configuration for Olive.MvcJs.
- `/dist/bundle.js` (auto-generated) - Single-file bundle of all Olive.MvcJs modules.
- `/bundle-build.bat` - Runs `yarn build:bundle`.
- `/bundle-tsconfig.json` - TypeScript config for the single-file bundle output.

> **Notice:** Run `bundle-build.bat` (or `yarn build:bundle`) before pushing TypeScript changes.

## How to use (with RequireJS)

### Map mode (per-module loading)

Use the paths/shims in `host-requirejs.config.example.js` and map `olive` to `olive.mvc/dist`.

### Bundle mode

1. Remove `'olive': "olive.mvc/dist"` from the map section.
2. Add the `bundles` block from `dist/bundle-requireJs-help.md`.

## HubJs integration

Run `hubjs.bat` to build Olive.MvcJs and copy into `Olive.Microservices.HubJs`, then rebuild the HubJs minified bundle. See [UPGRADE.md](UPGRADE.md) for the full pipeline.

## Upgrade testing checklist

After upgrading host `wwwroot/lib` packages and deploying `olive.mvc@4.0.0`:

| Area | Verify |
|------|--------|
| AJAX navigation | Page refresh, modal open/close, scroll-to-top |
| Forms | Client validation, date format parsing (Moment) |
| Modals | iframe mode, height adjustment, date picker in modal |
| Grids | Dropdown actions, column sorting |
| Select / MultiSelect | Option refresh, modal integration |
| HtmlEditor / FileManager | CKEditor 5 upload and file picker |
| Global search | Tabs, result badges |
| File upload | Progress bar, bootstrap-filestyle layout |
| AutoComplete | typeahead select events |
| Alerts | alert/confirm dialogs via alertifyjs |

## Architecture (v4 adapters)

| Adapter | Purpose |
|---------|---------|
| `src/adapters/bootstrap.ts` | Bootstrap 5 modal/tooltip compatibility |
| `src/adapters/dateTimePickerAdapter.ts` | Tempus Dominus 6 with legacy datetimepicker fallback |
| `src/adapters/selectAdapter.ts` | bootstrap-select BS5 / Tom Select fallback |
| `src/adapters/alertifyAdapter.ts` | alertifyjs 1.x with legacy alertify 0.3 API mapping |
