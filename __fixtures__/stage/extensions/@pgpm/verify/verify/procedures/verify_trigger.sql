-- Verify procedures/verify_trigger on pg

BEGIN;

SELECT verify_function ('public.verify_trigger');

ROLLBACK;
