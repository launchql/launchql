-- Deploy schemas/app_jobs/procedures/get_job to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/job_queues/table
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
CREATE FUNCTION app_jobs.get_job (worker_id text, task_identifiers text[] DEFAULT NULL, job_expiry interval DEFAULT '4 hours')
  RETURNS app_jobs.jobs
  LANGUAGE plpgsql
  AS $$
DECLARE
  v_job_id bigint;
  v_queue_name text;
  v_row app_jobs.jobs;
  v_now timestamptz = now();
BEGIN
  IF worker_id IS NULL THEN
    RAISE exception 'INVALID_WORKER_ID';
  END IF;
  SELECT
    jobs.queue_name,
    jobs.id INTO v_queue_name,
    v_job_id
  FROM
    app_jobs.jobs
  WHERE (jobs.locked_at IS NULL
    OR jobs.locked_at < (v_now - job_expiry))
    AND (jobs.queue_name IS NULL
      OR EXISTS (
        SELECT
          1
        FROM
          app_jobs.job_queues
        WHERE
          job_queues.queue_name = jobs.queue_name
          AND (job_queues.locked_at IS NULL
            OR job_queues.locked_at < (v_now - job_expiry))
        FOR UPDATE
          SKIP LOCKED))
    AND run_at <= v_now
    AND attempts < max_attempts
    AND (task_identifiers IS NULL
      OR task_identifier = ANY (task_identifiers))
  ORDER BY
    priority ASC,
    run_at ASC,
    id ASC
  LIMIT 1
  FOR UPDATE
    SKIP LOCKED;
  IF v_job_id IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_queue_name IS NOT NULL THEN
    UPDATE
      app_jobs.job_queues
    SET
      locked_by = worker_id,
      locked_at = v_now
    WHERE
      job_queues.queue_name = v_queue_name;
  END IF;
  UPDATE
    app_jobs.jobs
  SET
    attempts = attempts + 1,
    locked_by = worker_id,
    locked_at = v_now
  WHERE
    id = v_job_id
  RETURNING
    * INTO v_row;
  RETURN v_row;
END;
$$;
COMMIT;

