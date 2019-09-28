#!/bin/sh
cd `dirname $0`
cd ../

DIR_NAME=
echo Game directory name:
read DIR_NAME
echo $DIR_NAME

if [ "$DIR_NAME" != "" ]; then
  echo Start copy files.
  cp -r game_template "games/$DIR_NAME"
  rm -f "games/$DIR_NAME/public/README.txt"
  cp -r dist/ "games/$DIR_NAME/public"
  echo File copy completed! game directory: "game/%DIR_NAME%"
  echo Please open game directory and run start.sh
fi
