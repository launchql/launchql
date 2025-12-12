-- Revert schemas/inflection/procedures/plural from pg

BEGIN;

DROP FUNCTION inflection.plural;

COMMIT;
