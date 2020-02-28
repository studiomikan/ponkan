#!/bin/bash
cd `dirname $0`
cd ../
npm install

echo MANUAL:$MANUAL
if [ "${MANUAL}" = "1" ] ; then
  tail -f /dev/null
else
  npm start
fi
