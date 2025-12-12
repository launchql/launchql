-- Revert schemas/inflection/procedures/singular from pg

BEGIN;

DROP FUNCTION inflection.singular;

COMMIT;
