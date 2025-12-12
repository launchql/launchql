-- Revert schemas/inflection/procedures/upper from pg

BEGIN;

DROP FUNCTION inflection.upper;

COMMIT;
