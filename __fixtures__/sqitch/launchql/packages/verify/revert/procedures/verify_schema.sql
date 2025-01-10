-- Revert procedures/verify_schema from pg

BEGIN;

DROP FUNCTION verify_schema;

COMMIT;
