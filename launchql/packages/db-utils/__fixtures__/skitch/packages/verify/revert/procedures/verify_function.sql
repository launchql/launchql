-- Revert procedures/verify_function from pg

BEGIN;

DROP FUNCTION verify_function;

COMMIT;
