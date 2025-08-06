-- Revert procedures/verify_policy from pg

BEGIN;

DROP FUNCTION verify_policy;

COMMIT;
