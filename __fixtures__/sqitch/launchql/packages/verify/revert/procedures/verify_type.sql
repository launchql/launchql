-- Revert procedures/verify_type from pg

BEGIN;

DROP FUNCTION verify_type;

COMMIT;
