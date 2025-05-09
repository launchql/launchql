-- Verify procedures/myfunction  on pg

BEGIN;

SELECT verify_function ('public.myfunction', 'postgres');

ROLLBACK;
