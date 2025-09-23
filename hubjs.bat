
set ROOT=D:\Repositories

set MVCJS=%ROOT%\Olive.MvcJs

set HUBJS=%ROOT%\Olive.Microservices.HubJs
set HUBJSLIB=%HUBJS%\lib\olive.mvc
set HUBJSBUNDLING=%HUBJS%\src\bundling
set HUBJSDIST=%HUBJS%\dist

set HUBLIB=%ROOT%\hub\Website\wwwroot\lib\olive.microservices.hubjs\dist

@REM Build mvcjs project
cd "%MVCJS%"
call tsc
call tsc --project bundle-tsconfig.json

@REM Copy mvcjs to hubjs project
xcopy "%MVCJS%" "%HUBJSLIB%" /E /I /H /Y >nul
cd "%HUBJS%"
call tsc
cd %HUBJSBUNDLING%
call minify-js.bat

@REM Copy bundled files and ts types to hub project
xcopy "%HUBJSDIST%" "%HUBLIB%" /E /I /H /Y >nul

cd %MVCJS%

echo Done, HubJs updated, Hub updated.
pause