-- Revert schemas/status_public/tables/user_levels/table from pg

BEGIN;

DROP TABLE status_public.user_levels;

COMMIT;
