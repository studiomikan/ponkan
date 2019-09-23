#!/bin/sh

cd `dirname $0`
cd ../
mkdocs serve --dev-addr localhost:8000
