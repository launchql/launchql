# jobs

## getting started

### install openfaas on your kubernetes cluster

https://www.openfaas.com/

### install tables into Postges

make sure you have `lql` installed 

```sh
npm install -g @launchql/cli
```

make sure you have the jobs SQL installed in your Postgres database 

```sh
git clone https://github.com/pyramation/pg-utils
cd pg-utils
lql deploy --recursive --createdb --database jobs --yes --project launchql-extension-jobs
```

### deploy job worker

create a deployment that runs `@launchql/openfaas-job-worker` using nodejs in k8s

```sh
kubectl apply -f ./k8s/service.yaml
kubectl apply -f ./k8s/deployment.yaml
```

### build and deploy cloud functions

```sh
kubectl port-forward -n openfaas svc/gateway-external 8080:8080

export OPENFAAS_URL=gateway-external.openfaas.svc.cluster.local:8080

yarn build
faas build -f stack.prod.yml 
faas push -f stack.prod.yml 
faas remove -f stack.prod.yml 
faas deploy -f stack.prod.yml 
```

call it!

```
http://gateway-external.openfaas.svc.cluster.local:8080/function/hello-openfaas
```

### logging

```sh
pod-logs webinc job-worker
pod-logs openfaas-fn example-fn
```

## insert a job

```sql
SELECT app_jobs.add_job('example-fn', json_build_object('hello', 'world!'));
```

### more in depth setup

It's a bit hacky, but it was the most secure and consistent way for BOTH dev + prod I could figure it out.

First edit your `/etc/hosts` file:

```
127.0.0.1 gateway-external.openfaas.svc.cluster.local
```

the deploy requires that you have `OPENFAAS_URL=gateway-external.openfaas.svc.cluster.local:8080`, which means you should proxy the openfaas gateway if it's not exposed:

```sh
kubectl port-forward -n openfaas svc/gateway-external 8080:8080
```

Then you can build

```sh
yarn build:dev
yarn remove:dev
yarn deploy:dev
```

If you need to login, 

```sh
echo -n $PASSWORD | faas-cli login --username $USER --password-stdin
```

Or you can specify your gateway

```sh
echo -n $PASSWORD | faas-cli login --username $USER --password-stdin --gateway 127.0.0.1:31112
```

### TODOs

- [ ] check if openfaas is up and running before attempting to request 

