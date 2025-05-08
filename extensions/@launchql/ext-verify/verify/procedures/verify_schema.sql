-- Verify procedures/verify_schema on pg

BEGIN;

SELECT verify_function ('public.verify_schema');

ROLLBACK;
