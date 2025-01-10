-- Verify procedures/list_memberships on pg

BEGIN;

SELECT verify_function ('public.list_memberships', 'postgres');

ROLLBACK;
