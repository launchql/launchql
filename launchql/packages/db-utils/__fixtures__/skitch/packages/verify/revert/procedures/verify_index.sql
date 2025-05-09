-- Revert procedures/verify_index from pg

BEGIN;

DROP FUNCTION verify_index;

COMMIT;
