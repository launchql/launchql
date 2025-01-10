-- Revert procedures/verify_role from pg

BEGIN;

DROP FUNCTION verify_role;

COMMIT;
