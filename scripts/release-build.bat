@echo off
cd /d %~dp0
cd ../
call npm install
call npm run release
pause
@echo on