-- Verify procedures/verify_table_grant on pg

BEGIN;

SELECT verify_function ('public.verify_table_grant');

ROLLBACK;
