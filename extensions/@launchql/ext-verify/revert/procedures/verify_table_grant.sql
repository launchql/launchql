-- Revert procedures/verify_table_grant from pg

BEGIN;

DROP FUNCTION verify_table_grant;

COMMIT;
