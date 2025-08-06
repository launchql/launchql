-- Revert schemas/unique_names/schema from pg

BEGIN;

DROP SCHEMA unique_names;

COMMIT;
