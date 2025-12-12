-- Verify procedures/verify_function on pg

BEGIN;

SELECT verify_function ('public.verify_function');

ROLLBACK;
