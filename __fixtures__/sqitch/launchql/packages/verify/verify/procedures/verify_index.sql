-- Verify procedures/verify_index on pg

BEGIN;

SELECT verify_function ('public.verify_index', 'postgres');

ROLLBACK;
