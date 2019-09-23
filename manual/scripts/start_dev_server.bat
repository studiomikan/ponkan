@echo off
cd /d %~dp0
cd ../
mkdocs serve --dev-addr localhost:8000
@echo on