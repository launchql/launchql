-- Verify procedures/grant_execute_on_function  on pg

BEGIN;

SELECT verify_function ('public.grant_execute_on_function', 'postgres');

ROLLBACK;
