-- Revert procedures/verify_trigger from pg

BEGIN;

DROP FUNCTION verify_trigger;

COMMIT;
