-- Verify procedures/verify_constraint  on pg

BEGIN;

SELECT verify_function ('public.verify_constraint');

ROLLBACK;
