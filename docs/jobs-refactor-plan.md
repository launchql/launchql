# LaunchQL Jobs Refactor (OpenFaaS → Knative, typed, minimal runtime change)

This document captures the current shape of the jobs framework in the `launchql` repo, the constraints, and an incremental plan to modernize it. The refactor keeps SQL semantics intact (FOR UPDATE SKIP LOCKED, attempts/max_attempts, schedules) and minimizes runtime change to the Worker loop.

## Goals
- Canonicalize on the `database_jobs` queue (multi‑tenant via `database_id`).
- Keep current SQL and retry semantics; do not change behavior.
- Introduce a typed DB boundary for job operations, living in `packages/core` (not a new package).
- Decouple execution from OpenFaaS by adding a JobExecutor interface; add a Knative executor while keeping the existing OpenFaaS path intact during transition.
- Make the callback HTTP server neutral (works for Knative and OpenFaaS).
- Do not create new packages; changes live in `packages/core` and `jobs/*` only.

## Current State (mapped)
- DB queue SQL (LaunchQL extension):
  - `launchql/extensions/@launchql/ext-jobs/sql/launchql-ext-jobs--*.sql`
  - Objects: `app_jobs.jobs`, `app_jobs.scheduled_jobs`, functions: `get_job`, `get_scheduled_job`, `complete_job`, `fail_job`, `add_job`, `add_scheduled_job`, `run_scheduled_job`, notify triggers (`jobs:insert`, `scheduled_jobs:insert`).
- Jobs runtime (Node):
  - `launchql/jobs/job-utils`: thin wrappers around SQL; schema resolved via env (`JOBS_SCHEMA`, defaults to `app_jobs`). Includes OpenFaaS gateway/callback config helpers.
  - `launchql/jobs/job-worker`: Worker loop (LISTEN "jobs:insert", poll → lock → doWork → complete/fail).
  - `launchql/jobs/job-scheduler`: schedules → enqueues jobs.
  - `launchql/jobs/openfaas-*`: callback server, function template, example, worker (historical OpenFaaS flow).
- Supporting utilities:
  - `launchql/packages/pg-env`, `pg-cache`, `env`, `types`.

## Invariants / Constraints
- Keep SQL signatures and behavior. Do not touch the queue algorithms.
- Keep LISTEN/NOTIFY and the Worker’s loop behavior.
- No new packages; add code in `packages/core` (typed boundary) and `jobs/*` only.
- Multi‑tenancy must remain intact (`database_id` chained from triggers → worker → headers → functions).

## Proposed Architecture (minimal deltas)
- Typed DB layer in `packages/core/src/jobs/db.ts`:
  - `getJob(pool, { workerId, supportedTaskNames|null, jobExpiryInterval?, schema? })` → `JobRow|null`
  - `getScheduledJob`, `completeJob`, `failJob`, `addJob`, `addScheduledJob`, `runScheduledJob`, `releaseJobs`, `releaseScheduledJobs`.
  - `JobRow`/`ScheduledJobRow` typedefs closely mirror ext‑jobs SQL.
- Worker execution abstraction in `jobs/job-worker`:
  - Introduce `JobExecutor` interface.
  - Default executor wraps existing OpenFaaS call (no behavior change).
  - Add a Knative executor (cluster‑local ksvc URL), toggle via env/config.
- Neutral callback service:
  - Reuse existing callback server code; expose `POST /callback` with body `{ status: 'success'|'error', error? }` + headers `x-job-id`, `x-worker-id`.
  - Keep internal‑only exposure; no public ingress.
- Env resolution:
  - Use `@launchql/env` + `pg-env` in existing modules (no new package). Add neutral helpers: `getCallbackBaseUrl`, `getJobsCallbackPort` (already partially present) in `job-utils`.

## Phase Plan (incremental, reversible)

### Phase 0 — Guardrails & Acceptance
- No renames of directories in this phase.
- No removal of OpenFaaS packages; the new path coexists.

### Phase 1 — Typed DB layer in core (no runtime change)
- Add `packages/core/src/jobs/db.ts` (types + SQL wrappers).
- Add `packages/core/src/jobs/types.ts` with `JobRow`/`ScheduledJobRow`.
- Update `jobs/job-utils/src/index.ts` to import from `packages/core/src/jobs/db` instead of any ad‑hoc SQL. Keep existing API.

Deliverables:
- New core files, no behavior change.

### Phase 2 — Worker execution abstraction (compatible default)
- In `jobs/job-worker`:
  - Add `JobExecutor` interface.
  - Keep current HTTP call path as `OpenFaasExecutor` (uses existing `req.ts`/gateway helpers).
  - Worker constructor accepts optional `executor`, defaults to `OpenFaasExecutor` → no behavior change.
- Ensure headers include: `x-worker-id`, `x-job-id`, `x-database-id`, placeholder `x-current-user-id`, `x-callback-url`.

Deliverables:
- Refactored worker with same runtime behavior by default.

### Phase 3 — Knative executor (opt‑in)
- In `jobs/job-worker/src/executors/knative.ts`:
  - `KnativeJobExecutor` posts to `http://<task>.<namespace>.svc.cluster.local/` with JSON payload and standard headers.
- Config switch (env or option) to use Knative executor in dev/staging; default remains OpenFaaS until rollout.

Deliverables:
- Optional executor; no default behavior change.

### Phase 4 — Neutral callback
- Add `jobs/job-callback` (or adapt existing server) to accept POST `/callback` and call core DB wrappers.
- Wire up headers/body parsing for both executors.

Deliverables:
- A single internal callback path regardless of executor.

### Phase 5 — Documentation & DX
- Add `docs/jobs-knative.md` in `launchql/docs` with:
  - Data flow
  - Trigger example
  - Minimal Knative function example
  - How to run worker + callback in dev

### Phase 6 — Migration & (eventual) cleanup
- After validation, flip default executor to Knative.
- Mark OpenFaaS packages as deprecated; keep for a while.
- Only after acceptance, consider directory renames.

## Rollback
- Phases are isolated; revert a phase without affecting prior ones.
- By default, OpenFaaS executor remains the runtime path until we flip the switch.

## Next Actions (proposed to implement immediately)
1. Implement Phase 1 (typed DB in `packages/core/src/jobs/db.ts`, no behavior change).
2. Wire `jobs/job-utils` to these wrappers (keeping public API intact).
3. Submit for review; then proceed to Phase 2 (Worker executor abstraction) with default OpenFaaS executor.

