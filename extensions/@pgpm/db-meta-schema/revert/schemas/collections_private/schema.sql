-- Revert schemas/collections_private/schema from pg

BEGIN;

DROP SCHEMA collections_private CASCADE;

COMMIT;
