-- Revert schemas/status_public/tables/level_requirements/table from pg

BEGIN;

DROP TABLE status_public.level_requirements;

COMMIT;
