-- Deploy schemas/app_jobs/procedures/permanently_fail_jobs to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/job_queues/table
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
CREATE FUNCTION app_jobs.permanently_fail_jobs (job_ids bigint[], error_message text DEFAULT NULL)
  RETURNS SETOF app_jobs.jobs
  LANGUAGE sql
  AS $$
  UPDATE
    app_jobs.jobs
  SET
    last_error = coalesce(error_message, 'Manually marked as failed'),
    attempts = max_attempts
  WHERE
    id = ANY (job_ids)
    AND (locked_by IS NULL
      OR locked_at < NOW() - interval '4 hours')
  RETURNING
    *;
$$;
COMMIT;

