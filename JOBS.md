# LaunchQL Jobs (Knative)

This document describes the **current** jobs setup using:

- PostgreSQL + `launchql-ext-jobs` (`app_jobs.*`)
- `@launchql/knative-job-service` + `@launchql/knative-job-worker`
- Knative functions (example: `simple-email`)

> The old OpenFaaS-based flow that used `@launchql/openfaas-job-worker` is now legacy.

---

## 1. Database: jobs extension

Jobs live entirely in Postgres, provided by the `launchql-ext-jobs` extension.

Key pieces:

- Schema: `app_jobs`
- Tables:
  - `app_jobs.jobs` – queued / running jobs
  - `app_jobs.scheduled_jobs` – cron-like scheduled jobs
- Functions:
  - `app_jobs.add_job(...)`
  - `app_jobs.add_scheduled_job(...)`
  - `app_jobs.get_job(...)`
  - `app_jobs.get_scheduled_job(...)`
  - `app_jobs.complete_job(...)`
  - `app_jobs.fail_job(...)`
  - `app_jobs.run_scheduled_job(...)`

Install the extension into your **app database** (the same DB your LaunchQL API uses). In SQL:

```sql
CREATE EXTENSION IF NOT EXISTS launchql-ext-jobs;
```

Once installed you should see:

```sql
\dt app_jobs.*
```

and at least `app_jobs.jobs` and `app_jobs.scheduled_jobs` present.

---

## 2. Knative job worker + service

The jobs runtime consists of:

- `@launchql/knative-job-service`
  - Starts:
    - an HTTP callback server (`@launchql/knative-job-server`)
    - a Knative job worker (`@launchql/knative-job-worker`)
    - a scheduler (`@launchql/job-scheduler`)
- `@launchql/knative-job-worker`
  - Polls `app_jobs.jobs` for work
  - For each job, `POST`s to `${KNATIVE_SERVICE_URL}/${task_identifier}`
  - Uses `X-Worker-Id`, `X-Job-Id`, `X-Database-Id` headers and JSON payload

### Required env vars (knative-job-service)

From `jobs/knative-job-service/src/env.ts`:

- Postgres
  - `PGUSER` – DB user
  - `PGHOST` – DB host
  - `PGPASSWORD` – DB password
  - `PGPORT` – DB port (default `5432`)
  - `PGDATABASE` – the app DB that has `launchql-ext-jobs` installed
  - `JOBS_SCHEMA` – schema for jobs (default `app_jobs`)

- Worker configuration
  - `JOBS_SUPPORT_ANY` – `true` to accept all tasks, `false` to restrict
  - `JOBS_SUPPORTED` – comma-separated list of task names if `JOBS_SUPPORT_ANY=false`
  - `HOSTNAME` – worker/scheduler ID (used in logs and job-utils)

- Callback server
  - `INTERNAL_JOBS_CALLBACK_PORT` – port to bind the callback HTTP server (default `12345`)
  - `INTERNAL_JOBS_CALLBACK_URL` – full URL to that server, e.g.  
    `http://knative-job-service.interweb.svc.cluster.local:8080`

- Function gateway
  - `KNATIVE_SERVICE_URL` – base URL for Knative functions, e.g.  
    `http://simple-email.interweb.svc.cluster.local`
  - `INTERNAL_GATEWAY_URL` – fallback used by the worker; set this equal to `KNATIVE_SERVICE_URL` to keep env validation happy

---

## 3. Example function: `simple-email` (dry-run)

The `functions/simple-email` package is a **Knative function** that:

- Uses `@launchql/knative-job-fn` as the HTTP wrapper
- Expects JSON payload:

```json
{
  "to": "user@example.com",
  "subject": "Hello from jobs",
  "html": "<p>Hi from simple-email</p>"
}
```

- Validates `to`, `subject`, and at least one of `html` or `text`
- Logs the email and payload, but does **not** send anything:

```ts
console.log('[simple-email] DRY RUN email', { ... });
console.log('[simple-email] DRY RUN payload', payload);
res.status(200).json({ complete: true });
```

It also starts an HTTP server when run directly (for Knative):

```ts
if (require.main === module) {
  const port = Number(process.env.PORT ?? 8080);
  (app as any).listen(port, () => {
    console.log(`[simple-email] listening on port ${port}`);
  });
}
```

### Knative Service (simple-email)

Example Knative `Service` manifest:

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: simple-email
  namespace: interweb
spec:
  template:
    spec:
      containers:
      - name: simple-email
        image: ghcr.io/constructive-io/constructive:<tag>
        command: ["node"]
        args: ["functions/simple-email/dist/index.js"]
        ports:
        - containerPort: 8080
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
```

With this in place, the in-cluster URL is:

```text
http://simple-email.interweb.svc.cluster.local
```

and the worker will call:

```text
POST http://simple-email.interweb.svc.cluster.local/simple-email
```

---

## 4. Enqueue a job (simple-email)

To enqueue a job directly via SQL:

```sql
SELECT app_jobs.add_job(
  '00000000-0000-0000-0000-000000000001'::uuid,  -- database_id (any UUID; used for multi-tenant routing)
  'simple-email',                                -- task_identifier (must match function name)
  json_build_object(
    'to',      'user@example.com',
    'subject', 'Hello from LaunchQL jobs',
    'html',    '<p>Hi from simple-email (dry run)</p>'
  )::json                                         -- payload
);
```

Flow:

1. `app_jobs.add_job` inserts into `app_jobs.jobs` and fires `NOTIFY "jobs:insert"`.
2. `@launchql/knative-job-worker` receives the notification, calls `getJob`, and picks up the row.
3. The worker `POST`s the payload to `KNATIVE_SERVICE_URL + '/simple-email'`.
4. `simple-email` logs the email and payload, then returns `{ complete: true }`.
5. The worker logs success. (In the current Knative flow we rely on immediate responses; callback-based completion can be added later if needed.)

You can inspect the queue directly:

```sql
SELECT
  id,
  task_identifier,
  attempts,
  max_attempts,
  last_error,
  locked_by,
  locked_at,
  run_at,
  created_at,
  updated_at
FROM app_jobs.jobs
ORDER BY id DESC;
```

Completed jobs are removed from `app_jobs.jobs` by the completion logic; failed jobs with retries will show a `last_error` and incremented `attempts`.

---

## 5. Scheduled jobs (optional)

You can also use `app_jobs.scheduled_jobs` and `@launchql/job-scheduler` to run recurring jobs.

Example (generic, not specific to `simple-email`):

```sql
SELECT app_jobs.add_scheduled_job(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'some-task-name',
  json_build_object('foo', 'bar'),
  json_build_object(
    'start', NOW(),
    'end',   NOW() + '1 day'::interval,
    'rule',  '*/5 * * * *'   -- every 5 minutes (cron rule)
  )
);
```

The scheduler will:

1. Read from `app_jobs.scheduled_jobs`.
2. Use `app_jobs.run_scheduled_job` to materialize real jobs into `app_jobs.jobs`.
3. The worker then processes them like any other job.

Inspect scheduled jobs:

```sql
SELECT
  id,
  task_identifier,
  payload,
  schedule_info,
  last_scheduled,
  last_scheduled_id
FROM app_jobs.scheduled_jobs
ORDER BY id DESC;
```

---

## 6. Legacy OpenFaaS notes

The previous OpenFaaS-based setup (gateway, `OPENFAAS_URL`, `@launchql/openfaas-job-worker`, etc.) is no longer the primary path and has been removed from this guide. If you need those details for migration or debugging, refer to the git history of this file prior to the Knative migration. 
