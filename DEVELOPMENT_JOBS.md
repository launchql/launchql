# Jobs Development Setup

This guide covers a local development workflow for the jobs stack:

- Postgres + `launchql-ext-jobs`
- LaunchQL API server
- `simple-email` function
- `knative-job-service`

It assumes:

- You have Docker / Docker Compose v2 installed.
- You are using `pgpm` (not `lql`) for database initialization.
- You have the latest `pgpm` installed (`npm i -g pgpm` or equivalent).

---

## 1. Start Postgres (and Minio)

From the `constructive/` directory:

```sh
docker compose up -d postgres
```

This uses `docker-compose.yml` and creates a Docker network called `constructive-net` that other services will join.

---

## 2. Configure your local Postgres env (pgenv)

Add this helper to your shell config (for example in `~/.zshrc`):

```sh
pgenv() {
  export PGHOST=localhost
  export PGPORT=5432
  export PGUSER=postgres
  export PGPASSWORD=password
  export PGDATABASE=launchql
  echo "PostgreSQL environment variables set"
}
```

Then in a new shell (or after re-sourcing `~/.zshrc`), run:

```sh
pgenv
```

This ensures all subsequent `pgpm` and `psql` commands point at the same local database.

---

## 3. Bootstrap roles and database with pgpm

Make sure `pgpm` is installed and up to date.

From the `constructive/` directory (with `pgenv` applied):

1. Bootstrap admin users:

   ```sh
   pgpm admin-users bootstrap --yes
   pgpm admin-users add --test --yes
   ```

2. Create the `launchql` database (if it does not already exist):

   ```sh
   createdb launchql
   ```

3. Deploy the main app and jobs packages into `launchql`:

   ```sh
   pgpm deploy --yes --database "$PGDATABASE" --package app-svc-local
   pgpm deploy --yes --database "$PGDATABASE" --package db-meta
   pgpm deploy --yes --database "$PGDATABASE" --package launchql-database-jobs
   ```

At this point, the app schema and `database-jobs` should be installed and `app_jobs.*` should be available in the `launchql` database.

---

## 4. Start jobs stack (API + worker + function)

With Postgres initialized, bring up the jobs-related services using `docker-compose.jobs.yml`:

```sh
docker compose -f docker-compose.jobs.yml up
```

Or run detached:

```sh
docker compose -f docker-compose.jobs.yml up -d
```

This starts:

- `launchql-server` – GraphQL API server
- `simple-email` – Knative-style HTTP function
- `knative-job-service` – jobs runtime (callback server + worker + scheduler)

By default, all three services use the published image:

```text
ghcr.io/constructive-io/launchql:b88e3d1
```

If you want to test a local build instead, build the image from the `constructive/` workspace and update `image:` in `docker-compose.jobs.yml` to point to your local tag, for example:

```sh
docker build -t constructive-local .
```

Then in `docker-compose.jobs.yml`:

```yaml
image: constructive-local
```

All services are attached to the shared `constructive-net` network and talk to the `postgres` container by hostname `postgres`.

---

## 5. Enqueue a test job (simple-email)

With the jobs stack running, you can enqueue a test job from your host into the Postgres container:

```sh
docker exec -it postgres \
  psql -U postgres -d launchql -c "
    SELECT app_jobs.add_job(
      '00000000-0000-0000-0000-000000000001'::uuid,
      'simple-email',
      json_build_object(
        'to',      'user@example.com',
        'subject', 'Hello from LaunchQL jobs',
        'html',    '<p>Hi from simple-email (dry run)</p>'
      )::json
    );
  "
```

You should then see the job picked up by `knative-job-service` and the email payload logged by the `simple-email` container in `docker compose -f docker-compose.jobs.yml logs -f`.

---

## 6. Inspect logs and iterate

To watch logs while you develop:

```sh
docker compose -f docker-compose.jobs.yml logs -f
```

Useful containers:

- `launchql-server`
- `simple-email`
- `knative-job-service`
- `postgres` (from `docker-compose.yml`)

If you change Docker images, environment variables, or code inside the image, restart the stack:

```sh
docker compose -f docker-compose.jobs.yml down
docker compose -f docker-compose.jobs.yml up --build
```

---

## 7. Stopping services

To stop only the jobs stack:

```sh
docker compose -f docker-compose.jobs.yml down
```

To stop everything, including Postgres and Minio:

```sh
docker compose down
```
