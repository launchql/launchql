-- Revert schemas/myschema/schema from pg

BEGIN;

DROP SCHEMA myschema;

COMMIT;
