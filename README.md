# Olive.MvcJs



# Bundling

## Related files structure
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
- `/bundling-helper/fix-bundle-modules.js` - This file contains functions to read the bundled js file and fix its modules names by adding 'olive' to the start of them. It also generates the `bundle-requireJs-help.md` - This file contains the names of the modules that are needed in the [RequireJs config](https://requirejs.org/docs/api.html#config).
- `/dist/bundle-requireJs-help.md (Auto Generated)` - This file contains the [RequireJs bundle configuration](https://requirejs.org/docs/api.html#config-bundles) for 'Olive.MvcJs' bundling.
- `/dist/bundle.js (Auto Generated)` - All of the 'Olive.MvcJs' .js files will be bundled into this file.
- `/bundle-build.bat`
	The batch file to handle the bundling automatically.
- `/bundle-tsconfig.json` - The config file for compiling the .ts files into a single (bundled) .js file.


> **Notic:** Please run the `/bundle-build.bat` file before pushing the changes that you made in the .ts files.

## How to use (with RequireJS)
You need to make two changes in the 'RequireJs' config:

1. Remove the `'olive': "olive.mvc/dist"` from the map section
2. Add the bundle that is provided in the `bundle-requireJs-help.md` file.
