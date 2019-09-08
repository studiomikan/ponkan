@echo off
@setlocal
cd /d %~dp0
cd ../

set DIR_NAME=
set /P DIR_NAME="Game folder name: "
echo %DIR_NAME%

if "%DIR_NAME%" EQU "" (goto EXIT)

echo Start copy files.
xcopy game_template "games\%DIR_NAME%" /D /S /R /Y /I /K /Q
del "games\%DIR_NAME%\public\README.txt" /Q /F
xcopy dist "games\%DIR_NAME%\public" /D /S /R /Y /I /K /Q

echo File copy completed! game folder: "game/%DIR_NAME%"
echo Please open game folder and run start.bat

:EXIT
@echo on
@pause