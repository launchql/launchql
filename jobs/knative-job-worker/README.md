# knative-job-worker

Knative-compatible job worker that uses the existing LaunchQL PostgreSQL job queue and job utilities, invoking HTTP functions via `KNATIVE_SERVICE_URL` (or `INTERNAL_GATEWAY_URL` as a fallback) while preserving the same headers and payload shape as the OpenFaaS worker.
