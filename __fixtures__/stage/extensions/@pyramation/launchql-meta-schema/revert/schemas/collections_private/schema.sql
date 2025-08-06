-- Revert schemas/collections_private/schema from pg

BEGIN;

DROP SCHEMA dbs;

COMMIT;
