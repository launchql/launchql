First initialize the database for testing:

```sh
docker-compose up -d
```

Make sure you have the psql client, and then run this:

```sh
lql admin-users bootstrap --yes
lql admin-users add --test --yes
```

Then you can "install" the packages need:

```sh
docker exec postgres /sql-bin/install.sh
```

Then you can run

```sh
pnpm install
pnpm build
```

Then to run a test:

```sh
cd packages/core
pnpm test
```
