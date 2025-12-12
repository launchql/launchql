-- Deploy schemas/app_jobs/procedures/complete_jobs to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/job_queues/table
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
CREATE FUNCTION app_jobs.complete_jobs (job_ids bigint[])
  RETURNS SETOF app_jobs.jobs
  LANGUAGE sql
  AS $$
  DELETE FROM app_jobs.jobs
  WHERE id = ANY (job_ids)
    AND (locked_by IS NULL
      OR locked_at < NOW() - interval '4 hours')
  RETURNING
    *;
$$;
COMMIT;

