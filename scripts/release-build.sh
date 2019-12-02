#!/bin/sh
cd `dirname $0`
cd ../
rm -rf dist
npm install
npm run build
rm -rf dist/base
rm -rf dist/filter
rm -rf dist/layer
rm -rf dist/tag-actions
rm -rf dist/plugin

