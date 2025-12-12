-- Verify schemas/status_public/tables/user_achievements/table on pg

BEGIN;

SELECT verify_table ('status_public.user_achievements');

ROLLBACK;
