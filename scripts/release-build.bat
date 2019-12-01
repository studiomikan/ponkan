@echo off
cd /d %~dp0
cd ../
rd /S /Q dist
call npm install
call npm run build
rmdir /S /Q dist\d.ts
pause
@echo on