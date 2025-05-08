-- Verify procedures/verify_policy on pg

BEGIN;

SELECT verify_function ('public.verify_policy');

ROLLBACK;
