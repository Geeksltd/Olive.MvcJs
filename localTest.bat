call tsc

xcopy /y /s dist\*.* C:\Projects\Olive.Templates\MvcFull\Template\Website\wwwroot\lib\olive.mvc\dist\
xcopy /y /s src\*.* C:\Projects\Olive.Templates\MvcFull\Template\Website\wwwroot\lib\olive.mvc\src\

xcopy /y /s src\*.* C:\Projects\Geeks.MS\Hub\Website\wwwroot\lib\olive.mvc\src\
xcopy /y /s dist\*.* C:\Projects\Geeks.MS\Hub\Website\wwwroot\lib\olive.mvc\dist\
xcopy /y /s typings\*.* C:\Projects\Geeks.MS\Hub\Website\wwwroot\lib\olive.mvc\typings\
xcopy /y /s typings-lib\*.* C:\Projects\Geeks.MS\Hub\Website\wwwroot\lib\olive.mvc\typings-lib\