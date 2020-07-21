# jobs



## openfaas job worker

```sh
export INTERNAL_GATEWAY_URL=http://gateway-external.openfaas.svc.cluster.local:31112
export SUPPORTED_JOBS=example-fn
export PGDATABASE=jobs

yarn run watch
```