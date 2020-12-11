const path = require("path");
const fs = require("fs");
const targetFolder = "./dist/";
const bundleFileName = 'bundle.js';
var targetFileContent = '';
var requireJsBundle = [];

/*
The main function
*/
function fixBundleFile(){
    fs.readFile(`${targetFolder}/${bundleFileName}`, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        targetFileContent = data;
        findAndReplaceModules(targetFolder);
        updateTargetFile();
        createRequireJsHelp();
      });
}

function findAndReplaceModules(directory) {
    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isDirectory())
         return findAndReplaceModules(filePath);
        else if(path.extname(filePath) === '.js' && path.basename(filePath) !== bundleFileName) {
           fixModuleNameInTargetFileContent(filePath);
        }     
    });
}

function fixModuleNameInTargetFileContent(fileName){
    var searchTxt = fileName.replace('dist\\','').replace('\\','/').replace('.js','');
    var replaceTxt = `"olive/${searchTxt}"`;
    const regex = new RegExp(`"${searchTxt}"`, 'g');
    targetFileContent = targetFileContent.replace(regex, replaceTxt);
    requireJsBundle.push(replaceTxt);
}

function updateTargetFile(){
    fs.writeFile(`${targetFolder}/${bundleFileName}`, targetFileContent, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The updated bundle file was saved!");
    }); 
}

function createRequireJsHelp(){
    let bundleHelpText = `Please use this bundle in the RequireJs config, if you want to use the '${bundleFileName}' file:
\`\`\`bash
bundles: {
        "olive.mvc/dist/bundle": [${requireJsBundle.join()}]
    }
\`\`\``;
    fs.writeFile(`${targetFolder}/bundle-requireJs-help.md`, bundleHelpText, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The help file for using the bundling in the requireJs was created!");
    }); 
}

fixBundleFile();