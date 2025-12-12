-- Verify schemas/status_public/tables/user_steps/table on pg

BEGIN;

SELECT verify_table ('status_public.user_steps');

ROLLBACK;
