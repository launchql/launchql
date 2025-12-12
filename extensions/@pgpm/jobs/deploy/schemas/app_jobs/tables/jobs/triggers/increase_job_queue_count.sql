-- Deploy schemas/app_jobs/tables/jobs/triggers/increase_job_queue_count to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
CREATE FUNCTION app_jobs.tg_increase_job_queue_count ()
  RETURNS TRIGGER
  AS $$
BEGIN
  INSERT INTO app_jobs.job_queues (queue_name, job_count)
    VALUES (NEW.queue_name, 1)
  ON CONFLICT (queue_name)
    DO UPDATE SET
      job_count = job_queues.job_count + 1;
  RETURN NEW;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;
CREATE TRIGGER _500_increase_job_queue_count_on_insert
  AFTER INSERT ON app_jobs.jobs
  FOR EACH ROW
  WHEN ((NEW.queue_name IS NOT NULL))
  EXECUTE PROCEDURE app_jobs.tg_increase_job_queue_count ();
-- only a person would do this
CREATE TRIGGER _500_increase_job_queue_count_on_update
  AFTER UPDATE OF queue_name ON app_jobs.jobs
  FOR EACH ROW
  WHEN (((NEW.queue_name IS DISTINCT FROM OLD.queue_name) AND (NEW.queue_name IS NOT NULL)))
  EXECUTE PROCEDURE app_jobs.tg_increase_job_queue_count ();
COMMIT;

