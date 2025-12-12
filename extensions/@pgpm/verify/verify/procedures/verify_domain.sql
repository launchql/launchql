-- Verify procedures/verify_domain  on pg

BEGIN;

SELECT verify_function ('public.verify_domain');

ROLLBACK;
