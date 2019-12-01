@echo off
cd /d %~dp0
cd ../
rd /S /Q dist
call npm install
call npm run build
rmdir /S /Q dist\base
rmdir /S /Q dist\filter
rmdir /S /Q dist\layer
rmdir /S /Q dist\tag-actions
rmdir /S /Q dist\plugin
pause
@echo on