First initialize the database for testing:

```sh
docker-compose up -d
```

Make sure you have the psql client, and then run this:

```sh
psql < bootstrap-roles.sql
```

Then you can "install" the packages need:

```sh
docker exec postgres /sql-bin/install.sh
```

Then you can run 

```sh
yarn
yarn build
```

Then to run a test:

```sh
cd packages/migrate
yarn test
```

