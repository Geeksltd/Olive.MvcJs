@echo off

ECHO Use Visual Studio Code to edit this project.

where yarn > nul
if ERRORLEVEL 1 (
    echo yarn is required. Install from https://classic.yarnpkg.com/
    exit /b 1
)

call yarn install --frozen-lockfile
if ERRORLEVEL 1 call yarn install

call yarn build:bundle

pause
