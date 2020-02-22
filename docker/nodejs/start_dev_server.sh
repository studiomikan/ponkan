#!/bin/bash
cd `dirname $0`
cd ../
npm install

if [ "${MANUAL}" = "1" ] ; then
  tail -f /dev/null
else
  npm start
fi
