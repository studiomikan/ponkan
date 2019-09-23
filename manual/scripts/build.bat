@echo off
cd /d %~dp0
cd ../../
call npm run gen-command-ref-md
cd manual
call mkdocs build
@echo on