-- Deploy schemas/app_jobs/tables/scheduled_jobs/triggers/notify_scheduled_job to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/scheduled_jobs/table

BEGIN;
CREATE TRIGGER _900_notify_scheduled_job
    AFTER INSERT ON app_jobs.scheduled_jobs
    FOR EACH ROW
    EXECUTE PROCEDURE app_jobs.do_notify ('scheduled_jobs:insert');
COMMIT;

