-- Verify schemas/app_jobs/tables/job_queues/grants/grant_select_insert_update_delete_to_administrator on pg

BEGIN;

  SELECT has_table_privilege('administrator', 'app_jobs.job_queues', 'SELECT');
  SELECT has_table_privilege('administrator', 'app_jobs.job_queues', 'INSERT');
  SELECT has_table_privilege('administrator', 'app_jobs.job_queues', 'UPDATE');
  SELECT has_table_privilege('administrator', 'app_jobs.job_queues', 'DELETE');
  
ROLLBACK;
