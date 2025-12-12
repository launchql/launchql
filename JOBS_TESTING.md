# Jobs Testing Guide

This document describes how to test the jobs stack end‑to‑end, and how the existing tests are layered across the repositories.

The jobs stack consists of:

- Postgres + `launchql-ext-jobs` (via `@pgpm/database-jobs`)
- `@launchql/knative-job-worker` + `@launchql/job-*` utilities
- Jobs runtime (`knative-job-service`)
- Example function: `functions/simple-email`

All three runtime components (`launchql-server`, `simple-email`, `knative-job-service`) currently use the same Docker image:

```text
ghcr.io/constructive-io/launchql:b88e3d1
```

They differ only by **entrypoint/command**, so they are already running from the same Dockerfile / image.

---

## 1. Database‑level tests (`@pgpm/database-jobs`)

**Location**

- `constructive-db/extensions/@pgpm/database-jobs/__tests__/jobs.test.ts`

**What they cover**

- Schema and function behavior for:
  - `app_jobs.jobs`
  - `app_jobs.scheduled_jobs`
  - `app_jobs.add_job(...)`
  - `app_jobs.add_scheduled_job(...)`
  - `app_jobs.run_scheduled_job(...)`
- Snapshotting of scheduled job rows and key behavior (e.g. `job_key` conflicts).

**How to run**

From `constructive-db/`:

```sh
cd constructive-db/extensions/@pgpm/database-jobs
pnpm test
```

These tests use `pgsql-test` to provision an isolated Postgres instance per run, so they do not depend on Docker.

---

## 2. Worker‑level tests (`@launchql/knative-job-worker`)

**Location**

- `constructive/jobs/knative-job-worker/__tests__/req.test.ts`
- `constructive/jobs/knative-job-worker/__tests__/worker.integration.test.ts`

**What they cover**

- `req.test.ts`
  - Request construction to Knative / gateway:
    - `KNATIVE_SERVICE_URL`
    - `INTERNAL_GATEWAY_URL`
    - `INTERNAL_GATEWAY_DEVELOPMENT_MAP`
  - Headers and body (`X-Worker-Id`, `X-Job-Id`, `X-Database-Id`, `X-Callback-Url`).
  - Error behavior when no base URL envs are set.
- `worker.integration.test.ts`
  - Integration with `app_jobs.add_job(...)` via `pgsql-test` seed:
    - Inserts jobs into `app_jobs.jobs`.
    - Uses `jobUtils.getJob(...)` to fetch work.
    - Calls `worker.doWork(job)` and asserts it posts to the expected Knative URL.
    - Verifies error propagation when the underlying HTTP request fails.

**How to run**

From `constructive/`:

```sh
cd constructive/jobs/knative-job-worker
pnpm test
```

These tests also rely on `pgsql-test` and run entirely in‑process (no Docker needed).

---

## 3. HTTP function tests (`functions/simple-email`)

**Location**

- `constructive/functions/simple-email/src/index.ts`

**Goal**

Add focused tests for the `simple-email` function to ensure:

- Payload validation works as expected (required `to`, `subject`, and at least one of `html`/`text`).
- `MAILGUN_FROM` and optional `from`/`replyTo` are handled correctly.
- `@launchql/postmaster.send` is invoked with the correct arguments.

**Suggested test approach (no code yet)**

- Use an HTTP testing library (e.g. `supertest`) against the exported `app`.
- Mock `@launchql/postmaster`:
  - Assert it is called with the expected `to`, `subject`, `html`/`text`, `from`, and `replyTo`.
- Cover at least:
  - Happy path with `html` only.
  - Happy path with `text` only.
  - Missing required fields (`to`, `subject`).
  - Missing both `html` and `text`.
  - Overriding `MAILGUN_FROM` via payload `from`.

These tests would live alongside the function, e.g.:

- `constructive/functions/simple-email/__tests__/simple-email.test.ts`

and run with whatever test runner is already used in this workspace (`pnpm test` at the workspace or package level).

---

## 4. In‑process end‑to‑end pipeline tests (optional)

To exercise the full pipeline without Docker:

- Use `pgsql-test` to spin up a database with:
  - `launchql-ext-jobs` (via the same seed pattern used in `worker.integration.test.ts`).
- In a Jest test:
  - Start the `simple-email` HTTP app listening on an ephemeral port.
  - Start a `Worker` instance from `@launchql/knative-job-worker` with `tasks: ['simple-email']`.
  - Set env vars to match dev:
    - `PG*`, `JOBS_SCHEMA`
    - `KNATIVE_SERVICE_URL` or `INTERNAL_GATEWAY_DEVELOPMENT_MAP` pointing to the local `simple-email` server.
  - Enqueue a job via `app_jobs.add_job(...)`.
  - Call `jobUtils.getJob(...)` + `worker.doWork(job)` and assert:
    - The job is processed successfully.
    - `simple-email` (via a mocked `sendEmail`) sees the correct payload.

These tests would sit either:

- in a new integration suite under `constructive/jobs/knative-job-worker`, or
- in a dedicated `constructive/jobs/knative-job-service` test directory.

They give you a high‑confidence pipeline test without needing Docker‑compose.

---

## 5. Docker‑based manual and smoke testing

For real Docker runs and manual verification, use the existing jobs dev guide:

- `constructive/DEVELOPMENT_JOBS.md`

That guide covers:

- Starting Postgres + Minio via `docker compose`.
- Initializing the database with `pgpm` (including jobs packages).
- Bringing up the jobs stack via `docker-compose.jobs.yml`.
- Enqueuing a test job with:

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

This is ideal for:

- Local debugging.
- Verifying new Docker images (e.g. switching from `ghcr.io/constructive-io/launchql:b88e3d1` to a local build).
- High‑level smoke tests around deployment changes.

