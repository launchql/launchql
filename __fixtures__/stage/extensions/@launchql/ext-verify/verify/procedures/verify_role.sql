-- Verify procedures/verify_role on pg

BEGIN;

SELECT verify_function ('public.verify_role');

ROLLBACK;
