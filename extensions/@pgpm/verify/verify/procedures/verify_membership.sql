-- Verify procedures/verify_membership on pg

BEGIN;

SELECT verify_function ('public.verify_membership');

ROLLBACK;
