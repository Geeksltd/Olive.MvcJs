@echo off

ECHO Use Visual Studio Code to edit this project.

ECHO Checking tsc node module is installed globally...

where tsc > nul
if ERRORLEVEL 1 (	
	npm install typescript -g
)

call tsc --project bundle-tsconfig.json

node ./bundling-helper/fix-bundle-modules

pause