-- Deploy schemas/app_jobs/procedures/add_scheduled_job to pg

-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/scheduled_jobs/table

BEGIN;

CREATE FUNCTION app_jobs.add_scheduled_job(
  identifier text,
  payload json DEFAULT '{}'::json,
  schedule_info json DEFAULT '{}'::json,
  job_key text DEFAULT NULL,
  queue_name text DEFAULT NULL,
  max_attempts integer DEFAULT 25,
  priority integer DEFAULT 0
)
  RETURNS app_jobs.scheduled_jobs
  AS $$
DECLARE
  v_job app_jobs.scheduled_jobs;
BEGIN
  IF job_key IS NOT NULL THEN

    -- Upsert job	
    INSERT INTO app_jobs.scheduled_jobs (task_identifier, payload, queue_name, schedule_info, max_attempts, KEY, priority)	
      VALUES (identifier, coalesce(payload, '{}'::json), queue_name, schedule_info, coalesce(max_attempts, 25), job_key, coalesce(priority, 0))	
    ON CONFLICT (KEY)	
      DO UPDATE SET	
        task_identifier = excluded.task_identifier,
        payload = excluded.payload,
        queue_name = excluded.queue_name,
        max_attempts = excluded.max_attempts,
        schedule_info = excluded.schedule_info,
        priority = excluded.priority
      WHERE	
        scheduled_jobs.locked_at IS NULL	
      RETURNING	
        * INTO v_job;	

    -- If upsert succeeded (insert or update), return early	
    
    IF NOT (v_job IS NULL) THEN	
      RETURN v_job;	
    END IF;	

    -- Upsert failed -> there must be an existing scheduled job that is locked. Remove	
    -- and allow a new one to be inserted

    DELETE FROM	
      app_jobs.scheduled_jobs	
    WHERE	
      KEY = job_key;	
  END IF;

  INSERT INTO app_jobs.scheduled_jobs (task_identifier, payload, queue_name, schedule_info, max_attempts, priority)
    VALUES (identifier, payload, queue_name, schedule_info, max_attempts, priority)
  RETURNING
    * INTO v_job;
  RETURN v_job;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE
SECURITY DEFINER;
COMMIT;

