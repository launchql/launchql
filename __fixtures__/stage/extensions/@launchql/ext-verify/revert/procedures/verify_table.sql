-- Revert procedures/verify_table from pg

BEGIN;

DROP FUNCTION verify_table;

COMMIT;
