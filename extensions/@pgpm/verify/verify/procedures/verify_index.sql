-- Verify procedures/verify_index on pg

BEGIN;

SELECT verify_function ('public.verify_index');

ROLLBACK;
