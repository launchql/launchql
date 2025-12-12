-- Verify schemas/app_jobs/procedures/do_notify  on pg

BEGIN;

SELECT verify_function ('app_jobs.do_notify');

ROLLBACK;
