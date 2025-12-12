-- Revert schemas/base32/schema from pg

BEGIN;

DROP SCHEMA base32 CASCADE;

COMMIT;
