-- Revert procedures/verify_constraint from pg

BEGIN;

DROP FUNCTION verify_constraint;

COMMIT;
