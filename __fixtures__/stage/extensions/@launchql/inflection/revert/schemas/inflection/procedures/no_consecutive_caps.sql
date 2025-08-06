-- Revert schemas/inflection/procedures/no_consecutive_caps from pg

BEGIN;

DROP FUNCTION inflection.no_consecutive_caps;

COMMIT;
