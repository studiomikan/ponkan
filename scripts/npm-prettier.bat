@echo off
cd /d %~dp0
cd ../
call npm run prettier
@echo on