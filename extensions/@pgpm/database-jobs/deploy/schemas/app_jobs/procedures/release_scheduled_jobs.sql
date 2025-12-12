-- Deploy schemas/app_jobs/procedures/release_scheduled_jobs to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/scheduled_jobs/table

BEGIN;
CREATE FUNCTION app_jobs.release_scheduled_jobs (worker_id text, ids bigint[] DEFAULT NULL)
  RETURNS void
  AS $$
DECLARE
BEGIN
  -- clear the scheduled job
  UPDATE
    app_jobs.scheduled_jobs s
  SET
    locked_at = NULL,
    locked_by = NULL
  WHERE
    locked_by = worker_id
    AND (ids IS NULL
      OR s.id = ANY (ids));
END;
$$
LANGUAGE 'plpgsql'
VOLATILE;
COMMIT;

