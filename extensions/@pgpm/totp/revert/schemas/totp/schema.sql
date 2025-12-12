-- Revert schemas/totp/schema from pg

BEGIN;

DROP SCHEMA totp CASCADE;

COMMIT;
