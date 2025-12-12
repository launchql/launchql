-- Deploy schemas/app_jobs/procedures/run_scheduled_job to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table
-- requires: schemas/app_jobs/tables/scheduled_jobs/table

BEGIN;
CREATE FUNCTION app_jobs.run_scheduled_job (id bigint, job_expiry interval DEFAULT '1 hours')
  RETURNS app_jobs.jobs
  AS $$
DECLARE
  j app_jobs.jobs;
  last_id bigint;
  lkd_by text;
BEGIN
  -- check last scheduled
  SELECT
    last_scheduled_id
  FROM
    app_jobs.scheduled_jobs s
  WHERE
    s.id = run_scheduled_job.id INTO last_id;

  -- if it's been scheduled check if it's been run
  
  IF (last_id IS NOT NULL) THEN
    SELECT
      locked_by
    FROM
      app_jobs.jobs js
    WHERE
      js.id = last_id
      AND (js.locked_at IS NULL -- never been run
        OR js.locked_at >= (NOW() - job_expiry)
        -- still running within a safe interval
) INTO lkd_by;
    IF (FOUND) THEN
      RAISE EXCEPTION 'ALREADY_SCHEDULED';
    END IF;
  END IF;

  -- insert new job
  INSERT INTO app_jobs.jobs (
    database_id,
    queue_name,
    task_identifier,
    payload,
    priority,
    max_attempts,
    key
  ) SELECT
    database_id,
    queue_name,
    task_identifier,
    payload,
    priority,
    max_attempts,
    key
  FROM
    app_jobs.scheduled_jobs s
  WHERE
    s.id = run_scheduled_job.id
  RETURNING
    * INTO j;
  -- update the scheduled job
  UPDATE
    app_jobs.scheduled_jobs s
  SET
    last_scheduled = NOW(),
    last_scheduled_id = j.id
  WHERE
    s.id = run_scheduled_job.id;
  RETURN j;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;
COMMIT;

