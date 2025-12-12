-- Deploy schemas/app_jobs/procedures/get_scheduled_job to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/scheduled_jobs/table

BEGIN;
CREATE FUNCTION app_jobs.get_scheduled_job (worker_id text, task_identifiers text[] DEFAULT NULL)
  RETURNS app_jobs.scheduled_jobs
  LANGUAGE plpgsql
  AS $$
DECLARE
  v_job_id bigint;
  v_row app_jobs.scheduled_jobs;
BEGIN

  --

  IF worker_id IS NULL THEN
    RAISE exception 'INVALID_WORKER_ID';
  END IF;

  --

  SELECT
    scheduled_jobs.id INTO v_job_id
  FROM
    app_jobs.scheduled_jobs
  WHERE (scheduled_jobs.locked_at IS NULL)
    AND (task_identifiers IS NULL
      OR task_identifier = ANY (task_identifiers))
  ORDER BY
    priority ASC,
    id ASC
  LIMIT 1
  FOR UPDATE
    SKIP LOCKED;

  --

  IF v_job_id IS NULL THEN
    RETURN NULL;
  END IF;

  --

  UPDATE
    app_jobs.scheduled_jobs
  SET
    locked_by = worker_id,
    locked_at = NOW()
  WHERE
    id = v_job_id
  RETURNING
    * INTO v_row;

  --

  RETURN v_row;
END;
$$;
COMMIT;

