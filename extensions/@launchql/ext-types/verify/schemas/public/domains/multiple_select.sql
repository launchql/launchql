-- Verify schemas/public/domains/multiple_select on pg

BEGIN;

SELECT verify_type ('public.multiple_select');

ROLLBACK;
