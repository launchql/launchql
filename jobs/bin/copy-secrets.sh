#!/bin/bash

if [ -z "$3" ]
then
  echo copy-secrets.sh secret-name ns1 ns2
  exit 1
fi

SECRET_NAME=$1
NS1=$2
NS2=$3

kubectl get secret $SECRET_NAME --namespace=$NS1 -oyaml | grep -v '^\s*namespace:\s' | kubectl apply --namespace=$NS2 -f -
