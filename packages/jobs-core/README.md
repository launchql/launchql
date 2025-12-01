# @launchql/jobs-core

Typed DB helpers for LaunchQL jobs using the `database_jobs`/`jobs` PGPM modules.

Includes strongly-typed wrappers for:
- `get_job`, `get_scheduled_job`
- `complete_job`, `fail_job`
- `add_job`, `add_scheduled_job`, `run_scheduled_job`
- `release_jobs`, `release_scheduled_jobs`

All functions default to the `app_jobs` schema and preserve the SQL semantics (including `FOR UPDATE SKIP LOCKED`).

