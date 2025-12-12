-- Verify schemas/app_jobs/tables/jobs/grants/grant_select_insert_update_delete_to_administrator on pg

BEGIN;

  SELECT has_table_privilege('administrator', 'app_jobs.jobs', 'SELECT');
  SELECT has_table_privilege('administrator', 'app_jobs.jobs', 'INSERT');
  SELECT has_table_privilege('administrator', 'app_jobs.jobs', 'UPDATE');
  SELECT has_table_privilege('administrator', 'app_jobs.jobs', 'DELETE');
  
ROLLBACK;
