-- Verify procedures/drop_function  on pg

BEGIN;

SELECT verify_function ('public.drop_function', 'postgres');

ROLLBACK;
