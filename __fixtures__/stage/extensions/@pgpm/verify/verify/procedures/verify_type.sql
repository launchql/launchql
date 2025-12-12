-- Verify procedures/verify_type on pg

BEGIN;

SELECT verify_function ('public.verify_type');

ROLLBACK;
