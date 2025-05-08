-- Deploy schemas/app_jobs/triggers/tg_update_timestamps to pg
-- requires: schemas/app_jobs/schema

BEGIN;
CREATE FUNCTION app_jobs.tg_update_timestamps ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = NOW();
    NEW.updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.created_at = OLD.created_at;
    NEW.updated_at = greatest (now(), OLD.updated_at + interval '1 millisecond');
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';
COMMIT;

