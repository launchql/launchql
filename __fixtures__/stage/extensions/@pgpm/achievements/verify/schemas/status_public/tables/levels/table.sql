-- Verify schemas/status_public/tables/levels/table on pg

BEGIN;

SELECT verify_table ('status_public.levels');

ROLLBACK;
