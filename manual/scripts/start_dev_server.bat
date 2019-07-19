@echo off
cd /d %~dp0
cd ../
mkdocs serve --dev-addr 0.0.0.0:8000
@echo on