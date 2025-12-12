-- Deploy schemas/app_jobs/tables/jobs/triggers/decrease_job_queue_count to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
CREATE FUNCTION app_jobs.tg_decrease_job_queue_count ()
  RETURNS TRIGGER
  AS $$
DECLARE
  v_new_job_count int;
BEGIN
  UPDATE
    app_jobs.job_queues
  SET
    job_count = job_queues.job_count - 1
  WHERE
    queue_name = OLD.queue_name
  RETURNING
    job_count INTO v_new_job_count;
  IF v_new_job_count <= 0 THEN
    DELETE FROM app_jobs.job_queues
    WHERE queue_name = OLD.queue_name
      AND job_count <= 0;
  END IF;
  RETURN OLD;
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;
CREATE TRIGGER decrease_job_queue_count_on_delete
  AFTER DELETE ON app_jobs.jobs
  FOR EACH ROW
  WHEN ((OLD.queue_name IS NOT NULL))
  EXECUTE PROCEDURE app_jobs.tg_decrease_job_queue_count ();
-- only a person would do this...
CREATE TRIGGER decrease_job_queue_count_on_update
  AFTER UPDATE OF queue_name ON app_jobs.jobs
  FOR EACH ROW
  WHEN (((NEW.queue_name IS DISTINCT FROM OLD.queue_name) AND (OLD.queue_name IS NOT NULL)))
  EXECUTE PROCEDURE app_jobs.tg_decrease_job_queue_count ();
COMMIT;

