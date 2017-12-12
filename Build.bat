@echo off

ECHO Checking tsc node module is installed globally...

where tsc > nul
if ERRORLEVEL 1 (	
	npm install typescript -g
)

tsc
