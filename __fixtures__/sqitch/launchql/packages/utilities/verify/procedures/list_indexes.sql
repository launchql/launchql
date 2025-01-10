-- Verify procedures/list_indexes on pg

BEGIN;

SELECT verify_function ('public.list_indexes', 'postgres');

ROLLBACK;
