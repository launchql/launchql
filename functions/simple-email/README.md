# @launchql/simple-email-fn

Simple Knative-compatible email function used with the LaunchQL jobs system.

This function is intentionally minimal: it reads an email payload from the job
body and **logs it only** (dry‑run mode). It does **not** send any email. This
is useful while wiring up jobs and Knative without needing a real mail
provider configured.

## Expected job payload

Jobs should use `task_identifier = 'simple-email'` (or whatever route you
configure at your Knative gateway) and a JSON payload like:

```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "html": "<p>Welcome to our app</p>"
}
```

Supported fields:

- `to` (string, required)
- `subject` (string, required)
- `html` (string, optional)
- `text` (string, optional)
- `from` (string, optional)
- `replyTo` (string, optional)

At least one of `html` or `text` must be provided. If required fields are
missing, the function throws and the error is propagated via the
`@launchql/knative-job-fn` wrapper as a job error.

## HTTP contract (with knative-job-worker)

The function is wrapped by `@launchql/knative-job-fn`, so it expects:

- HTTP method: `POST`
- Body: JSON job payload (see above)
- Headers (set by `@launchql/knative-job-worker`):
  - `X-Worker-Id`
  - `X-Job-Id`
  - `X-Database-Id`
  - `X-Callback-Url`

The handler:

1. Reads the email data directly from the request body.
2. Logs the email metadata (to/subject/from, and whether html/text are present)
   and the full payload.
3. Responds with HTTP 200 and:

```json
{ "complete": true }
```

Errors bubble into the error middleware installed by
`@launchql/knative-job-fn`, so they are translated into an `X-Job-Error`
callback for the worker.

## Environment variables

This function does **not** depend on any GraphQL or email provider
configuration. There are currently **no required environment variables** for
its core behavior; it will simply log the email payload and return a successful
response.

## Building locally

From the repo root:

```bash
pnpm --filter="@launchql/simple-email-fn" build
```

This compiles TypeScript into `dist/`.
