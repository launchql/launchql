-- Verify procedures/verify_security  on pg

BEGIN;

SELECT verify_function ('public.verify_security');

ROLLBACK;
