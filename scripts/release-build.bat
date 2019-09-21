@echo off
cd /d %~dp0
cd ../
rd /S /Q dist
call npm install
call npm run release
pause
@echo on