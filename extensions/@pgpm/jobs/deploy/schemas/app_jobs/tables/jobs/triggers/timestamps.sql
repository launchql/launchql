-- Deploy schemas/app_jobs/tables/jobs/triggers/timestamps to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table
-- requires: schemas/app_jobs/triggers/tg_update_timestamps

BEGIN;
ALTER TABLE app_jobs.jobs
    ADD COLUMN created_at timestamptz;
ALTER TABLE app_jobs.jobs
    ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE app_jobs.jobs
    ADD COLUMN updated_at timestamptz;
ALTER TABLE app_jobs.jobs
    ALTER COLUMN updated_at SET DEFAULT NOW();
CREATE TRIGGER _100_update_jobs_modtime_tg
    BEFORE UPDATE OR INSERT ON app_jobs.jobs
    FOR EACH ROW
    EXECUTE PROCEDURE app_jobs.tg_update_timestamps ();
COMMIT;

