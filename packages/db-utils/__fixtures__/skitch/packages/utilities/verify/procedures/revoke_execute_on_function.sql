-- Verify procedures/revoke_execute_on_function  on pg

BEGIN;

SELECT verify_function ('public.revoke_execute_on_function', 'postgres');

ROLLBACK;
