-- Revert schemas/meta_private/schema from pg

BEGIN;

DROP SCHEMA meta_private;

COMMIT;
