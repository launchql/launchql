-- Revert schemas/meta_public/schema from pg

BEGIN;

DROP SCHEMA meta_public;

COMMIT;
