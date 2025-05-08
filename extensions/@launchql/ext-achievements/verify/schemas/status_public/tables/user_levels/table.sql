-- Verify schemas/status_public/tables/user_levels/table on pg

BEGIN;

SELECT verify_table ('status_public.user_levels');

ROLLBACK;
