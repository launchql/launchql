-- Verify procedures/verify_table on pg

BEGIN;

SELECT verify_function ('public.verify_table');

ROLLBACK;
