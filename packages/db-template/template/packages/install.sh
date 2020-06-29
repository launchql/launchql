#!/usr/bin/env bash

function installit {
  DIR=$(pwd)

  echo $1
  cd $1
  for x in $(ls -d */)
  do
   cd $x
   make install
   cd ../
  done

  cd $DIR
}

installit /sql-extensions
installit /sql-modules
