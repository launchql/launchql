-- Revert schemas/inflection/schema from pg

BEGIN;

DROP SCHEMA inflection;

COMMIT;
