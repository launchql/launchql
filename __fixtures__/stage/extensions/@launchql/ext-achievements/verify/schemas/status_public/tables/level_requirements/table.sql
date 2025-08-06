-- Verify schemas/status_public/tables/level_requirements/table on pg

BEGIN;

SELECT verify_table ('status_public.level_requirements');

ROLLBACK;
