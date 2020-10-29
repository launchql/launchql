#!/usr/bin/env bash

function installit {
  DIR=$(pwd)

  if [ -d "$1" ]
  then
    echo "SQL Module Directory $1 exists."
    echo $1
    cd $1
    for x in $(ls -d */)
    do
      cd $x
      make install
      cd ../
    done
    cd $DIR
  else
    echo "Error: SQL MODULE Directory $1 does not exist, don't worry, moving on."
  fi

}

installit /sql-extensions
installit /sql-packages
