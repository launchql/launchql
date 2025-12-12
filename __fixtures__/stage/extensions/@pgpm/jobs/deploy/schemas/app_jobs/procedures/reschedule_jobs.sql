-- Deploy schemas/app_jobs/procedures/reschedule_jobs to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
-- NOTE this should be renamed to reset_jobs to avoid confusion of scheduled jobs
CREATE FUNCTION app_jobs.reschedule_jobs (job_ids bigint[], run_at timestamptz DEFAULT NULL, priority integer DEFAULT NULL, attempts integer DEFAULT NULL, max_attempts integer DEFAULT NULL)
  RETURNS SETOF app_jobs.jobs
  LANGUAGE sql
  AS $$
  UPDATE
    app_jobs.jobs
  SET
    run_at = coalesce(reschedule_jobs.run_at, jobs.run_at),
    priority = coalesce(reschedule_jobs.priority, jobs.priority),
    attempts = coalesce(reschedule_jobs.attempts, jobs.attempts),
    max_attempts = coalesce(reschedule_jobs.max_attempts, jobs.max_attempts)
  WHERE
    id = ANY (job_ids)
    AND (locked_by IS NULL
      OR locked_at < NOW() - interval '4 hours')
  RETURNING
    *;
$$;
COMMIT;

