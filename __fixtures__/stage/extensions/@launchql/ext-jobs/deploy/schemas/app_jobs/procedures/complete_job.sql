-- Deploy schemas/app_jobs/procedures/complete_job to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table
-- requires: schemas/app_jobs/tables/job_queues/table

BEGIN;
CREATE FUNCTION app_jobs.complete_job (worker_id text, job_id bigint)
  RETURNS app_jobs.jobs
  LANGUAGE plpgsql
  AS $$
DECLARE
  v_row app_jobs.jobs;
BEGIN
  DELETE FROM app_jobs.jobs
  WHERE id = job_id
  RETURNING
    * INTO v_row;
  IF v_row.queue_name IS NOT NULL THEN
    UPDATE
      app_jobs.job_queues
    SET
      locked_by = NULL,
      locked_at = NULL
    WHERE
      queue_name = v_row.queue_name
      AND locked_by = worker_id;
  END IF;
  RETURN v_row;
END;
$$;
COMMIT;

