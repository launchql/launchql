-- Deploy schemas/app_jobs/procedures/release_jobs to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table
-- requires: schemas/app_jobs/tables/job_queues/table

BEGIN;
CREATE FUNCTION app_jobs.release_jobs (worker_id text)
  RETURNS void
  AS $$
DECLARE
BEGIN
  -- clear the job
  UPDATE
    app_jobs.jobs
  SET
    locked_at = NULL,
    locked_by = NULL,
    attempts = GREATEST (attempts - 1, 0)
  WHERE
    locked_by = worker_id;
  -- clear the queue
  UPDATE
    app_jobs.job_queues
  SET
    locked_at = NULL,
    locked_by = NULL
  WHERE
    locked_by = worker_id;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;
COMMIT;

