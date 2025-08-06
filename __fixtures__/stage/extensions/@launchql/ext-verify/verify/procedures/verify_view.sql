-- Verify procedures/verify_view  on pg

BEGIN;

SELECT verify_function ('public.verify_view');

ROLLBACK;
