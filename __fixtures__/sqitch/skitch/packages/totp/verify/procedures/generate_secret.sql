-- Verify procedures/generate_secret  on pg

BEGIN;

SELECT verify_function ('public.generate_secret', 'postgres');

ROLLBACK;
