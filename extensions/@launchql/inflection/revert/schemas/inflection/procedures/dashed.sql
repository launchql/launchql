-- Revert schemas/inflection/procedures/dashed from pg

BEGIN;

DROP FUNCTION inflection.dashed;

COMMIT;
