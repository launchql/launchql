-- Verify procedures/verify_extension  on pg

BEGIN;

SELECT verify_function ('public.verify_extension');

ROLLBACK;
