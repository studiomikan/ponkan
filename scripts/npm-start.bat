@echo off
cd /d %~dp0
cd ../
call npm install
call npm start
@echo on