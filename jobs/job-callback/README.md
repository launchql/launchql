# @launchql/job-callback

Internal callback HTTP service for LaunchQL jobs. This service is neutral and works with both:

- OpenFaaS async functions (platform calls the callback URL supplied by the worker)
- Knative functions (function code posts back to this callback when done)

## Endpoint

- `POST /callback`
  - Headers:
    - `x-job-id`: string (required)
    - `x-worker-id`: string (required)
  - Body JSON:
    - `{ "status": "success" }` OR `{ "status": "error", "error": "..." }`

Semantics:
- success → marks job complete
- error → marks job failed and stores the error message

## Env
- `INTERNAL_JOBS_CALLBACK_PORT` (optional): port to listen on (default 12345)
- Standard PG* env vars or LaunchQL env for DB connection

## Run (dev)

```
pnpm -w -F @launchql/job-callback build
node launchql/jobs/job-callback/src/run.ts
```

This starts the callback on `http://localhost:12345/callback` by default.

## Wiring
- Worker sets the `x-callback-url` header for executors. By default it uses `JOBS_CALLBACK_BASE_URL` if provided, otherwise `http://jobs-callback:<port>/callback` where `<port>` is `INTERNAL_JOBS_CALLBACK_PORT`.
- OpenFaaS executor passes this header to the platform (OpenFaaS async callback).
- Knative executor passes the header to function code; the function should POST back to this URL when done.
