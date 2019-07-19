@echo off
cd /d %~dp0
cd ../../
npm run gen-command-ref-md
cd manual
mkdocs build
@echo on