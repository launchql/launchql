-- Revert procedures/verify_security from pg

BEGIN;

DROP FUNCTION verify_security;

COMMIT;
