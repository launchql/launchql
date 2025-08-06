-- Revert schemas/inflection/procedures/underscore from pg

BEGIN;

DROP FUNCTION inflection.underscore;

COMMIT;
