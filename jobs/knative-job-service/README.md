# knative-job-service

Knative-based job service that starts:

- the callback HTTP server (internal-only), and
- a Worker polling Postgres and invoking Knative services per task.

