-- Revert schemas/inflection/procedures/no_single_underscores from pg

BEGIN;

DROP FUNCTION inflection.no_single_underscores;

COMMIT;
