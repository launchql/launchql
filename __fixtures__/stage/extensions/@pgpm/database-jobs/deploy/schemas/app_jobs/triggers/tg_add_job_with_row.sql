-- Deploy schemas/app_jobs/triggers/tg_add_job_with_row to pg
-- requires: schemas/app_jobs/schema

BEGIN;
CREATE FUNCTION app_jobs.tg_add_job_with_row ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM
      app_jobs.add_job (jwt_private.current_database_id(), TG_ARGV[0], to_json(NEW));
    RETURN NEW;
  END IF;
  IF (TG_OP = 'DELETE') THEN
    PERFORM
      app_jobs.add_job (jwt_private.current_database_id(), TG_ARGV[0], to_json(OLD));
    RETURN OLD;
  END IF;
END;
$$
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER;
COMMENT ON FUNCTION app_jobs.tg_add_job_with_row IS E'Useful shortcut to create a job on insert or update. Pass the task name as the trigger argument, and the record data will automatically be available on the JSON payload.';
COMMIT;

