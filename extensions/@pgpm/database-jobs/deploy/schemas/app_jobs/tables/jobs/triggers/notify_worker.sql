-- Deploy schemas/app_jobs/tables/jobs/triggers/notify_worker to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table
-- requires: schemas/app_jobs/procedures/do_notify
-- requires: schemas/app_jobs/tables/jobs/triggers/increase_job_queue_count

BEGIN;
CREATE TRIGGER _900_notify_worker
    AFTER INSERT ON app_jobs.jobs
    FOR EACH ROW
    EXECUTE PROCEDURE app_jobs.do_notify ('jobs:insert');
COMMIT;

