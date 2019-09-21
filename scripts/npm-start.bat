@echo off
cd /d %~dp0
cd ../
rd /S /Q dist_dev
call npm install
call npm start
@echo on