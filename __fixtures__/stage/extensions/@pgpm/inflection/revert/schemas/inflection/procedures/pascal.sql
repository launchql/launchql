-- Revert schemas/inflection/procedures/pascal from pg

BEGIN;

DROP FUNCTION inflection.pascal;

COMMIT;
