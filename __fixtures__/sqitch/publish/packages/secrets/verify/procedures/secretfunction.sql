-- Verify procedures/secretfunction  on pg

BEGIN;

SELECT verify_function ('public.secretfunction', 'postgres');

ROLLBACK;
