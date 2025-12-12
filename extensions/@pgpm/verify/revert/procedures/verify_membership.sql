-- Revert procedures/verify_membership from pg

BEGIN;

DROP FUNCTION verify_membership;

COMMIT;
