-- Verify schemas/app_jobs/tables/scheduled_jobs/grants/grant_select_insert_update_delete_to_administrator on pg

BEGIN;

  SELECT has_table_privilege('administrator', 'app_jobs.scheduled_jobs', 'SELECT');
  SELECT has_table_privilege('administrator', 'app_jobs.scheduled_jobs', 'INSERT');
  SELECT has_table_privilege('administrator', 'app_jobs.scheduled_jobs', 'UPDATE');
  SELECT has_table_privilege('administrator', 'app_jobs.scheduled_jobs', 'DELETE');
  
ROLLBACK;
