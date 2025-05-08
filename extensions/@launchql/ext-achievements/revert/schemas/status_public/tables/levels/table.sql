-- Revert schemas/status_public/tables/levels/table from pg

BEGIN;

DROP TABLE status_public.levels;

COMMIT;
