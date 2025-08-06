-- Verify schemas/status_public/tables/user_achievements/policies/enable_row_level_security  on pg

BEGIN;

SELECT verify_security ('status_public.user_achievements');

ROLLBACK;
